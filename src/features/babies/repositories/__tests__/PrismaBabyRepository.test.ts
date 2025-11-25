// src/features/babies/repositories/__tests__/PrismaBabyRepository.test.ts
import { PrismaBabyRepository } from '../PrismaBabyRepository';
import { prismaMock } from '../../../../../jest.setup';
import { Baby } from '@prisma/client';
import { CreateBabyData } from '../IBabyRepository';

describe('아기 리포지토리 (PrismaBabyRepository)', () => {
  let repository: PrismaBabyRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new PrismaBabyRepository();
  });

  describe('create', () => {
    it('[성공] 아기 생성 성공 - 필수 필드 포함', async () => {
      // Given: 아기 생성에 필요한 데이터
      const familyId = 'test-family-id';
      const babyData: CreateBabyData = {
        name: '김아기',
        gender: 'male',
        birthDate: new Date('2024-01-15'),
        birthTime: '14:30',
      };

      const mockBaby: Baby = {
        id: 'baby-id',
        name: '지우',
        gender: 'female',
        birthDate: new Date('2024-01-15'),
        birthTime: '14:30',
        photoUrl: null,
        familyId: 'family-id',
        aiSettings: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.baby.create.mockResolvedValue(mockBaby);

      // When: create 메서드 호출
      const result = await repository.create(familyId, babyData);

      // Then: 생성된 아기 객체가 반환되고, 모든 필수 필드가 포함되어 있는지 확인
      expect(result).toEqual(mockBaby);
      expect(result.name).toBe('지우');
      expect(result.gender).toBe('female');
      expect(result.birthDate).toEqual(new Date('2024-01-15'));
      expect(result.birthTime).toBe('14:30');
      expect(result.familyId).toBe('family-id');
      expect(result.aiSettings).toBeNull();

      expect(prismaMock.baby.create).toHaveBeenCalledWith({
        data: {
          ...babyData,
          familyId,
        },
      });
      expect(prismaMock.baby.create).toHaveBeenCalledTimes(1);
    });

    it('[성공] 아기와 가족 연결 확인 (familyId)', async () => {
      // Given: 특정 가족 ID와 아기 데이터
      const familyId = 'specific-family-id';
      const babyData: CreateBabyData = {
        name: '이아기',
        gender: 'female',
        birthDate: new Date('2024-02-20'),
        birthTime: '09:15',
        photoUrl: 'https://example.com/photo.jpg',
      };

      const mockBaby: Baby = {
        id: 'baby-id',
        name: '지우',
        gender: 'female',
        birthDate: new Date('2024-01-15'),
        birthTime: '14:30',
        photoUrl: 'https://example.com/photo.jpg',
        familyId: 'family-id',
        aiSettings: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.baby.create.mockResolvedValue(mockBaby);

      // When: create 메서드 호출
      const result = await repository.create(familyId, babyData);

      // Then: familyId가 올바르게 전달되고 연결되었는지 확인
      expect(result.familyId).toBe(familyId);
      expect(prismaMock.baby.create).toHaveBeenCalledWith({
        data: {
          name: '이아기',
          gender: 'female',
          birthDate: new Date('2024-02-20'),
          birthTime: '09:15',
          photoUrl: 'https://example.com/photo.jpg',
          familyId: 'specific-family-id',
        },
      });
      expect(prismaMock.baby.create).toHaveBeenCalledTimes(1);
    });

    it('[실패] 필수 필드 누락 시 에러', async () => {
      // Given: 필수 필드가 누락된 데이터 (Prisma 제약 조건 위반)
      const familyId = 'test-family-id';
      const incompleteBabyData = {
        name: '박아기',
        // gender 필드 누락
        birthDate: new Date('2024-03-10'),
        birthTime: '16:45',
      } as CreateBabyData;

      // Prisma가 필수 필드 누락 시 발생시키는 에러
      const prismaError = new Error('Prisma validation error');
      (prismaError as any).code = 'P2000'; // Prisma 에러 코드 예시

      prismaMock.baby.create.mockRejectedValue(prismaError);

      // When & Then: create 메서드 호출 시 에러가 발생하는지 확인
      await expect(
        repository.create(familyId, incompleteBabyData)
      ).rejects.toThrow('Prisma validation error');

      expect(prismaMock.baby.create).toHaveBeenCalledWith({
        data: {
          ...incompleteBabyData,
          familyId,
        },
      });
      expect(prismaMock.baby.create).toHaveBeenCalledTimes(1);
    });
  });
});
