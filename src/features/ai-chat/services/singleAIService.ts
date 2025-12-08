import { genAI } from "@/shared/lib/gemini";


/**
 * Single AI 서비스
 * 
 * 역할:
 * 단순 질문(인사, 일반 상식 등)에 대해 빠르고 저렴하게 응답합니다.
 * 도구 호출이나 복잡한 데이터 분석 단계 없이(Orchestrator 생략) 바로 답변을 생성합니다.
 */
export async function runSingleAI(
  babyName: string,
  monthAge: number,
  userRole: string,
  userQuestion: string,
  chatHistoryContext: string
): Promise<string> {
  const prompt = `# 역할
당신은 BabyCare AI - 육아 상담 전문가입니다.

# 기본 정보
- 아기: ${babyName} (${monthAge}개월)
- 사용자: ${userRole}
- 질문: ${userQuestion}

# 답변 원칙
1. **간결하고 명확하게** (3~5문장 내외)
2. **${monthAge}개월 기준**으로 설명 (필요 시)
3. **일반론 + 따뜻한 공감**
4. **의학적 진단 금지** (필요시 전문의 상담 권장)

${chatHistoryContext ? `# 이전 대화\n${chatHistoryContext}\n` : ""}

# 주의사항
- 추측성 답변 금지
- 마크다운(bold, list 등) 사용 금지 (순수 텍스트)
- 이모지는 자연스럽게 사용 가능

답변:`;

  // Single AI는 속도와 비용이 중요하므로 Flash 모델 사용
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  
  try {
    const result = await model.generateContent(prompt);
    let answer = result.response.text();

    // 마크다운 제거 (안전장치)
    answer = answer
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/^#{1,6}\s+/gm, "")
      .trim();

    return answer;
  } catch (error) {
    console.error("Single AI Error:", error);
    // 에러 시 기본 응답
    return "죄송해요, 지금은 답변을 드리기 잠시 어려워요. 조금 뒤에 다시 물어봐주시겠어요? 😢";
  }
}
