import { SleepRecord } from "../types";
import {
  formatDate,
  formatTime,
  formatMinutes,
  getTodayString,
} from "../utils/dateFormatter";

interface DailySleepData {
  nightMins: number;
  napMins: number;
  totalMins: number;
}

/**
 * 수면 일일 종합 데이터 추출
 */
export function extractSleepDailySummary(sleeps: SleepRecord[]): Map<string, DailySleepData> {
  const dailyData = new Map<string, DailySleepData>();
  
  sleeps.forEach((s) => {
    if (!s.endTime) return;
    
    const date = formatDate(s.startTime);
    const day = dailyData.get(date) || { nightMins: 0, napMins: 0, totalMins: 0 };
    
    // duration 계산
    const start = new Date(s.startTime).getTime();
    const end = new Date(s.endTime).getTime();
    const duration = Math.round((end - start) / (1000 * 60)); // 분 단위
    
    day.totalMins += duration;
    
    if (s.sleepType?.toLowerCase() === "nap") {
      day.napMins += duration;
    } else {
      day.nightMins += duration;
    }
    
    dailyData.set(date, day);
  });
  
  return dailyData;
}

/**
 * 수면 평균 데이터 추출
 */
export function extractSleepAverage(sleeps: SleepRecord[]): {
  avgNight: string;
  avgNap: string;
  dates: string[];
} | null {
  if (!sleeps || sleeps.length === 0) return null;
  
  const dailyData = extractSleepDailySummary(sleeps);
  const today = getTodayString();
  const dates = Array.from(dailyData.keys()).sort((a, b) => b.localeCompare(a));
  
  const pastDates = dates.filter(d => d !== today);
  if (pastDates.length === 0) return null;
  
  let totalNightMins = 0;
  let totalNapMins = 0;
  
  pastDates.forEach(date => {
    const day = dailyData.get(date)!;
    totalNightMins += day.nightMins;
    totalNapMins += day.napMins;
  });
  
  return {
    avgNight: formatMinutes(totalNightMins / pastDates.length),
    avgNap: formatMinutes(totalNapMins / pastDates.length),
    dates: pastDates,
  };
}

/**
 * 수면 상세 데이터 추출
 */
export function extractSleepDetails(sleeps: SleepRecord[]): Map<string, {
  naps: Array<{ start: string; end: string; memo?: string }>;
  nights: Array<{ start: string; end: string; memo?: string }>;
}> {
  const dailyData = new Map<string, {
    naps: Array<{ start: string; end: string; memo?: string }>;
    nights: Array<{ start: string; end: string; memo?: string }>;
  }>();
  
  sleeps.forEach((s) => {
    if (!s.endTime) return;
    
    const date = formatDate(s.startTime);
    const day = dailyData.get(date) || { naps: [], nights: [] };
    
    const item = {
      start: formatTime(s.startTime),
      end: formatTime(s.endTime),
      memo: s.memo || undefined,
    };
    
    if (s.sleepType?.toLowerCase() === "nap") {
      day.naps.push(item);
    } else {
      day.nights.push(item);
    }
    
    dailyData.set(date, day);
  });
  
  return dailyData;
}

/**
 * 수면 기록을 한글 형식으로 포맷팅합니다. (하위 호환성 유지)
 */
export function formatSleeps(
  sleeps: SleepRecord[],
  dataCollectionDays: number = 7
): string {
  return "";
}
