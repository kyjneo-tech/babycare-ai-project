/**
 * 기간 요약 통계 타입
 */

export type TrendType = "up" | "down" | "same" | "new";

export interface ComparisonResult {
  diff: number; // 차이값 (3, -2, 0)
  trend: TrendType;
  message: string; // "지난 기간보다 3회 더 많아요"
}

export interface PeriodStats {
  feedingCount: number;
  feedingAvgAmount: number; // ml
  sleepCount: number;
  sleepAvgHours: number;
  diaperCount: number;
  stoolCount: number;
  urineCount: number;
  medicineCount: number;
  temperatureCount: number;
}

export interface PeriodSummary {
  current: PeriodStats;
  previous: PeriodStats;
  comparison: {
    feeding: ComparisonResult;
    sleep: ComparisonResult;
    diaper: ComparisonResult;
    medicine: ComparisonResult;
  };
}
