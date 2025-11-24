// src/features/activities/__tests__/getActivitiesPaginated.test.ts
import { getActivitiesPaginated } from '../actions';
import { prismaMock } from '../../../../jest.setup';
import { Activity, ActivityType } from '@prisma/client';

// Redis mock
jest.mock('@/shared/lib/redis', () => ({
  redis: {
    get: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
  },
}));

// revalidatePath mock
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('getActivitiesPaginated', () => {
  const mockBabyId = 'baby-1';

  beforeEach(() => {
    jest.clearAllMocks();
    prismaMock.activity.findMany.mockReset();
  });

  describe('[성공] 첫 페이지 조회', () => {
    it('cursor가 없을 때 첫 페이지를 조회해야 한다', async () => {
      // Given: 10개의 활동 기록 (limit=5 설정)
      const now = new Date('2025-01-01T12:00:00Z');
      const mockActivities: Partial<Activity>[] = Array.from({ length: 6 }, (_, i) => ({
        id: `activity-${i + 1}`,
        babyId: mockBabyId,
        type: ActivityType.FEEDING,
        startTime: new Date(now.getTime() - i * 60 * 60 * 1000),
        endTime: null,
        duration: null,
        feedingType: 'bottle',
        feedingAmount: 120,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user-1',
      }));

      prismaMock.activity.findMany.mockResolvedValue(mockActivities as Activity[]);

      // When: cursor 없이 첫 페이지 조회 (limit=5)
      const result = await getActivitiesPaginated(mockBabyId, undefined, 5);

      // Then
      expect(result.success).toBe(true);
      expect(result.data?.activities).toHaveLength(5); // limit 크기만큼 반환
      expect(result.data?.hasMore).toBe(true); // 다음 페이지가 있음
      expect(result.data?.nextCursor).toBe('activity-5'); // 마지막 활동의 ID
      expect(prismaMock.activity.findMany).toHaveBeenCalledWith({
        where: { babyId: mockBabyId },
        take: 6, // limit + 1
        orderBy: { startTime: 'desc' },
      });
    });

    it('활동이 limit보다 적을 때 hasMore가 false여야 한다', async () => {
      // Given: 3개의 활동 기록 (limit=5)
      const now = new Date('2025-01-01T12:00:00Z');
      const mockActivities: Partial<Activity>[] = Array.from({ length: 3 }, (_, i) => ({
        id: `activity-${i + 1}`,
        babyId: mockBabyId,
        type: ActivityType.SLEEP,
        startTime: new Date(now.getTime() - i * 60 * 60 * 1000),
        endTime: new Date(now.getTime() - i * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        duration: 120,
        sleepType: 'night',
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user-1',
      }));

      prismaMock.activity.findMany.mockResolvedValue(mockActivities as Activity[]);

      // When
      const result = await getActivitiesPaginated(mockBabyId, undefined, 5);

      // Then
      expect(result.success).toBe(true);
      expect(result.data?.activities).toHaveLength(3);
      expect(result.data?.hasMore).toBe(false); // 다음 페이지가 없음
      expect(result.data?.nextCursor).toBeNull();
    });
  });

  describe('[성공] 다음 페이지 조회', () => {
    it('cursor가 있을 때 다음 페이지를 조회해야 한다', async () => {
      // Given: cursor 이후의 활동들
      const now = new Date('2025-01-01T12:00:00Z');
      const mockActivities: Partial<Activity>[] = Array.from({ length: 6 }, (_, i) => ({
        id: `activity-${i + 6}`, // activity-6부터 시작
        babyId: mockBabyId,
        type: ActivityType.DIAPER,
        startTime: new Date(now.getTime() - (i + 5) * 60 * 60 * 1000),
        diaperType: 'pee',
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user-1',
      }));

      prismaMock.activity.findMany.mockResolvedValue(mockActivities as Activity[]);

      // When: cursor='activity-5'로 다음 페이지 조회
      const result = await getActivitiesPaginated(mockBabyId, 'activity-5', 5);

      // Then
      expect(result.success).toBe(true);
      expect(result.data?.activities).toHaveLength(5);
      expect(result.data?.hasMore).toBe(true);
      expect(result.data?.nextCursor).toBe('activity-10');
      expect(prismaMock.activity.findMany).toHaveBeenCalledWith({
        where: { babyId: mockBabyId },
        take: 6,
        cursor: { id: 'activity-5' },
        skip: 1,
        orderBy: { startTime: 'desc' },
      });
    });

    it('마지막 페이지에서는 hasMore가 false여야 한다', async () => {
      // Given: 마지막 3개의 활동
      const now = new Date('2025-01-01T12:00:00Z');
      const mockActivities: Partial<Activity>[] = Array.from({ length: 3 }, (_, i) => ({
        id: `activity-${i + 18}`, // 마지막 3개
        babyId: mockBabyId,
        type: ActivityType.BATH,
        startTime: new Date(now.getTime() - (i + 17) * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user-1',
      }));

      prismaMock.activity.findMany.mockResolvedValue(mockActivities as Activity[]);

      // When
      const result = await getActivitiesPaginated(mockBabyId, 'activity-17', 5);

      // Then
      expect(result.success).toBe(true);
      expect(result.data?.activities).toHaveLength(3);
      expect(result.data?.hasMore).toBe(false);
      expect(result.data?.nextCursor).toBeNull();
    });
  });

  describe('[검증] limit 파라미터 적용', () => {
    it('limit 파라미터가 정확히 적용되어야 한다', async () => {
      // Given: 많은 활동 기록
      const now = new Date('2025-01-01T12:00:00Z');
      const mockActivities: Partial<Activity>[] = Array.from({ length: 11 }, (_, i) => ({
        id: `activity-${i + 1}`,
        babyId: mockBabyId,
        type: ActivityType.FEEDING,
        startTime: new Date(now.getTime() - i * 60 * 60 * 1000),
        feedingAmount: 100 + i * 10,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user-1',
      }));

      prismaMock.activity.findMany.mockResolvedValue(mockActivities as Activity[]);

      // When: limit=10 설정
      const result = await getActivitiesPaginated(mockBabyId, undefined, 10);

      // Then
      expect(result.success).toBe(true);
      expect(result.data?.activities).toHaveLength(10); // 정확히 limit만큼
      expect(result.data?.hasMore).toBe(true);
      expect(prismaMock.activity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 11, // limit + 1
        })
      );
    });

    it('기본 limit 값(20)이 적용되어야 한다', async () => {
      // Given
      const mockActivities: Partial<Activity>[] = [];
      prismaMock.activity.findMany.mockResolvedValue(mockActivities as Activity[]);

      // When: limit 파라미터 생략
      await getActivitiesPaginated(mockBabyId);

      // Then
      expect(prismaMock.activity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 21, // 기본 limit(20) + 1
        })
      );
    });
  });

  describe('[검증] 일일 요약 계산 정확성', () => {
    it('같은 날짜의 활동들을 그룹핑하여 요약해야 한다', async () => {
      // Given: 2025-01-01과 2025-01-02의 활동들
      const mockActivities: Partial<Activity>[] = [
        {
          id: 'activity-1',
          babyId: mockBabyId,
          type: ActivityType.FEEDING,
          startTime: new Date('2025-01-01T10:00:00Z'),
          feedingAmount: 120,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'user-1',
        },
        {
          id: 'activity-2',
          babyId: mockBabyId,
          type: ActivityType.FEEDING,
          startTime: new Date('2025-01-01T13:00:00Z'),
          feedingAmount: 100,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'user-1',
        },
        {
          id: 'activity-3',
          babyId: mockBabyId,
          type: ActivityType.SLEEP,
          startTime: new Date('2025-01-01T14:00:00Z'),
          endTime: new Date('2025-01-01T16:00:00Z'),
          duration: 120,
          sleepType: 'nap',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'user-1',
        },
        {
          id: 'activity-4',
          babyId: mockBabyId,
          type: ActivityType.FEEDING,
          startTime: new Date('2025-01-02T10:00:00Z'),
          feedingAmount: 110,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'user-1',
        },
      ];

      prismaMock.activity.findMany.mockResolvedValue(mockActivities as Activity[]);

      // When
      const result = await getActivitiesPaginated(mockBabyId, undefined, 10);

      // Then
      expect(result.success).toBe(true);
      expect(result.data?.dailySummaries).toBeDefined();

      // 2025-01-01 요약
      expect(result.data?.dailySummaries['2025-01-01']).toBeDefined();
      expect(result.data?.dailySummaries['2025-01-01'][ActivityType.FEEDING]).toEqual({
        count: 2,
        totalAmount: 220, // 120 + 100
        totalDuration: 0,
      });
      expect(result.data?.dailySummaries['2025-01-01'][ActivityType.SLEEP]).toEqual({
        count: 1,
        totalAmount: 0,
        totalDuration: 120,
      });

      // 2025-01-02 요약
      expect(result.data?.dailySummaries['2025-01-02']).toBeDefined();
      expect(result.data?.dailySummaries['2025-01-02'][ActivityType.FEEDING]).toEqual({
        count: 1,
        totalAmount: 110,
        totalDuration: 0,
      });
    });

    it('feedingAmount가 없는 활동은 totalAmount에 포함하지 않아야 한다', async () => {
      // Given: feedingAmount가 없는 모유 수유
      const mockActivities: Partial<Activity>[] = [
        {
          id: 'activity-1',
          babyId: mockBabyId,
          type: ActivityType.FEEDING,
          startTime: new Date('2025-01-01T10:00:00Z'),
          feedingAmount: null, // 모유 수유
          feedingType: 'breast',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'user-1',
        },
        {
          id: 'activity-2',
          babyId: mockBabyId,
          type: ActivityType.FEEDING,
          startTime: new Date('2025-01-01T13:00:00Z'),
          feedingAmount: 120,
          feedingType: 'bottle',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'user-1',
        },
      ];

      prismaMock.activity.findMany.mockResolvedValue(mockActivities as Activity[]);

      // When
      const result = await getActivitiesPaginated(mockBabyId, undefined, 10);

      // Then
      expect(result.success).toBe(true);
      expect(result.data?.dailySummaries['2025-01-01'][ActivityType.FEEDING]).toEqual({
        count: 2,
        totalAmount: 120, // feedingAmount가 있는 것만 합산
        totalDuration: 0,
      });
    });

    it('duration이 없는 활동은 totalDuration에 포함하지 않아야 한다', async () => {
      // Given
      const mockActivities: Partial<Activity>[] = [
        {
          id: 'activity-1',
          babyId: mockBabyId,
          type: ActivityType.SLEEP,
          startTime: new Date('2025-01-01T10:00:00Z'),
          endTime: new Date('2025-01-01T12:00:00Z'),
          duration: 120,
          sleepType: 'nap',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'user-1',
        },
        {
          id: 'activity-2',
          babyId: mockBabyId,
          type: ActivityType.SLEEP,
          startTime: new Date('2025-01-01T14:00:00Z'),
          endTime: null, // 진행 중인 수면
          duration: null,
          sleepType: 'night',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'user-1',
        },
      ];

      prismaMock.activity.findMany.mockResolvedValue(mockActivities as Activity[]);

      // When
      const result = await getActivitiesPaginated(mockBabyId, undefined, 10);

      // Then
      expect(result.data?.dailySummaries['2025-01-01'][ActivityType.SLEEP]).toEqual({
        count: 2,
        totalAmount: 0,
        totalDuration: 120, // duration이 있는 것만 합산
      });
    });
  });

  describe('[경계값] Edge Cases', () => {
    it('활동이 없을 때 빈 배열과 빈 요약을 반환해야 한다', async () => {
      // Given: 활동이 전혀 없음
      prismaMock.activity.findMany.mockResolvedValue([]);

      // When
      const result = await getActivitiesPaginated(mockBabyId, undefined, 10);

      // Then
      expect(result.success).toBe(true);
      expect(result.data?.activities).toEqual([]);
      expect(result.data?.hasMore).toBe(false);
      expect(result.data?.nextCursor).toBeNull();
      expect(result.data?.dailySummaries).toEqual({});
    });

    it('limit이 1일 때도 정상 동작해야 한다', async () => {
      // Given
      const mockActivities: Partial<Activity>[] = [
        {
          id: 'activity-1',
          babyId: mockBabyId,
          type: ActivityType.BATH,
          startTime: new Date('2025-01-01T10:00:00Z'),
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'user-1',
        },
        {
          id: 'activity-2',
          babyId: mockBabyId,
          type: ActivityType.BATH,
          startTime: new Date('2025-01-01T09:00:00Z'),
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'user-1',
        },
      ];

      prismaMock.activity.findMany.mockResolvedValue(mockActivities as Activity[]);

      // When
      const result = await getActivitiesPaginated(mockBabyId, undefined, 1);

      // Then
      expect(result.success).toBe(true);
      expect(result.data?.activities).toHaveLength(1);
      expect(result.data?.hasMore).toBe(true);
      expect(result.data?.nextCursor).toBe('activity-1');
    });
  });

  describe('[검증] 정렬 순서', () => {
    it('startTime 내림차순으로 정렬되어야 한다', async () => {
      // Given
      const mockActivities: Partial<Activity>[] = [
        {
          id: 'activity-1',
          babyId: mockBabyId,
          type: ActivityType.FEEDING,
          startTime: new Date('2025-01-01T12:00:00Z'), // 최신
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'user-1',
        },
        {
          id: 'activity-2',
          babyId: mockBabyId,
          type: ActivityType.FEEDING,
          startTime: new Date('2025-01-01T09:00:00Z'),
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'user-1',
        },
        {
          id: 'activity-3',
          babyId: mockBabyId,
          type: ActivityType.FEEDING,
          startTime: new Date('2025-01-01T06:00:00Z'), // 가장 오래됨
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'user-1',
        },
      ];

      prismaMock.activity.findMany.mockResolvedValue(mockActivities as Activity[]);

      // When
      await getActivitiesPaginated(mockBabyId, undefined, 10);

      // Then
      expect(prismaMock.activity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { startTime: 'desc' },
        })
      );
    });
  });

  describe('[실패] 에러 처리', () => {
    it('데이터베이스 에러 발생 시 에러 메시지를 반환해야 한다', async () => {
      // Given
      prismaMock.activity.findMany.mockRejectedValue(new Error('Database connection failed'));

      // When
      const result = await getActivitiesPaginated(mockBabyId, undefined, 10);

      // Then
      expect(result.success).toBe(false);
      expect(result.error).toBe('활동 조회에 실패했습니다');
    });
  });
});
