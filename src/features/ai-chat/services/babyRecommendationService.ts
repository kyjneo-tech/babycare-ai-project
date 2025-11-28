// src/features/ai-chat/services/babyRecommendationService.ts

interface BabyInfoForRecommendations {
  birthDate: Date;
  gender: "MALE" | "FEMALE";
  weightKg?: number; // 현재 체중 (kg)
  heightCm?: number; // 현재 키 (cm)
}

// 아기 월령 계산
function getAgeInMonths(birthDate: Date): number {
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - birthDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 30.4375); // 평균 한 달 일수
}

// 성장 백분위 계산 (매우 단순화된 예시, 실제로는 복잡한 차트 데이터 필요)
// 이 함수는 실제 성장 차트 데이터를 기반으로 구현되어야 합니다.
// 여기서는 예시를 위해 매우 단순화된 로직을 사용합니다.
export function calculateGrowthPercentiles(babyInfo: BabyInfoForRecommendations): { weightPercentile?: string; heightPercentile?: string } {
  const ageInMonths = getAgeInMonths(babyInfo.birthDate);
  const { weightKg, heightCm } = babyInfo;

  let weightPercentile: string | undefined;
  let heightPercentile: string | undefined;

  // 예시: 6개월 남아 기준 (실제 데이터 아님)
  if (ageInMonths === 6 && babyInfo.gender === "MALE") {
    if (weightKg !== undefined) {
      if (weightKg < 7) weightPercentile = "10th 미만";
      else if (weightKg >= 7 && weightKg < 8) weightPercentile = "10th - 50th";
      else if (weightKg >= 8 && weightKg < 9) weightPercentile = "50th - 90th";
      else weightPercentile = "90th 이상";
    }
    if (heightCm !== undefined) {
      if (heightCm < 65) heightPercentile = "10th 미만";
      else if (heightCm >= 65 && heightCm < 68) heightPercentile = "10th - 50th";
      else if (heightCm >= 68 && heightCm < 71) heightPercentile = "50th - 90th";
      else heightPercentile = "90th 이상";
    }
  }
  // TODO: 실제 성장 차트 데이터를 기반으로 더 정교하게 구현 필요

  return { weightPercentile, heightPercentile };
}

// 권장 수유량 계산 (매우 단순화된 예시)
export function getRecommendedFeedingAmount(babyInfo: BabyInfoForRecommendations): string {
  const ageInMonths = getAgeInMonths(babyInfo.birthDate);

  if (ageInMonths < 1) return "신생아: 60-90ml/회, 하루 8-12회";
  if (ageInMonths < 3) return "1-3개월: 90-120ml/회, 하루 6-8회";
  if (ageInMonths < 6) return "3-6개월: 120-180ml/회, 하루 5-6회";
  if (ageInMonths < 12) return "6-12개월: 180-240ml/회, 하루 4-5회 (이유식 병행)";
  return "12개월 이상: 이유식 위주, 보충 수유";
}

// 권장 수면 시간 계산 (매우 단순화된 예시)
export function getRecommendedSleepDuration(babyInfo: BabyInfoForRecommendations): string {
  const ageInMonths = getAgeInMonths(babyInfo.birthDate);

  if (ageInMonths < 3) return "신생아-3개월: 하루 14-17시간 (밤잠 8-9시간, 낮잠 7-8시간)";
  if (ageInMonths < 6) return "3-6개월: 하루 12-15시간 (밤잠 10-11시간, 낮잠 3-4시간)";
  if (ageInMonths < 12) return "6-12개월: 하루 12-14시간 (밤잠 11-12시간, 낮잠 2-3시간)";
  return "12개월 이상: 하루 11-14시간";
}

// 약 적정 용량 가이드라인 (매우 일반적인 예시, 실제로는 약 종류와 체중 기반)
export function getMedicationDosageGuideline(babyInfo: BabyInfoForRecommendations, medicineName: string): string {
  const { weightKg } = babyInfo;

  if (!weightKg) return "체중 정보가 없어 정확한 용량 안내가 어렵습니다. 의사 또는 약사와 상담하세요.";

  // 예시: 아세트아미노펜 (타이레놀 시럽)
  if (medicineName.includes("아세트아미노펜") || medicineName.includes("타이레놀")) {
    // 10-15mg/kg/회, 4-6시간 간격
    const minDose = (10 * weightKg).toFixed(0);
    const maxDose = (15 * weightKg).toFixed(0);
    return `아세트아미노펜 (해열제): 체중 1kg당 10-15mg/회, 4-6시간 간격. ${weightKg}kg 아기의 경우 ${minDose}-${maxDose}mg/회. (시럽의 경우 농도 확인 필요)`;
  }
  // TODO: 다른 약에 대한 가이드라인 추가

  return "해당 약에 대한 일반적인 용량 정보는 없습니다. 의사 또는 약사와 상담하세요.";
}
