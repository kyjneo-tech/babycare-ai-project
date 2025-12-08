import { prisma } from "@/shared/lib/prisma";

export interface ChatMetricsInput {
  // 기본 정보
  babyId: string;
  userId: string;
  question: string;
  answer: string;

  // 분류
  complexity: "simple" | "complex";
  historyTier: number; // 1 | 2 | 3
  historyCount: number;
  historyReason: string;
  mode: "single-ai" | "dual-ai";

  // 성능 (타임스탬프로 자동 계산)
  startTime: number;
  orchestratorStartTime?: number;
  orchestratorEndTime?: number;
  answererStartTime?: number;
  answererEndTime?: number;
  toolsStartTime?: number;
  toolsEndTime?: number;
  databaseStartTime?: number;
  databaseEndTime?: number;
  endTime: number;

  // 비용
  inputTokens: number;
  outputTokens: number;
  aiCallCount: number;

  // 도구 사용
  toolsCalled: string[];
  toolsSuccess: boolean;
  toolsData?: any;

  // 결과
  success: boolean;
  errorType?: string;
  errorMessage?: string;
  dataAvailable: boolean;
  missingInfo?: string[];
}

/**
 * AI 상담 메트릭 수집 및 저장
 */
export async function collectChatMetrics(
  input: ChatMetricsInput
): Promise<void> {
  try {
    // 1. 시간 계산
    const totalTime = input.endTime - input.startTime;
    const orchestratorTime = input.orchestratorEndTime && input.orchestratorStartTime
      ? input.orchestratorEndTime - input.orchestratorStartTime
      : null;
    const answererTime = input.answererEndTime && input.answererStartTime
      ? input.answererEndTime - input.answererStartTime
      : null;
    const toolsTime = input.toolsEndTime && input.toolsStartTime
      ? input.toolsEndTime - input.toolsStartTime
      : null;
    const databaseTime = input.databaseEndTime && input.databaseStartTime
      ? input.databaseEndTime - input.databaseStartTime
      : null;

    // 2. 토큰 계산
    const totalTokens = input.inputTokens + input.outputTokens;

    // 3. 비용 계산 (Gemini 2.5 Flash 공식 가격 - Paid Tier 기준)
    // Ref: User provided pricing table
    // Input (Text): $0.30 / 1M tokens
    // Output: $2.50 / 1M tokens
    const inputCost = (input.inputTokens / 1000000) * 0.30; 
    const outputCost = (input.outputTokens / 1000000) * 2.50;
    const estimatedCost = inputCost + outputCost;

    // 4. DB 저장
    await prisma.chatMetrics.create({
      data: {
        babyId: input.babyId,
        userId: input.userId,
        question: input.question,
        answer: input.answer,

        complexity: input.complexity,
        historyTier: input.historyTier,
        historyCount: input.historyCount,
        historyReason: input.historyReason,
        mode: input.mode,

        totalTime,
        orchestratorTime,
        answererTime,
        toolsTime,
        databaseTime,

        inputTokens: input.inputTokens,
        outputTokens: input.outputTokens,
        totalTokens,
        estimatedCost,
        aiCallCount: input.aiCallCount,

        toolsCalled: input.toolsCalled,
        toolsSuccess: input.toolsSuccess,
        toolsData: input.toolsData ?? undefined,

        success: input.success,
        errorType: input.errorType,
        errorMessage: input.errorMessage,
        dataAvailable: input.dataAvailable,
        missingInfo: input.missingInfo || [],
      },
    });

    // 5. 실시간 로그 (서버 콘솔)
    console.log("📊 Metrics Collected:", {
      question: input.question.slice(0, 30),
      time: `${totalTime}ms`,
      cost: `$${estimatedCost.toFixed(6)}`,
      tokens: totalTokens,
      mode: input.mode,
      tier: input.historyTier,
    });

    // 6. 알림 체크 (추후 Phase 2에서 구현)
    
  } catch (error) {
    console.error("❌ Metrics Collection Failed:", error);
    // 메트릭 수집 실패는 사용자에게 영향 주면 안 됨 (Silent Fail)
  }
}
