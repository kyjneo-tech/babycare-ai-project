import { prisma } from "@/shared/lib/prisma";
import { extractFeedingDailySummary } from "@/features/ai-chat/formatters/feedingFormatter";
import { extractSleepDailySummary } from "@/features/ai-chat/formatters/sleepFormatter";
import { extractDiaperDailySummary } from "@/features/ai-chat/formatters/diaperFormatter";
import { CleanedData } from "@/features/ai-chat/types";
import { PeriodSummary, PeriodStats, ComparisonResult, TrendType } from "../types/summary";

/**
 * 특정 날짜 범위의 활동 데이터를 수집합니다.
 */
async function collectActivityDataByDateRange(
  babyId: string,
  startDate: Date,
  endDate: Date
): Promise<CleanedData> {
  const [feedings, sleeps, diapers, temperatures, medicines] = await Promise.all([
    prisma.activity.findMany({
      where: {
        babyId,
        startTime: { gte: startDate, lte: endDate },
        type: "FEEDING",
      },
      select: {
        startTime: true,
        memo: true,
        feedingType: true,
        feedingAmount: true,
        breastSide: true,
        duration: true,
      },
      orderBy: { startTime: "desc" },
    }),
    prisma.activity.findMany({
      where: {
        babyId,
        startTime: { gte: startDate, lte: endDate },
        type: "SLEEP",
      },
      select: {
        startTime: true,
        endTime: true,
        memo: true,
        sleepType: true,
      },
      orderBy: { startTime: "desc" },
    }),
    prisma.activity.findMany({
      where: {
        babyId,
        startTime: { gte: startDate, lte: endDate },
        type: "DIAPER",
      },
      select: {
        startTime: true,
        memo: true,
        diaperType: true,
        stoolCondition: true,
      },
      orderBy: { startTime: "desc" },
    }),
    prisma.activity.findMany({
      where: {
        babyId,
        startTime: { gte: startDate, lte: endDate },
        type: "TEMPERATURE",
      },
      select: {
        startTime: true,
        memo: true,
        temperature: true,
      },
      orderBy: { startTime: "desc" },
    }),
    prisma.activity.findMany({
      where: {
        babyId,
        startTime: { gte: startDate, lte: endDate },
        type: "MEDICINE",
      },
      select: {
        startTime: true,
        memo: true,
        medicineName: true,
        medicineAmount: true,
        medicineUnit: true,
      },
      orderBy: { startTime: "desc" },
    }),
  ]);

  return {
    feedings: feedings.map((f) => ({
      ...f,
      startTime: f.startTime.toISOString(),
    })),
    sleeps: sleeps.map((s) => ({
      ...s,
      startTime: s.startTime.toISOString(),
      endTime: s.endTime ? s.endTime.toISOString() : null,
    })),
    diapers: diapers.map((d) => ({
      ...d,
      startTime: d.startTime.toISOString(),
    })),
    temperatures: temperatures.map((t) => ({
      ...t,
      startTime: t.startTime.toISOString(),
    })),
    medicines: medicines.map((m) => ({
      ...m,
      startTime: m.startTime.toISOString(),
    })),
    weights: [], // 요약에는 불필요
  };
}

/**
 * CleanedData로부터 통계 추출
 */
function extractPeriodStats(data: CleanedData): PeriodStats {
  // 수유 통계
  const feedingDaily = extractFeedingDailySummary(data.feedings || []);
  let feedingCount = 0;
  let totalFeedingAmount = 0;

  feedingDaily.forEach(day => {
    feedingCount += day.count;
    totalFeedingAmount += day.amount;
  });

  const feedingAvgAmount = feedingCount > 0
    ? Math.round(totalFeedingAmount / feedingCount)
    : 0;

  // 수면 통계
  const sleepCount = data.sleeps?.length || 0;
  let totalSleepMins = 0;

  if (sleepCount > 0) {
    data.sleeps?.forEach(sleep => {
      if (sleep.endTime) {
        const start = new Date(sleep.startTime).getTime();
        const end = new Date(sleep.endTime).getTime();
        const duration = Math.round((end - start) / (1000 * 60));
        totalSleepMins += duration;
      }
    });
  }

  const sleepAvgHours = sleepCount > 0
    ? Math.round((totalSleepMins / sleepCount / 60) * 10) / 10
    : 0;

  // 배변 통계
  const diaperDaily = extractDiaperDailySummary(data.diapers || []);
  let stoolCount = 0;
  let urineCount = 0;

  diaperDaily.forEach(day => {
    stoolCount += day.poop;
    urineCount += day.pee;
  });

  const diaperCount = stoolCount + urineCount;

  // 투약 통계
  const medicineCount = data.medicines?.length || 0;

  // 체온 통계
  const temperatureCount = data.temperatures?.length || 0;

  return {
    feedingCount,
    feedingAvgAmount,
    sleepCount,
    sleepAvgHours,
    diaperCount,
    stoolCount,
    urineCount,
    medicineCount,
    temperatureCount,
  };
}

/**
 * 두 값 비교하여 ComparisonResult 생성
 */
function compareValues(
  current: number,
  previous: number,
  activityName: string
): ComparisonResult {
  const diff = current - previous;

  // 이전 데이터가 없으면 "첫 기록"
  if (previous === 0 && current > 0) {
    return {
      diff: current,
      trend: "new" as TrendType,
      message: "이번이 첫 기록이에요 ✨",
    };
  }

  // 둘 다 0이면 "비슷해요"
  if (previous === 0 && current === 0) {
    return {
      diff: 0,
      trend: "same" as TrendType,
      message: "기록이 없어요",
    };
  }

  // 증가
  if (diff > 0) {
    return {
      diff,
      trend: "up" as TrendType,
      message: `지난 기간보다 ${Math.abs(diff)}회 더 많아요`,
    };
  }
  // 감소
  else if (diff < 0) {
    return {
      diff,
      trend: "down" as TrendType,
      message: `지난 기간보다 ${Math.abs(diff)}회 줄었어요`,
    };
  }
  // 동일
  else {
    return {
      diff: 0,
      trend: "same" as TrendType,
      message: "지난 기간과 비슷해요",
    };
  }
}

/**
 * 기간 요약 통계 계산
 * @param babyId - 아기 ID
 * @param currentDays - 현재 기간 일수 (7, 14, 30)
 */
export async function calculatePeriodSummary(
  babyId: string,
  currentDays: number
): Promise<PeriodSummary> {
  const now = new Date();

  // 현재 기간: 오늘부터 currentDays 일 전까지
  const currentEnd = new Date(now);
  currentEnd.setHours(23, 59, 59, 999);

  const currentStart = new Date(now);
  currentStart.setDate(currentStart.getDate() - (currentDays - 1));
  currentStart.setHours(0, 0, 0, 0);

  // 이전 기간: 현재 기간 시작일 바로 전날부터 같은 일수만큼
  const previousEnd = new Date(currentStart);
  previousEnd.setDate(previousEnd.getDate() - 1);
  previousEnd.setHours(23, 59, 59, 999);

  const previousStart = new Date(previousEnd);
  previousStart.setDate(previousStart.getDate() - (currentDays - 1));
  previousStart.setHours(0, 0, 0, 0);

  console.log("📊 [Summary Calculator]", {
    currentPeriod: `${currentStart.toISOString().split('T')[0]} ~ ${currentEnd.toISOString().split('T')[0]}`,
    previousPeriod: `${previousStart.toISOString().split('T')[0]} ~ ${previousEnd.toISOString().split('T')[0]}`,
  });

  // 데이터 수집
  const [currentData, previousData] = await Promise.all([
    collectActivityDataByDateRange(babyId, currentStart, currentEnd),
    collectActivityDataByDateRange(babyId, previousStart, previousEnd),
  ]);

  // 통계 추출
  const current = extractPeriodStats(currentData);
  const previous = extractPeriodStats(previousData);

  // 비교
  const comparison = {
    feeding: compareValues(current.feedingCount, previous.feedingCount, "수유"),
    sleep: compareValues(current.sleepCount, previous.sleepCount, "수면"),
    diaper: compareValues(current.diaperCount, previous.diaperCount, "배변"),
    medicine: compareValues(current.medicineCount, previous.medicineCount, "투약"),
  };

  return {
    current,
    previous,
    comparison,
  };
}
