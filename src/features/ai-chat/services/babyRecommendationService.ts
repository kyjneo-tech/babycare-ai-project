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

// ==========================================
// 1. 권장 기준 상수 및 조회 함수 (Raw Data)
// ==========================================

export interface FeedingRecommendation {
  minCount: number;
  maxCount: number;
  minVolume: number;
  maxVolume: number;
  description: string;
}

export function getFeedingRecommendationRange(months: number): FeedingRecommendation {
  if (months < 1) return { minCount: 8, maxCount: 12, minVolume: 60, maxVolume: 90, description: "신생아" };
  if (months < 3) return { minCount: 6, maxCount: 8, minVolume: 90, maxVolume: 120, description: "1-3개월" };
  if (months < 6) return { minCount: 5, maxCount: 6, minVolume: 120, maxVolume: 180, description: "3-6개월" };
  if (months < 12) return { minCount: 4, maxCount: 5, minVolume: 180, maxVolume: 240, description: "6-12개월 (이유식 병행)" };
  return { minCount: 3, maxCount: 4, minVolume: 200, maxVolume: 240, description: "12개월 이상 (이유식 위주)" };
}

export interface SleepRecommendation {
  totalMin: number;
  totalMax: number;
  nightMin: number;
  nightMax: number;
  napMin: number;
  napMax: number;
  description: string;
}

export function getSleepRecommendationRange(months: number): SleepRecommendation {
  if (months < 3) return { totalMin: 14, totalMax: 17, nightMin: 8, nightMax: 9, napMin: 7, napMax: 8, description: "신생아-3개월" };
  if (months < 6) return { totalMin: 12, totalMax: 15, nightMin: 10, nightMax: 11, napMin: 3, napMax: 4, description: "3-6개월" };
  if (months < 12) return { totalMin: 12, totalMax: 14, nightMin: 11, nightMax: 12, napMin: 2, napMax: 3, description: "6-12개월" };
  return { totalMin: 11, totalMax: 14, nightMin: 10, nightMax: 12, napMin: 1, napMax: 2, description: "12개월 이상" };
}

// ==========================================
// 2. 기존 텍스트 생성 함수 (위 함수 활용)
// ==========================================

// 성장 백분위 계산 (매우 단순화된 예시, 실제로는 복잡한 차트 데이터 필요)
export function calculateGrowthPercentiles(babyInfo: BabyInfoForRecommendations): { weightPercentile?: string; heightPercentile?: string } {
  const ageInMonths = getAgeInMonths(babyInfo.birthDate);
  const { weightKg, heightCm } = babyInfo;

  let weightPercentile: string | undefined;
  let heightPercentile: string | undefined;

  // 예시: 6개월 남아 기준 (실제 데이터 아님) - 기존 로직 유지
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
  return { weightPercentile, heightPercentile };
}

// 권장 수유량 가이드라인 텍스트
export function getRecommendedFeedingAmount(babyInfo: BabyInfoForRecommendations): string {
  const ageInMonths = getAgeInMonths(babyInfo.birthDate);
  const rec = getFeedingRecommendationRange(ageInMonths);
  return `${rec.description}: ${rec.minVolume}-${rec.maxVolume}ml/회, 하루 ${rec.minCount}-${rec.maxCount}회`;
}

// 권장 수면 시간 가이드라인 텍스트
export function getRecommendedSleepDuration(babyInfo: BabyInfoForRecommendations): string {
  const ageInMonths = getAgeInMonths(babyInfo.birthDate);
  const rec = getSleepRecommendationRange(ageInMonths);
  return `${rec.description}: 하루 ${rec.totalMin}-${rec.totalMax}시간 (밤잠 ${rec.nightMin}-${rec.nightMax}시간, 낮잠 ${rec.napMin}-${rec.napMax}시간)`;
}

// 약 적정 용량 가이드라인 (기존 유지)
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

  return "해당 약에 대한 일반적인 용량 정보는 없습니다. 의사 또는 약사와 상담하세요.";
}

