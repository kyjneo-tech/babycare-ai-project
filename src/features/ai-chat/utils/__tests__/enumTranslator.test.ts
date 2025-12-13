import { describe, it, expect } from '@jest/globals';
import { translateEnum, translateRelation } from '../enumTranslator';

describe('translateEnum', () => {
  it('should translate feeding types', () => {
    expect(translateEnum('BREAST')).toBe('모유');
    expect(translateEnum('FORMULA')).toBe('분유');
    expect(translateEnum('PUMPED')).toBe('유축');
  });

  it('should translate breast side', () => {
    expect(translateEnum('LEFT')).toBe('왼쪽');
    expect(translateEnum('RIGHT')).toBe('오른쪽');
    expect(translateEnum('BOTH')).toBe('양쪽');
  });

  it('should translate sleep types', () => {
    expect(translateEnum('NIGHT')).toBe('밤잠');
    expect(translateEnum('NAP')).toBe('낮잠');
  });

  it('should translate diaper types', () => {
    expect(translateEnum('PEE')).toBe('소변');
    expect(translateEnum('POOP')).toBe('대변');
  });

  it('should translate stool conditions', () => {
    expect(translateEnum('NORMAL')).toBe('정상');
    expect(translateEnum('SOFT')).toBe('무름');
    expect(translateEnum('HARD')).toBe('딱딱');
    expect(translateEnum('WATERY')).toBe('설사');
  });

  it('should handle case insensitivity', () => {
    expect(translateEnum('breast')).toBe('모유');
    expect(translateEnum('Breast')).toBe('모유');
  });

  it('should return "알 수 없음" for null or undefined', () => {
    expect(translateEnum(null)).toBe('알 수 없음');
    expect(translateEnum(undefined)).toBe('알 수 없음');
  });

  it('should return original value for unknown enum', () => {
    expect(translateEnum('UNKNOWN')).toBe('UNKNOWN');
  });
});

describe('translateRelation', () => {
  it('should translate family relations', () => {
    expect(translateRelation('mother')).toBe('엄마');
    expect(translateRelation('father')).toBe('아빠');
  });

  it('should translate grandparents', () => {
    expect(translateRelation('grandmother_maternal')).toBe('외할머니');
    expect(translateRelation('grandmother_paternal')).toBe('친할머니');
    expect(translateRelation('grandfather_maternal')).toBe('외할아버지');
    expect(translateRelation('grandfather_paternal')).toBe('친할아버지');
  });

  it('should translate other relations', () => {
    expect(translateRelation('nanny')).toBe('돌봄이');
    expect(translateRelation('parent')).toBe('보호자');
    expect(translateRelation('other')).toBe('보호자');
  });

  it('should return "보호자" for null or undefined', () => {
    expect(translateRelation(null)).toBe('보호자');
    expect(translateRelation(undefined)).toBe('보호자');
  });

  it('should return "보호자" for unknown relation', () => {
    expect(translateRelation('unknown')).toBe('보호자');
  });
});
