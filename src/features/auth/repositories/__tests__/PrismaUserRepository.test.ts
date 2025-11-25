// src/features/auth/repositories/__tests__/PrismaUserRepository.test.ts
import { PrismaUserRepository } from '../PrismaUserRepository';
import { prismaMock } from '../../../../../jest.setup';
import { User } from '@prisma/client';

describe('사용자 리포지토리 (PrismaUserRepository)', () => {
  let repository: PrismaUserRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new PrismaUserRepository();
  });

  describe('findById', () => {
    it('[성공] 유효한 ID로 사용자 조회 성공', async () => {
      // Given: 유효한 사용자 ID와 예상되는 사용자 객체
      const mockUser: User = {
        id: 'test-user-id',
        email: 'test@example.com',
        password: 'hashed-password',
        name: '테스트 사용자',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      // When: findById 메서드 호출
      const result = await repository.findById('test-user-id');

      // Then: 예상되는 사용자 객체가 반환되고, Prisma가 올바르게 호출되었는지 확인
      expect(result).toEqual(mockUser);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-user-id' },
      });
      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
    });

    it('[실패] 존재하지 않는 ID 조회 시 null 반환', async () => {
      // Given: 존재하지 않는 사용자 ID
      const nonExistentId = 'non-existent-id';
      prismaMock.user.findUnique.mockResolvedValue(null);

      // When: findById 메서드 호출
      const result = await repository.findById(nonExistentId);

      // Then: null이 반환되고, Prisma가 올바르게 호출되었는지 확인
      expect(result).toBeNull();
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: nonExistentId },
      });
      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
    });

    it('[경계값] 빈 문자열 ID 처리', async () => {
      // Given: 빈 문자열 ID
      const emptyId = '';
      prismaMock.user.findUnique.mockResolvedValue(null);

      // When: findById 메서드 호출
      const result = await repository.findById(emptyId);

      // Then: null이 반환되고, Prisma가 호출되었는지 확인
      expect(result).toBeNull();
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: emptyId },
      });
      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
    });
  });
});
