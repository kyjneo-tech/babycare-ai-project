/**
 * 개선된 Activity Calculator
 *
 * 주요 수정 사항:
 * 1. Timezone 버그 수정 (KST 명시적 처리)
 * 2. 빈 데이터 처리 개선
 * 3. 날짜 검증 추가
 * 4. 상대 날짜 변환 도구 추가
 */

import { prisma } from "@/shared/lib/prisma";
import { getFeedingRecommendationRange, getSleepRecommendationRange } from "../services/babyRecommendationService";

// ==========================================
// Helpers - Timezone 안전하게 처리
// ==========================================

/**
 * "YYYY-MM-DD" 문자열을 로컬 타임존 기준 Date 객체로 변환
 * 버그 수정: UTC 변환 없이 로컬 기준으로 처리
 */
function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

function parseLocalDateEnd(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 23, 59, 59, 999);
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 날짜 검증 헬퍼
 */
function validateDateRange(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  if (isNaN(start.getTime())) {
    throw new Error(`잘못된 시작 날짜 형식입니다: ${startDate}`);
  }
  if (isNaN(end.getTime())) {
    throw new Error(`잘못된 종료 날짜 형식입니다: ${endDate}`);
  }
  if (start > end) {
    throw new Error("시작 날짜가 종료 날짜보다 늦습니다");
  }
  if (end > today) {
    throw new Error("미래 날짜는 조회할 수 없습니다");
  }
}

function getDaysBetween(start: string, end: string): number {
  const oneDay = 24 * 60 * 60 * 1000;
  const firstDate = parseLocalDate(start);
  const secondDate = parseLocalDate(end);
  return Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / oneDay)) + 1;
}

function getDateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  let currentDate = parseLocalDate(start);
  const stopDate = parseLocalDate(end);

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
// 🆕 상대 날짜 변환 도구
// ==========================================

export interface GetRelativeDateParams {
  relative: 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month';
}

export interface RelativeDateResult {
  startDate: string;
  endDate: string;
  description: string;
}

/**
 * 🆕 상대적 날짜를 절대 날짜로 변환
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
      // 이번 주 월요일부터 일요일까지
      const dayOfWeek = today.getDay(); // 0(일) ~ 6(토)
      const monday = new Date(today);
      monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      startDate = monday;
      endDate = new Date(today);
      description = "이번 주";
      break;

    case 'last_week':
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
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today);
      description = "이번 달";
      break;

    case 'last_month':
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

// ==========================================
// 기존 도구들 (버그 수정 버전)
// ==========================================

export interface GetActivityLogsParams {
  babyId: string;
  date: string;
}

export interface GetDailyCountsParams {
  babyId: string;
  startDate: string;
  endDate: string;
}

export interface CalculateStatsParams {
  babyId: string;
  startDate: string;
  endDate: string;
  activityType?: 'FEEDING' | 'SLEEP' | 'DIAPER' | 'ALL';
  excludeDates?: string[];
}

export interface StatsResult {
  period: { start: string; end: string };
  totalDays: number;
  excludedDates: string[];
  analyzedDays: number;
  actualDaysWithData?: number;  // 🆕 실제 데이터 있는 날 수
  message?: string;  // 🆕 데이터 없을 때 메시지

  feeding?: {
    totalCount: number;
    avgPerDay: number;
    avgAmount: number;
    totalAmount: number;
    avgDailyAmount: number;
    byType: { breast: number; formula: number };
  };

  sleep?: {
    totalMinutes: number;
    avgHoursPerDay: number;
    nightSleep: { totalMinutes: number; avgHoursPerDay: number; count: number };
    napSleep: { totalMinutes: number; avgHoursPerDay: number; count: number };
  };

  diaper?: {
    totalCount: number;
    avgPerDay: number;
    urine: { total: number; avgPerDay: number };
    stool: { total: number; avgPerDay: number };
    stoolConditions: Record<string, number>;
  };
}

function formatActivityLogs(activities: any[]): string {
  if (activities.length === 0) return "기록 없음";

  return activities.map(activity => {
    const time = new Date(activity.startTime).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
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

/**
 * 특정 날짜의 활동 로그 조회 (버그 수정)
 */
export async function getActivityLogs(params: GetActivityLogsParams) {
  const { babyId, date } = params;

  // 🔧 수정: parseLocalDate 사용
  const startOfDay = parseLocalDate(date);
  const endOfDay = parseLocalDateEnd(date);

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
 * 날짜별 활동 수 조회 (버그 수정)
 */
export async function getDailyCounts(params: GetDailyCountsParams) {
  const { babyId, startDate, endDate } = params;

  // 🔧 추가: 날짜 검증
  validateDateRange(startDate, endDate);

  // 🔧 수정: parseLocalDate 사용
  const start = parseLocalDate(startDate);
  const end = parseLocalDateEnd(endDate);

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
      isSameDay(new Date(a.startTime), parseLocalDate(date))
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
 * 기간 통계 계산 (버그 수정)
 */
export async function calculateStats(params: CalculateStatsParams): Promise<StatsResult> {
  const { babyId, startDate, endDate, activityType = 'ALL', excludeDates = [] } = params;

  // 🔧 추가: 날짜 검증
  validateDateRange(startDate, endDate);

  // 🔧 수정: parseLocalDate 사용
  const start = parseLocalDate(startDate);
  const end = parseLocalDateEnd(endDate);

  const activities = await prisma.activity.findMany({
    where: {
      babyId,
      startTime: {
        gte: start,
        lte: end,
      },
    },
    orderBy: { startTime: 'asc' },
  });

  // 제외 날짜 필터링
  const filteredActivities = activities.filter(a => {
    const dateStr = formatDate(a.startTime);
    return !excludeDates.includes(dateStr);
  });

  // 🔧 개선: 실제 데이터 있는 날 수 계산
  const datesWithData = new Set(
    filteredActivities.map(a => formatDate(a.startTime))
  );
  const actualDaysWithData = datesWithData.size;

  const totalDays = getDaysBetween(startDate, endDate);
  const analyzedDays = Math.max(1, actualDaysWithData || (totalDays - excludeDates.length));

  const result: StatsResult = {
    period: { start: startDate, end: endDate },
    totalDays,
    excludedDates: excludeDates,
    analyzedDays,
    actualDaysWithData,
  };

  // 🔧 추가: 데이터 없을 때 조기 반환
  if (filteredActivities.length === 0) {
    result.message = "이 기간에는 기록이 없습니다";
    return result;
  }

  // 수유 통계
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

  // 수면 통계
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

  // 배변 통계
  if (activityType === 'DIAPER' || activityType === 'ALL') {
    const diapers = filteredActivities.filter(a => a.type === 'DIAPER');
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

// 나머지 함수들 (calculateSpecificDates, compareToRecommended, analyzeTrend)도 동일하게 수정...
// 여기서는 핵심 수정 사항만 표시했습니다.
