import { FeedingRecord } from "../types";
import {
  formatDate,
  formatTime,
  formatDateList,
  getTodayString,
  extractDay,
} from "../utils/dateFormatter";
import { translateEnum } from "../utils/enumTranslator";

interface DailyFeedingData {
  count: number;
  amount: number;
  duration: number;
  breast: { count: number; duration: number };
  formula: { count: number; amount: number };
}

/**
 * 수유 일일 종합 데이터 추출
 */
export function extractFeedingDailySummary(feedings: FeedingRecord[]): Map<string, DailyFeedingData> {
  const dailyData = new Map<string, DailyFeedingData>();
  
  feedings.forEach((f) => {
    const date = formatDate(f.startTime);
    const day = dailyData.get(date) || {
      count: 0,
      amount: 0,
      duration: 0,
      breast: { count: 0, duration: 0 },
      formula: { count: 0, amount: 0 },
    };
    
    day.count++;
    
    const feedingType = f.feedingType?.toUpperCase();
    if (feedingType === "BREAST") {
      day.breast.count++;
      day.breast.duration += f.duration || 0;
      day.duration += f.duration || 0;
    } else {
      day.formula.count++;
      day.formula.amount += f.feedingAmount || 0;
      day.amount += f.feedingAmount || 0;
    }
    
    dailyData.set(date, day);
  });
  
  return dailyData;
}

/**
 * 수유 평균 데이터 추출
 */
export function extractFeedingAverage(feedings: FeedingRecord[]): {
  avgCount: number;
  avgAmount: number;
  dates: string[];
} | null {
  if (!feedings || feedings.length === 0) return null;
  
  const dailyData = extractFeedingDailySummary(feedings);
  const today = getTodayString();
  const dates = Array.from(dailyData.keys()).sort((a, b) => b.localeCompare(a));
  
  // 오늘 제외
  const pastDates = dates.filter(d => d !== today);
  if (pastDates.length === 0) return null;
  
  let totalCount = 0;
  let totalAmount = 0;
  
  pastDates.forEach(date => {
    const day = dailyData.get(date)!;
    totalCount += day.count;
    totalAmount += day.amount;
  });
  
  return {
    avgCount: totalCount / pastDates.length,
    avgAmount: Math.round(totalAmount / pastDates.length),
    dates: pastDates,
  };
}

/**
 * 수유 상세 데이터 추출
 */
export function extractFeedingDetails(feedings: FeedingRecord[]): Map<string, {
  breast: Array<{ time: string; side: string; duration: number; memo?: string }>;
  formula: Array<{ time: string; amount: number; memo?: string }>;
}> {
  const dailyData = new Map<string, {
    breast: Array<{ time: string; side: string; duration: number; memo?: string }>;
    formula: Array<{ time: string; amount: number; memo?: string }>;
  }>();
  
  feedings.forEach((f) => {
    const date = formatDate(f.startTime);
    const day = dailyData.get(date) || { breast: [], formula: [] };
    
    const feedingType = f.feedingType?.toUpperCase();
    if (feedingType === "BREAST") {
      day.breast.push({
        time: formatTime(f.startTime),
        side: translateEnum(f.breastSide),
        duration: f.duration || 0,
        memo: f.memo || undefined,
      });
    } else {
      day.formula.push({
        time: formatTime(f.startTime),
        amount: f.feedingAmount || 0,
        memo: f.memo || undefined,
      });
    }
    
    dailyData.set(date, day);
  });
  
  return dailyData;
}

/**
 * 수유 기록을 한글 형식으로 포맷팅합니다. (하위 호환성 유지)
 */
export function formatFeedings(
  feedings: FeedingRecord[],
  dataCollectionDays: number = 7
): string {
  // 이 함수는 하위 호환성을 위해 유지하지만 사용하지 않음
  return "";
}
