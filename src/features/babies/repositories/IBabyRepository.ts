// src/features/babies/repositories/IBabyRepository.ts
import { Baby } from '@prisma/client';
import { z } from 'zod';
import { CreateBabySchema } from '@/shared/types/schemas';

export type CreateBabyData = z.infer<typeof CreateBabySchema>;

export interface IBabyRepository {
  create(familyId: string, data: CreateBabyData): Promise<Baby>;
}
