/**
 * 질문 복잡도 분석기
 * 
 * 역할:
 * 사용자 질문이 단순한지(Simple) 복잡한지(Complex) 분류합니다.
 * - Simple: 도구 호출이나 데이터 조회가 필요 없는 일반 대화, 인사, 기본 지식 질문 -> Single AI (빠름, 저렴)
 * - Complex: 아기 데이터를 조회하거나 분석이 필요한 질문 -> Dual AI (정확, 도구 사용)
 */

export type QuestionComplexity = "simple" | "complex";

export function analyzeQuestionComplexity(
  question: string
): QuestionComplexity {
  const q = question.toLowerCase().trim();

  // 데이터 키워드가 있으면 무조건 Complex (데이터 조회 필요)
  // 가장 강력한 조건이므로 먼저 체크
  const dataKeywords = [
    "오늘", "어제", "최근", "평균", "몇번", "몇회", "몇시간",
    "수유", "수면", "기저귀", "체온", "약", "체중", "키", "몸무게",
    "성장", "발달", "백분위", "지난주", "이번달"
  ];

  const hasDataKeyword = dataKeywords.some(k => q.includes(k));

  if (hasDataKeyword) {
    // 예외: "수유란 뭐야?" 처럼 정의를 묻는 경우에도, 
    // 기획상 "OO이는 최근 하루 ~회 수유해요" 같은 개인화 데이터를 섞어주기로 했으므로
    // 데이터 키워드가 들어가면 원칙적으로 Complex로 보내 데이터를 가져오는게 맞음.
    // 하지면 "수유 방법 알려줘" 같은 경우 굳이 데이터가 필수적이지 않을 수 있음.
    // 그러나 하이브리드 시스템 정책상 "개인화 예시"를 위해 Complex로 보내는 것이 안전함.
    return "complex";
  }

  // ========================================
  // SIMPLE: 도구 호출 불필요
  // ========================================

  const simplePatterns = [
    // 인사 / 가벼운 대화
    /^(안녕|하이|헬로|hi|hello|반가워)/,
    /^(고마워|감사|수고)/,
    /^잘자$/,
    /^사랑해$/,

    // 단순 개념 설명 (데이터 키워드가 없는 경우에만 여기 도달)
    /이란|뭐야|의미|정의|설명해줘|차이점/,
    
    // 일반적인 육아 정보 (데이터 없이 답할 수 있는)
    /방법|꿀팁|추천해/,
    /주의할|조심해야/,
    
    // 시기 질문 (일반론)
    /몇 개월에|언제부터|시기|언제/,
  ];

  for (const pattern of simplePatterns) {
    if (pattern.test(q)) {
      return "simple";
    }
  }

  // ========================================
  // COMPLEX: 기본값
  // ========================================
  // 애매하면 데이터를 확인하는 쪽이 더 안전하고 풍부한 답변 가능

  return "complex";
}
