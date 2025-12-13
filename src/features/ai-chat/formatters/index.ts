import { CleanedData } from "../types";
import { formatFeedings, extractFeedingDailySummary, extractFeedingAverage, extractFeedingDetails } from "./feedingFormatter";
import { formatSleeps, extractSleepDailySummary, extractSleepAverage, extractSleepDetails } from "./sleepFormatter";
import { formatDiapers, extractDiaperDailySummary, extractDiaperAverage, extractDiaperDetails } from "./diaperFormatter";
import {
  formatTemperatures,
  formatMedicines,
  formatWeights,
  extractTemperatureDetails,
  extractMedicineDetails,
  extractWeightDetails,
} from "./activityFormatter";
import { formatHeader } from "./headerFormatter";
import { formatDate, getTodayString, extractDay, formatMinutes } from "../utils/dateFormatter";

/**
 * 전체 데이터를 한글 형식으로 포맷팅합니다.
 * @param rawData - 정리된 원시 데이터
 * @param dataCollectionDays - 데이터 수집 기간 (일)
 * @returns 한글 형식의 포맷팅된 문자열
 */
export function toKoreanData(
  rawData: CleanedData,
  dataCollectionDays: number = 7
): string {
  // 모든 데이터에서 날짜 추출
  const allDates = new Set<string>();
  
  rawData.feedings?.forEach(f => allDates.add(formatDate(f.startTime)));
  rawData.sleeps?.forEach(s => allDates.add(formatDate(s.startTime)));
  rawData.diapers?.forEach(d => allDates.add(formatDate(d.startTime)));
  rawData.temperatures?.forEach(t => allDates.add(formatDate(t.startTime)));
  rawData.medicines?.forEach(m => allDates.add(formatDate(m.startTime)));
  
  const dataDates = Array.from(allDates).sort((a, b) => b.localeCompare(a));
  
  // 1. 헤더
  const header = formatHeader(dataCollectionDays, dataDates);
  
  // 2. 일일 종합
  const dailySummary = formatDailySummary(rawData, dataDates);
  
  // 3. 종합 평균
  const average = formatAverage(rawData);
  
  // 4. 상세 기록
  const detail = formatDetail(rawData);
  
  return `${header}\n\n${dailySummary}\n\n${average}\n\n${detail}`;
}

function formatDailySummary(data: CleanedData, dates: string[]): string {
  let result = `\n일일 종합\n`;
  
  // 수유
  const feedingDaily = extractFeedingDailySummary(data.feedings || []);
  if (feedingDaily.size > 0) {
    result += `\n\n[수유]`;
    dates.forEach(date => {
      const day = feedingDaily.get(date);
      if (!day) return;
      result += `\n${date}`;
      if (day.breast.count > 0) {
        const avgDuration = day.breast.count > 0 ? Math.round(day.breast.duration / day.breast.count) : 0;
        result += `\n- 모유: 총 ${day.breast.count}회, ${day.breast.duration}분 (평균 ${avgDuration}분/회)`;
      }
      if (day.formula.count > 0) {
        const avgAmount = day.formula.count > 0 ? Math.round(day.formula.amount / day.formula.count) : 0;
        result += `\n- 분유: 총 ${day.formula.count}회, ${day.formula.amount}ml (평균 ${avgAmount}ml/회)`;
      }
    });
  }
  
  // 수면
  const sleepDaily = extractSleepDailySummary(data.sleeps || []);
  if (sleepDaily.size > 0) {
    result += `\n\n[수면]`;
    dates.forEach(date => {
      const day = sleepDaily.get(date);
      if (!day) return;
      result += `\n${date}`;
      result += `\n- 총 ${formatMinutes(day.totalMins)} (밤잠 ${formatMinutes(day.nightMins)}, 낮잠 ${formatMinutes(day.napMins)})`;
    });
  }
  
  // 기저귀
  const diaperDaily = extractDiaperDailySummary(data.diapers || []);
  if (diaperDaily.size > 0) {
    result += `\n\n[기저귀]`;
    dates.forEach(date => {
      const day = diaperDaily.get(date);
      if (!day) return;
      result += `\n${date}`;
      result += `\n- 소변 ${day.pee}회, 대변 ${day.poop}회`;
    });
  }
  
  // 체온
  const tempDaily = extractTemperatureDetails(data.temperatures || []);
  if (tempDaily.size > 0) {
    result += `\n\n[체온]`;
    dates.forEach(date => {
      const day = tempDaily.get(date);
      if (!day || day.length === 0) return;
      result += `\n${date}`;
      result += `\n- ${day.length}회: ${day.map(t => t.value).join(", ")}`;
    });
  }
  
  // 투약
  const medDaily = extractMedicineDetails(data.medicines || []);
  if (medDaily.size > 0) {
    result += `\n\n[투약]`;
    dates.forEach(date => {
      const dayData = medDaily.get(date);
      if (!dayData) return;
      result += `\n${date}`;
      dayData.forEach((records, medicineName) => {
        const totalDose = records.map(r => r.amount).join(" + ");
        result += `\n- ${medicineName}: ${records.length}회 (${totalDose})`;
      });
    });
  }
  
  return result;
}

function formatAverage(data: CleanedData): string {
  let result = `\n종합 평균\n`;
  
  // 수유
  const feedingAvg = extractFeedingAverage(data.feedings || []);
  if (feedingAvg) {
    result += `\n\n[수유]`;
    result += `\n평균 ${feedingAvg.avgCount.toFixed(1)}회/일, ${feedingAvg.avgAmount}ml/일`;
  }
  
  // 수면
  const sleepAvg = extractSleepAverage(data.sleeps || []);
  if (sleepAvg) {
    result += `\n\n[수면]`;
    result += `\n평균 밤잠 ${sleepAvg.avgNight}, 낮잠 ${sleepAvg.avgNap}`;
  }
  
  // 기저귀
  const diaperAvg = extractDiaperAverage(data.diapers || []);
  if (diaperAvg) {
    result += `\n\n[기저귀]`;
    result += `\n평균 소변 ${diaperAvg.avgPee.toFixed(1)}회/일, 대변 ${diaperAvg.avgPoop.toFixed(1)}회/일`;
  }
  
  return result;
}

function formatDetail(data: CleanedData): string {
  let result = `\n상세 기록\n`;
  
  // 모든 날짜 수집
  const allDates = new Set<string>();
  const feedingDetails = extractFeedingDetails(data.feedings || []);
  const sleepDetails = extractSleepDetails(data.sleeps || []);
  const diaperDetails = extractDiaperDetails(data.diapers || []);
  const tempDetails = extractTemperatureDetails(data.temperatures || []);
  const medDetails = extractMedicineDetails(data.medicines || []);
  const weightDetails = extractWeightDetails(data.weights || []);
  
  feedingDetails.forEach((_, date) => allDates.add(date));
  sleepDetails.forEach((_, date) => allDates.add(date));
  diaperDetails.forEach((_, date) => allDates.add(date));
  tempDetails.forEach((_, date) => allDates.add(date));
  medDetails.forEach((_, date) => allDates.add(date));
  weightDetails.forEach((_, date) => allDates.add(date));
  
  const dates = Array.from(allDates).sort((a, b) => b.localeCompare(a));
  
  dates.forEach(date => {
    // 수유
    const feeding = feedingDetails.get(date);
    if (feeding && (feeding.breast.length > 0 || feeding.formula.length > 0)) {
      result += `\n\n${date} [수유]`;
      if (feeding.breast.length > 0) {
        const items = feeding.breast.map(b => {
          const memo = b.memo ? `, ${b.memo}` : '';
          return `${b.time}(${b.side} ${b.duration}분${memo})`;
        });
        result += `\n- 모유: ${items.join(", ")}`;
      }
      if (feeding.formula.length > 0) {
        const items = feeding.formula.map(f => {
          const memo = f.memo ? `, ${f.memo}` : '';
          return `${f.time}(${f.amount}ml${memo})`;
        });
        result += `\n- 분유: ${items.join(", ")}`;
      }
    }
    
    // 수면
    const sleep = sleepDetails.get(date);
    if (sleep && (sleep.naps.length > 0 || sleep.nights.length > 0)) {
      result += `\n\n${date} [수면]`;
      if (sleep.naps.length > 0) {
        const items = sleep.naps.map(n => {
          const memo = n.memo ? `, ${n.memo}` : '';
          return `${n.start}~${n.end}${memo}`;
        });
        result += `\n- 낮잠: ${items.join(", ")}`;
      }
      if (sleep.nights.length > 0) {
        const items = sleep.nights.map(n => {
          const memo = n.memo ? `, ${n.memo}` : '';
          return `${n.start}~${n.end}${memo}`;
        });
        result += `\n- 밤잠: ${items.join(", ")}`;
      }
    }
    
    // 기저귀
    const diaper = diaperDetails.get(date);
    if (diaper && (diaper.poops.length > 0 || diaper.pees.length > 0)) {
      result += `\n\n${date} [기저귀]`;
      if (diaper.poops.length > 0) {
        const items = diaper.poops.map(p => {
          const extras = [p.condition, p.memo].filter(Boolean);
          return extras.length > 0 ? `${p.time}(${extras.join(", ")})` : p.time;
        });
        result += `\n- 대변: ${items.join(", ")}`;
      }
      if (diaper.pees.length > 0) {
        const items = diaper.pees.map(p => p.memo ? `${p.time}(${p.memo})` : p.time);
        result += `\n- 소변: ${items.join(", ")}`;
      }
    }
    
    // 체온
    const temp = tempDetails.get(date);
    if (temp && temp.length > 0) {
      result += `\n\n${date} [체온]`;
      const items = temp.map(t => t.memo ? `${t.time}(${t.value}, ${t.memo})` : `${t.time}(${t.value})`);
      result += `\n- ${items.join(", ")}`;
    }
    
    // 투약
    const med = medDetails.get(date);
    if (med && med.size > 0) {
      result += `\n\n${date} [투약]`;
      med.forEach((records, medicineName) => {
        const items = records.map(r => r.memo ? `${r.time}(${r.amount}, ${r.memo})` : `${r.time}(${r.amount})`);
        result += `\n- ${medicineName}: ${items.join(", ")}`;
      });
    }
    
    // 성장
    const weight = weightDetails.get(date);
    if (weight && weight.length > 0) {
      result += `\n\n${date} [성장]`;
      const items = weight.map(w => {
        const measurements = [w.weight, w.height].filter(Boolean).join(", ");
        return `${w.time}(${measurements})`;
      });
      result += `\n- ${items.join(", ")}`;
    }
  });
  
  return result;
}
