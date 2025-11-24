// src/features/families/repositories/__tests__/PrismaFamilyRepository.test.ts
import { PrismaFamilyRepository } from '../PrismaFamilyRepository';
import { prismaMock } from '../../../../../jest.setup';
import { Family, FamilyMember, Baby, Prisma } from '@prisma/client';

describe('PrismaFamilyRepository', () => {
  let repository: PrismaFamilyRepository;

  const mockFamily: Family = {
    id: 'family-id',
    name: '테스트 가족',
    inviteCode: 'ABC123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockFamilyMember: FamilyMember = {
    userId: 'user-id',
    familyId: 'family-id',
    role: 'parent',
    relation: 'parent',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockBaby: Baby = {
    id: 'baby-id',
    familyId: 'family-id',
    name: '지우',
    gender: 'female',
    birthDate: new Date('2024-01-15'),
    birthTime: '14:30',
    photoUrl: null,
    aiSettings: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    repository = new PrismaFamilyRepository();
  });

  describe('findMemberByUserId', () => {
    it('[성공] 존재하는 가족원 조회 성공', async () => {
      // Given
      const expectedResult = {
        ...mockFamilyMember,
        Family: mockFamily,
      };
      prismaMock.familyMember.findFirst.mockResolvedValue(expectedResult);

      // When
      const result = await repository.findMemberByUserId('user-id');

      // Then
      expect(result).toEqual(expectedResult);
      expect(prismaMock.familyMember.findFirst).toHaveBeenCalledWith({
        where: { userId: 'user-id' },
        include: { Family: true },
      });
    });

    it('[실패] 존재하지 않는 가족원 조회 시 null 반환', async () => {
      // Given
      prismaMock.familyMember.findFirst.mockResolvedValue(null);

      // When
      const result = await repository.findMemberByUserId('non-existent-user');

      // Then
      expect(result).toBeNull();
      expect(prismaMock.familyMember.findFirst).toHaveBeenCalledWith({
        where: { userId: 'non-existent-user' },
        include: { Family: true },
      });
    });

    it('[경계값] 빈 userId로 조회 시 null 반환', async () => {
      // Given
      prismaMock.familyMember.findFirst.mockResolvedValue(null);

      // When
      const result = await repository.findMemberByUserId('');

      // Then
      expect(result).toBeNull();
      expect(prismaMock.familyMember.findFirst).toHaveBeenCalledWith({
        where: { userId: '' },
        include: { Family: true },
      });
    });
  });

  describe('findFamilyDetailsByUserId', () => {
    it('[성공] 가족과 아기 정보 포함 조회', async () => {
      // Given
      const memberWithFamily = {
        ...mockFamilyMember,
        Family: mockFamily,
      };
      const familyWithBabies = {
        ...mockFamily,
        Babies: [mockBaby],
      };

      prismaMock.familyMember.findFirst.mockResolvedValue(mockFamilyMember);
      prismaMock.family.findUnique.mockResolvedValue(familyWithBabies);

      // When
      const result = await repository.findFamilyDetailsByUserId('user-id');

      // Then
      expect(result).toEqual(familyWithBabies);
      expect(prismaMock.familyMember.findFirst).toHaveBeenCalledWith({
        where: { userId: 'user-id' },
      });
      expect(prismaMock.family.findUnique).toHaveBeenCalledWith({
        where: { id: mockFamilyMember.familyId },
        include: { Babies: true },
      });
    });

    it('[성공] 여러 아기를 가진 가족 조회', async () => {
      // Given
      const secondBaby: Baby = {
        ...mockBaby,
        id: 'baby-id-2',
        name: '민준',
        gender: 'male',
      };
      const familyWithMultipleBabies = {
        ...mockFamily,
        Babies: [mockBaby, secondBaby],
      };

      prismaMock.familyMember.findFirst.mockResolvedValue(mockFamilyMember);
      prismaMock.family.findUnique.mockResolvedValue(familyWithMultipleBabies);

      // When
      const result = await repository.findFamilyDetailsByUserId('user-id');

      // Then
      expect(result).toEqual(familyWithMultipleBabies);
      expect(result?.Babies).toHaveLength(2);
      expect(result?.Babies[0].name).toBe('지우');
      expect(result?.Babies[1].name).toBe('민준');
    });

    it('[실패] 가족원이 없을 경우 null 반환', async () => {
      // Given
      prismaMock.familyMember.findFirst.mockResolvedValue(null);

      // When
      const result = await repository.findFamilyDetailsByUserId('non-existent-user');

      // Then
      expect(result).toBeNull();
      expect(prismaMock.familyMember.findFirst).toHaveBeenCalledWith({
        where: { userId: 'non-existent-user' },
      });
      expect(prismaMock.family.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('createWithBabyAndMember', () => {
    const babyData = {
      name: '지우',
      gender: 'female' as const,
      birthDate: new Date('2024-01-15'),
      birthTime: '14:30',
    };

    it('[성공] 가족, 아기, 가족원 동시 생성', async () => {
      // Given
      const expectedFamily = {
        ...mockFamily,
        Babies: [mockBaby],
      };

      prismaMock.$transaction.mockImplementation(async (callback) => {
        const txMock = {
          family: {
            create: jest.fn().mockResolvedValue(expectedFamily),
          },
        };
        return await callback(txMock as unknown as Prisma.TransactionClient);
      });

      // When
      const result = await repository.createWithBabyAndMember('user-id', babyData);

      // Then
      expect(result).toEqual({
        baby: mockBaby,
        family: expectedFamily,
      });
      expect(prismaMock.$transaction).toHaveBeenCalled();
    });

    it('[검증] 초대 코드 자동 생성 확인 (6자 대문자)', async () => {
      // Given
      let capturedInviteCode: string | undefined;

      prismaMock.$transaction.mockImplementation(async (callback) => {
        const txMock = {
          family: {
            create: jest.fn().mockImplementation((data) => {
              capturedInviteCode = data.data.inviteCode;
              return Promise.resolve({
                ...mockFamily,
                inviteCode: capturedInviteCode,
                Babies: [mockBaby],
              });
            }),
          },
        };
        return await callback(txMock as unknown as Prisma.TransactionClient);
      });

      // When
      await repository.createWithBabyAndMember('user-id', babyData);

      // Then
      expect(capturedInviteCode).toBeDefined();
      expect(capturedInviteCode).toHaveLength(6);
      expect(capturedInviteCode).toMatch(/^[A-Z0-9]{6}$/);
    });

    it('[검증] 트랜잭션 처리 확인', async () => {
      // Given
      const txMock = {
        family: {
          create: jest.fn().mockResolvedValue({
            ...mockFamily,
            Babies: [mockBaby],
          }),
        },
      };

      prismaMock.$transaction.mockImplementation(async (callback) => {
        return await callback(txMock as unknown as Prisma.TransactionClient);
      });

      // When
      await repository.createWithBabyAndMember('user-id', babyData);

      // Then
      expect(prismaMock.$transaction).toHaveBeenCalled();
      expect(txMock.family.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: '지우의 가족',
            inviteCode: expect.stringMatching(/^[A-Z0-9]{6}$/),
            Babies: {
              create: babyData,
            },
            FamilyMembers: {
              create: {
                userId: 'user-id',
                role: 'parent',
                relation: 'parent',
              },
            },
          }),
          include: {
            Babies: true,
          },
        })
      );
    });

    it('[실패] 트랜잭션 롤백 처리', async () => {
      // Given
      const testError = new Error('트랜잭션 실패');

      prismaMock.$transaction.mockImplementation(async (callback) => {
        const txMock = {
          family: {
            create: jest.fn().mockRejectedValue(testError),
          },
        };
        return await callback(txMock as unknown as Prisma.TransactionClient);
      });

      // When & Then
      await expect(repository.createWithBabyAndMember('user-id', babyData)).rejects.toThrow(
        '트랜잭션 실패'
      );
      expect(prismaMock.$transaction).toHaveBeenCalled();
    });
  });

  describe('generateInviteCode (간접 검증)', () => {
    const babyData = {
      name: '테스트',
      gender: 'male' as const,
      birthDate: new Date(),
      birthTime: '12:00',
    };

    it('[검증] 6자 대문자 코드 생성', async () => {
      // Given
      let capturedInviteCode: string | undefined;

      prismaMock.$transaction.mockImplementation(async (callback) => {
        const txMock = {
          family: {
            create: jest.fn().mockImplementation((data) => {
              capturedInviteCode = data.data.inviteCode;
              return Promise.resolve({
                ...mockFamily,
                inviteCode: capturedInviteCode,
                Babies: [mockBaby],
              });
            }),
          },
        };
        return await callback(txMock as unknown as Prisma.TransactionClient);
      });

      // When
      await repository.createWithBabyAndMember('user-id', babyData);

      // Then
      expect(capturedInviteCode).toBeDefined();
      expect(capturedInviteCode?.length).toBe(6);
      expect(/^[A-Z0-9]+$/.test(capturedInviteCode!)).toBe(true);
    });

    it('[검증] 코드 포맷 검증 (정규식)', async () => {
      // Given
      let capturedInviteCode: string | undefined;

      prismaMock.$transaction.mockImplementation(async (callback) => {
        const txMock = {
          family: {
            create: jest.fn().mockImplementation((data) => {
              capturedInviteCode = data.data.inviteCode;
              return Promise.resolve({
                ...mockFamily,
                inviteCode: capturedInviteCode,
                Babies: [mockBaby],
              });
            }),
          },
        };
        return await callback(txMock as unknown as Prisma.TransactionClient);
      });

      // When
      await repository.createWithBabyAndMember('user-id', babyData);

      // Then
      expect(capturedInviteCode).toMatch(/^[A-Z0-9]{6}$/);
    });
  });
});
