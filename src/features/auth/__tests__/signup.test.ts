// babycare-ai/src/features/auth/__tests__/signup.test.ts
import { signupService } from '../services/signupService';
import { PrismaUserRepository } from '../repositories/PrismaUserRepository';
import { User } from '@prisma/client';
import bcrypt from 'bcryptjs';

// PrismaUserRepository를 모킹합니다.
jest.mock('../repositories/PrismaUserRepository');

// bcrypt.hash 함수를 모킹합니다.
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
}));

const MockPrismaUserRepository = PrismaUserRepository as jest.MockedClass<typeof PrismaUserRepository>;

describe('회원가입 서비스 (signupService)', () => {
  beforeEach(() => {
    // 각 테스트 전에 모든 모의를 초기화합니다.
    MockPrismaUserRepository.mockClear();
    (bcrypt.hash as jest.Mock).mockClear();
  });

  it('[성공] 유효한 정보로 회원가입 시 사용자를 생성하고 반환해야 한다', async () => {
    // Given: 테스트에 필요한 데이터를 설정합니다.
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      name: '테스트유저',
    };

    const mockUser: User = {
      id: 'test-user-id',
      email: 'test@example.com',
      password: 'hashed-password',
      name: '테스트유저',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 모의 Repository의 create 메서드가 mockUser를 반환하도록 설정합니다.
    MockPrismaUserRepository.prototype.create.mockResolvedValue(mockUser);

    const userRepositoryInstance = new MockPrismaUserRepository();

    // When: signupService 함수를 실행합니다.
    const result = await signupService(userData, userRepositoryInstance);

    // Then: 결과가 예상과 같은지 확인합니다.
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    expect(MockPrismaUserRepository.prototype.create).toHaveBeenCalledWith({
      ...userData,
      password: 'hashed-password',
    });
    expect(result).toEqual({
      id: 'test-user-id',
      email: 'test@example.com',
      name: '테스트유저',
    });
  });

  it('[실패] 중복된 이메일로 회원가입 시 에러를 발생시켜야 한다', async () => {
    // Given: 중복된 이메일을 포함한 사용자 데이터
    const userData = {
      email: 'duplicate@example.com',
      password: 'password123',
      name: '테스트유저',
    };

    // 모의 Repository의 create 메서드가 에러를 발생시키도록 설정합니다.
    MockPrismaUserRepository.prototype.create.mockRejectedValue({
      code: 'P2002',
      meta: { target: ['email'] },
    });

    const userRepositoryInstance = new MockPrismaUserRepository();

    // When & Then: signupService 함수를 실행했을 때 에러가 발생하는지 확인합니다.
    await expect(signupService(userData, userRepositoryInstance)).rejects.toMatchObject({
      code: 'P2002',
    });
  });
});
