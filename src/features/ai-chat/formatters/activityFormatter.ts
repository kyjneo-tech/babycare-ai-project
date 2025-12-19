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
 * 투약 용량을 AI가 이해하기 쉬운 형태로 포맷팅
 * 예: "mg (50mg/5ml, 7.5ml)" → "7.5ml (10.0mg/mL)"
 * 예: "mg (80mg/ml, 2ml)" → "2ml (80.0mg/mL)"
 */
function formatMedicineDose(amount: string | null, unit: string | null): string {
  if (!unit) return amount || "";

  // "mg (총mg/총ml, 복용ml)" 형태를 파싱 (대소문자 무시)
  // 총ml은 생략 가능 (예: "80mg/ml" = "80mg/1ml")
  const match = unit.match(/mg\s*\((\d+(?:\.\d+)?)mg\/(\d+(?:\.\d+)?)?ml,\s*(\d+(?:\.\d+)?)ml\)/i);

  if (match) {
    const [_, totalMg, totalMl, doseMl] = match;
    const mlValue = totalMl ? parseFloat(totalMl) : 1; // 생략 시 1ml
    const concentration = (parseFloat(totalMg) / mlValue).toFixed(1);
    return `${doseMl}ml (${concentration}mg/mL)`;
  }

  // 기존 형태 유지 (예: "1정", "5ml" 등)
  return [amount, unit].filter(Boolean).join("");
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

    const dose = formatMedicineDose(m.medicineAmount, m.medicineUnit);

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
