import { z } from 'zod';
import { CreateBabySchema } from '@/shared/types/schemas';
import { PrismaBabyRepository } from '../repositories/PrismaBabyRepository';
import { PrismaFamilyRepository } from '@/features/families/repositories/PrismaFamilyRepository';

type CreateBabyInput = z.infer<typeof CreateBabySchema>;

const babyRepository = new PrismaBabyRepository();
const familyRepository = new PrismaFamilyRepository();

export async function createBabyService(userId: string, input: CreateBabyInput) {
  const validated = CreateBabySchema.parse(input);

  const existingFamilyMember = await familyRepository.findMemberByUserId(userId);

  if (existingFamilyMember) {
    const baby = await babyRepository.create(existingFamilyMember.familyId, validated);
    return { baby, family: existingFamilyMember.Family };
  }

  return familyRepository.createWithBabyAndMember(userId, validated);
}
