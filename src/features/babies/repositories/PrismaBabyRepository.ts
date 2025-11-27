// src/features/babies/repositories/PrismaBabyRepository.ts
import { prisma } from '@/shared/lib/prisma';
import { IBabyRepository, CreateBabyData } from './IBabyRepository';
import { Baby } from '@prisma/client';

export class PrismaBabyRepository implements IBabyRepository {
  async create(familyId: string, data: CreateBabyData): Promise<Baby> {
    return prisma.baby.create({
      data: {
        ...data,
        familyId,
      },
      select: {
        id: true,
        name: true,
        birthDate: true,
        birthTime: true,
        gender: true,
        familyId: true,
        photoUrl: true,
        createdAt: true,
        updatedAt: true,
        aiSettings: true,
      },
    });
  }
}
