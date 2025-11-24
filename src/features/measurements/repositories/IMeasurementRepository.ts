// src/features/measurements/repositories/IMeasurementRepository.ts

import { BabyMeasurement } from "@prisma/client";

export interface CreateMeasurementData {
  babyId: string;
  weight: number;
  height: number;
  measuredAt: Date;
  note?: string;
}

export interface IMeasurementRepository {
  create(data: CreateMeasurementData): Promise<BabyMeasurement>;
  findLatest(babyId: string): Promise<BabyMeasurement | null>;
  findByBabyId(babyId: string): Promise<BabyMeasurement[]>;
}
