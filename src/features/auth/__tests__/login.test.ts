// babycare-ai/src/features/auth/__tests__/login.test.ts
import { loginService } from '../services/loginService';
import { PrismaUserRepository } from '../repositories/PrismaUserRepository';
import bcrypt from 'bcryptjs';
import { User } from '@prisma/client';

// PrismaUserRepository를 모킹합니다.
jest.mock('../repositories/PrismaUserRepository');

// bcrypt.compare 함수를 모킹합니다.
jest.mock('bcryptjs', () => ({
  ...jest.requireActual('bcryptjs'),
  compare: jest.fn(),
}));

const MockPrismaUserRepository = PrismaUserRepository as jest.MockedClass<typeof PrismaUserRepository>;

describe('로그인 서비스 (loginService)', () => {
  beforeEach(() => {
    // 각 테스트 전에 모든 모의를 초기화합니다.
    MockPrismaUserRepository.mockClear();
    (bcrypt.compare as jest.Mock).mockClear();
  });

  it('[성공] 유효한 자격 증명으로 로그인 시 사용자 ID를 반환해야 한다', async () => {
    // Given
    const userData = { email: 'test@example.com', password: 'password123' };
    const mockUser: User = {
      id: 'test-user-id',
      email: userData.email,
      password: 'hashed-password',
      name: '테스트유저',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    MockPrismaUserRepository.prototype.findByEmail.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    // When
    const userId = await loginService(userData);

    // Then
    expect(userId).toBe('test-user-id');
    expect(MockPrismaUserRepository.prototype.findByEmail).toHaveBeenCalledWith(userData.email);
    expect(bcrypt.compare).toHaveBeenCalledWith(userData.password, mockUser.password);
  });

  it('[실패] 존재하지 않는 이메일로 로그인 시 null을 반환해야 한다', async () => {
    // Given
    const userData = { email: 'nonexistent@example.com', password: 'password123' };
    MockPrismaUserRepository.prototype.findByEmail.mockResolvedValue(null);

    // When
    const userId = await loginService(userData);

    // Then
    expect(userId).toBeNull();
    expect(MockPrismaUserRepository.prototype.findByEmail).toHaveBeenCalledWith(userData.email);
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  it('[실패] 비밀번호가 일치하지 않을 경우 null을 반환해야 한다', async () => {
    // Given
    const userData = { email: 'test@example.com', password: 'wrong-password' };
    const mockUser: User = {
      id: 'test-user-id',
      email: userData.email,
      password: 'hashed-password',
      name: '테스트유저',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    MockPrismaUserRepository.prototype.findByEmail.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    // When
    const userId = await loginService(userData);

    // Then
    expect(userId).toBeNull();
    expect(MockPrismaUserRepository.prototype.findByEmail).toHaveBeenCalledWith(userData.email);
    expect(bcrypt.compare).toHaveBeenCalledWith(userData.password, mockUser.password);
  });
});
