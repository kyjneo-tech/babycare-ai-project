/**
 * 대화 기록 필요성 분석
 *
 * 이전 대화 기록이 필요한지 자동으로 판단합니다.
 */

export interface ChatHistoryNeeds {
  needsHistory: boolean;      // 자동으로 제공할지
  count: number;               // 제공할 개수 (0이면 제공 안 함)
  autoProvide: boolean;        // true면 자동 제공, false면 도구로만 제공
  reason: string;              // 판단 이유 (디버깅용)
}

/**
 * 대화 기록 필요성 분석 (하이브리드 방식)
 */
export function analyzeChatHistoryNeeds(message: string): ChatHistoryNeeds {
  const lowerMessage = message.toLowerCase();

  // ========================================
  // Phase 1: 명확히 불필요한 질문
  // ========================================

  const unnecessaryPatterns = [
    // 데이터/통계 질문 (이전 대화 불필요)
    /^(오늘|어제|최근|지난주|이번주|이번달).*(수유|수면|잠|기저귀|목욕|병원)/,

    // 성장 정보 질문
    /^우리 아기 (키|몸무게|체중|성장|발달)/,

    // 통계 질문
    /^(몇|얼마|평균|총)/,

    // 권장/비교 질문
    /(권장|정상|평균|괜찮|적절|비교)/,

    // 트렌드 질문
    /(늘었|줄었|변화|추세)/,
  ];

  for (const pattern of unnecessaryPatterns) {
    if (pattern.test(lowerMessage)) {
      return {
        needsHistory: false,
        count: 0,
        autoProvide: false,
        reason: `명확히 데이터 질문 - 패턴: ${pattern}`
      };
    }
  }

  // ========================================
  // Phase 2: 명확히 필요한 질문 (이전 대화 참조)
  // ========================================

  const necessaryPatterns = [
    // 이전 대화 직접 참조
    /(방금|아까|조금 전|이전에|전에).*(말|이야기|물어|답|대답)/,

    // 질문 재확인
    /뭐라고|뭐였|어떻게 (말|답|대답)/,

    // 반복/계속
    /(다시|또|또 한번|한번 더|계속)/,

    // 대화 이어가기
    /(그|그거|그게|그건|그래서|왜)/,  // 지시대명사

    // 이유/설명 추가 요청
    /^(이유|원인|왜|어떻게|설명)/,
  ];

  for (const pattern of necessaryPatterns) {
    if (pattern.test(lowerMessage)) {
      return {
        needsHistory: true,
        count: 5,
        autoProvide: true,
        reason: `명확히 이전 대화 참조 - 패턴: ${pattern}`
      };
    }
  }

  // ========================================
  // Phase 3: 건강 관련은 맥락이 도움될 수 있음
  // ========================================

  const healthKeywords = [
    '아프', '열', '체온', '증상', '병', '토', '설사',
    '기침', '콧물', '구토', '통증', '울', '보채',
    '이상', '걱정', '문제'
  ];

  const isHealthRelated = healthKeywords.some(keyword =>
    lowerMessage.includes(keyword)
  );

  if (isHealthRelated) {
    // 건강 관련은 최소 3개 대화 제공 (맥락 도움)
    return {
      needsHistory: true,
      count: 3,
      autoProvide: true,
      reason: '건강 관련 질문 - 맥락이 도움될 수 있음'
    };
  }

  // ========================================
  // Phase 4: 애매한 경우 - AI에게 도구만 제공
  // ========================================

  return {
    needsHistory: false,
    count: 0,
    autoProvide: false,
    reason: '애매한 질문 - AI가 필요시 도구 사용'
  };
}

/**
 * 분석 결과 로그 출력
 */
export function logChatHistoryAnalysis(message: string, needs: ChatHistoryNeeds): void {
  console.log('💬 Chat History Analysis:', {
    message,
    needsHistory: needs.needsHistory,
    count: needs.count,
    autoProvide: needs.autoProvide,
    reason: needs.reason,
  });
}

/**
 * 통계 수집용 (선택)
 */
export function getChatHistoryStats() {
  // 나중에 통계 수집 기능 추가 가능
  return {
    totalQuestions: 0,
    historyProvided: 0,
    historySaved: 0,
    savingsPercent: 0,
  };
}
