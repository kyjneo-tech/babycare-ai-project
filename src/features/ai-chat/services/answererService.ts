// src/features/ai-chat/services/answererService.ts
/**
 * AI #2: Answerer Service
 * 
 * 역할:
 * - Orchestrator가 수집한 데이터 해석
 * - 순수 텍스트 형식의 답변 생성 (마크다운 기호 제거)
 * - 데이터 부족 시 역질문 생성
 * - 친근하고 이해하기 쉬운 답변 제공
 */

import { genAI } from "@/shared/lib/gemini";
import { OrchestratorOutput } from "./orchestratorService";

// ============================================================
// Answerer 시스템 프롬프트 생성
// ============================================================

function generateAnswererPrompt(
  babyName: string,
  monthAge: number, // 개월 수 추가
  userRole: string,
  userQuestion: string,
  orchestratorOutput: OrchestratorOutput
): string {
  const { dataSummary, missingInfo, noDataReason } = orchestratorOutput;

  return `# BabyCare AI 상담
아기: ${babyName} (${monthAge}개월), 사용자: ${userRole}
질문: ${userQuestion}

# 데이터
${JSON.stringify(dataSummary, null, 2)}

# 답변 원칙
1. **신뢰도 최우선**
   - 구체적 수치 사용 ("평균 6.5회")
   - 기간 명시 ("최근 7일 기준")
   - 추측 금지 ("~같아요" 대신 데이터 기반 팩트만)

2. **의학적 책임 회피**
   - 발열 38도 이상, 급격한 변화 등 이상 징후 시 "전문의 상담 권장" 명시

3. **풍부한 상담 (3단 구조)**
   - 1단: 요약 (핵심 결론)
   - 2단: 상세 분석 (평균, 범위, 변화 추이, 특이사항)
   - 3단: 조언 (데이터 기반 제안)

4. **형식**
   - 순수 텍스트 (마크다운 금지)
   - 문단 사이 빈 줄
   - 이모지 사용 가능

# 예외 처리 (매우 중요)
- **데이터 부족 시 (dataAvailable: false)**: 
   1. **조회 사실 언급**: "${babyName}의 데이터를 찾아보았지만, 아직 기록된 내용이 없어서 정확한 분석이 어려워요." (솔직함=신뢰)
   2. **월령 기반 일반 상담 전환**: "하지만 ${monthAge}개월 아기들의 평균적인 발달 기준을 바탕으로 설명드릴게요."
   3. **지식 전달**: 해당 월령의 표준 수유량, 수면 시간, 발달 특징 등을 상세히 안내.
   4. **기록 독려**: "앞으로 수유나 수면 등을 기록해 주시면, 제가 ${babyName}만의 맞춤형 분석을 해드릴게요!"
- **데이터 일부 부족**: 부족한 정보를 명확히 언급하고, 있는 데이터 + 일반론으로 답변.

답변:`;
}

// ============================================================
// Answerer 실행
// ============================================================

export async function runAnswerer(
  babyName: string,
  monthAge: number, // 개월 수 파라미터 추가
  userRole: string,
  userQuestion: string,
  orchestratorOutput: OrchestratorOutput
): Promise<string> {
  const prompt = generateAnswererPrompt(
    babyName,
    monthAge,
    userRole,
    userQuestion,
    orchestratorOutput
  );

  console.log("---------------------------------------------------");
  console.log("Answerer Prompt:");
  console.log(prompt);
  console.log("---------------------------------------------------");

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let answer = response.text();

    console.log("---------------------------------------------------");
    console.log("Answerer Raw Response:");
    console.log(answer);
    console.log("---------------------------------------------------");

    // 추가 마크다운 기호 제거 (혹시 모를 경우 대비)
    answer = answer
      .replace(/\*\*/g, "")  // ** 제거
      .replace(/\*/g, "")    // * 제거
      .replace(/^#{1,6}\s+/gm, "")  // # 제거
      .replace(/^[-*+]\s+/gm, "")   // 리스트 기호 제거 (줄 시작)
      .trim();

    return answer;
  } catch (error: any) {
    console.error("Answerer 실행 실패:", error);
    return `죄송해요, 답변 생성 중 오류가 발생했습니다. 다시 한 번 질문해주시겠어요? 😊`;
  }
}
