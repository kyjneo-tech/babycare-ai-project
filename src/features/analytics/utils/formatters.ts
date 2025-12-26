import { FeedingRecord, SleepRecord, DiaperRecord } from "../types/data";

/**
 * ISO 문자열을 yy-mm-dd 형식으로 변환합니다.
 */
function formatDate(dateInput: string | Date): string {
  const date = new Date(dateInput);
  const yy = String(date.getFullYear()).slice(2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

/**
 * Enum 값을 한글로 번역합니다.
 */
function translateEnum(value: string | null | undefined): string {
  if (!value) return "알 수 없음";
  const upperValue = value.toUpperCase();
  const map: Record<string, string> = {
    BREAST: "모유",
    FORMULA: "분유",
    PUMPED: "유축",
    BOTTLE: "분유",
    BABY_FOOD: "이유식",
    LEFT: "왼쪽",
    RIGHT: "오른쪽",
    BOTH: "양쪽",
    NIGHT: "밤잠",
    NAP: "낮잠",
    PEE: "소변",
    POOP: "대변",
    URINE: "소변",
    STOOL: "대변",
    WATERY: "물설사",
    LOOSE: "묽은변",
    NORMAL: "정상변",
    HARD: "된변",
  };
  return map[upperValue] || value;
}

interface DailyFeedingData {
  count: number;
  amount: number;
}

/**
 * 수유 일일 종합 데이터 추출
 */
export function extractFeedingDailySummary(feedings: FeedingRecord[]): Map<string, DailyFeedingData> {
  const dailyData = new Map<string, DailyFeedingData>();

  feedings.forEach((f) => {
    const date = formatDate(f.startTime);
    const day = dailyData.get(date) || { count: 0, amount: 0 };

    day.count++;

    const feedingType = f.feedingType?.toLowerCase();
    if (feedingType === "formula" || feedingType === "pumped" || feedingType === "baby_food") {
      day.amount += f.feedingAmount || 0;
    }

    dailyData.set(date, day);
  });

  return dailyData;
}

interface DailySleepData {
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
    const day = dailyData.get(date) || { totalMins: 0 };
    
    const start = new Date(s.startTime).getTime();
    const end = new Date(s.endTime).getTime();
    const duration = Math.round((end - start) / (1000 * 60));
    
    day.totalMins += duration;
    dailyData.set(date, day);
  });
  
  return dailyData;
}

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

    const type = d.diaperType?.toUpperCase();
    if (type === "BOTH") {
      day.pee++;
      day.poop++;
    } else if (type === "URINE" || type === "PEE" || type === "WET") {
      day.pee++;
    } else if (type === "STOOL" || type === "POOP" || type === "DIRTY") {
      day.poop++;
    }

    dailyData.set(date, day);
  });

  return dailyData;
}
