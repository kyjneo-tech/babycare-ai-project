// src/features/analytics/utils/statsCalculator.ts
import { Activity, ActivityType } from "@prisma/client";

export interface ActivityStats {
  feeding: {
    count: number;
    totalAmount: number;
    avgAmount: number;
    byType: {
      breast: number;
      formula: number;
      pumped: number;
      baby_food: number;
    };
  };
  sleep: {
    totalDuration: number;
    napCount: number;
    nightSleepDuration: number;
    avgNapDuration: number;
  };
  diaper: {
    count: number;
    urine: number;
    stool: number;
    both: number;
  };
  medicine: {
    count: number;
  };
  temperature: {
    count: number;
    avg: number;
    max: number;
    min: number;
  };
}

export function calculateActivityStats(activities: Activity[]): ActivityStats {
  // 통계 계산 시에는 분할된 자식 레코드만 사용 (원본 레코드 제외)
  // - 분할 안 된 레코드 (isSplit: false)
  // - 분할된 자식 레코드 (isSplit: true && originalActivityId != null)
  const statsActivities = activities.filter(a => 
    !a.isSplit || (a.isSplit && a.originalActivityId !== null)
  );

  // 수유 통계
  const feedingActivities = statsActivities.filter(a => a.type === 'FEEDING');
  const feedingByType = {
    breast: feedingActivities.filter(a => a.feedingType === 'breast').length,
    formula: feedingActivities.filter(a => a.feedingType === 'formula').length,
    pumped: feedingActivities.filter(a => a.feedingType === 'pumped').length,
    baby_food: feedingActivities.filter(a => a.feedingType === 'baby_food').length,
  };
  const totalFeedingAmount = feedingActivities.reduce((sum, a) => sum + (a.feedingAmount || 0), 0);

  // 수면 통계
  const sleepActivities = statsActivities.filter(a => a.type === 'SLEEP');
  const napActivities = sleepActivities.filter(a => a.sleepType === 'nap');
  const nightSleepActivities = sleepActivities.filter(a => a.sleepType === 'night');
  const totalSleepDuration = sleepActivities.reduce((sum, a) => sum + (a.duration || 0), 0);
  const nightSleepDuration = nightSleepActivities.reduce((sum, a) => sum + (a.duration || 0), 0);
  const totalNapDuration = napActivities.reduce((sum, a) => sum + (a.duration || 0), 0);

  // 기저귀 통계
  const diaperActivities = statsActivities.filter(a => a.type === 'DIAPER');
  const diaperByType = {
    urine: diaperActivities.filter(a => a.diaperType === 'urine').length,
    stool: diaperActivities.filter(a => a.diaperType === 'stool').length,
    both: diaperActivities.filter(a => a.diaperType === 'both').length,
  };



  // 체온 통계
  const tempActivities = statsActivities.filter(a => a.type === 'TEMPERATURE');
  const temperatures = tempActivities.map(a => a.temperature || 0).filter(t => t > 0);

  return {
    feeding: {
      count: feedingActivities.length,
      totalAmount: totalFeedingAmount,
      avgAmount: feedingActivities.length > 0
        ? Math.round(totalFeedingAmount / feedingActivities.length)
        : 0,
      byType: feedingByType,
    },
    sleep: {
      totalDuration: totalSleepDuration,
      napCount: napActivities.length,
      nightSleepDuration: nightSleepDuration,
      avgNapDuration: napActivities.length > 0
        ? Math.round(totalNapDuration / napActivities.length)
        : 0,
    },
    diaper: {
      count: diaperActivities.length,
      ...diaperByType,
    },
    medicine: {
      count: statsActivities.filter(a => a.type === 'MEDICINE').length,
    },
    temperature: {
      count: tempActivities.length,
      avg: temperatures.length > 0
        ? Math.round(temperatures.reduce((sum, t) => sum + t, 0) / temperatures.length * 10) / 10
        : 0,
      max: temperatures.length > 0 ? Math.max(...temperatures) : 0,
      min: temperatures.length > 0 ? Math.min(...temperatures) : 0,
    },
  };
}

export function formatDuration(minutes: number): string {
  if (minutes === 0) return '0분';

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}분`;
  if (mins === 0) return `${hours}시간`;
  return `${hours}시간 ${mins}분`;
}

export function calculateTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export function getDailyStats(activities: Activity[], date: Date) {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const dayActivities = activities.filter(a => {
    const activityTime = new Date(a.startTime);
    return activityTime >= dayStart && activityTime <= dayEnd;
  });

  return calculateActivityStats(dayActivities);
}
