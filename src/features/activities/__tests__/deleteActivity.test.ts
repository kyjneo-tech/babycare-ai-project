// src/features/activities/__tests__/deleteActivity.test.ts
import { deleteActivity } from '../actions';
import { prismaMock } from '../../../../jest.setup';
import { Activity, Baby, Family, FamilyMember, ActivityType } from '@prisma/client';

// Redis mock
jest.mock('@/shared/lib/redis', () => ({
  redis: {
    del: jest.fn().mockResolvedValue(1),
  },
}));

// revalidatePath mock
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('deleteActivity', () => {
  const mockUserId = 'user-1';
  const mockActivityId = 'activity-1';
  const mockBabyId = 'baby-1';
  const mockFamilyId = 'family-1';

  const mockFamily: Family = {
    id: mockFamilyId,
    name: '테스트 가족',
    inviteCode: 'INVITE1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockBaby: Baby & { Family: Family } = {
    id: mockBabyId,
    name: '테스트 아기',
    birthDate: new Date('2024-01-01'),
    gender: 'male',
    familyId: mockFamilyId,
    createdAt: new Date(),
    updatedAt: new Date(),
    Family: mockFamily,
  };

  const mockActivity: Activity & { Baby: Baby & { Family: Family } } = {
    id: mockActivityId,
    babyId: mockBabyId,
    type: ActivityType.FEEDING,
    startTime: new Date(),
    endTime: null,
    duration: null,
    feedingType: 'bottle',
    feedingAmount: 120,
    sleepType: null,
    diaperType: null,
    stoolColor: null,
    stoolCondition: null,
    temperature: null,
    medicineName: null,
    medicineAmount: null,
    medicineUnit: null,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: mockUserId,
    Baby: mockBaby,
  };

  const mockFamilyMember: FamilyMember = {
    userId: mockUserId,
    familyId: mockFamilyId,
    role: 'parent',
    relation: 'mother',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prismaMock.activity.findUnique.mockReset();
    prismaMock.familyMember.findFirst.mockReset();
    prismaMock.activity.delete.mockReset();
  });

  describe('[성공] 정상 케이스', () => {
    it('본인이 기록한 활동을 삭제할 수 있어야 한다', async () => {
      // Given: 사용자가 가족 구성원이고, 활동이 존재함
      prismaMock.activity.findUnique.mockResolvedValue(mockActivity);
      prismaMock.familyMember.findFirst.mockResolvedValue(mockFamilyMember);
      prismaMock.activity.delete.mockResolvedValue(mockActivity);

      // When
      const result = await deleteActivity(mockActivityId, mockUserId);

      // Then
      expect(result.success).toBe(true);
      expect(result.message).toBe('활동 기록이 삭제되었습니다.');
      expect(prismaMock.activity.findUnique).toHaveBeenCalledWith({
        where: { id: mockActivityId },
        include: { Baby: { include: { Family: true } } },
      });
      expect(prismaMock.familyMember.findFirst).toHaveBeenCalledWith({
        where: {
          familyId: mockFamilyId,
          userId: mockUserId,
        },
      });
      expect(prismaMock.activity.delete).toHaveBeenCalledWith({
        where: { id: mockActivityId },
      });
    });

    it('가족 구성원이면 다른 사람이 기록한 활동도 삭제할 수 있어야 한다', async () => {
      // Given: 활동은 다른 사용자(user-2)가 기록했지만, 현재 사용자(user-1)도 같은 가족 구성원
      const otherUserActivity = {
        ...mockActivity,
        userId: 'user-2', // 다른 사용자가 기록
      };
      prismaMock.activity.findUnique.mockResolvedValue(otherUserActivity);
      prismaMock.familyMember.findFirst.mockResolvedValue(mockFamilyMember);
      prismaMock.activity.delete.mockResolvedValue(otherUserActivity);

      // When
      const result = await deleteActivity(mockActivityId, mockUserId);

      // Then
      expect(result.success).toBe(true);
      expect(result.message).toBe('활동 기록이 삭제되었습니다.');
    });
  });

  describe('[실패] 존재하지 않는 활동', () => {
    it('존재하지 않는 활동 삭제 시도 시 에러를 반환해야 한다', async () => {
      // Given: 활동을 찾을 수 없음
      prismaMock.activity.findUnique.mockResolvedValue(null);

      // When
      const result = await deleteActivity('non-existent-id', mockUserId);

      // Then
      expect(result.success).toBe(false);
      expect(result.error).toBe('활동 기록을 찾을 수 없습니다.');
      expect(prismaMock.familyMember.findFirst).not.toHaveBeenCalled();
      expect(prismaMock.activity.delete).not.toHaveBeenCalled();
    });
  });

  describe('[실패] 권한 에러', () => {
    it('다른 가족의 활동 삭제 시도 시 권한 에러를 반환해야 한다', async () => {
      // Given: 활동은 존재하지만, 사용자가 해당 가족의 구성원이 아님
      prismaMock.activity.findUnique.mockResolvedValue(mockActivity);
      prismaMock.familyMember.findFirst.mockResolvedValue(null); // 가족 구성원이 아님

      // When
      const result = await deleteActivity(mockActivityId, mockUserId);

      // Then
      expect(result.success).toBe(false);
      expect(result.error).toBe('이 활동을 삭제할 권한이 없습니다.');
      expect(prismaMock.activity.delete).not.toHaveBeenCalled();
    });

    it('가족에 속하지 않은 사용자는 활동을 삭제할 수 없어야 한다', async () => {
      // Given: 사용자가 어떤 가족에도 속하지 않음
      const outsiderUserId = 'outsider-user';
      prismaMock.activity.findUnique.mockResolvedValue(mockActivity);
      prismaMock.familyMember.findFirst.mockResolvedValue(null);

      // When
      const result = await deleteActivity(mockActivityId, outsiderUserId);

      // Then
      expect(result.success).toBe(false);
      expect(result.error).toBe('이 활동을 삭제할 권한이 없습니다.');
    });
  });

  describe('[검증] 캐시 무효화', () => {
    it('활동 삭제 성공 시 Redis 캐시가 무효화되어야 한다', async () => {
      // Given
      const { redis } = require('@/shared/lib/redis');
      prismaMock.activity.findUnique.mockResolvedValue(mockActivity);
      prismaMock.familyMember.findFirst.mockResolvedValue(mockFamilyMember);
      prismaMock.activity.delete.mockResolvedValue(mockActivity);

      // When
      await deleteActivity(mockActivityId, mockUserId);

      // Then
      expect(redis.del).toHaveBeenCalledWith(`baby:${mockBabyId}:recent-activities:7-days`);
    });

    it('활동 삭제 실패 시 Redis 캐시가 무효화되지 않아야 한다', async () => {
      // Given: 권한 에러 발생
      const { redis } = require('@/shared/lib/redis');
      prismaMock.activity.findUnique.mockResolvedValue(mockActivity);
      prismaMock.familyMember.findFirst.mockResolvedValue(null);

      // When
      await deleteActivity(mockActivityId, mockUserId);

      // Then
      expect(redis.del).not.toHaveBeenCalled();
    });
  });

  describe('[검증] revalidatePath 호출', () => {
    it('활동 삭제 성공 시 관련 경로가 재검증되어야 한다', async () => {
      // Given
      const { revalidatePath } = require('next/cache');
      prismaMock.activity.findUnique.mockResolvedValue(mockActivity);
      prismaMock.familyMember.findFirst.mockResolvedValue(mockFamilyMember);
      prismaMock.activity.delete.mockResolvedValue(mockActivity);

      // When
      await deleteActivity(mockActivityId, mockUserId);

      // Then
      expect(revalidatePath).toHaveBeenCalledWith(`/dashboard/babies/${mockBabyId}`);
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
      expect(revalidatePath).toHaveBeenCalledWith(`/dashboard/analytics/${mockBabyId}`);
    });
  });

  describe('[에러 처리] 데이터베이스 에러', () => {
    it('데이터베이스 에러 발생 시 에러 메시지를 반환해야 한다', async () => {
      // Given
      prismaMock.activity.findUnique.mockResolvedValue(mockActivity);
      prismaMock.familyMember.findFirst.mockResolvedValue(mockFamilyMember);
      prismaMock.activity.delete.mockRejectedValue(new Error('Database connection failed'));

      // When
      const result = await deleteActivity(mockActivityId, mockUserId);

      // Then
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
    });
  });
});
