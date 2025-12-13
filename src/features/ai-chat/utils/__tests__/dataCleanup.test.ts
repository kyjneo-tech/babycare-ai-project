import { describe, it, expect } from '@jest/globals';
import { removeNulls } from '../dataCleanup';

describe('removeNulls', () => {
  it('should remove null values from object', () => {
    const input = { a: 1, b: null, c: 'test' };
    const result = removeNulls(input);
    expect(result).toEqual({ a: 1, c: 'test' });
  });

  it('should remove undefined values from object', () => {
    const input = { a: 1, b: undefined, c: 'test' };
    const result = removeNulls(input);
    expect(result).toEqual({ a: 1, c: 'test' });
  });

  it('should handle nested objects', () => {
    const input = { a: { b: null, c: 1 }, d: 2 };
    const result = removeNulls(input);
    expect(result).toEqual({ a: { c: 1 }, d: 2 });
  });

  it('should filter null items from arrays', () => {
    const input = [1, null, 2, undefined, 3];
    const result = removeNulls(input);
    expect(result).toEqual([1, 2, 3]);
  });

  it('should handle arrays of objects', () => {
    const input = [{ a: 1, b: null }, { c: 2 }];
    const result = removeNulls(input);
    expect(result).toEqual([{ a: 1 }, { c: 2 }]);
  });

  it('should preserve Date objects', () => {
    const date = new Date('2025-01-01');
    const input = { date, value: null };
    const result = removeNulls(input);
    expect(result).toEqual({ date });
    expect(result.date).toBeInstanceOf(Date);
  });

  it('should return undefined for null input', () => {
    expect(removeNulls(null)).toBeUndefined();
  });

  it('should return undefined for undefined input', () => {
    expect(removeNulls(undefined)).toBeUndefined();
  });
});
