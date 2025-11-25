// src/features/families/utils/permissions.ts
import { prisma } from '@/shared/lib/prisma';

export type Permission = 'owner' | 'admin' | 'member' | 'viewer';

/**
 * 사용자의 가족 내 권한을 조회합니다.
 */
export async function getMyPermission(
  userId: string,
  familyId: string
): Promise<Permission | null> {
  const member = await prisma.familyMember.findUnique({
    where: {
      userId_familyId: {
        userId,
        familyId,
      },
    },
    select: {
      permission: true,
    },
  });

  return (member?.permission as Permission) || null;
}

/**
 * 사용자가 특정 권한 레벨 이상인지 확인합니다.
 */
export async function checkPermission(
  userId: string,
  familyId: string,
  requiredPermission: Permission
): Promise<boolean> {
  const userPermission = await getMyPermission(userId, familyId);
  if (!userPermission) return false;

  const permissionLevel: Record<Permission, number> = {
    owner: 4,
    admin: 3,
    member: 2,
    viewer: 1,
  };

  return permissionLevel[userPermission] >= permissionLevel[requiredPermission];
}

/**
 * Owner 권한이 있는지 확인합니다.
 */
export async function isOwner(userId: string, familyId: string): Promise<boolean> {
  const permission = await getMyPermission(userId, familyId);
  return permission === 'owner';
}

/**
 * Admin 이상 권한이 있는지 확인합니다.
 */
export async function isAdminOrOwner(userId: string, familyId: string): Promise<boolean> {
  return checkPermission(userId, familyId, 'admin');
}

/**
 * Member 이상 권한이 있는지 확인합니다 (조회 제외한 기본 권한).
 */
export async function isMemberOrAbove(userId: string, familyId: string): Promise<boolean> {
  return checkPermission(userId, familyId, 'member');
}

/**
 * 권한 레이블을 반환합니다.
 */
export const permissionLabels: Record<Permission, string> = {
  owner: '소유자',
  admin: '관리자',
  member: '구성원',
  viewer: '조회 전용',
};
