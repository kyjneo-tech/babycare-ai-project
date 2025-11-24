// src/features/families/repositories/PrismaFamilyRepository.ts
import { prisma } from '@/shared/lib/prisma';
import { IFamilyRepository } from './IFamilyRepository';
import { Family, FamilyMember, Baby } from '@prisma/client';
import { CreateBabyData } from '@/features/babies/repositories/IBabyRepository';

function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export class PrismaFamilyRepository implements IFamilyRepository {
  async findMemberByUserId(userId: string): Promise<(FamilyMember & { Family: Family }) | null> {
    return prisma.familyMember.findFirst({
      where: { userId },
      include: { Family: true },
    });
  }

  async findFamilyDetailsByUserId(userId: string): Promise<(Family & { Babies: Baby[] }) | null> {
    try {
      const member = await prisma.familyMember.findFirst({
        where: { userId },
        include: {
          Family: {
            include: {
              Babies: true,
            },
          },
        },
      });

      if (!member) return null;
      return member.Family;
    } catch (error) {
      console.error("가족 정보 조회 실패 (DB 에러):", error);
      // DB 연결 에러 시 null 반환하여 앱 충돌 방지 (로그인 페이지로 리다이렉트되거나 빈 상태 표시)
      return null;
    }
  }

  async createWithBabyAndMember(
    userId: string,
    babyData: CreateBabyData
  ): Promise<{ baby: Baby; family: Family & { Babies: Baby[] } }> {
    const inviteCode = generateInviteCode();
    const newFamily = await prisma.$transaction(async (tx) => {
      const family = await tx.family.create({
        data: {
          name: `${babyData.name}의 가족`,
          inviteCode,
          Babies: {
            create: babyData,
          },
          FamilyMembers: {
            create: {
              userId,
              role: 'parent',
              relation: 'parent',
            },
          },
        },
        include: {
          Babies: true,
        },
      });
      return family;
    });
    return { baby: newFamily.Babies[0], family: newFamily };
  }
}
