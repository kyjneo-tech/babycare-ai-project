import { TemperatureRecord, MedicineRecord, WeightRecord } from "../types";
import { formatDate, formatTime } from "../utils/dateFormatter";

/**
 * 체온 상세 데이터 추출
 */
export function extractTemperatureDetails(temperatures: TemperatureRecord[]): Map<string, Array<{
  time: string;
  value: number;
  memo?: string;
}>> {
  const dailyData = new Map<string, Array<{ time: string; value: number; memo?: string }>>();
  
  temperatures.forEach((t) => {
    const date = formatDate(t.startTime);
    const day = dailyData.get(date) || [];
    
    day.push({
      time: formatTime(t.startTime),
      value: t.temperature || 0,
      memo: t.memo || undefined,
    });
    
    dailyData.set(date, day);
  });
  
  return dailyData;
}

/**
 * 투약 상세 데이터 추출
 */
export function extractMedicineDetails(medicines: MedicineRecord[]): Map<string, Map<string, Array<{
  time: string;
  amount: string;
  memo?: string;
}>>> {
  const dailyData = new Map<string, Map<string, Array<{
    time: string;
    amount: string;
    memo?: string;
  }>>>();
  
  medicines.forEach((m) => {
    const date = formatDate(m.startTime);
    const dayData = dailyData.get(date) || new Map();
    const medicineName = m.medicineName || "약품";
    const medicineData = dayData.get(medicineName) || [];
    
    const dose = [m.medicineAmount, m.medicineUnit].filter(Boolean).join("");
    
    medicineData.push({
      time: formatTime(m.startTime),
      amount: dose,
      memo: m.memo || undefined,
    });
    
    dayData.set(medicineName, medicineData);
    dailyData.set(date, dayData);
  });
  
  return dailyData;
}

/**
 * 성장 상세 데이터 추출
 */
export function extractWeightDetails(weights: WeightRecord[]): Map<string, Array<{
  time: string;
  weight?: number;
  height?: number;
}>> {
  const dailyData = new Map<string, Array<{ time: string; weight?: number; height?: number }>>();
  
  weights.forEach((w) => {
    const date = formatDate(w.measuredAt);
    const day = dailyData.get(date) || [];
    
    day.push({
      time: formatTime(w.measuredAt),
      weight: w.weight || undefined,
      height: w.height || undefined,
    });
    
    dailyData.set(date, day);
  });
  
  return dailyData;
}

/**
 * 하위 호환성 유지
 */
export function formatTemperatures(
  temperatures: TemperatureRecord[],
  dataCollectionDays: number = 7
): string {
  return "";
}

export function formatMedicines(
  medicines: MedicineRecord[],
  dataCollectionDays: number = 7
): string {
  return "";
}

export function formatWeights(weights: WeightRecord[]): string {
  return "";
}
