/**
 * todo-helpers.ts
 * 투두리스트 관련 헬퍼 함수들
 */

import { Priority } from '@prisma/client';

// 카테고리 타입 정의
export type TodoCategory = 
  | 'shopping'    // 쇼핑
  | 'hospital'    // 병원
  | 'cleaning'    // 청소
  | 'childcare'   // 돌봄
  | 'education'   // 육아
  | 'other';      // 기타

/**
 * 카테고리별 아이콘 반환
 */
export function getCategoryIcon(category: TodoCategory): string {
  const icons: Record<TodoCategory, string> = {
    shopping: '🛒',
    hospital: '🏥',
    cleaning: '🧼',
    childcare: '👶',
    education: '📚',
    other: '📌',
  };
  return icons[category] || icons.other;
}

/**
 * 카테고리별 라벨 반환
 */
export function getCategoryLabel(category: TodoCategory): string {
  const labels: Record<TodoCategory, string> = {
    shopping: '쇼핑',
    hospital: '병원',
    cleaning: '청소',
    childcare: '돌봄',
    education: '육아',
    other: '기타',
  };
  return labels[category] || labels.other;
}

/**
 * 우선순위별 색상 클래스 반환
 */
export function getPriorityColor(priority: Priority): string {
  const colors: Record<Priority, string> = {
    URGENT: 'bg-red-500',     // 긴급
    HIGH: 'bg-orange-500',    // 높음
    MEDIUM: 'bg-yellow-500',  // 중간
    LOW: 'bg-gray-400',       // 낮음
  };
  return colors[priority] || colors.MEDIUM;
}

/**
 * 우선순위별 텍스트 색상 클래스 반환
 */
export function getPriorityTextColor(priority: Priority): string {
  const colors: Record<Priority, string> = {
    URGENT: 'text-red-600',
    HIGH: 'text-orange-600',
    MEDIUM: 'text-yellow-600',
    LOW: 'text-gray-600',
  };
  return colors[priority] || colors.MEDIUM;
}

/**
 * 우선순위 라벨 반환
 */
export function getPriorityLabel(priority: Priority): string {
  const labels: Record<Priority, string> = {
    URGENT: '🔴 긴급',
    HIGH: '🟠 중요',
    MEDIUM: '🟡 보통',
    LOW: '⚪ 낮음',
  };
  return labels[priority] || labels.MEDIUM;
}

/**
 * 투두 마감일 포맷팅
 * - 오늘: "오늘"
 * - 내일: "내일"
 * - 7일 이내: "X일 후"
 * - 그 이상: "MM월 DD일"
 */
export function formatTodoDate(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return '오늘';
  if (diffDays === 1) return '내일';
  if (diffDays === -1) return '어제';
  if (diffDays > 1 && diffDays <= 7) return `${diffDays}일 후`;
  if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)}일 전`;
  
  // 7일 이상
  const month = targetDate.getMonth() + 1;
  const day = targetDate.getDate();
  return `${month}월 ${day}일`;
}

/**
 * 마감일이 지났는지 확인
 */
export function isOverdue(dueDate: Date | null): boolean {
  if (!dueDate) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const targetDate = new Date(dueDate);
  targetDate.setHours(0, 0, 0, 0);
  
  return targetDate < today;
}

/**
 * 우선순위 정렬 순서 반환 (낮을수록 우선)
 */
export function getPrioritySortOrder(priority: Priority): number {
  const order: Record<Priority, number> = {
    URGENT: 0,
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
  };
  return order[priority] || 2;
}
