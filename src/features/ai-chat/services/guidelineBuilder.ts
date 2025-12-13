import {
  getFeedingGuideline,
  getBabyFoodGuideline,
  getSleepGuideline,
} from "@/shared/lib/growthGuidelines";

/**
 * 아기의 체중과 나이를 기반으로 가이드라인 메시지를 생성합니다.
 */
export function buildGuidelineMessages(
  currentWeight: number | null,
  monthAge: number | null
): string {
  const guidelineMessages: string[] = [];

  if (currentWeight) {
    const feedingGuide = getFeedingGuideline(currentWeight);
    guidelineMessages.push(
      `[권장 수유량] 체중 ${currentWeight}kg 기준, 1회 권장량은 ${feedingGuide.perFeeding.min}~${feedingGuide.perFeeding.max}ml입니다.`
    );
  }

  if (currentWeight && monthAge !== null && monthAge >= 0) {
    const babyFoodGuide = getBabyFoodGuideline(currentWeight, monthAge);
    guidelineMessages.push(
      `[권장 이유식량] 체중 ${currentWeight}kg, 생후 ${monthAge}개월 기준 (${babyFoodGuide.stage}), 1회 권장량은 ${babyFoodGuide.min}~${babyFoodGuide.max}g입니다.`
    );
  }

  if (monthAge !== null && monthAge >= 0) {
    const sleepGuide = getSleepGuideline(monthAge);
    guidelineMessages.push(
      `[권장 수면 시간] 생후 ${monthAge}개월 기준, 하루 총 수면은 ${sleepGuide.total}, 낮잠은 ${sleepGuide.naps}입니다.`
    );
  }

  return guidelineMessages.join("\n");
}
