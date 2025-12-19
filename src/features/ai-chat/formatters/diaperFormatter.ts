import { DiaperRecord } from "../types";
import {
  formatDate,
  formatTime,
  getTodayString,
} from "../utils/dateFormatter";
import { translateEnum } from "../utils/enumTranslator";

interface DailyDiaperData {
  pee: number;
  poop: number;
}

/**
 * 기저귀 일일 종합 데이터 추출
 */
export function extractDiaperDailySummary(diapers: DiaperRecord[]): Map<string, DailyDiaperData> {
  const dailyData = new Map<string, DailyDiaperData>();

  diapers.forEach((d) => {
    const date = formatDate(d.startTime);
    const day = dailyData.get(date) || { pee: 0, poop: 0 };

    const type = d.diaperType?.toLowerCase();
    if (type === "both") {
      // both는 소변 + 대변 둘 다
      day.pee++;
      day.poop++;
    } else if (type === "urine" || type === "pee") {
      day.pee++;
    } else if (type === "stool" || type === "poop") {
      day.poop++;
    }

    dailyData.set(date, day);
  });

  return dailyData;
}

/**
 * 기저귀 평균 데이터 추출
 */
export function extractDiaperAverage(diapers: DiaperRecord[]): {
  avgPee: number;
  avgPoop: number;
  dates: string[];
} | null {
  if (!diapers || diapers.length === 0) return null;
  
  const dailyData = extractDiaperDailySummary(diapers);
  const today = getTodayString();
  const dates = Array.from(dailyData.keys()).sort((a, b) => b.localeCompare(a));
  
  const pastDates = dates.filter(d => d !== today);
  if (pastDates.length === 0) return null;
  
  let totalPee = 0;
  let totalPoop = 0;
  
  pastDates.forEach(date => {
    const day = dailyData.get(date)!;
    totalPee += day.pee;
    totalPoop += day.poop;
  });
  
  return {
    avgPee: totalPee / pastDates.length,
    avgPoop: totalPoop / pastDates.length,
    dates: pastDates,
  };
}

/**
 * 기저귀 상세 데이터 추출
 */
export function extractDiaperDetails(diapers: DiaperRecord[]): Map<string, {
  poops: Array<{ time: string; condition?: string; memo?: string }>;
  pees: Array<{ time: string; memo?: string }>;
}> {
  const dailyData = new Map<string, {
    poops: Array<{ time: string; condition?: string; memo?: string }>;
    pees: Array<{ time: string; memo?: string }>;
  }>();

  diapers.forEach((d) => {
    const date = formatDate(d.startTime);
    const day = dailyData.get(date) || { poops: [], pees: [] };

    const type = d.diaperType?.toLowerCase();
    if (type === "both") {
      // both는 소변 + 대변 둘 다 표시
      day.pees.push({
        time: formatTime(d.startTime),
        memo: d.memo || undefined,
      });
      day.poops.push({
        time: formatTime(d.startTime),
        condition: d.stoolCondition ? translateEnum(d.stoolCondition) : undefined,
        memo: d.memo || undefined,
      });
    } else if (type === "stool" || type === "poop") {
      day.poops.push({
        time: formatTime(d.startTime),
        condition: d.stoolCondition ? translateEnum(d.stoolCondition) : undefined,
        memo: d.memo || undefined,
      });
    } else if (type === "urine" || type === "pee") {
      day.pees.push({
        time: formatTime(d.startTime),
        memo: d.memo || undefined,
      });
    }

    dailyData.set(date, day);
  });

  return dailyData;
}

/**
 * 기저귀 기록을 한글 형식으로 포맷팅합니다. (하위 호환성 유지)
 */
export function formatDiapers(
  diapers: DiaperRecord[],
  dataCollectionDays: number = 7
): string {
  return "";
}
