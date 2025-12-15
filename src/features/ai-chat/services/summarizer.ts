import { genAI } from "@/shared/lib/gemini";

const MAX_RETRIES = 3;
const INITIAL_BACKOFF = 1000; // 1 second

async function retryWithBackoff<T>(fn: () => Promise<T>, retries = MAX_RETRIES, delay = INITIAL_BACKOFF): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && (error.status === 503 || error.message?.includes("503") || error.message?.includes("overloaded"))) {
      console.warn(`⚠️ 503 Overload detected. Retrying in ${delay}ms... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

/**
 * 대화 내용을 3문장으로 요약합니다.
 * @param userMessage 사용자 질문
 * @param aiReply AI 답변
 * @returns 3문장 요약 텍스트
 */
export async function summarizeConversation(
  userMessage: string,
  aiReply: string
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `
다음 대화 내용을 핵심만 간추려 **3문장 이내**의 평문(Plain Text)으로 요약해줘.
기계적인 어투보다는 맥락을 기억하기 좋게 건조하게 요약할 것.
마크다운이나 불릿 기호를 절대 사용하지 말 것.

[사용자]: ${userMessage}
[AI]: ${aiReply}
    `.trim();

    // Retry 로직 적용
    const result = await retryWithBackoff(() => model.generateContent(prompt));
    const summary = result.response.text();

    return summary.trim();
  } catch (error: any) {
    console.error("Conversation summarization failed after retries:", error);
    return ""; // 최종 실패 시 빈 문자열 반환 (시스템 중단 방지)
  }
}
