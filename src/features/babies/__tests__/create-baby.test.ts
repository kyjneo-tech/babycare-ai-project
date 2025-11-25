import { createBabyService } from '../services/createBabyService';
import { PrismaBabyRepository } from '../repositories/PrismaBabyRepository';
import { PrismaFamilyRepository } from '@/features/families/repositories/PrismaFamilyRepository';
import { User, Family, Baby } from '@prisma/client';

jest.mock('../repositories/PrismaBabyRepository');
jest.mock('@/features/families/repositories/PrismaFamilyRepository');

const MockBabyRepository = PrismaBabyRepository as jest.MockedClass<typeof PrismaBabyRepository>;
const MockFamilyRepository = PrismaFamilyRepository as jest.MockedClass<typeof PrismaFamilyRepository>;

describe('아기 등록 서비스 (createBabyService)', () => {
  const mockUser: User = {
    id: 'test-user-id',
    email: 'test@example.com',
    password: 'hashed-password',
    name: '테스트유저',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const babyData = {
    name: '지우',
    gender: 'female',
    birthDate: new Date('2024-01-15'),
    birthTime: '14:30',
  };

  beforeEach(() => {
    MockBabyRepository.mockClear();
    MockFamilyRepository.mockClear();
  });

  it('[성공] 첫 아기 등록 시 가족도 자동 생성되어야 한다', async () => {
    // Given
    MockFamilyRepository.prototype.findMemberByUserId.mockResolvedValue(null);
    const mockResult = {
      baby: { id: 'baby-id', name: babyData.name },
      family: { id: 'family-id', name: `${babyData.name}의 가족`, inviteCode: 'ABCDEF' },
    };
    MockFamilyRepository.prototype.createWithBabyAndMember.mockResolvedValue(mockResult);

    // When
    const result = await createBabyService(mockUser.id, babyData);

    // Then
    expect(result.baby.name).toBe(babyData.name);
    expect(result.family.name).toBe(`${babyData.name}의 가족`);
    expect(MockFamilyRepository.prototype.findMemberByUserId).toHaveBeenCalledWith(mockUser.id);
    expect(MockFamilyRepository.prototype.createWithBabyAndMember).toHaveBeenCalledWith(mockUser.id, babyData);
  });

  it('[성공] 기존 가족에 두 번째 아기를 추가해야 한다', async () => {
    // Given
    const existingFamilyMember = {
      userId: mockUser.id,
      familyId: 'existing-family-id',
      role: 'parent',
      relation: 'father',
      permission: 'full',
      createdAt: new Date(),
      updatedAt: new Date(),
      Family: {
        id: 'existing-family-id',
        name: '기존 가족',
        inviteCode: 'XYZ123',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };
    MockFamilyRepository.prototype.findMemberByUserId.mockResolvedValue(existingFamilyMember);

    const newBaby: Baby = {
      id: 'new-baby-id',
      familyId: 'existing-family-id',
      ...babyData,
      photoUrl: null,
      aiSettings: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    MockBabyRepository.prototype.create.mockResolvedValue(newBaby);

    // When
    const result = await createBabyService(mockUser.id, babyData);

    // Then
    expect(result.baby.id).toBe('new-baby-id');
    expect(result.family.id).toBe('existing-family-id');
    expect(MockBabyRepository.prototype.create).toHaveBeenCalledWith(
      'existing-family-id',
      babyData
    );
  });
});
