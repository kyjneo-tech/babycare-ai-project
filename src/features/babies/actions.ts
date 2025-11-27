// src/features/babies/actions.ts
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createBabyService } from "./services/createBabyService";
import { CreateBabyInput, CreateBabySchema } from "@/shared/types/schemas";
import { ZodError } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/shared/lib/prisma";
import { generateSchedulesAction } from "@/features/notes/actions";

export async function createBaby(input: CreateBabyInput) {
  try {
    // 1. 사용자 세션 확인
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("로그인이 필요합니다.");
    }
    const userId = session.user.id;

    // 2. 입력값 유효성 검사
    const validatedInput = CreateBabySchema.parse(input);

    // 3. 서비스 호출
    const result = await createBabyService(userId, validatedInput);

    // 4. 생성된 아기에 대한 모든 일정 자동 생성
    console.log(`Generating schedules for new baby: ${result.baby.id}`);
    const scheduleResult = await generateSchedulesAction(result.baby.id);
    if (!scheduleResult.success) {
      // 일정 생성 실패는 전체 프로세스를 중단시키지 않음. 로깅만 수행.
      console.error(`Failed to generate schedules for baby ${result.baby.id}:`, scheduleResult.error);
    } else {
      console.log(`${scheduleResult.data.count} schedules generated for baby ${result.baby.id}.`);
    }

    // 5. 대시보드 페이지 캐시 무효화
    revalidatePath("/");
    revalidatePath("/schedules"); // 스케줄 페이지도 무효화

    return { success: true, data: result };
  } catch (error: any) {
    // 6. 에러 처리
    if (error instanceof ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return {
      success: false,
      error: error.message || "아기 등록에 실패했습니다.",
    };
  }
}

export async function deleteBaby(babyId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("로그인이 필요합니다.");
    }

    // 아기가 현재 사용자의 가족에 속하는지 확인
    const baby = await prisma.baby.findUnique({
      where: { id: babyId },
      include: { Family: true },
    });

    if (!baby) {
      throw new Error("아기를 찾을 수 없습니다.");
    }

    // 가족원 확인
    const isFamilyMember = await prisma.familyMember.findFirst({
      where: {
        familyId: baby.familyId,
        userId: session.user.id,
      },
    });

    if (!isFamilyMember) {
      throw new Error("이 아기를 삭제할 권한이 없습니다.");
    }

    // 관련된 모든 활동 기록 삭제
    await prisma.activity.deleteMany({
      where: { babyId },
    });

    // 아기 삭제
    await prisma.baby.delete({
      where: { id: babyId },
    });

    revalidatePath("/");
    revalidatePath(`/babies/${babyId}`);

    return { success: true, message: "아기가 삭제되었습니다." };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "아기 삭제에 실패했습니다.",
    };
  }
}

export async function getBabyById(babyId: string) {
  try {
    const baby = await prisma.baby.findUnique({
      where: { id: babyId },
      select: { id: true, name: true, gender: true, birthDate: true }, // 필요한 필드만 선택
    });

    if (!baby) {
      return { success: false, error: "아기를 찾을 수 없습니다." };
    }

    return { success: true, data: baby };
  } catch (error: any) {
    console.error("아기 정보 조회 실패:", error);
    return { success: false, error: "아기 정보 조회 실패" };
  }
}
