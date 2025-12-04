import { prisma } from "@/shared/lib/prisma";
import { getFeedingRecommendationRange, getSleepRecommendationRange } from "../services/babyRecommendationService";

// ==========================================
// Types
// ==========================================

export interface GetActivityLogsParams {
  babyId: string;
  date: string; // "2024-11-26"
}

export interface CalculateStatsParams {
  babyId: string;
  startDate: string;  // "2024-11-26"
  endDate: string;    // "2024-12-02"
  activityType?: 'FEEDING' | 'SLEEP' | 'DIAPER' | 'ALL';
  excludeDates?: string[];  // AI가 지정한 제외 날짜
}

export interface StatsResult {
  period: { start: string; end: string };
  totalDays: number;
  excludedDates: string[];
  analyzedDays: number;

  feeding?: {
    totalCount: number;
    avgPerDay: number;
    avgAmount: number; // 1회 평균
    totalAmount: number; // 총 수유량
    avgDailyAmount: number; // 일일 평균 수유량
    byType: { breast: number; formula: number };
  };

  sleep?: {
    totalMinutes: number;
    avgHoursPerDay: number;
    nightSleep: { 
      totalMinutes: number;
      avgHoursPerDay: number;
      count: number;
    };
    napSleep: { 
      totalMinutes: number;
      avgHoursPerDay: number;
      count: number;
    };
  };

  diaper?: {
    totalCount: number;
    avgPerDay: number;
    urine: {
      total: number;
      avgPerDay: number;
    };
    stool: {
      total: number;
      avgPerDay: number;
    };
    stoolConditions: Record<string, number>;
  };
}

export interface CalculateSpecificDatesParams {
  babyId: string;
  dates: string[];  // ["2024-11-26", "2024-11-27", "2024-11-29"]
  activityType?: 'FEEDING' | 'SLEEP' | 'DIAPER' | 'ALL';
}

export interface GetDailyCountsParams {
  babyId: string;
  startDate: string;
  endDate: string;
}

export interface DailyCount {
  date: string;
  totalCount: number;
  byType: {
    FEEDING: number;
    SLEEP: number;
    DIAPER: number;
    [key: string]: number;
  };
}

export interface CompareToRecommendedParams {
  babyId: string;
  metric: 'feeding_count' | 'feeding_volume' | 'sleep_total' | 'sleep_night' | 'sleep_nap';
  actualValue: number;  // AI가 계산한 값
}

export interface ComparisonResult {
  actualValue: number;
  recommendedRange: { min: number; max: number };
  status: 'below' | 'normal' | 'above';
  difference: number;
  message: string;
}

export interface AnalyzeTrendParams {
  babyId: string;
  metric: 'feeding_count' | 'feeding_amount' | 'sleep_hours' | 'diaper_count';
  days: number;
}

export interface TrendResult {
  trend: 'increasing' | 'decreasing' | 'stable';
  changePercent: number;
  dailyValues: { date: string; value: number }[];
  message: string;
}

export interface GetRelativeDateParams {
  relative: 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month';
}

export interface RelativeDateResult {
  startDate: string;
  endDate: string;
  description: string;
}

// ==========================================
// Helpers
// ==========================================

function formatDate(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDaysBetween(start: string, end: string): number {
  const oneDay = 24 * 60 * 60 * 1000;
  const firstDate = new Date(start);
  const secondDate = new Date(end);
  return Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / oneDay)) + 1;
}

function getDateRange(start: string, end: string): string[] {
  const dates = [];
  let currentDate = new Date(start);
  const stopDate = new Date(end);
  while (currentDate <= stopDate) {
    dates.push(formatDate(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
}

function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0);
}

function avg(arr: number[]): number {
  if (arr.length === 0) return 0;
  return sum(arr) / arr.length;
}

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function getMonthAge(birthDate: Date): number {
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - birthDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 30.4375);
}

// ==========================================
// Helper Functions
// ==========================================

function formatActivityLogs(activities: any[]): string {
  if (activities.length === 0) return "기록 없음";

  return activities.map(activity => {
    const time = new Date(activity.startTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
    let details = "";

    switch (activity.type) {
      case "FEEDING":
        const feedingType = activity.feedingType === "breast" ? "모유" :
                          activity.feedingType === "formula" ? "분유" :
                          activity.feedingType === "baby_food" ? "이유식" : "수유";
        details = `${feedingType} ${activity.feedingAmount ? `${activity.feedingAmount}ml` : ""}`;
        break;
      case "SLEEP":
        const durationMin = activity.duration ? Math.round(activity.duration / 60) : 0;
        const sleepType = activity.sleepType === "night" ? "밤잠" : "낮잠";
        details = `${sleepType} ${durationMin}분`;
        break;
      case "DIAPER":
        const diaperType = activity.diaperType === "urine" ? "소변" :
                           activity.diaperType === "stool" ? "대변" : "기저귀";
        details = `${diaperType}`;
        if (activity.stoolCondition) details += ` (${activity.stoolCondition})`;
        break;
      case "BATH":
        details = "목욕";
        break;
      case "HOSPITAL":
        details = "병원";
        break;
      default:
        details = activity.type;
    }

    if (activity.memo) details += ` | 메모: ${activity.memo}`;
    
    return `[${time}] ${details}`;
  }).join("\n");
}

// ==========================================
// Tools
// ==========================================

/**
 * 특정 날짜의 활동 로그를 텍스트로 조회합니다.
 * AI가 구체적인 기록 내용(메모, 시간 등)을 확인해야 할 때 사용합니다.
 */
export async function getActivityLogs(params: GetActivityLogsParams) {
  const { babyId, date } = params;
  
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const activities = await prisma.activity.findMany({
    where: {
      babyId,
      startTime: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    orderBy: { startTime: "asc" },
  });

  return {
    date,
    count: activities.length,
    logs: formatActivityLogs(activities)
  };
}

/**
 * 1. 날짜별 활동 수 조회 (AI가 판단 자료로 사용)
 */
export async function getDailyCounts(
  params: GetDailyCountsParams
): Promise<DailyCount[]> {
  const { babyId, startDate, endDate } = params;

  // KST 보정 등을 고려해야 하지만, 여기서는 단순 날짜 비교
  // DB가 UTC라면 start는 00:00, end는 23:59로 설정 필요
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const activities = await prisma.activity.findMany({
    where: {
      babyId,
      startTime: {
        gte: start,
        lte: end,
      },
    },
  });

  const dateRange = getDateRange(startDate, endDate);

  return dateRange.map(date => {
    const dayActivities = activities.filter(a =>
      isSameDay(new Date(a.startTime), new Date(date))
    );

    const byType: Record<string, number> = {};
    dayActivities.forEach(a => {
      byType[a.type] = (byType[a.type] || 0) + 1;
    });

    return {
      date,
      totalCount: dayActivities.length,
      byType: byType as any,
    };
  });
}

/**
 * 2. AI가 지정한 기간/날짜의 통계 계산 (핵심)
 */
export async function calculateStats(
  params: CalculateStatsParams
): Promise<StatsResult> {
  const { babyId, startDate, endDate, activityType = 'ALL', excludeDates = [] } = params;

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  // 활동 조회: 기간 내에 '걸쳐있는' 모든 활동을 조회 (수면 스플릿을 위해)
  const activities = await prisma.activity.findMany({
    where: {
      babyId,
      OR: [
        { startTime: { gte: start, lte: end } }, // 기간 내 시작
        { endTime: { gte: start, lte: end } },   // 기간 내 종료
        { startTime: { lt: start }, endTime: { gt: end } } // 기간을 포함 (기간보다 길게 걸쳐있음)
      ]
    },
    orderBy: { startTime: 'asc' },
  });

  const totalDays = getDaysBetween(startDate, endDate);
  const analyzedDays = Math.max(1, totalDays - excludeDates.length);

  const result: StatsResult = {
    period: { start: startDate, end: endDate },
    totalDays,
    excludedDates: excludeDates,
    analyzedDays,
  };

  // 날짜별로 순회하며 통계 계산
  const dateRange = getDateRange(startDate, endDate);
  const validDates = dateRange.filter(d => !excludeDates.includes(d));

  // 수유 통계 (시작 시간 기준)
  if (activityType === 'FEEDING' || activityType === 'ALL') {
    // 수유는 시작 시간이 해당 기간 내인 것만 집계 (기존 방식 유지)
    const feedings = activities.filter(a => 
      a.type === 'FEEDING' && 
      new Date(a.startTime) >= start && 
      new Date(a.startTime) <= end &&
      !excludeDates.includes(formatDate(a.startTime))
    );
    
    const totalAmount = sum(feedings.map(f => f.feedingAmount || 0));
    
    result.feeding = {
      totalCount: feedings.length,
      avgPerDay: Number((feedings.length / analyzedDays).toFixed(1)),
      avgAmount: Number(avg(feedings.map(f => f.feedingAmount || 0)).toFixed(1)),
      totalAmount: totalAmount,
      avgDailyAmount: Number((totalAmount / analyzedDays).toFixed(1)),
      byType: {
        breast: feedings.filter(f => f.feedingType === 'breast' || f.feedingType === 'breast_milk').length,
        formula: feedings.filter(f => f.feedingType === 'formula').length,
      },
    };
  }

  // 수면 통계 (기간 내 실제 수면 시간 기준 - 스플릿 적용)
  if (activityType === 'SLEEP' || activityType === 'ALL') {
    const sleeps = activities.filter(a => a.type === 'SLEEP');
    
    let totalMinutes = 0;
    let nightTotalMinutes = 0;
    let napTotalMinutes = 0;
    
    // 횟수는 시작 시간 기준으로 집계 (제외된 날짜의 시작은 제외)
    const validStarts = sleeps.filter(s => {
      const d = formatDate(s.startTime);
      return new Date(s.startTime) >= start && new Date(s.startTime) <= end && !excludeDates.includes(d);
    });
    
    const nightCount = validStarts.filter(s => s.sleepType === 'night').length;
    const napCount = validStarts.filter(s => s.sleepType === 'nap').length;

    // 시간은 '유효한 날짜'에 걸친 시간만 합산
    validDates.forEach(dateStr => {
      const dayStart = new Date(dateStr);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dateStr);
      dayEnd.setHours(23, 59, 59, 999);

      sleeps.forEach(s => {
        // 교집합 시간 계산
        const sTime = new Date(s.startTime);
        const eTime = s.endTime ? new Date(s.endTime) : new Date(); // 종료 시간 없으면 현재까지로 가정? 혹은 무시? 
        // 보통 종료되지 않은 수면은 계산에서 제외하거나 현재까지로 계산. 여기서는 endTime이 있는 경우만 정확히 계산 가능.
        // 데이터 무결성을 위해 endTime이 있는 경우만 계산하거나, 로직에 따라 처리.
        // 기존 로직은 duration 필드를 썼음. 스플릿을 위해선 startTime/endTime 필수.
        
        if (!s.endTime) return; // 종료 시간 없으면 계산 불가 (혹은 duration 필드 사용 불가 - 스플릿 안됨)

        const overlapStart = sTime > dayStart ? sTime : dayStart;
        const overlapEnd = eTime < dayEnd ? eTime : dayEnd;

        if (overlapStart < overlapEnd) {
          const durationMin = (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60);
          totalMinutes += durationMin;
          
          if (s.sleepType === 'night') nightTotalMinutes += durationMin;
          else napTotalMinutes += durationMin;
        }
      });
    });

    result.sleep = {
      totalMinutes: Math.round(totalMinutes),
      avgHoursPerDay: Number((totalMinutes / analyzedDays / 60).toFixed(1)),
      nightSleep: {
        totalMinutes: Math.round(nightTotalMinutes),
        avgHoursPerDay: Number((nightTotalMinutes / analyzedDays / 60).toFixed(1)),
        count: nightCount,
      },
      napSleep: {
        totalMinutes: Math.round(napTotalMinutes),
        avgHoursPerDay: Number((napTotalMinutes / analyzedDays / 60).toFixed(1)),
        count: napCount,
      },
    };
  }

  // 배변 통계 (시작 시간 기준)
  if (activityType === 'DIAPER' || activityType === 'ALL') {
    const diapers = activities.filter(a => 
      a.type === 'DIAPER' && 
      new Date(a.startTime) >= start && 
      new Date(a.startTime) <= end &&
      !excludeDates.includes(formatDate(a.startTime))
    );

    const stoolConditions: Record<string, number> = {};

    diapers.forEach(d => {
      if (d.stoolCondition) {
        stoolConditions[d.stoolCondition] = (stoolConditions[d.stoolCondition] || 0) + 1;
      }
    });

    const urineCount = diapers.filter(d => d.diaperType === 'urine').length;
    const stoolCount = diapers.filter(d => d.diaperType === 'stool').length;

    result.diaper = {
      totalCount: diapers.length,
      avgPerDay: Number((diapers.length / analyzedDays).toFixed(1)),
      urine: {
        total: urineCount,
        avgPerDay: Number((urineCount / analyzedDays).toFixed(1)),
      },
      stool: {
        total: stoolCount,
        avgPerDay: Number((stoolCount / analyzedDays).toFixed(1)),
      },
      stoolConditions,
    };
  }

  return result;
}

/**
 * 3. AI가 선택한 특정 날짜들만 계산
 */
export async function calculateSpecificDates(
  params: CalculateSpecificDatesParams
): Promise<StatsResult> {
  const { babyId, dates, activityType = 'ALL' } = params;

  if (dates.length === 0) {
    throw new Error("Dates array cannot be empty");
  }

  // 날짜 범위 구하기 (쿼리 최적화용)
  const sortedDates = [...dates].sort();
  const startDate = sortedDates[0];
  const endDate = sortedDates[sortedDates.length - 1];

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const activities = await prisma.activity.findMany({
    where: {
      babyId,
      startTime: {
        gte: start,
        lte: end,
      },
    },
  });

  // 지정된 날짜만 필터링
  const filteredActivities = activities.filter(a => {
    const dateStr = formatDate(a.startTime);
    return dates.includes(dateStr);
  });

  // calculateStats 로직 재사용을 위해 내부 함수로 분리하거나, 여기서 직접 계산
  // 여기서는 직접 계산 로직을 수행 (calculateStats와 동일한 로직)
  
  const analyzedDays = Math.max(1, dates.length);
  const result: StatsResult = {
    period: { start: startDate, end: endDate },
    totalDays: dates.length,
    excludedDates: [],
    analyzedDays,
  };

  // ... (calculateStats와 동일한 계산 로직 복사 - 실제로는 함수 분리가 좋음)
  // 편의상 위 calculateStats 함수를 호출하는 방식으로 변경 불가 (파라미터가 다름)
  // 따라서 핵심 계산 로직을 수행합니다.

  // 수유
  if (activityType === 'FEEDING' || activityType === 'ALL') {
    const feedings = filteredActivities.filter(a => a.type === 'FEEDING');
    const totalAmount = sum(feedings.map(f => f.feedingAmount || 0));
    result.feeding = {
      totalCount: feedings.length,
      avgPerDay: Number((feedings.length / analyzedDays).toFixed(1)),
      avgAmount: Number(avg(feedings.map(f => f.feedingAmount || 0)).toFixed(1)),
      totalAmount: totalAmount,
      avgDailyAmount: Number((totalAmount / analyzedDays).toFixed(1)),
      byType: {
        breast: feedings.filter(f => f.feedingType === 'breast' || f.feedingType === 'breast_milk').length,
        formula: feedings.filter(f => f.feedingType === 'formula').length,
      },
    };
  }

  // 수면
  if (activityType === 'SLEEP' || activityType === 'ALL') {
    const sleeps = filteredActivities.filter(a => a.type === 'SLEEP');
    const nightSleeps = sleeps.filter(s => s.sleepType === 'night');
    const napSleeps = sleeps.filter(s => s.sleepType === 'nap');
    const totalMinutes = sum(sleeps.map(s => s.duration || 0));
    const nightTotalMinutes = sum(nightSleeps.map(s => s.duration || 0));
    const napTotalMinutes = sum(napSleeps.map(s => s.duration || 0));

    result.sleep = {
      totalMinutes,
      avgHoursPerDay: Number((totalMinutes / analyzedDays / 60).toFixed(1)),
      nightSleep: {
        totalMinutes: nightTotalMinutes,
        avgHoursPerDay: Number((nightTotalMinutes / analyzedDays / 60).toFixed(1)),
        count: nightSleeps.length,
      },
      napSleep: {
        totalMinutes: napTotalMinutes,
        avgHoursPerDay: Number((napTotalMinutes / analyzedDays / 60).toFixed(1)),
        count: napSleeps.length,
      },
    };
  }

  // 배변
  if (activityType === 'DIAPER' || activityType === 'ALL') {
    const diapers = filteredActivities.filter(a => a.type === 'DIAPER');
    const urineCount = diapers.filter(d => d.diaperType === 'urine').length;
    const stoolCount = diapers.filter(d => d.diaperType === 'stool').length;
    const stoolConditions: Record<string, number> = {};
    diapers.forEach(d => {
      if (d.stoolCondition) stoolConditions[d.stoolCondition] = (stoolConditions[d.stoolCondition] || 0) + 1;
    });

    result.diaper = {
      totalCount: diapers.length,
      avgPerDay: Number((diapers.length / analyzedDays).toFixed(1)),
      urine: {
        total: urineCount,
        avgPerDay: Number((urineCount / analyzedDays).toFixed(1)),
      },
      stool: {
        total: stoolCount,
        avgPerDay: Number((stoolCount / analyzedDays).toFixed(1)),
      },
      stoolConditions,
    };
  }

  return result;
}

/**
 * 4. 권장 기준과 비교 (babyRecommendationService 연동)
 */
export async function compareToRecommended(
  params: CompareToRecommendedParams
): Promise<ComparisonResult> {
  const { babyId, metric, actualValue } = params;

  const baby = await prisma.baby.findUnique({ where: { id: babyId } });
  if (!baby) throw new Error('Baby not found');

  const monthAge = getMonthAge(baby.birthDate);

  let recommended: { min: number; max: number };
  let unit: string;
  let description: string = "";

  if (metric === 'feeding_count') {
    const rec = getFeedingRecommendationRange(monthAge);
    recommended = { min: rec.minCount, max: rec.maxCount };
    unit = '회';
    description = rec.description;
  } else if (metric === 'feeding_volume') {
    const rec = getFeedingRecommendationRange(monthAge);
    recommended = { min: rec.minVolume, max: rec.maxVolume };
    unit = 'ml';
    description = rec.description;
  } else if (metric === 'sleep_total') {
    const rec = getSleepRecommendationRange(monthAge);
    recommended = { min: rec.totalMin, max: rec.totalMax };
    unit = '시간';
    description = rec.description;
  } else if (metric === 'sleep_night') {
    const rec = getSleepRecommendationRange(monthAge);
    recommended = { min: rec.nightMin, max: rec.nightMax };
    unit = '시간';
    description = rec.description;
  } else if (metric === 'sleep_nap') {
    const rec = getSleepRecommendationRange(monthAge);
    recommended = { min: rec.napMin, max: rec.napMax };
    unit = '시간';
    description = rec.description;
  } else {
    throw new Error('Unknown metric');
  }

  let status: 'below' | 'normal' | 'above';
  let difference: number;
  let message: string;

  if (actualValue < recommended.min) {
    status = 'below';
    difference = Number((recommended.min - actualValue).toFixed(1));
    message = `${description} 권장 범위(${recommended.min}~${recommended.max}${unit})보다 ${difference}${unit} 적습니다`;
  } else if (actualValue > recommended.max) {
    status = 'above';
    difference = Number((actualValue - recommended.max).toFixed(1));
    message = `${description} 권장 범위(${recommended.min}~${recommended.max}${unit})보다 ${difference}${unit} 많습니다`;
  } else {
    status = 'normal';
    difference = 0;
    message = `${description} 권장 범위(${recommended.min}~${recommended.max}${unit}) 내에 있습니다`;
  }

  return {
    actualValue,
    recommendedRange: recommended,
    status,
    difference,
    message,
  };
}

/**
 * 5. 트렌드 분석
 */
export async function analyzeTrend(
  params: AnalyzeTrendParams
): Promise<TrendResult> {
  const { babyId, metric, days } = params;

  // 최근 N일 데이터 조회
  const today = new Date();
  const startDate = new Date();
  startDate.setDate(today.getDate() - days + 1);

  const activities = await prisma.activity.findMany({
    where: {
      babyId,
      startTime: {
        gte: startDate,
      },
    },
  });

  const dateRange = getDateRange(formatDate(startDate), formatDate(today));

  const dailyValues = dateRange.map(date => {
    const dayActivities = activities.filter(a => isSameDay(new Date(a.startTime), new Date(date)));

    let value = 0;
    if (metric === 'feeding_count') {
      value = dayActivities.filter(a => a.type === 'FEEDING').length;
    } else if (metric === 'feeding_amount') {
      value = sum(dayActivities.filter(a => a.type === 'FEEDING').map(a => a.feedingAmount || 0));
    } else if (metric === 'sleep_hours') {
      value = sum(dayActivities.filter(a => a.type === 'SLEEP').map(a => a.duration || 0)) / 60;
    } else if (metric === 'diaper_count') {
      value = dayActivities.filter(a => a.type === 'DIAPER').length;
    }

    return { date, value };
  });

  // 선형 회귀로 트렌드 계산 (y = mx + b)
  // x: 0, 1, 2... (날짜 인덱스)
  // y: value
  const n = dailyValues.length;
  if (n < 2) {
    return { trend: 'stable', changePercent: 0, dailyValues, message: '데이터가 부족하여 트렌드를 분석할 수 없습니다' };
  }

  const xSum = n * (n - 1) / 2;
  const ySum = sum(dailyValues.map(d => d.value));
  const xySum = sum(dailyValues.map((d, i) => i * d.value));
  const xxSum = sum(dailyValues.map((d, i) => i * i));

  const slope = (n * xySum - xSum * ySum) / (n * xxSum - xSum * xSum);
  
  // 첫날 값 대비 마지막날 예상 값의 변화율
  const startValue = (ySum - slope * xSum) / n; // 평균값 근사치
  const endValue = startValue + slope * (n - 1);
  
  let changePercent = 0;
  if (startValue !== 0) {
    changePercent = ((endValue - startValue) / startValue) * 100;
  }

  let trend: 'increasing' | 'decreasing' | 'stable';
  let message: string;

  if (Math.abs(changePercent) < 5) {
    trend = 'stable';
    message = '안정적인 패턴을 유지하고 있습니다';
  } else if (changePercent > 0) {
    trend = 'increasing';
    message = `최근 ${days}일간 약 ${changePercent.toFixed(1)}% 증가 추세입니다`;
  } else {
    trend = 'decreasing';
    message = `최근 ${days}일간 약 ${Math.abs(changePercent).toFixed(1)}% 감소 추세입니다`;
  }

  return {
    trend,
    changePercent: Number(changePercent.toFixed(1)),
    dailyValues,
    message,
  };
}

// ==========================================
// Relative Date Conversion
// ==========================================

/**
 * 상대적 날짜를 절대 날짜로 변환
 * "오늘", "어제", "이번 주" 등을 YYYY-MM-DD 형식으로 변환
 */
export function getRelativeDate(params: GetRelativeDateParams): RelativeDateResult {
  const { relative } = params;
  const today = new Date();
  let startDate: Date;
  let endDate: Date;
  let description: string;

  switch (relative) {
    case 'today':
      startDate = new Date(today);
      endDate = new Date(today);
      description = "오늘";
      break;

    case 'yesterday':
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 1);
      endDate = new Date(startDate);
      description = "어제";
      break;

    case 'this_week':
      // 이번 주 월요일부터 오늘까지
      const dayOfWeek = today.getDay(); // 0(일) ~ 6(토)
      const monday = new Date(today);
      monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      startDate = monday;
      endDate = new Date(today);
      description = "이번 주";
      break;

    case 'last_week':
      // 지난 주 월요일부터 일요일까지
      const lastMonday = new Date(today);
      const dow = today.getDay();
      lastMonday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1) - 7);
      const lastSunday = new Date(lastMonday);
      lastSunday.setDate(lastMonday.getDate() + 6);
      startDate = lastMonday;
      endDate = lastSunday;
      description = "지난 주";
      break;

    case 'this_month':
      // 이번 달 1일부터 오늘까지
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today);
      description = "이번 달";
      break;

    case 'last_month':
      // 지난 달 1일부터 마지막 날까지
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      endDate = new Date(today.getFullYear(), today.getMonth(), 0);
      description = "지난 달";
      break;

    default:
      throw new Error(`알 수 없는 상대 날짜: ${relative}`);
  }

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    description,
  };
}
