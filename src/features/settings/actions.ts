"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/shared/lib/prisma";

export async function getCurrentUser() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "로그인이 필요합니다." };
    }
    return { success: true, data: { userId: session.user.id } };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
    return { success: false, error: message };
  }
}

export async function getUserSettings(userId: string) {
  try {
    let settings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await prisma.userSettings.create({
        data: { userId },
      });
    }

    return { success: true, data: settings };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "설정 조회 중 오류가 발생했습니다.";
    return { success: false, error: message };
  }
}

export async function updateUserSettings(
  userId: string,
  data: {
    unit?: string;
    timeFormat?: string;
    notificationsEnabled?: boolean;
    notificationTimes?: Record<string, string>; // 구체적인 타입으로 변경
  }
) {
  try {
    const settings = await prisma.userSettings.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });

    return { success: true, data: settings };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "설정 업데이트 중 오류가 발생했습니다.";
    return { success: false, error: message };
  }
}
