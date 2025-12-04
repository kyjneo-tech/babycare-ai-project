"use server";

import { prisma } from "@/shared/lib/prisma";
import { ChatMessage } from "@prisma/client";
import { z } from "zod";
import { Message } from "@/shared/types/chat";
import { AISettings } from "./types";
import { DEFAULT_AI_SETTINGS } from "./constants/aiSettings";
import { getChatContext } from "./services/chatDataService";
import { generateAIResponse } from "./services/chatAIService";
import { saveChatMessage } from "./services/chatHistoryService";
import { generateFinalPrompt } from "./prompts/systemPrompt";
import { removeBoldFormatting } from "./utils/responseFormatter";
import { getSampleChatHistory } from "./services/getSampleChatHistoryService";
import { analyzeChatHistoryNeeds, logChatHistoryAnalysis } from "./utils/chatHistoryAnalyzer";
import { getChatHistoryTool, formatChatHistoryForPrompt } from "./services/chatHistoryTools";

// ============================================================
// 입력 검증
// ============================================================

const chatMessageSchema = z.object({
  message: z
    .string()
    .min(1, "메시지를 입력해주세요.")
    .max(1500, "메시지는 최대 1,500자까지 입력 가능합니다.")
    .trim(),
});

// ============================================================
// AI 설정 관리
// ============================================================

export async function getBabyAISettings(babyId: string) {
  if (babyId === "guest-baby-id") {
    return { success: true, data: DEFAULT_AI_SETTINGS };
  }

  try {
    const baby = await prisma.baby.findUnique({
      where: { id: babyId },
      select: { aiSettings: true },
    });

    const savedSettings = baby?.aiSettings as unknown as Partial<AISettings>;
    const fullSettings = { ...DEFAULT_AI_SETTINGS, ...savedSettings };

    return { success: true, data: fullSettings };
  } catch (error) {
    console.error("설정 조회 실패:", error);
    return { success: false, error: "설정 조회 실패" };
  }
}

export async function updateBabyAISettings(babyId: string, settings: AISettings) {
  try {
    await prisma.baby.update({
      where: { id: babyId },
      data: { aiSettings: settings as any },
    });
    return { success: true };
  } catch (error) {
    console.error("설정 저장 실패:", error);
    return { success: false, error: "설정 저장 실패" };
  }
}

// ============================================================
// AI 채팅
// ============================================================

export async function sendChatMessage(
  babyId: string,
  userId: string | undefined,
  message: string
): Promise<{
  success: boolean;
  data?: { reply: string | null; summary?: any };
  error?: string;
}> {
  // 1. 입력 검증
  const validation = chatMessageSchema.safeParse({ message });
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0].message,
    };
  }
  const validatedMessage = validation.data.message;

  // 2. 게스트 모드 처리
  if (babyId === "guest-baby-id") {
    return {
      success: true,
      data: {
        reply: "저는 게스트 모드 AI입니다. 실제 아기 데이터에 기반한 답변은 회원가입 후 이용 가능합니다. 예를 들어, '우리 아기 수면 패턴은 어떤가요?'와 같이 질문하실 수 있습니다.",
      },
    };
  }

  // 3. 인증 확인
  if (!userId) {
    return { success: false, error: "로그인이 필요합니다" };
  }

  // 4. Rate Limiting
  const { aiChatRateLimit } = await import('@/shared/lib/ratelimit');
  if (aiChatRateLimit) {
    const { success } = await aiChatRateLimit.limit(userId);
    if (!success) {
      const { logger } = await import('@/shared/lib/logger');
      logger.warn('AI 채팅 rate limit 초과', { userId });
      return {
        success: false,
        error: "너무 많은 요청입니다. 잠시 후 다시 시도해주세요."
      };
    }
  }

  try {
    // 5. 채팅 컨텍스트 데이터 조회
    const context = await getChatContext(babyId, userId);

    // 🆕 6. 대화 기록 필요성 분석 (하이브리드 방식)
    const historyNeeds = analyzeChatHistoryNeeds(validatedMessage);
    logChatHistoryAnalysis(validatedMessage, historyNeeds);

    let historyContext = "";

    if (historyNeeds.autoProvide && historyNeeds.needsHistory) {
      // 자동으로 대화 기록 제공
      const historyResult = await getChatHistoryTool({
        babyId,
        count: historyNeeds.count,
      });
      historyContext = formatChatHistoryForPrompt(historyResult);

      console.log(`✅ 자동으로 ${historyNeeds.count}개 대화 기록 제공: ${historyNeeds.reason}`);
    } else {
      // 대화 기록 제공 안 함 (AI가 필요시 도구 사용)
      historyContext = "";
      console.log(`⏭️ 대화 기록 제공 안 함: ${historyNeeds.reason}`);
    }

    // 7. 최종 프롬프트 생성
    const finalPrompt = generateFinalPrompt(context, historyContext, validatedMessage);

    // 디버깅용 로그
    console.log("---------------------------------------------------");
    console.log("AI Prompt Debugging:");
    console.log(finalPrompt);
    console.log("---------------------------------------------------");

    // 8. AI 응답 생성
    let reply = await generateAIResponse(finalPrompt, babyId);

    // 9. 볼드 표시 제거
    reply = removeBoldFormatting(reply);

    // 10. 채팅 기록 저장
    const simpleSummary = {
      logCount: 0,
      excluded: [],
      growthDataCount: context.growthHistory.length,
      historyProvided: historyNeeds.autoProvide,  // 🆕 대화 기록 제공 여부
      historyCount: historyNeeds.count,  // 🆕 제공한 대화 개수
    };

    await saveChatMessage(babyId, userId, validatedMessage, reply, simpleSummary);

    return {
      success: true,
      data: {
        reply,
        summary: simpleSummary as any,
      },
    };
  } catch (error) {
    const { logger } = await import('@/shared/lib/logger');
    logger.error("AI 채팅 실패");
    return { success: false, error: "AI 응답 생성에 실패했습니다" };
  }
}

// ============================================================
// 채팅 기록 조회
// ============================================================

export async function getChatHistory(
  babyId: string
): Promise<{
  success: boolean;
  data?: (ChatMessage | Message)[];
  error?: string;
}> {
  if (babyId === "guest-baby-id") {
    return { success: true, data: getSampleChatHistory() };
  }

  try {
    const messages = await prisma.chatMessage.findMany({
      where: { babyId },
      orderBy: { createdAt: "asc" },
    });

    const formattedMessages: Message[] = messages.flatMap((msg) => [
      {
        id: `${msg.id}-user`,
        role: "user",
        content: msg.message,
        createdAt: msg.createdAt,
      },
      {
        id: msg.id,
        role: "assistant",
        content: msg.reply,
        createdAt: msg.createdAt,
      },
    ]);

    return { success: true, data: formattedMessages };
  } catch (error) {
    const { logger } = await import('@/shared/lib/logger');
    logger.error("대화 기록 조회 실패");
    return { success: false, error: "대화 기록 조회에 실패했습니다" };
  }
}
