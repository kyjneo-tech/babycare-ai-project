// src/features/measurements/services/createMeasurementService.ts

import { BabyMeasurement } from "@prisma/client";
import {
  CreateMeasurementData,
  IMeasurementRepository,
} from "../repositories/IMeasurementRepository";

export async function createMeasurementService(
  repository: IMeasurementRepository,
  data: CreateMeasurementData
): Promise<BabyMeasurement> {
  // 체중과 키 유효성 검사
  if (data.weight <= 0) {
    throw new Error("체중은 0보다 커야 합니다");
  }

  if (data.height <= 0) {
    throw new Error("키는 0보다 커야 합니다");
  }

  // 측정 기록 생성
  return await repository.create(data);
}
