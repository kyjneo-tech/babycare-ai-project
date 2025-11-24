// src/features/measurements/services/getMeasurementHistoryService.ts

import { BabyMeasurement } from "@prisma/client";
import { IMeasurementRepository } from "../repositories/IMeasurementRepository";

export async function getMeasurementHistoryService(
  repository: IMeasurementRepository,
  babyId: string
): Promise<BabyMeasurement[]> {
  return await repository.findByBabyId(babyId);
}
