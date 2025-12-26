/**
 * Analytics에서 사용하는 정리된 데이터 타입
 * (기존 ai-chat에 의존하던 타입을 내부로 이전)
 */
export interface CleanedData {
  feedings?: FeedingRecord[];
  sleeps?: SleepRecord[];
  diapers?: DiaperRecord[];
  temperatures?: TemperatureRecord[];
  medicines?: MedicineRecord[];
  weights?: WeightRecord[];
}

export interface FeedingRecord {
  startTime: string;
  memo: string | null;
  feedingType: string | null;
  feedingAmount: number | null;
  breastSide: string | null;
  duration: number | null;
}

export interface SleepRecord {
  startTime: string;
  endTime: string | null;
  memo: string | null;
  sleepType: string | null;
}

export interface DiaperRecord {
  startTime: string;
  memo: string | null;
  diaperType: string | null;
  stoolCondition: string | null;
}

export interface TemperatureRecord {
  startTime: string;
  memo: string | null;
  temperature: number | null;
}

export interface MedicineRecord {
  startTime: string;
  memo: string | null;
  medicineName: string | null;
  medicineAmount: string | null;
  medicineUnit: string | null;
}

export interface WeightRecord {
  measuredAt: string;
  weight: number | null;
  height: number | null;
}
