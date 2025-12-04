import { prisma } from "@/shared/lib/prisma";
import { ChatContext, BabyInfo, GrowthHistoryItem } from "../types";
import { getMonthAge, getGenderForRecommendation } from "../utils/babyInfoUtils";
import {
  calculateGrowthPercentiles,
  getRecommendedFeedingAmount,
  getRecommendedSleepDuration,
  getMedicationDosageGuideline,
} from "./babyRecommendationService";

/**
 * 스마트 성장 기록 조회 (최근 1개월 + 직전 기록)
 */
async function getSmartGrowthHistory(babyId: string): Promise<GrowthHistoryItem[]> {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  // 1. 최근 1개월 기록
  const recentMeasurements = await prisma.babyMeasurement.findMany({
    where: {
      babyId,
      measuredAt: { gte: oneMonthAgo },
    },
    orderBy: { measuredAt: "asc" },
  });

  // 2. 1개월 이전의 가장 최근 기록 1개 (추세 비교용)
  const lastMeasurementBeforeMonth = await prisma.babyMeasurement.findFirst({
    where: {
      babyId,
      measuredAt: { lt: oneMonthAgo },
    },
    orderBy: { measuredAt: "desc" },
  });

  const history = lastMeasurementBeforeMonth
    ? [lastMeasurementBeforeMonth, ...recentMeasurements]
    : recentMeasurements;

  return history.map((m) => ({
    date: new Date(m.measuredAt).toLocaleDateString("ko-KR"),
    weight: m.weight,
    height: m.height,
  }));
}

/**
 * 성장 백분위 정보를 생성합니다.
 */
function generateGrowthPercentileInfo(
  baby: BabyInfo,
  latestMeasurement: { weight: number; height: number } | null
): string {
  if (!latestMeasurement) return "";

  const { weightPercentile, heightPercentile } = calculateGrowthPercentiles({
    birthDate: baby.birthDate,
    gender: getGenderForRecommendation(baby.gender),
    weightKg: latestMeasurement.weight,
    heightCm: latestMeasurement.height,
  });

  if (!weightPercentile && !heightPercentile) return "";

  let info = `\n[성장 백분위 (최신 기록 기준)]`;
  if (weightPercentile) info += `\n- 체중 백분위: ${weightPercentile}`;
  if (heightPercentile) info += `\n- 키 백분위: ${heightPercentile}`;

  return info;
}

/**
 * 권장 수유량 정보를 생성합니다.
 */
function generateRecommendedFeedingInfo(baby: BabyInfo): string {
  return `\n[권장 수유량 가이드라인]\n- ${getRecommendedFeedingAmount({
    birthDate: baby.birthDate,
    gender: getGenderForRecommendation(baby.gender),
  })}`;
}

/**
 * 권장 수면 시간 정보를 생성합니다.
 */
function generateRecommendedSleepInfo(baby: BabyInfo): string {
  return `\n[권장 수면 시간 가이드라인]\n- ${getRecommendedSleepDuration({
    birthDate: baby.birthDate,
    gender: getGenderForRecommendation(baby.gender),
  })}`;
}

/**
 * 약 적정 용량 정보를 생성합니다.
 */
async function generateMedicationDosageInfo(
  baby: BabyInfo,
  latestMeasurement: { weight: number; height: number } | null
): Promise<string> {
  if (!latestMeasurement?.weight) {
    return `\n[약 적정 용량 가이드라인]\n- 체중 정보가 없어 약 적정 용량 가이드라인 제공이 어렵습니다.`;
  }

  const recentMedicineActivity = await prisma.activity.findFirst({
    where: { babyId: baby.id, type: 'MEDICINE' },
    orderBy: { startTime: 'desc' }
  });

  if (!recentMedicineActivity || !recentMedicineActivity.medicineName) {
    return `\n[약 적정 용량 가이드라인]\n- 체중 정보는 있으나 최근 투약 기록이 없어 특정 약에 대한 가이드라인 제공이 어렵습니다.`;
  }

  return `\n[약 적정 용량 가이드라인 (최신 체중 기준)]\n- ${getMedicationDosageGuideline(
    {
      birthDate: baby.birthDate,
      gender: getGenderForRecommendation(baby.gender),
      weightKg: latestMeasurement.weight,
    },
    recentMedicineActivity.medicineName
  )}`;
}

/**
 * 사용자 역할 정보를 조회합니다.
 */
async function getUserRoleLabel(familyId: string, userId: string): Promise<string> {
  const familyMember = await prisma.familyMember.findFirst({
    where: {
      familyId,
      userId,
    },
    select: { relation: true },
  });

  const userRelation = familyMember?.relation || "보호자";
  const { getRelationLabel } = await import('../../families/constants/relationOptions');
  return getRelationLabel(userRelation);
}

/**
 * AI 채팅에 필요한 모든 컨텍스트 데이터를 조회합니다.
 */
export async function getChatContext(babyId: string, userId: string): Promise<ChatContext> {
  // 1. 아기 정보 조회
  const baby = await prisma.baby.findUnique({
    where: { id: babyId },
    select: {
      id: true,
      name: true,
      birthDate: true,
      gender: true,
      familyId: true,
    },
  });

  if (!baby) {
    throw new Error("아기 정보를 찾을 수 없습니다.");
  }

  // 2. 월령 계산
  const monthAge = getMonthAge(new Date(baby.birthDate));

  // 3. 성장 기록 조회
  const growthHistory = await getSmartGrowthHistory(babyId);

  // 4. 최신 측정 기록 조회
  const latestMeasurement = await prisma.babyMeasurement.findFirst({
    where: { babyId },
    orderBy: { measuredAt: "desc" },
    select: { weight: true, height: true },
  });

  // 5. 사용자 역할 조회
  const userRoleLabel = await getUserRoleLabel(baby.familyId, userId);

  // 6. 가이드라인 정보 생성
  const growthPercentileInfo = generateGrowthPercentileInfo(baby, latestMeasurement);
  const recommendedFeedingInfo = generateRecommendedFeedingInfo(baby);
  const recommendedSleepInfo = generateRecommendedSleepInfo(baby);
  const medicationDosageInfo = await generateMedicationDosageInfo(baby, latestMeasurement);

  return {
    baby,
    monthAge,
    growthHistory,
    latestMeasurement,
    userRoleLabel,
    growthPercentileInfo,
    recommendedFeedingInfo,
    recommendedSleepInfo,
    medicationDosageInfo,
  };
}

/**
 * 대화 기록을 조회합니다.
 */
export async function getChatHistoryContext(
  babyId: string,
  isHealthRelated: boolean
): Promise<string> {
  const historyCount = isHealthRelated ? 5 : 3;

  const recentMessages = await prisma.chatMessage.findMany({
    where: { babyId },
    orderBy: { createdAt: "desc" },
    take: historyCount,
  });

  // 시간순 정렬 (과거 -> 현재)
  const messages = recentMessages.reverse();

  if (messages.length === 0) return "없음";

  return messages
    .map(msg => `User: ${msg.message}\nAI: ${msg.reply}`)
    .join("\n\n");
}
