import { calculateDate } from '../activityCalculator';

describe('calculateDate', () => {
  // 현재 날짜를 고정하여 테스트 (2024-12-05 기준)
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-12-05'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('일(day) 계산', () => {
    it('1일 전을 계산한다', () => {
      const result = calculateDate({
        amount: 1,
        unit: 'day',
        direction: 'ago'
      });

      expect(result.date).toBe('2024-12-04');
      expect(result.description).toBe('1일 전');
    });

    it('3일 전을 계산한다', () => {
      const result = calculateDate({
        amount: 3,
        unit: 'day',
        direction: 'ago'
      });

      expect(result.date).toBe('2024-12-02');
      expect(result.description).toBe('3일 전');
    });

    it('7일 전을 계산한다', () => {
      const result = calculateDate({
        amount: 7,
        unit: 'day',
        direction: 'ago'
      });

      expect(result.date).toBe('2024-11-28');
      expect(result.description).toBe('7일 전');
    });

    it('30일 전을 계산한다', () => {
      const result = calculateDate({
        amount: 30,
        unit: 'day',
        direction: 'ago'
      });

      expect(result.date).toBe('2024-11-05');
      expect(result.description).toBe('30일 전');
    });

    it('2일 후를 계산한다', () => {
      const result = calculateDate({
        amount: 2,
        unit: 'day',
        direction: 'later'
      });

      expect(result.date).toBe('2024-12-07');
      expect(result.description).toBe('2일 후');
    });
  });

  describe('주(week) 계산', () => {
    it('1주 전을 계산한다', () => {
      const result = calculateDate({
        amount: 1,
        unit: 'week',
        direction: 'ago'
      });

      expect(result.date).toBe('2024-11-28');
      expect(result.description).toBe('1주 전');
    });

    it('2주 전을 계산한다', () => {
      const result = calculateDate({
        amount: 2,
        unit: 'week',
        direction: 'ago'
      });

      expect(result.date).toBe('2024-11-21');
      expect(result.description).toBe('2주 전');
    });

    it('4주 전을 계산한다', () => {
      const result = calculateDate({
        amount: 4,
        unit: 'week',
        direction: 'ago'
      });

      expect(result.date).toBe('2024-11-07');
      expect(result.description).toBe('4주 전');
    });

    it('1주 후를 계산한다', () => {
      const result = calculateDate({
        amount: 1,
        unit: 'week',
        direction: 'later'
      });

      expect(result.date).toBe('2024-12-12');
      expect(result.description).toBe('1주 후');
    });
  });

  describe('개월(month) 계산', () => {
    it('1개월 전을 계산한다', () => {
      const result = calculateDate({
        amount: 1,
        unit: 'month',
        direction: 'ago'
      });

      expect(result.date).toBe('2024-11-05');
      expect(result.description).toBe('1개월 전');
    });

    it('2개월 전을 계산한다', () => {
      const result = calculateDate({
        amount: 2,
        unit: 'month',
        direction: 'ago'
      });

      expect(result.date).toBe('2024-10-05');
      expect(result.description).toBe('2개월 전');
    });

    it('3개월 전을 계산한다', () => {
      const result = calculateDate({
        amount: 3,
        unit: 'month',
        direction: 'ago'
      });

      expect(result.date).toBe('2024-09-05');
      expect(result.description).toBe('3개월 전');
    });

    it('6개월 전을 계산한다', () => {
      const result = calculateDate({
        amount: 6,
        unit: 'month',
        direction: 'ago'
      });

      expect(result.date).toBe('2024-06-05');
      expect(result.description).toBe('6개월 전');
    });

    it('1개월 후를 계산한다', () => {
      const result = calculateDate({
        amount: 1,
        unit: 'month',
        direction: 'later'
      });

      expect(result.date).toBe('2025-01-05');
      expect(result.description).toBe('1개월 후');
    });

    it('연도를 넘어가는 계산을 처리한다', () => {
      jest.setSystemTime(new Date('2024-01-15'));

      const result = calculateDate({
        amount: 2,
        unit: 'month',
        direction: 'ago'
      });

      expect(result.date).toBe('2023-11-15');
      expect(result.description).toBe('2개월 전');
    });
  });

  describe('기본값 처리', () => {
    it('direction이 없으면 ago로 처리한다', () => {
      const result = calculateDate({
        amount: 1,
        unit: 'day'
      });

      expect(result.date).toBe('2024-12-04');
      expect(result.description).toBe('1일 전');
    });
  });
});
