// src/features/auth/repositories/IUserRepository.ts
import { User } from '@prisma/client';
import { z } from 'zod';
import { CreateUserSchema } from '@/shared/types/schemas';

// CreateUserSchema에서 password를 제외한 타입을 생성합니다.
const _UserResponseSchema = CreateUserSchema.omit({ password: true }).extend({
  id: z.string(),
});

export type UserCreationData = z.infer<typeof CreateUserSchema>;
export type UserResponseData = z.infer<typeof _UserResponseSchema>;

/**
 * 사용자 데이터에 접근하기 위한 Repository 인터페이스
 */
export interface IUserRepository {
  /**
   * ID로 사용자를 찾습니다.
   * @param id - 찾을 사용자의 ID
   * @returns 찾은 사용자 정보 또는 null
   */
  findById(id: string): Promise<User | null>;

  /**
   * 이메일로 사용자를 찾습니다.
   * @param email - 찾을 사용자의 이메일
   * @returns 찾은 사용자 정보 또는 null
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * 새로운 사용자를 생성합니다.
   * @param userData - 생성할 사용자의 데이터
   * @returns 생성된 사용자 정보
   */
  create(userData: UserCreationData): Promise<User>;
}
