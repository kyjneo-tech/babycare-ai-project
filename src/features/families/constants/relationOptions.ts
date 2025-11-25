// src/features/families/constants/relationOptions.ts

export interface RelationOption {
  value: string;
  label: string;
  unique: boolean; // true면 1명만 가능
}

export const relationOptions: RelationOption[] = [
  // 1명만 가능한 역할
  { value: 'mother', label: '엄마', unique: true },
  { value: 'father', label: '아빠', unique: true },
  
  // 여러 명 가능한 역할
  { value: 'grandmother_maternal', label: '외할머니', unique: false },
  { value: 'grandmother_paternal', label: '친할머니', unique: false },
  { value: 'grandfather_maternal', label: '외할아버지', unique: false },
  { value: 'grandfather_paternal', label: '친할아버지', unique: false },
  { value: 'nanny', label: '돌봄이', unique: false },
  { value: 'other', label: '기타', unique: false },
];

// 레이블 조회 헬퍼
export function getRelationLabel(value: string): string {
  return relationOptions.find(opt => opt.value === value)?.label || value;
}

// Unique relation 체크 헬퍼
export function isUniqueRelation(value: string): boolean {
  return relationOptions.find(opt => opt.value === value)?.unique || false;
}
