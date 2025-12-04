/**
 * Note 관련 헬퍼 함수들
 */

import { NoteType, Priority } from '@prisma/client';

/**
 * NoteType별 아이콘 반환
 */
export const noteTypeIcons: Record<NoteType, string> = {
  MEMO: '📝',
  TODO: '✅',
  VACCINATION: '💉',
  HEALTH_CHECKUP: '🏥',
  MILESTONE: '🎯',
  WONDER_WEEK: '🌊',
  SLEEP_REGRESSION: '😴',
  FEEDING_STAGE: '🍼',
  APPOINTMENT: '📅',
};
export function getNoteIcon(type: NoteType): string {
  return noteTypeIcons[type] || '📌';
}

/**
 * NoteType별 색상 반환 (Tailwind CSS 클래스)
 */
export const noteTypeColors: Record<NoteType, string> = {
  MEMO: 'bg-gray-100 text-gray-800',
  TODO: 'bg-green-100 text-green-800',
  VACCINATION: 'bg-blue-100 text-blue-800',
  HEALTH_CHECKUP: 'bg-purple-100 text-purple-800',
  MILESTONE: 'bg-yellow-100 text-yellow-800',
  WONDER_WEEK: 'bg-cyan-100 text-cyan-800',
  SLEEP_REGRESSION: 'bg-indigo-100 text-indigo-800',
  FEEDING_STAGE: 'bg-orange-100 text-orange-800',
  APPOINTMENT: 'bg-pink-100 text-pink-800',
};
export function getNoteColor(type: NoteType): string {
  return noteTypeColors[type] || 'bg-gray-100 text-gray-800';
}

/**
 * Priority별 색상 반환
 */
export function getPriorityColor(priority: Priority): string {
  const colorMap: Record<Priority, string> = {
    LOW: 'text-gray-500',
    MEDIUM: 'text-blue-500',
    HIGH: 'text-orange-500',
    URGENT: 'text-red-500',
  };

  return colorMap[priority] || 'text-gray-500';
}

/**
 * Priority별 라벨 반환
 */
export function getPriorityLabel(priority: Priority): string {
  const labelMap: Record<Priority, string> = {
    LOW: '낮음',
    MEDIUM: '보통',
    HIGH: '높음',
    URGENT: '긴급',
  };

  return labelMap[priority] || '보통';
}

/**
 * NoteType별 한글 라벨 반환
 */
export const noteTypeLabels: Record<NoteType, string> = {
  MEMO: '메모',
  TODO: '할 일',
  VACCINATION: '예방접종',
  HEALTH_CHECKUP: '건강검진',
  MILESTONE: '마일스톤',
  WONDER_WEEK: '원더위크',
  SLEEP_REGRESSION: '수면퇴행',
  FEEDING_STAGE: '이유식',
  APPOINTMENT: '병원예약',
};
export function getNoteTypeLabel(type: NoteType): string {
  return noteTypeLabels[type] || '노트';
}

/**
 * 날짜 포맷팅 (상대적 표현 포함)
 */
export function formatDueDate(dueDate: Date, today: Date = new Date()): string {
  const diffInDays = Math.floor(
    (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffInDays === 0) {
    return '오늘';
  } else if (diffInDays === 1) {
    return '내일';
  } else if (diffInDays === -1) {
    return '어제';
  } else if (diffInDays > 1 && diffInDays <= 7) {
    return `${diffInDays}일 후`;
  } else if (diffInDays < -1 && diffInDays >= -7) {
    return `${Math.abs(diffInDays)}일 전`;
  } else {
    // YYYY.MM.DD 형식
    const year = dueDate.getFullYear();
    const month = String(dueDate.getMonth() + 1).padStart(2, '0');
    const day = String(dueDate.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  }
}

/**
 * NoteType에 따른 상세 정보(아이콘, 라벨) 반환
 */
export function getNoteTypeDetails(type: NoteType): { icon: string; label: string } {
  return {
    icon: getNoteIcon(type),
    label: getNoteTypeLabel(type),
  };
}
