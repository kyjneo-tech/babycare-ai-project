/**
 * 일정 계산 유틸리티
 * 생년월일 기반으로 예방접종, 건강검진 등의 날짜를 계산합니다.
 */

import { addMonths, addWeeks, addDays, differenceInMonths } from 'date-fns';

/**
 * 생년월일에 개월수를 더한 날짜 계산
 */
export function addMonthsToBirthDate(
  birthDate: Date,
  months: number
): Date {
  return addMonths(birthDate, months);
}

/**
 * 생년월일에 주수를 더한 날짜 계산
 */
export function addWeeksToBirthDate(birthDate: Date, weeks: number): Date {
  return addWeeks(birthDate, weeks);
}

/**
 * 생년월일에 일수를 더한 날짜 계산
 */
export function addDaysToBirthDate(birthDate: Date, days: number): Date {
  return addDays(birthDate, days);
}

/**
 * 현재 월령 계산 (만 나이 개월수)
 */
export function calculateAgeInMonths(birthDate: Date, today: Date = new Date()): number {
  return differenceInMonths(today, birthDate);
}

/**
 * 알림 표시 여부 판단
 * @param dueDate 예정일
 * @param reminderDays 알림 일수 배열 (예: [7, 3, 0])
 * @param today 오늘 날짜
 * @returns 알림을 표시해야 하는지 여부
 */
export function shouldShowReminder(
  dueDate: Date,
  reminderDays: number[],
  today: Date = new Date()
): boolean {
  const diffInDays = Math.floor(
    (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  // 알림 일수에 해당하면 true
  return reminderDays.includes(diffInDays);
}

/**
 * 다가오는 일정인지 판단 (7일 이내)
 * @param dueDate 예정일
 * @param withinDays 기준 일수 (기본: 7일)
 * @param today 오늘 날짜
 */
export function isUpcoming(
  dueDate: Date,
  withinDays: number = 7,
  today: Date = new Date()
): boolean {
  const diffInDays = Math.floor(
    (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  return diffInDays >= 0 && diffInDays <= withinDays;
}

/**
 * 기한이 지났는지 판단
 */
export function isOverdue(dueDate: Date, today: Date = new Date()): boolean {
  return dueDate < today && dueDate.toDateString() !== today.toDateString();
}

/**
 * 오늘이 예정일인지 판단
 */
export function isToday(dueDate: Date, today: Date = new Date()): boolean {
  return dueDate.toDateString() === today.toDateString();
}
