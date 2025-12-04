/**
 * 질문을 분석하여 필요한 컨텍스트 유형을 결정합니다.
 */

export interface QuestionContext {
  needsGrowthData: boolean;
  needsGuidelines: boolean;
  needsActivityData: boolean;
  needsMedicationInfo: boolean;
  questionType: 'statistics' | 'specific_record' | 'trend' | 'general' | 'growth' | 'health';
  timeRange?: 'today' | 'yesterday' | 'week' | 'month' | 'all';
}

/**
 * 질문을 분석하여 필요한 컨텍스트를 판단합니다.
 */
export function analyzeQuestion(message: string): QuestionContext {
  const lowerMessage = message.toLowerCase();

  // 성장 관련 키워드
  const growthKeywords = ['키', '몸무게', '체중', '성장', '백분위', '발달'];
  const needsGrowthData = growthKeywords.some(keyword => lowerMessage.includes(keyword));

  // 가이드라인 필요 여부 (권장/정상/비교 등)
  const guidelineKeywords = ['권장', '정상', '평균', '비교', '괜찮', '적절'];
  const needsGuidelines = guidelineKeywords.some(keyword => lowerMessage.includes(keyword));

  // 활동 데이터 필요 여부
  const activityKeywords = ['수유', '수면', '잠', '기저귀', '먹', '자'];
  const needsActivityData = activityKeywords.some(keyword => lowerMessage.includes(keyword));

  // 약/건강 관련
  const medicationKeywords = ['약', '열', '체온', '아프', '증상'];
  const needsMedicationInfo = medicationKeywords.some(keyword => lowerMessage.includes(keyword));

  // 질문 유형 판단
  let questionType: QuestionContext['questionType'] = 'general';

  if (lowerMessage.match(/최근|요즘|평균|전체|주|일/)) {
    questionType = 'statistics';
  } else if (lowerMessage.match(/어제|오늘|그제|언제|몇 ?시/)) {
    questionType = 'specific_record';
  } else if (lowerMessage.match(/늘었|줄었|변화|추세|트렌드/)) {
    questionType = 'trend';
  } else if (needsGrowthData) {
    questionType = 'growth';
  } else if (needsMedicationInfo) {
    questionType = 'health';
  }

  // 시간 범위 판단
  let timeRange: QuestionContext['timeRange'];
  if (lowerMessage.includes('오늘')) timeRange = 'today';
  else if (lowerMessage.includes('어제')) timeRange = 'yesterday';
  else if (lowerMessage.match(/일주일|7일|주/)) timeRange = 'week';
  else if (lowerMessage.match(/한 ?달|30일|월/)) timeRange = 'month';

  return {
    needsGrowthData,
    needsGuidelines,
    needsActivityData,
    needsMedicationInfo,
    questionType,
    timeRange,
  };
}

/**
 * 질문 분석 결과를 로그로 출력합니다.
 */
export function logQuestionAnalysis(message: string, context: QuestionContext): void {
  console.log('📊 Question Analysis:', {
    message,
    type: context.questionType,
    timeRange: context.timeRange,
    needs: {
      growth: context.needsGrowthData,
      guidelines: context.needsGuidelines,
      activity: context.needsActivityData,
      medication: context.needsMedicationInfo,
    },
  });
}
