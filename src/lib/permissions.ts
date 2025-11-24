// src/lib/permissions.ts
/**
 * 역할 기반 권한 관리 유틸리티
 *
 * 역할 계층:
 * - Owner: 모든 권한 (가족 삭제, 멤버 제거, 역할 변경 등)
 * - Admin: 관리 권한 (초대, 멤버 제거 제외한 대부분)
 * - Member: 일반 권한 (아기 기록 추가/수정)
 * - Read-Only: 읽기 전용
 */

export type Role = "Owner" | "Admin" | "Member" | "Read-Only";

/**
 * 가족 구성원을 초대할 수 있는지 확인
 * Owner와 Admin만 가능
 */
export function canInviteMembers(role: Role): boolean {
  return role === "Owner" || role === "Admin";
}

/**
 * 가족 구성원을 제거할 수 있는지 확인
 * Owner만 가능
 */
export function canRemoveMembers(role: Role): boolean {
  return role === "Owner";
}

/**
 * 가족을 삭제할 수 있는지 확인
 * Owner만 가능
 */
export function canDeleteFamily(role: Role): boolean {
  return role === "Owner";
}

/**
 * 구성원의 역할을 변경할 수 있는지 확인
 * Owner만 가능
 */
export function canChangeRole(role: Role): boolean {
  return role === "Owner";
}

/**
 * 아기 정보를 추가할 수 있는지 확인
 * Owner, Admin, Member만 가능
 */
export function canAddBaby(role: Role): boolean {
  return role === "Owner" || role === "Admin" || role === "Member";
}

/**
 * 아기 정보를 수정할 수 있는지 확인
 * Owner, Admin, Member만 가능
 */
export function canEditBaby(role: Role): boolean {
  return role === "Owner" || role === "Admin" || role === "Member";
}

/**
 * 아기 정보를 삭제할 수 있는지 확인
 * Owner와 Admin만 가능
 */
export function canDeleteBaby(role: Role): boolean {
  return role === "Owner" || role === "Admin";
}

/**
 * 아기 기록(수유, 수면, 배변 등)을 추가할 수 있는지 확인
 * Owner, Admin, Member만 가능
 */
export function canAddRecord(role: Role): boolean {
  return role === "Owner" || role === "Admin" || role === "Member";
}

/**
 * 아기 기록을 수정할 수 있는지 확인
 * Owner, Admin, Member만 가능
 */
export function canEditRecord(role: Role): boolean {
  return role === "Owner" || role === "Admin" || role === "Member";
}

/**
 * 아기 기록을 삭제할 수 있는지 확인
 * Owner, Admin, Member만 가능
 */
export function canDeleteRecord(role: Role): boolean {
  return role === "Owner" || role === "Admin" || role === "Member";
}

/**
 * 가족 정보를 수정할 수 있는지 확인
 * Owner와 Admin만 가능
 */
export function canEditFamilyInfo(role: Role): boolean {
  return role === "Owner" || role === "Admin";
}

/**
 * 아기 정보를 볼 수 있는지 확인
 * 모든 역할 가능
 */
export function canViewBaby(role: Role): boolean {
  return true;
}

/**
 * 아기 기록을 볼 수 있는지 확인
 * 모든 역할 가능
 */
export function canViewRecords(role: Role): boolean {
  return true;
}

/**
 * 가족 구성원 목록을 볼 수 있는지 확인
 * 모든 역할 가능
 */
export function canViewMembers(role: Role): boolean {
  return true;
}

/**
 * 초대 코드를 새로 생성할 수 있는지 확인
 * Owner와 Admin만 가능
 */
export function canRegenerateInviteCode(role: Role): boolean {
  return role === "Owner" || role === "Admin";
}

/**
 * AI 챗봇을 사용할 수 있는지 확인
 * 모든 역할 가능
 */
export function canUseChatbot(role: Role): boolean {
  return true;
}

/**
 * 분석 및 통계를 볼 수 있는지 확인
 * 모든 역할 가능
 */
export function canViewAnalytics(role: Role): boolean {
  return true;
}

/**
 * 알림 설정을 변경할 수 있는지 확인
 * Owner, Admin, Member만 가능
 */
export function canEditNotificationSettings(role: Role): boolean {
  return role === "Owner" || role === "Admin" || role === "Member";
}

/**
 * 역할별 권한 요약 정보
 */
export const rolePermissions = {
  Owner: {
    description: "가족 소유자",
    permissions: [
      "모든 권한",
      "가족 삭제",
      "구성원 제거",
      "역할 변경",
      "초대 코드 생성",
      "아기 추가/수정/삭제",
      "기록 추가/수정/삭제",
      "가족 정보 수정",
    ],
  },
  Admin: {
    description: "관리자",
    permissions: [
      "초대 코드 생성",
      "아기 추가/수정/삭제",
      "기록 추가/수정/삭제",
      "가족 정보 수정",
    ],
  },
  Member: {
    description: "일반 구성원",
    permissions: [
      "아기 정보 추가/수정",
      "기록 추가/수정/삭제",
      "알림 설정 변경",
    ],
  },
  "Read-Only": {
    description: "읽기 전용",
    permissions: [
      "아기 정보 보기",
      "기록 보기",
      "구성원 목록 보기",
      "분석 및 통계 보기",
      "AI 챗봇 사용",
    ],
  },
} as const;

/**
 * 역할의 우선순위를 반환 (숫자가 클수록 높은 권한)
 */
export function getRolePriority(role: Role): number {
  const priorities = {
    Owner: 4,
    Admin: 3,
    Member: 2,
    "Read-Only": 1,
  };
  return priorities[role] || 0;
}

/**
 * 특정 역할이 대상 역할보다 높은 권한을 가지는지 확인
 */
export function hasHigherRole(currentRole: Role, targetRole: Role): boolean {
  return getRolePriority(currentRole) > getRolePriority(targetRole);
}
