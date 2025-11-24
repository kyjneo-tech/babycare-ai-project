// src/shared/lib/growthGuidelines.ts

/**
 * 이 파일은 아기의 성장(키, 체중)과 활동(수유, 수면)에 대한
 * 의학적/통계적 가이드라인을 계산하는 함수들을 포함합니다.
 * 모든 데이터는 질병관리청, 보건복지부 등 국내 공신력 있는 기관의
 * 공개된 자료를 기반으로 합니다.
 */

// 1-2. 질병관리청 2017 소아청소년 성장도표 데이터 단순화
// 출처: https://knhanes.kdca.go.kr/knhanes/sub08/sub08_04.do
// 남아/여아별, 개월수별 체중 백분위수 (단위: kg)
const KCDC_WEIGHT_CHARTS = {
  male: {
    '0': { p3: 2.5, p15: 2.9, p50: 3.3, p85: 3.7, p97: 4.2 },
    '3': { p3: 5.0, p15: 5.7, p50: 6.4, p85: 7.2, p97: 7.9 },
    '6': { p3: 6.4, p15: 7.3, p50: 8.0, p85: 8.8, p97: 9.6 },
    '12': { p3: 7.7, p15: 8.6, p50: 9.6, p85: 10.8, p97: 11.8 },
  },
  female: {
    '0': { p3: 2.4, p15: 2.8, p50: 3.2, p85: 3.7, p97: 4.0 },
    '3': { p3: 4.5, p15: 5.2, p50: 5.8, p85: 6.6, p97: 7.2 },
    '6': { p3: 5.8, p15: 6.5, p50: 7.3, p85: 8.2, p97: 9.0 },
    '12': { p3: 7.0, p15: 7.9, p50: 8.9, p85: 10.1, p97: 11.2 },
  },
};

/**
 * 아기의 성장 백분위를 추정합니다. (단순화된 버전)
 * @param weight 체중 (kg)
 * @param ageInMonths 생후 개월 수
 * @param gender 성별 ('male' | 'female')
 * @returns { percentile: number, label: string }
 */
export function getWeightPercentile(
  weight: number,
  ageInMonths: number,
  gender: 'male' | 'female'
) {
  const chart = KCDC_WEIGHT_CHARTS[gender];
  const ageData = chart[ageInMonths.toString() as keyof typeof chart];

  if (!ageData) return { percentile: 50, label: '평균' }; // 데이터 없는 경우 기본값

  if (weight < ageData.p3) return { percentile: 3, label: '하위 3%' };
  if (weight < ageData.p15) return { percentile: 15, label: '하위 15%' };
  if (weight < ageData.p50) return { percentile: 35, label: '평균 이하' };
  if (weight < ageData.p85) return { percentile: 65, label: '평균 이상' };
  if (weight < ageData.p97) return { percentile: 95, label: '상위 15%' };
  return { percentile: 97, label: '상위 3%' };
}


/**
 * 아기의 일일 권장 수유량을 계산합니다.
 * @param weight 체중 (kg)
 * @returns { daily: { min: number, max: number } }
 */
export function getFeedingGuideline(weight: number) {
  // 공식: 체중(kg) × 100~150ml
  const dailyMin = weight * 100;
  const dailyMax = weight * 150;
  
  // 1회 수유량 (하루 수유량 ÷ 6~8회 기준)
  const perFeedingMin = Math.round(dailyMin / 8);
  const perFeedingMax = Math.round(dailyMax / 6);
  
  return {
    daily: { min: Math.round(dailyMin), max: Math.round(dailyMax) },
    perFeeding: { min: perFeedingMin, max: perFeedingMax },
  };
}

/**
 * 아기의 일일 권장 수면 시간을 조회합니다.
 * @param ageInMonths 생후 개월 수
 * @returns { total: string, naps: string }
 */
export function getSleepGuideline(ageInMonths: number) {
  if (ageInMonths <= 3) return { total: '14-17시간', naps: '3-5회' };
  if (ageInMonths <= 11) return { total: '12-15시간', naps: '2-3회' };
  if (ageInMonths <= 24) return { total: '11-14시간', naps: '1-2회' };
  
  return { total: '10-13시간', naps: '1회' };
}

/**
 * 덱시부프로펜 계열 해열제의 권장 복용량을 계산합니다.
 * @param weight 체중 (kg)
 * @returns { dose: string, disclaimer: string }
 */
export function getDexibuprofenGuideline(weight: number) {
  const minDose = weight * 0.4;
  const maxDose = weight * 0.6;
  
  return {
    dose: `${minDose.toFixed(1)} ~ ${maxDose.toFixed(1)}ml`,
    disclaimer: "⚠️ 본 계산은 일반 참고용이며, 실제 투약 전 반드시 의사/약사와 상담하세요."
  };
}
