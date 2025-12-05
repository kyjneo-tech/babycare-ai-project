// src/features/activities/lib/__tests__/sleepSplitUtils.test.ts
import { describe, it, expect } from '@jest/globals';
import {
  crossesMidnight,
  determineSleepType,
  splitActivityByMidnight,
  needsSplit,
  calculateDuration,
  NIGHT_SLEEP_CUTOFF_HOUR,
  NIGHT_SLEEP_START_HOUR,
} from '../sleepSplitUtils';
import { ActivityType } from '@prisma/client';

describe('sleepSplitUtils', () => {
  describe('crossesMidnight', () => {
    it('같은 날짜 내 활동은 false를 반환해야 한다', () => {
      const start = new Date('2025-12-01T23:00:00');
      const end = new Date('2025-12-01T23:30:00');
      expect(crossesMidnight(start, end)).toBe(false);
    });

    it('자정을 넘는 활동은 true를 반환해야 한다', () => {
      const start = new Date('2025-12-01T23:41:00');
      const end = new Date('2025-12-02T02:18:00');
      expect(crossesMidnight(start, end)).toBe(true);
    });

    it('정확히 자정에 끝나는 활동은 true를 반환해야 한다', () => {
      const start = new Date('2025-12-01T23:00:00');
      const end = new Date('2025-12-02T00:00:00');
      expect(crossesMidnight(start, end)).toBe(true);
    });
  });

  describe('determineSleepType', () => {
    it('저녁 6시 이후 시작한 수면은 밤잠이어야 한다', () => {
      const start = new Date('2025-12-01T18:00:00');
      expect(determineSleepType(start)).toBe('night');
      
      const start2 = new Date('2025-12-01T22:00:00');
      expect(determineSleepType(start2)).toBe('night');
    });

    it('오전 6시 이전에 끝난 수면은 밤잠이어야 한다', () => {
      const start = new Date('2025-12-02T00:00:00');
      const end = new Date('2025-12-02T05:59:00');
      expect(determineSleepType(start, end)).toBe('night');
    });

    it('낮 시간대 수면은 낮잠이어야 한다', () => {
      const start = new Date('2025-12-01T13:00:00');
      const end = new Date('2025-12-01T14:30:00');
      expect(determineSleepType(start, end)).toBe('nap');
    });

    it('오전 6시 이후에 끝난 수면은 낮잠이어야 한다', () => {
      const start = new Date('2025-12-01T05:00:00');
      const end = new Date('2025-12-01T06:30:00');
      expect(determineSleepType(start, end)).toBe('nap');
    });
  });

  describe('splitActivityByMidnight', () => {
    it('자정을 넘지 않는 수면은 빈 배열을 반환해야 한다', () => {
      const start = new Date('2025-12-01T22:00:00');
      const end = new Date('2025-12-01T23:30:00');
      const result = splitActivityByMidnight(start, end, ActivityType.SLEEP);
      expect(result).toEqual([]);
    });

    it('자정을 넘는 수면은 2개로 분할되어야 한다', () => {
      // 12월 1일 23:41 ~ 12월 2일 02:18
      const start = new Date('2025-12-01T23:41:00');
      const end = new Date('2025-12-02T02:18:00');
      const result = splitActivityByMidnight(start, end, ActivityType.SLEEP);

      expect(result).toHaveLength(2);

      // 첫 번째 분할: 12월 1일 23:41 ~ 12월 2일 00:00 (19분)
      expect(result[0].startTime).toEqual(new Date('2025-12-01T23:41:00'));
      expect(result[0].endTime).toEqual(new Date('2025-12-02T00:00:00'));
      expect(result[0].duration).toBe(19);
      expect(result[0].sleepType).toBe('night');
      expect(result[0].splitSequence).toBe(1);

      // 두 번째 분할: 12월 2일 00:00 ~ 12월 2일 02:18 (138분)
      expect(result[1].startTime).toEqual(new Date('2025-12-02T00:00:00'));
      expect(result[1].endTime).toEqual(new Date('2025-12-02T02:18:00'));
      expect(result[1].duration).toBe(138);
      expect(result[1].sleepType).toBe('night');
      expect(result[1].splitSequence).toBe(2);
    });

    it('2일 이상 걸친 수면은 여러 개로 분할되어야 한다', () => {
      // 12월 1일 22:00 ~ 12월 3일 01:00 (27시간)
      const start = new Date('2025-12-01T22:00:00');
      const end = new Date('2025-12-03T01:00:00');
      const result = splitActivityByMidnight(start, end, ActivityType.SLEEP);

      expect(result).toHaveLength(3);

      // 첫 번째: 12월 1일 22:00 ~ 12월 2일 00:00 (2시간 = 120분)
      expect(result[0].duration).toBe(120);
      expect(result[0].splitSequence).toBe(1);

      // 두 번째: 12월 2일 00:00 ~ 12월 3일 00:00 (24시간 = 1440분)
      expect(result[1].duration).toBe(1440);
      expect(result[1].splitSequence).toBe(2);

      // 세 번째: 12월 3일 00:00 ~ 12월 3일 01:00 (1시간 = 60분)
      expect(result[2].duration).toBe(60);
      expect(result[2].splitSequence).toBe(3);
    });

    it('SLEEP이 아닌 타입은 에러를 발생시켜야 한다 (FEEDING)', () => {
      const start = new Date('2025-12-01T23:00:00');
      const end = new Date('2025-12-02T01:00:00');
      expect(() => {
        splitActivityByMidnight(start, end, ActivityType.FEEDING);
      }).toThrow('Activity type FEEDING cannot be split');
    });

    it('PLAY 타입도 분할 가능해야 한다', () => {
      const start = new Date('2025-12-01T23:30:00');
      const end = new Date('2025-12-02T00:30:00');
      const result = splitActivityByMidnight(start, end, ActivityType.PLAY);

      expect(result).toHaveLength(2);
      expect(result[0].duration).toBe(30);
      expect(result[1].duration).toBe(30);
    });
  });

  describe('needsSplit', () => {
    it('종료 시간이 없으면 false를 반환해야 한다', () => {
      const start = new Date('2025-12-01T23:00:00');
      expect(needsSplit(start, null, ActivityType.SLEEP)).toBe(false);
    });

    it('SLEEP이 아닌 타입은 false를 반환해야 한다', () => {
      const start = new Date('2025-12-01T23:00:00');
      const end = new Date('2025-12-02T01:00:00');
      expect(needsSplit(start, end, ActivityType.FEEDING)).toBe(false);
    });

    it('자정을 넘는 SLEEP은 true를 반환해야 한다', () => {
      const start = new Date('2025-12-01T23:00:00');
      const end = new Date('2025-12-02T01:00:00');
      expect(needsSplit(start, end, ActivityType.SLEEP)).toBe(true);
    });

    it('자정을 넘지 않는 SLEEP은 false를 반환해야 한다', () => {
      const start = new Date('2025-12-01T22:00:00');
      const end = new Date('2025-12-01T23:00:00');
      expect(needsSplit(start, end, ActivityType.SLEEP)).toBe(false);
    });
  });

  describe('calculateDuration', () => {
    it('정확한 분 단위 지속 시간을 계산해야 한다', () => {
      const start = new Date('2025-12-01T23:41:00');
      const end = new Date('2025-12-02T02:18:00');
      const duration = calculateDuration(start, end);
      expect(duration).toBe(157); // 2시간 37분 = 157분
    });

    it('1시간은 60분으로 계산되어야 한다', () => {
      const start = new Date('2025-12-01T22:00:00');
      const end = new Date('2025-12-01T23:00:00');
      const duration = calculateDuration(start, end);
      expect(duration).toBe(60);
    });

    it('초 단위는 버림 처리되어야 한다', () => {
      const start = new Date('2025-12-01T22:00:00');
      const end = new Date('2025-12-01T22:01:30'); // 1분 30초
      const duration = calculateDuration(start, end);
      expect(duration).toBe(1); // 1분으로 버림
    });
  });
});
