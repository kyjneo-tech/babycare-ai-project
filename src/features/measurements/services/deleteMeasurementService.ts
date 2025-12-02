import { IMeasurementRepository } from "../repositories/IMeasurementRepository";
import { BabyMeasurement } from "@prisma/client";

export async function deleteMeasurementService(
  repository: IMeasurementRepository,
  id: string
): Promise<BabyMeasurement> {
  // 존재 여부 확인
  const existing = await repository.findById(id);
  if (!existing) {
    throw new Error("측정 기록을 찾을 수 없습니다.");
  }

  return await repository.delete(id);
}
