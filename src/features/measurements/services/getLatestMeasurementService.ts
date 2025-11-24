// src/features/measurements/services/getLatestMeasurementService.ts

import { BabyMeasurement } from "@prisma/client";
import { IMeasurementRepository } from "../repositories/IMeasurementRepository";

export async function getLatestMeasurementService(
  repository: IMeasurementRepository,
  babyId: string
): Promise<BabyMeasurement | null> {
  return await repository.findLatest(babyId);
}
