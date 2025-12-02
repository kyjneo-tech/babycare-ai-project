import { IMeasurementRepository, CreateMeasurementData } from "../repositories/IMeasurementRepository";
import { BabyMeasurement } from "@prisma/client";

export async function updateMeasurementService(
  repository: IMeasurementRepository,
  id: string,
  data: Partial<CreateMeasurementData>
): Promise<BabyMeasurement> {
  // 유효성 검사
  if (data.weight !== undefined && data.weight <= 0) {
    throw new Error("체중은 0보다 커야 합니다.");
  }
  if (data.height !== undefined && data.height <= 0) {
    throw new Error("키는 0보다 커야 합니다.");
  }

  // 존재 여부 확인 (선택 사항, repository.update에서 에러 발생할 수 있음)
  const existing = await repository.findById(id);
  if (!existing) {
    throw new Error("측정 기록을 찾을 수 없습니다.");
  }

  return await repository.update(id, data);
}
