// src/features/families/actions.ts
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { joinFamilyService } from "./services/joinFamilyService";
import { PrismaFamilyRepository } from "./repositories/PrismaFamilyRepository";
import { revalidatePath } from "next/cache";
import { prisma } from "@/shared/lib/prisma";

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

    // 2. 서비스 호출
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
    revalidatePath("/dashboard");

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

    return {
      success: true,
      data: {
        id: family.id,
        name: family.name,
        inviteCode: family.inviteCode,
        members: members.map((m) => ({
          userId: m.userId,
          name: m.User.name,
          email: m.User.email,
          role: m.role,
          relation: m.relation,
          joinedAt: m.createdAt,
        })),
        babies: family.Babies,
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
 * 가족원의 역할을 업데이트합니다.
 */
export async function updateFamilyMemberRole(
  memberId: string,
  newRole: string,
  newRelation: string
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("로그인이 필요합니다.");
    }

    // 현재 사용자가 가족 관리자인지 확인
    const repository = new PrismaFamilyRepository();
    const family = await repository.findFamilyDetailsByUserId(session.user.id);
    if (!family) {
      throw new Error("가족 정보를 찾을 수 없습니다.");
    }

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

    revalidatePath("/dashboard/family");

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "역할 업데이트에 실패했습니다.";
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * 가족원을 제거합니다.
 */
export async function removeFamilyMember(memberId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("로그인이 필요합니다.");
    }

    // 현재 사용자가 가족 관리자인지 확인
    const repository = new PrismaFamilyRepository();
    const family = await repository.findFamilyDetailsByUserId(session.user.id);
    if (!family) {
      throw new Error("가족 정보를 찾을 수 없습니다.");
    }

    // 자신을 제거할 수는 없음
    if (memberId === session.user.id) {
      throw new Error("자신을 제거할 수 없습니다.");
    }

    await prisma.familyMember.delete({
      where: {
        userId_familyId: {
          userId: memberId,
          familyId: family.id,
        },
      },
    });

    revalidatePath("/dashboard/family");

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "가족원 제거에 실패했습니다.";
    return {
      success: false,
      error: message,
    };
  }
}
