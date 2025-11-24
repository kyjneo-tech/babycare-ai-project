// src/features/measurements/repositories/PrismaMeasurementRepository.ts

import { prisma } from "@/shared/lib/prisma";
import { BabyMeasurement } from "@prisma/client";
import {
  CreateMeasurementData,
  IMeasurementRepository,
} from "./IMeasurementRepository";

export class PrismaMeasurementRepository implements IMeasurementRepository {
  async create(data: CreateMeasurementData): Promise<BabyMeasurement> {
    return await prisma.babyMeasurement.create({
      data,
    });
  }

  async findLatest(babyId: string): Promise<BabyMeasurement | null> {
    return await prisma.babyMeasurement.findFirst({
      where: { babyId },
      orderBy: { measuredAt: "desc" },
    });
  }

  async findByBabyId(babyId: string): Promise<BabyMeasurement[]> {
    return await prisma.babyMeasurement.findMany({
      where: { babyId },
      orderBy: { measuredAt: "desc" },
    });
  }
}
