import { describe, it, expect } from '@jest/globals';
import { formatDate, formatTime, formatMinutes } from '../dateFormatter';

describe('formatDate', () => {
  it('should format ISO string to yy-mm-dd', () => {
    expect(formatDate('2025-01-15T10:30:00.000Z')).toBe('25-01-15');
  });

  it('should pad single digit month and day', () => {
    expect(formatDate('2025-03-05T10:30:00.000Z')).toBe('25-03-05');
  });
});

describe('formatTime', () => {
  it('should format ISO string to hh:min', () => {
    expect(formatTime('2025-01-15T10:30:00.000Z')).toMatch(/\d{2}:\d{2}/);
  });

  it('should pad single digit hours and minutes', () => {
    const result = formatTime('2025-01-15T09:05:00.000Z');
    expect(result).toMatch(/^\d{2}:\d{2}$/);
  });
});

describe('formatMinutes', () => {
  it('should return "0분" for 0 minutes', () => {
    expect(formatMinutes(0)).toBe('0분');
  });

  it('should format minutes only when less than 60', () => {
    expect(formatMinutes(45)).toBe('45분');
  });

  it('should format hours only when minutes is 0', () => {
    expect(formatMinutes(120)).toBe('2시간');
  });

  it('should format hours and minutes when both exist', () => {
    expect(formatMinutes(90)).toBe('1시간 30분');
  });

  it('should round minutes correctly', () => {
    expect(formatMinutes(65)).toBe('1시간 5분');
  });
});
