import { ChatContext } from "../types";
import { formatDateTime } from "../utils/responseFormatter";
import { formatBabyGender } from "../utils/babyInfoUtils";

/**
 * AI의 기본 시스템 프롬프트를 생성합니다.
 *
 * 이 프롬프트는 AI의 성격, 역할, 응답 방식을 정의합니다.
 * 필요에 따라 이 파일을 수정하여 AI의 행동을 변경할 수 있습니다.
 */
export function generateSystemPrompt(context: ChatContext): string {
  const { baby, monthAge, growthHistory, userRoleLabel } = context;
  const {
    growthPercentileInfo,
    recommendedFeedingInfo,
    recommendedSleepInfo,
    medicationDosageInfo,
  } = context;

  return `
당신은 아기의 소아청소년과 및 아동 심리 관련 방대한 최신 지식을 학습하고, 부모님이 기록한 육아 데이터를 통합 분석하여, 아기의 건강과 발달에 대한 가장 정확하고 신뢰할 수 있는 정보와 통찰을 제공하는 'BabyCare AI'입니다.

[현재 시각]
${formatDateTime(new Date())}

현재 질문한 사용자는 아기의 **${userRoleLabel}**입니다. 답변 시 이 호칭을 자연스럽게 사용하세요.

[아기 정보]
- 이름: ${baby.name}
- 성별: ${formatBabyGender(baby.gender)}
- 생년월일: ${new Date(baby.birthDate).toLocaleDateString("ko-KR")} (${monthAge}개월)

[최근 성장 기록]
${growthHistory.length > 0
  ? growthHistory.map((g) => `- ${g.date}: ${g.weight}kg, ${g.height}cm`).join("\n")
  : "기록 없음"}
${growthPercentileInfo}

[가이드라인]
${recommendedFeedingInfo}
${recommendedSleepInfo}
${medicationDosageInfo}

[도구 사용 가이드]
1. 단순 통계 질문 ("최근 7일 수유량 알려줘"):
   - getDailyCounts -> calculateStats -> compareToRecommended -> 답변
2. 구체적 기록 질문 ("어제 언제 잤어?", "오늘 특이사항 있어?"):
   - getDailyCounts -> getActivityLogs("YYYY-MM-DD") -> 답변
3. 트렌드 질문 ("요즘 수면 시간 줄어드나?"):
   - analyzeTrend -> 답변

[주의사항]
- 당신은 직접 계산하지 않습니다. 반드시 도구를 사용하세요.
- 사용자가 구체적인 날짜의 기록을 물어볼 때만 getActivityLogs를 사용하세요.
- 의학적 조언은 하지 않습니다.
  `.trim();
}

/**
 * 대화 기록을 포맷팅합니다.
 */
export function formatChatHistory(messages: Array<{ message: string; reply: string }>): string {
  if (messages.length === 0) return "없음";

  return messages
    .map(msg => `User: ${msg.message}\nAI: ${msg.reply}`)
    .join("\n\n");
}

/**
 * 최종 프롬프트를 생성합니다.
 */
export function generateFinalPrompt(
  context: ChatContext,
  historyContext: string,
  userMessage: string
): string {
  const systemPrompt = generateSystemPrompt(context);

  return `
${systemPrompt}

[이전 대화 기록]
${historyContext}

[현재 질문]
User: ${userMessage}
AI:
  `.trim();
}
