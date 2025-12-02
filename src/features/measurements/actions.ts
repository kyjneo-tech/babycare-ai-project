// src/features/measurements/actions.ts
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import { BabyMeasurement } from "@prisma/client";
import { PrismaMeasurementRepository } from "./repositories/PrismaMeasurementRepository";
import { createMeasurementService } from "./services/createMeasurementService";
import { getLatestMeasurementService } from "./services/getLatestMeasurementService";
import { getMeasurementHistoryService } from "./services/getMeasurementHistoryService";
import { updateMeasurementService } from "./services/updateMeasurementService";
import { deleteMeasurementService } from "./services/deleteMeasurementService";
import { CreateMeasurementData } from "./repositories/IMeasurementRepository";

const repository = new PrismaMeasurementRepository();

export async function createMeasurement(
  data: Omit<CreateMeasurementData, 'measuredAt'>
): Promise<{
  success: boolean;
  data?: BabyMeasurement;
  error?: string;
}> {

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.error("[Action] 세션 없음");
      return { success: false, error: "로그인이 필요합니다" };
    }

    // measuredAt을 현재 시간으로 자동 설정
    const measurementData: CreateMeasurementData = {
      ...data,
      measuredAt: new Date(),
    };


    // 서비스 호출
    const measurement = await createMeasurementService(repository, measurementData);


    // 캐시 무효화
    revalidatePath(`/babies/${data.babyId}`);

    return { success: true, data: measurement };
  } catch (error: unknown) {
    console.error("측정값 생성 실패:", error);
    const message = error instanceof Error ? error.message : "측정값 생성에 실패했습니다";
    return { success: false, error: message };
  }
}

export async function getLatestMeasurement(
  babyId: string
): Promise<{
  success: boolean;
  data?: BabyMeasurement | null;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "로그인이 필요합니다" };
    }

    const measurement = await getLatestMeasurementService(repository, babyId);

    return { success: true, data: measurement };
  } catch (error: unknown) {
    console.error("최근 측정값 조회 실패:", error);
    return { success: false, error: "최근 측정값 조회에 실패했습니다" };
  }
}

export async function getMeasurementHistory(
  babyId: string
): Promise<{
  success: boolean;
  data?: BabyMeasurement[];
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "로그인이 필요합니다" };
    }

    const measurements = await getMeasurementHistoryService(repository, babyId);

    return { success: true, data: measurements };
  } catch (error: unknown) {
    console.error("측정값 이력 조회 실패:", error);
    return { success: false, error: "측정값 이력 조회에 실패했습니다" };
  }
}

export async function updateMeasurement(
  id: string,
  data: Partial<CreateMeasurementData>
): Promise<{ success: boolean; data?: BabyMeasurement; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "로그인 사용자만 측정 기록을 수정할 수 있습니다." };
  }

  try {
    // TODO: 권한 검사 로직 추가 (activity actions 참고)
    
    const updatedMeasurement = await updateMeasurementService(repository, id, data);
    revalidatePath(`/babies/${updatedMeasurement.babyId}`);
    return { success: true, data: updatedMeasurement };
  } catch (error: any) {
    console.error("측정 기록 수정 실패:", error);
    return { success: false, error: error.message || "측정 기록 수정에 실패했습니다" };
  }
}

export async function deleteMeasurement(
  id: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "로그인 사용자만 측정 기록을 삭제할 수 있습니다." };
  }

  try {
    // TODO: 권한 검사 로직 추가
    
    const deletedMeasurement = await deleteMeasurementService(repository, id);
    revalidatePath(`/babies/${deletedMeasurement.babyId}`);
    return { success: true, message: "측정 기록이 삭제되었습니다." };
  } catch (error: any) {
    console.error("측정 기록 삭제 실패:", error);
    return { success: false, error: error.message || "측정 기록 삭제에 실패했습니다" };
  }
}
