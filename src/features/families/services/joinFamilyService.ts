// babycare-ai/src/features/families/services/joinFamilyService.ts
import { prisma } from '@/shared/lib/prisma';

export async function joinFamilyService(
  userId: string,
  inviteCode: string,
  role: string,
  relation: string
): Promise<string | null> {
  // 1. 사용자가 이미 가족에 속해 있는지 확인
  const existingFamilyMember = await prisma.familyMember.findFirst({
    where: { userId },
  });

  if (existingFamilyMember) {
    return null; // 이미 가족에 속해 있음
  }

  // 2. 초대 코드로 가족 찾기
  const family = await prisma.family.findUnique({
    where: { inviteCode },
  });

  if (!family) {
    return null; // 유효하지 않은 초대 코드
  }

  // 3. 가족 구성원 추가
  await prisma.familyMember.create({
    data: {
      userId,
      familyId: family.id,
      role,
      relation,
    },
  });

  return family.id; // 성공적으로 참여한 가족의 ID 반환
}
