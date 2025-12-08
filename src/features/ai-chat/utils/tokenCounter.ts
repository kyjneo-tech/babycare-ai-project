/**
 * 텍스트의 대략적인 토큰 수 계산
 * (정확한 계산은 tiktoken 라이브러리 사용 필요하지만, 여기서는 간단한 추정치 사용)
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  // 간단한 추정: 
  // 영어: 1 토큰 ≈ 4 문자
  // 한글: 1 토큰 ≈ 1.5~2 문자 (UTF-8 바이트 수 고려 시 다름, 여기서는 보수적으로 3으로 나눔)
  return Math.ceil(text.length / 3);
}

/**
 * 프롬프트 토큰 계산
 */
export function calculatePromptTokens(
  systemPrompt: string,
  userMessage: string,
  chatHistory: string = ""
): number {
  return (
    estimateTokens(systemPrompt) +
    estimateTokens(userMessage) +
    estimateTokens(chatHistory)
  );
}

/**
 * 응답 토큰 계산
 */
export function calculateResponseTokens(response: string): number {
  return estimateTokens(response);
}
