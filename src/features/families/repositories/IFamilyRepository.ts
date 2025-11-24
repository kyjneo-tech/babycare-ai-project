// src/features/families/repositories/IFamilyRepository.ts
import { Family, FamilyMember, Baby } from '@prisma/client';
import { CreateBabyData } from '@/features/babies/repositories/IBabyRepository';

export interface IFamilyRepository {
  findMemberByUserId(userId: string): Promise<(FamilyMember & { Family: Family }) | null>;
  
  findFamilyDetailsByUserId(userId: string): Promise<(Family & { Babies: Baby[] }) | null>;

  createWithBabyAndMember(
    userId: string,
    babyData: CreateBabyData
  ): Promise<{ baby: Baby; family: Family & { Babies: Baby[] } }>;
}
