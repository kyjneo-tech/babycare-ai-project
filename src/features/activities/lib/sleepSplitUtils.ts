// src/features/activities/lib/sleepSplitUtils.ts
/**
 * 수면 기록의 날짜 경계 분할 처리를 위한 유틸리티 함수들
 * 
 * 주요 기능:
 * 1. 날짜 경계(자정) 체크
 * 2. 자정 기준으로 Activity 분할
 * 3. 수면 타입 판단 (오전 6시 Cutoff)
 */

import { ActivityType } from "@prisma/client";

/**
 * 밤잠 판단 기준 시간 (오전 6시)
 * 이 시간 이전에 끝난 수면은 전날 밤잠으로 간주
 */
export const NIGHT_SLEEP_CUTOFF_HOUR = 6;

/**
 * 밤잠 시작 기준 시간 (저녁 6시)
 * 이 시간 이후에 시작한 수면은 밤잠으로 간주
 */
export const NIGHT_SLEEP_START_HOUR = 18;

/**
 * 활동이 날짜 경계(자정)를 넘는지 확인
 */
export function crossesMidnight(startTime: Date, endTime: Date): boolean {
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);
  
  // 날짜가 다르면 자정을 넘은 것
  return startDate.getDate() !== endDate.getDate() ||
         startDate.getMonth() !== endDate.getMonth() ||
         startDate.getFullYear() !== endDate.getFullYear();
}

/**
 * 수면 타입 판단 (밤잠 vs 낮잠)
 * 
 * 규칙:
 * 1. 오전 6시 이전에 끝난 수면 → 밤잠
 * 2. 저녁 6시 이후에 시작한 수면 → 밤잠
 * 3. 그 외 → 낮잠
 */
export function determineSleepType(startTime: Date, endTime?: Date): 'night' | 'nap' {
  const startHour = startTime.getHours();
  
  // 저녁 6시 이후 시작 → 밤잠
  if (startHour >= NIGHT_SLEEP_START_HOUR) {
    return 'night';
  }
  
  // 종료 시간이 있고, 오전 6시 이전에 끝남 → 밤잠
  if (endTime) {
    const endHour = endTime.getHours();
    if (endHour < NIGHT_SLEEP_CUTOFF_HOUR) {
      return 'night';
    }
  }
  
  // 그 외 → 낮잠
  return 'nap';
}

/**
 * 분할된 Activity 데이터 타입
 */
export interface SplitActivityData {
  startTime: Date;
  endTime: Date;
  duration: number; // 분 단위
  sleepType: 'night' | 'nap';
  splitSequence: number;
}

/**
 * Activity를 자정 기준으로 분할
 * 
 * @param startTime 활동 시작 시간
 * @param endTime 활동 종료 시간
 * @param type 활동 타입
 * @returns 분할된 Activity 데이터 배열
 */
export function splitActivityByMidnight(
  startTime: Date,
  endTime: Date,
  type: ActivityType
): SplitActivityData[] {
  // SLEEP과 PLAY만 분할 가능
  if (type !== ActivityType.SLEEP && type !== ActivityType.PLAY) {
    throw new Error(`Activity type ${type} cannot be split`);
  }
  
  // 자정을 넘지 않으면 분할 불필요
  if (!crossesMidnight(startTime, endTime)) {
    return [];
  }
  
  const splits: SplitActivityData[] = [];
  let currentStart = new Date(startTime);
  let sequence = 1;
  
  while (currentStart < endTime) {
    // 다음 자정 계산
    const nextMidnight = new Date(currentStart);
    nextMidnight.setHours(24, 0, 0, 0); // 다음날 00:00
    
    // 종료 시간 결정 (다음 자정 vs 실제 종료 시간 중 빠른 것)
    const currentEnd = nextMidnight < endTime ? nextMidnight : endTime;
    
    // 지속 시간 계산 (분 단위)
    const durationMs = currentEnd.getTime() - currentStart.getTime();
    const duration = Math.floor(durationMs / (1000 * 60));
    
    // 수면 타입 판단 (SLEEP인 경우만)
    const sleepType = type === ActivityType.SLEEP 
      ? determineSleepType(currentStart, currentEnd)
      : 'nap'; // PLAY는 sleepType 사용 안 함
    
    splits.push({
      startTime: new Date(currentStart),
      endTime: new Date(currentEnd),
      duration,
      sleepType,
      splitSequence: sequence,
    });
    
    // 다음 구간으로 이동
    currentStart = nextMidnight;
    sequence++;
  }
  
  return splits;
}

/**
 * 분할이 필요한지 확인
 */
export function needsSplit(
  startTime: Date,
  endTime: Date | null,
  type: ActivityType
): boolean {
  // 종료 시간이 없으면 분할 불필요
  if (!endTime) {
    return false;
  }
  
  // SLEEP과 PLAY만 분할 가능
  if (type !== ActivityType.SLEEP && type !== ActivityType.PLAY) {
    return false;
  }
  
  // 자정을 넘는지 확인
  return crossesMidnight(startTime, endTime);
}

/**
 * 활동 지속 시간 계산 (분 단위)
 */
export function calculateDuration(startTime: Date, endTime: Date): number {
  const durationMs = endTime.getTime() - startTime.getTime();
  return Math.floor(durationMs / (1000 * 60));
}
