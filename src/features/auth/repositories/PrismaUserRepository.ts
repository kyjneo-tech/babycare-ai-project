// src/features/auth/repositories/PrismaUserRepository.ts
import { prisma } from '@/shared/lib/prisma';
import { IUserRepository, UserCreationData } from './IUserRepository';
import { User } from '@prisma/client';

/**
 * Prisma를 사용하여 사용자 데이터에 접근하는 Repository 구현체
 */
export class PrismaUserRepository implements IUserRepository {
  /**
   * ID로 사용자를 찾습니다.
   * @param id - 찾을 사용자의 ID
   * @returns 찾은 사용자 정보 또는 null
   */
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * 이메일로 사용자를 찾습니다.
   * @param email - 찾을 사용자의 이메일
   * @returns 찾은 사용자 정보 또는 null
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * 새로운 사용자를 생성합니다.
   * @param userData - 생성할 사용자의 데이터 (비밀번호는 해싱된 상태여야 함)
   * @returns 생성된 사용자 정보
   */
  async create(userData: UserCreationData): Promise<User> {
    return prisma.user.create({
      data: userData,
    });
  }
}
