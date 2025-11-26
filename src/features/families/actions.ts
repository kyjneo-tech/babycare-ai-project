"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import { prisma } from "@/shared/lib/prisma";
import { PrismaFamilyRepository } from "./repositories/PrismaFamilyRepository";
import { joinFamilyService } from "./services/joinFamilyService";
import { isAdminOrOwner, isOwner, getMyPermission } from "./utils/permissions";
import { withFamilyPermission } from "./lib/withPermission";

export async function joinFamily(
  inviteCode: string,
  role: string,
  relation: string
) {
  try {
    // 1. 사용자 세션 확인
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("로그인이 필요합니다.");
    }
    const userId = session.user.id;

    // 2. 서비스 호출 (새로 참여하는 구성원은 기본적으로 'member' 권한)
    const familyId = await joinFamilyService(
      userId,
      inviteCode,
      role,
      relation
    );

    if (!familyId) {
      throw new Error(
        "가족에 참여할 수 없습니다. 이미 다른 가족에 속해 있거나 초대 코드가 잘못되었을 수 있습니다."
      );
    }

    // 3. 관련 페이지 캐시 무효화
    revalidatePath("/");

    return { success: true, data: { familyId } };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "가족 참여에 실패했습니다.";
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * 현재 사용자의 가족 정보를 조회합니다.
 */
export async function getFamilyInfo() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("로그인이 필요합니다.");
    }

    const familyRepository = new PrismaFamilyRepository();
    const family = await familyRepository.findFamilyDetailsByUserId(
      session.user.id
    );

    if (!family) {
      return { success: true, data: null };
    }

    // 가족원 정보와 함께 반환
    const members = await prisma.familyMember.findMany({
      where: { familyId: family.id },
      include: {
        User: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // 현재 사용자의 권한 정보 조회
    const currentUserMember = members.find(m => m.userId === session.user.id);

    return {
      success: true,
      data: {
        id: family.id,
        name: family.name,
        inviteCode: family.inviteCode,
        inviteCodeExpiry: family.inviteCodeExpiry,
        members: members.map((m) => ({
          userId: m.userId,
          name: m.User.name,
          email: m.User.email,
          permission: m.permission,
          role: m.role,
          relation: m.relation,
          joinedAt: m.createdAt,
        })),
        babies: family.Babies,
        currentUser: currentUserMember ? {
          userId: currentUserMember.userId,
          permission: currentUserMember.permission,
        } : null,
      },
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "가족 정보 조회에 실패했습니다.";
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * 가족원의 역할을 업데이트합니다. (Admin 이상)
 */
export const updateFamilyMemberRole = withFamilyPermission(
  isAdminOrOwner,
  async ({ family }, memberId: string, newRole: string, newRelation: string) => {
    // 역할 업데이트
    await prisma.familyMember.update({
      where: {
        userId_familyId: {
          userId: memberId,
          familyId: family.id,
        },
      },
      data: {
        role: newRole,
        relation: newRelation,
      },
    });

    revalidatePath("/family");
  }
);

/**
 * 가족원을 제거합니다. (Admin 이상)
 */
export const removeFamilyMember = withFamilyPermission(
  isAdminOrOwner,
  async ({ userId, family }, memberId: string) => {
    // 자신을 제거할 수는 없음 (leaveFamily 사용)
    if (memberId === userId) {
      throw new Error("자신을 제거할 수 없습니다. 가족 나가기 기능을 사용하세요.");
    }

    // Owner는 제거할 수 없음
    const targetPermission = await getMyPermission(memberId, family.id);
    if (targetPermission === "owner") {
      throw new Error("소유자는 제거할 수 없습니다.");
    }

    await prisma.familyMember.delete({
      where: {
        userId_familyId: {
          userId: memberId,
          familyId: family.id,
        },
      },
    });

    revalidatePath("/family");
  }
);

/**
 * 가족을 나갑니다 (자신을 가족에서 제거).
 */
export const leaveFamily = withFamilyPermission(null, async ({ userId, family }) => {
  // Owner는 나가기 전에 다른 사람을 Owner로 지정하거나 가족을 삭제해야 함
  const myPermission = await getMyPermission(userId, family.id);
  if (myPermission === "owner") {
    throw new Error(
      "소유자는 가족을 나갈 수 없습니다. 다른 관리자를 소유자로 지정하거나 가족을 삭제하세요."
    );
  }

  await prisma.familyMember.delete({
    where: {
      userId_familyId: {
        userId: userId,
        familyId: family.id,
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/family");
});

/**
 * 가족을 삭제합니다 (Owner만 가능).
 */
export const deleteFamily = withFamilyPermission(isOwner, async ({ family }) => {
  // Family 삭제 시 Cascade로 FamilyMember, Baby, Activity 등 모두 삭제됨
  await prisma.family.delete({
    where: {
      id: family.id,
    },
  });

  revalidatePath("/");
  revalidatePath("/family");
});

/**
 * 구성원의 권한을 변경합니다 (Owner만 가능).
 */
export async function updateMemberPermission(
  memberId: string,
  newPermission: 'admin' | 'member' | 'viewer'
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("로그인이 필요합니다.");
    }

    const repository = new PrismaFamilyRepository();
    const family = await repository.findFamilyDetailsByUserId(session.user.id);
    if (!family) {
      throw new Error("가족 정보를 찾을 수 없습니다.");
    }

    // Owner만 권한 변경 가능
    const hasPermission = await isOwner(session.user.id, family.id);
    if (!hasPermission) {
      throw new Error("권한이 없습니다. 소유자만 권한을 변경할 수 있습니다.");
    }

    // 자신의 권한은 변경할 수 없음
    if (memberId === session.user.id) {
      throw new Error("자신의 권한은 변경할 수 없습니다.");
    }

    // Owner의 권한은 변경할 수 없음
    const targetPermission = await getMyPermission(memberId, family.id);
    if (targetPermission === 'owner') {
      throw new Error("소유자의 권한은 변경할 수 없습니다.");
    }

    await prisma.familyMember.update({
      where: {
        userId_familyId: {
          userId: memberId,
          familyId: family.id,
        },
      },
      data: {
        permission: newPermission,
      },
    });

    revalidatePath("/family");

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "권한 변경에 실패했습니다.";
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * 초대 코드를 재생성합니다. (Admin 이상)
 */
export const regenerateInviteCode = withFamilyPermission(
  isAdminOrOwner,
  async ({ family }) => {
    // 6자리 랜덤 초대 코드 생성
    function generateInviteCode(): string {
      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let code = "";
      for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return code;
    }

    // 고유한 초대 코드 생성
    let inviteCode = generateInviteCode();
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      const existingFamily = await prisma.family.findUnique({
        where: { inviteCode },
      });

      if (!existingFamily) {
        isUnique = true;
      } else {
        inviteCode = generateInviteCode();
        attempts++;
      }
    }

    if (!isUnique) {
      throw new Error("초대 코드 생성에 실패했습니다. 다시 시도해주세요.");
    }

    // 초대 코드 만료 시간 설정 (7일 후)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

    // 가족 초대 코드 업데이트
    await prisma.family.update({
      where: { id: family.id },
      data: {
        inviteCode,
        inviteCodeExpiry: expiryDate,
      },
    });

    revalidatePath("/family");

    return {
      inviteCode,
      expiresAt: expiryDate,
    };
  }
);

/**
 * 내 프로필(relation)을 업데이트합니다.
 * Unique relation(엄마/아빠)은 중복 방지 체크를 수행합니다.
 */
export async function updateMyProfile(newRelation: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("로그인이 필요합니다.");
    }

    const repository = new PrismaFamilyRepository();
    const family = await repository.findFamilyDetailsByUserId(session.user.id);
    if (!family) {
      throw new Error("가족 정보를 찾을 수 없습니다.");
    }

    // Relation 옵션에서 unique 여부 확인
    const { isUniqueRelation } = await import('./constants/relationOptions');
    const isUnique = isUniqueRelation(newRelation);

    if (isUnique) {
      // 중복 체크: 같은 relation을 가진 다른 구성원이 있는지
      const existing = await prisma.familyMember.findFirst({
        where: {
          familyId: family.id,
          relation: newRelation,
          userId: { not: session.user.id }, // 본인 제외
        },
        include: {
          User: {
            select: { name: true },
          },
        },
      });

      if (existing) {
        const { getRelationLabel } = await import('./constants/relationOptions');
        throw new Error(
          `이미 ${getRelationLabel(newRelation)} 역할의 가족원(${existing.User.name})이 있습니다.`
        );
      }
    }

    // 업데이트
    await prisma.familyMember.update({
      where: {
        userId_familyId: {
          userId: session.user.id,
          familyId: family.id,
        },
      },
      data: {
        relation: newRelation,
      },
    });

    revalidatePath("/family");

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "프로필 업데이트에 실패했습니다.";
    return {
      success: false,
      error: message,
    };
  }
}

