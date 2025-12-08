import { deleteBaby } from '../actions';
import { prisma } from '@/shared/lib/prisma';
import { getServerSession } from 'next-auth';

// Mock auth options to prevent NextAuth initialization error
jest.mock('@/app/api/auth/[...nextauth]/route', () => ({
  authOptions: {},
}));

// Mock notes actions to prevent Redis/Upstash dependency issues
jest.mock('@/features/notes/actions', () => ({
  generateSchedulesAction: jest.fn(),
}));


// Mock dependencies
jest.mock('@/shared/lib/prisma', () => ({
  prisma: {
    baby: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
    familyMember: {
      findFirst: jest.fn(),
    },
    activity: {
      deleteMany: jest.fn(),
    },
    family: {
      update: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(prisma)),
  },
}));

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('deleteBaby', () => {
  const mockUserId = 'user-123';
  const mockFamilyId = 'family-123';
  const mockBabyId = 'baby-123';

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: mockUserId },
    });
  });

  it('[성공] 아기 삭제 후 남은 아기가 있으면 가족 이름을 업데이트해야 한다', async () => {
    // Given
    (prisma.baby.findUnique as jest.Mock).mockResolvedValue({
      id: mockBabyId,
      familyId: mockFamilyId,
      Family: { id: mockFamilyId },
    });

    (prisma.familyMember.findFirst as jest.Mock).mockResolvedValue({
      userId: mockUserId,
      familyId: mockFamilyId,
    });

    // Mock finding remaining babies (transaction inside)
    (prisma.baby.findMany as jest.Mock).mockResolvedValue([
      { name: '김철수' } // Remaining baby
    ]);

    // When
    const result = await deleteBaby(mockBabyId);

    // Then
    expect(result.success).toBe(true);
    // Verify transaction operations
    expect(prisma.activity.deleteMany).toHaveBeenCalledWith({ where: { babyId: mockBabyId } });
    expect(prisma.baby.delete).toHaveBeenCalledWith({ where: { id: mockBabyId } });
    
    // Verify family name update
    expect(prisma.family.update).toHaveBeenCalledWith({
      where: { id: mockFamilyId },
      data: { name: '김철수의 가족' },
    });
  });

  it('[성공] 아기 삭제 후 남은 아기가 없으면 가족 이름을 업데이트하지 않아야 한다', async () => {
    // Given
    (prisma.baby.findUnique as jest.Mock).mockResolvedValue({
      id: mockBabyId,
      familyId: mockFamilyId,
      Family: { id: mockFamilyId },
    });

    (prisma.familyMember.findFirst as jest.Mock).mockResolvedValue({
      userId: mockUserId,
      familyId: mockFamilyId,
    });

    // Mock finding remaining babies (empty)
    (prisma.baby.findMany as jest.Mock).mockResolvedValue([]);

    // When
    const result = await deleteBaby(mockBabyId);

    // Then
    expect(result.success).toBe(true);
    expect(prisma.baby.delete).toHaveBeenCalledWith({ where: { id: mockBabyId } });
    
    // Verify family name NOT update
    expect(prisma.family.update).not.toHaveBeenCalled();
  });

  it('[실패] 로그인하지 않은 경우 에러를 반환해야 한다', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const result = await deleteBaby(mockBabyId);

    expect(result.success).toBe(false);
    expect(result.error).toContain('로그인이 필요합니다');
  });

  it('[실패] 아기를 찾을 수 없는 경우 에러를 반환해야 한다', async () => {
    (prisma.baby.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await deleteBaby(mockBabyId);

    expect(result.success).toBe(false);
    expect(result.error).toContain('아기를 찾을 수 없습니다');
  });

  it('[실패] 권한이 없는 경우 에러를 반환해야 한다', async () => {
    (prisma.baby.findUnique as jest.Mock).mockResolvedValue({
      id: mockBabyId,
      familyId: mockFamilyId,
      Family: { id: mockFamilyId },
    });

    (prisma.familyMember.findFirst as jest.Mock).mockResolvedValue(null);

    const result = await deleteBaby(mockBabyId);

    expect(result.success).toBe(false);
    expect(result.error).toContain('삭제할 권한이 없습니다');
  });
});
