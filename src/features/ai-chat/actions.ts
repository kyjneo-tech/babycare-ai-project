"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { runOrchestrator } from "./services/orchestratorService";
import { runAnswerer } from "./services/answererService";
import { runSingleAI } from "./services/singleAIService";
import { getChatContext, getChatHistoryContext } from "./services/chatDataService";
import { prisma } from "@/shared/lib/prisma";
import { revalidatePath } from "next/cache";

// 최적화 유틸리티
import { analyzeOptimalChatHistory } from "./utils/improvedChatHistoryAnalyzer";
import { analyzeQuestionComplexity } from "./utils/questionComplexity";

// 설정 관리
import { AISettings } from "./types";
import { DEFAULT_AI_SETTINGS } from "./constants/aiSettings";

// 모니터링
import { ChatMessage } from "@prisma/client";
import { collectChatMetrics } from "./services/metricsCollector";
import { calculatePromptTokens, calculateResponseTokens } from "./utils/tokenCounter";


// ============================================================
// AI 설정 관리
// ============================================================

export async function getBabyAISettings(babyId: string) {
  if (babyId === "guest-baby-id") {
    return { success: true, data: DEFAULT_AI_SETTINGS };
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    const baby = await prisma.baby.findFirst({
      where: {
        id: babyId,
        Family: {
          FamilyMembers: {
            some: {
              userId: session.user.id,
            },
          },
        },
      },
      select: { aiSettings: true },
    });

    if (!baby) {
      return { success: false, error: "아기를 찾을 수 없거나 접근 권한이 없습니다." };
    }

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
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    const baby = await prisma.baby.findFirst({
      where: {
        id: babyId,
        Family: {
          FamilyMembers: {
            some: {
              userId: session.user.id,
            },
          },
        },
      },
      select: { id: true },
    });

    if (!baby) {
      return { success: false, error: "아기를 찾을 수 없거나 접근 권한이 없습니다." };
    }

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
// Server Action: AI 채팅 메시지 전송 (하이브리드 시스템)
// ============================================================

export async function sendChatMessage(
  babyId: string,
  userId: string | undefined, // undefined 허용
  message: string
): Promise<{ success: boolean; data?: { reply: string }; error?: string }> {
  const startTime = Date.now();
  let orchestratorStartTime = 0;
  let orchestratorEndTime = 0;
  let answererStartTime = 0;
  let answererEndTime = 0;
  let mode: "single-ai" | "dual-ai" = "dual-ai";
  let historyCount = 0;
  let toolsUsedCount = 0;
  let complexityResult: "simple" | "complex" = "complex";

  try {
    // 0. 사용자 인증 확인
    const session = await getServerSession(authOptions);
    if (!session || session.user.id !== userId) {
      throw new Error("인증되지 않은 사용자입니다.");
    }

    // 1. 질문 및 대화 기록 분석 (최적화)
    complexityResult = analyzeQuestionComplexity(message);
    const historyStrategy = analyzeOptimalChatHistory(message);
    historyCount = historyStrategy.count;

    console.log(`📊 질문 분석: ${complexityResult}, 기록: ${historyCount}개 (${historyStrategy.reason})`);

    // 2. 컨텍스트 조회 (공통)
    const context = await getChatContext(babyId, userId);
    const chatHistoryContext = historyCount > 0
      ? await getChatHistoryContext(babyId, historyCount)
      : "";

    // ============================================================
    // Case A: Simple 질문 -> Single AI (빠름, 저렴)
    // ============================================================
    if (complexityResult === "simple") {
      mode = "single-ai";
      console.log("🚀 Single AI 모드 실행");

      answererStartTime = Date.now();
      
      const reply = await runSingleAI(
        context.baby.name,
        context.monthAge,
        context.userRoleLabel,
        message,
        chatHistoryContext
      );
      
      answererEndTime = Date.now();

      // DB 저장
      await saveChatMessage(babyId, userId, message, reply);

      // Revalidate
      revalidatePath(`/families/${context.baby.familyId}/chat`);

      // 메트릭 수집 (Fire-and-forget)
      const endTime = Date.now();
      // calculatePromptTokens 인터페이스: (systemPrompt, userMessage, chatHistory)
      // Single AI는 System Prompt가 코드 내에 하드코딩 되어 있으므로 대략적인 길이를 넣어주거나 빈 문자열 처리
      const inputTokens = calculatePromptTokens("", message, chatHistoryContext); 
      const outputTokens = calculateResponseTokens(reply);

      collectChatMetrics({
        babyId,
        userId,
        question: message,
        answer: reply,
        complexity: "simple",
        historyTier: historyStrategy.tier,
        historyCount: historyStrategy.count,
        historyReason: historyStrategy.reason,
        mode: "single-ai",
        
        // 시간 (Flat structure)
        startTime,
        endTime,
        answererStartTime,
        answererEndTime,

        // 토큰 (Flat structure)
        inputTokens,
        outputTokens,
        aiCallCount: 1,

        // 도구 (미사용)
        toolsCalled: [],
        toolsSuccess: true,
        
        // 결과
        success: true,
        dataAvailable: false, // Simple 모드는 데이터 조회 안함
      }).catch(e => console.error("Metrics Error (Single):", e));

      return { success: true, data: { reply } };
    }

    // ============================================================
    // Case B: Complex 질문 -> Dual AI (정확, 데이터 기반)
    // ============================================================
    console.log("🔄 Dual AI 모드 실행");
    mode = "dual-ai";

    // Step 3-1: AI #1 Orchestrator (데이터 수집)
    orchestratorStartTime = Date.now();
    const orchestratorOutput = await runOrchestrator(
      context.baby.name,
      context.monthAge,
      message,
      babyId,
      historyCount > 0 // 이전 대화 포함 여부 결정
    );
    orchestratorEndTime = Date.now();
    toolsUsedCount = orchestratorOutput.toolsCalled?.length || 0;

    // Step 3-2: AI #2 Answerer (답변 생성)
    answererStartTime = Date.now();
    const reply = await runAnswerer(
      context.baby.name,
      context.monthAge, // 개월 수 전달
      context.userRoleLabel,
      message,
      orchestratorOutput
    );
    answererEndTime = Date.now();

    // 4. 대화 저장
    await saveChatMessage(babyId, userId, message, reply);

    // 5. 페이지 갱신
    revalidatePath(`/families/${context.baby.familyId}/chat`);

    // 메트릭 수집 (Fire-and-forget)
    const endTime = Date.now();
    const inputTokens = calculatePromptTokens("", message, JSON.stringify(orchestratorOutput)); 
    const outputTokens = calculateResponseTokens(reply);

    collectChatMetrics({
      babyId,
      userId,
      question: message,
      answer: reply,
      complexity: "complex",
      historyTier: historyStrategy.tier,
      historyCount: historyStrategy.count,
      historyReason: historyStrategy.reason,
      mode: "dual-ai",
      
      // 시간
      startTime,
      endTime,
      orchestratorStartTime,
      orchestratorEndTime,
      answererStartTime,
      answererEndTime,

      // 토큰
      inputTokens,
      outputTokens,
      aiCallCount: 2,

      // 도구
      toolsCalled: orchestratorOutput.toolsCalled?.map((t: any) => t.toolName) || [],
      toolsSuccess: true,
      toolsData: orchestratorOutput.toolsCalled,

      // 결과
      success: true,
      dataAvailable: orchestratorOutput.dataAvailable,
      missingInfo: orchestratorOutput.missingInfo
    }).catch(e => console.error("Metrics Error (Dual):", e));

    return { success: true, data: { reply } };

  } catch (error: any) {
    console.error("AI Chat Error:", error);
    
    // 에러 발생 시에도 메트릭 수집
    collectChatMetrics({
      babyId,
      userId: userId || "unknown",
      question: message,
      answer: "Error",
      complexity: complexityResult || "complex", // 에러 시 기본값
      historyTier: 1,
      historyCount: 0,
      historyReason: "Error",
      mode: mode,
      
      startTime: Date.now(),
      endTime: Date.now(),
      
      inputTokens: 0,
      outputTokens: 0,
      aiCallCount: 0,
      
      toolsCalled: [],
      toolsSuccess: false,
      
      success: false,
      errorType: error.name || "UnknownError",
      errorMessage: error.message,
      dataAvailable: false
    }).catch(e => console.error("Metrics Error (Fail):", e));

    return { 
      success: false, 
      error: "상담 중 문제가 발생했어요. 잠시 후 다시 시도해주세요." 
    };
  }
}

// ============================================================
// Internal: 대화 저장
// ============================================================

async function saveChatMessage(
  babyId: string,
  userId: string,
  message: string,
  reply: string
) {
  try {
    // 1. 메시지 저장
    await prisma.chatMessage.create({
      data: {
        babyId,
        userId,
        message,
        reply,
        createdAt: new Date(), 
      },
    });

    // 2. 오래된 메시지 삭제 (TTL: 30일)
    // 매번 실행하는 것이 부담스럽다면 확률적으로 실행하거나(e.g. 1/10), 별도 Cron으로 분리 가능.
    // 여기서는 간단히 사용자 별 Cleanup으로 구현.
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // Fire-and-forget (await 하지 않음 or 에러 무시)
    prisma.chatMessage.deleteMany({
      where: {
        babyId, // 해당 아기의 데이터만 정리 (인덱스 활용)
        createdAt: {
          lt: thirtyDaysAgo
        }
      }
    }).catch(e => console.error("TTL Cleanup Error:", e));

  } catch (dbError) {
    console.error("DB Save Error:", dbError);
    // 채팅 저장이 실패해도 사용자에게 답변은 보여주는게 UX상 나음
  }
}

/**
 * 대화 목록 조회
 */
export async function getChatHistory(
  babyId: string
): Promise<{
  success: boolean;
  data?: any[]; // ChatMessage | Message 타입 호환을 위해 any 또는 유연한 타입 사용
  error?: string;
}> {
  if (babyId === "guest-baby-id") {
    // getSampleChatHistory 함수 필요 (import 필요)
    // 하지만 여기서는 간단히 빈 배열 또는 샘플 데이터 처리를 위해 import 구문을 확인해야 함.
    // 기존 코드 상단에 import { getSampleChatHistory } from "./services/getSampleChatHistoryService"; 가 있었음.
    // 이 파일 맨 위 import 섹션에 추가되어 있는지 확인해야 함. 
    // 현재 파일 상단 import 목록을 보면 getSampleChatHistory가 없음. 
    // 따라서 여기서 import를 추가할 수는 없으니, 동적 import를 쓰거나 상단 import를 추가해야 함.
    // 일단 여기서는 동적 import로 처리.
    const { getSampleChatHistory } = await import("./services/getSampleChatHistoryService");
    return { success: true, data: getSampleChatHistory() };
  }

  try {
    const messages = await prisma.chatMessage.findMany({
      where: { babyId },
      orderBy: { createdAt: "asc" }, // 과거 -> 현재 (화면 표시 순서)
    });

    const formattedMessages = messages.flatMap((msg) => [
      {
        id: `${msg.id}-user`,
        role: "user",
        content: msg.message,
        createdAt: msg.createdAt,
      },
      {
        id: msg.id,
        role: "assistant", // "ai" 대신 "assistant" 사용 (Message 타입 따름)
        content: msg.reply,
        createdAt: msg.createdAt,
      },
    ]);

    return { success: true, data: formattedMessages };
  } catch (error) {
    console.error("Get Messages Error:", error);
    return { success: false, error: "대화 기록 조회 실패" };
  }
}
