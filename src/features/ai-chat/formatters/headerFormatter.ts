import { getTodayString, extractDay } from "../utils/dateFormatter";

/**
 * 헤더 섹션 (단위 + 조회 정보)
 */
export function formatHeader(dataCollectionDays: number, dataDates: string[]): string {
  const dateList = dataDates.map(extractDay).join(", ");
  const today = getTodayString();
  const todayDay = extractDay(today);
  
  return `【단위】
날짜: yy-mm-dd, 시간: hh:mm
수유 - 모유: 분, 분유/이유식: ml
수면: 시간(X시간 Y분)
체온: °C
투약: 용량 단위 포함 (예: 5ml, 1정)
성장: 체중 kg, 신장 cm
기타: 횟수는 '회', 일일 평균은 '회/일'

【조회 정보】
기간: 최근 ${dataCollectionDays}일 조회 중 데이터 기록 일자는 ${dateList}
종합 평균: 데이터 기록 일자 중 오늘(${todayDay})은 집계 중이므로 평균 계산에서 제외`;
}
