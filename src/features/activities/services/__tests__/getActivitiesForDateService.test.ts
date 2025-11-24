// src/features/activities/services/__tests__/getActivitiesForDateService.test.ts
import { getActivitiesForDateService } from '../getActivitiesForDateService';
import { prismaMock } from '../../../../jest.setup';
import { Activity } from '@prisma/client';

describe('날짜별 활동 조회 서비스 (getActivitiesForDateService)', () => {
  const mockBabyId = 'baby-123';
  const mockActivities: Activity[] = [
    {
      id: 'activity-1',
      babyId: mockBabyId,
      userId: 'user-1',
      type: 'FEEDING',
      createdAt: new Date('2024-01-15T10:00:00'),
      updatedAt: new Date('2024-01-15T10:00:00'),
      feedingAmount: 100,
      feedingUnit: 'ml',
      feedingType: 'BOTTLE',
      feedingSide: null,
      sleepStartTime: null,
      sleepEndTime: null,
      diaperType: null,
      diaperRash: null,
      medicineType: null,
      medicineDosage: null,
      notes: null,
    },
    {
      id: 'activity-2',
      babyId: mockBabyId,
      userId: 'user-1',
      type: 'SLEEP',
      createdAt: new Date('2024-01-15T15:00:00'),
      updatedAt: new Date('2024-01-15T15:00:00'),
      feedingAmount: null,
      feedingUnit: null,
      feedingType: null,
      feedingSide: null,
      sleepStartTime: new Date('2024-01-15T13:00:00'),
      sleepEndTime: new Date('2024-01-15T15:00:00'),
      diaperType: null,
      diaperRash: null,
      medicineType: null,
      medicineDosage: null,
      notes: null,
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('[성공] 유효한 날짜로 활동 조회', async () => {
    // Given
    const testDate = '2024-01-15';
    prismaMock.activity.findMany.mockResolvedValue(mockActivities as any);

    // When
    const result = await getActivitiesForDateService(mockBabyId, testDate);

    // Then
    expect(result).toEqual(mockActivities);
    expect(prismaMock.activity.findMany).toHaveBeenCalled();
  });

  it('[검증] 시간 범위 확인 (00:00:00.000 ~ 23:59:59.999)', async () => {
    // Given
    const testDate = '2024-01-15';
    prismaMock.activity.findMany.mockResolvedValue([]);

    // When
    await getActivitiesForDateService(mockBabyId, testDate);

    // Then
    const callArgs = prismaMock.activity.findMany.mock.calls[0][0];
    const startTime = callArgs.where.createdAt.gte;
    const endTime = callArgs.where.createdAt.lte;

    // startOfDay는 00:00:00.000
    expect(startTime.getHours()).toBe(0);
    expect(startTime.getMinutes()).toBe(0);
    expect(startTime.getSeconds()).toBe(0);
    expect(startTime.getMilliseconds()).toBe(0);

    // endOfDay는 23:59:59.999
    expect(endTime.getHours()).toBe(23);
    expect(endTime.getMinutes()).toBe(59);
    expect(endTime.getSeconds()).toBe(59);
    expect(endTime.getMilliseconds()).toBe(999);
  });

  it('[검증] 올바른 날짜 파싱 (ISO 형식 문자열)', async () => {
    // Given
    const testDate = '2024-01-15';
    prismaMock.activity.findMany.mockResolvedValue([]);

    // When
    await getActivitiesForDateService(mockBabyId, testDate);

    // Then
    const callArgs = prismaMock.activity.findMany.mock.calls[0][0];
    const startTime = callArgs.where.createdAt.gte;
    const endTime = callArgs.where.createdAt.lte;

    expect(startTime.getFullYear()).toBe(2024);
    expect(startTime.getMonth()).toBe(0); // 0-indexed (January)
    expect(startTime.getDate()).toBe(15);

    expect(endTime.getFullYear()).toBe(2024);
    expect(endTime.getMonth()).toBe(0);
    expect(endTime.getDate()).toBe(15);
  });

  it('[경계값] 활동이 없을 경우 빈 배열', async () => {
    // Given
    const testDate = '2024-01-15';
    prismaMock.activity.findMany.mockResolvedValue([]);

    // When
    const result = await getActivitiesForDateService(mockBabyId, testDate);

    // Then
    expect(result).toEqual([]);
  });

  it('[검증] 시간대가 포함된 날짜 문자열 처리', async () => {
    // Given
    const testDate = '2024-01-15T23:45:00';
    prismaMock.activity.findMany.mockResolvedValue([]);

    // When
    await getActivitiesForDateService(mockBabyId, testDate);

    // Then
    const callArgs = prismaMock.activity.findMany.mock.calls[0][0];
    const startTime = callArgs.where.createdAt.gte;
    const endTime = callArgs.where.createdAt.lte;

    // 시간 정보와 관계없이 해당 날짜의 시작과 끝으로 설정되어야 함
    expect(startTime.getHours()).toBe(0);
    expect(startTime.getMinutes()).toBe(0);
    expect(startTime.getSeconds()).toBe(0);

    expect(endTime.getHours()).toBe(23);
    expect(endTime.getMinutes()).toBe(59);
    expect(endTime.getSeconds()).toBe(59);
  });

  it('[검증] DB 쿼리에 User 정보 포함 및 오름차순 정렬', async () => {
    // Given
    const testDate = '2024-01-15';
    prismaMock.activity.findMany.mockResolvedValue([]);

    // When
    await getActivitiesForDateService(mockBabyId, testDate);

    // Then
    const callArgs = prismaMock.activity.findMany.mock.calls[0][0];
    expect(callArgs.include).toEqual({
      User: {
        select: { name: true }
      }
    });
    expect(callArgs.orderBy).toEqual({ createdAt: 'asc' });
  });

  it('[검증] babyId 필터링 확인', async () => {
    // Given
    const testDate = '2024-01-15';
    prismaMock.activity.findMany.mockResolvedValue([]);

    // When
    await getActivitiesForDateService(mockBabyId, testDate);

    // Then
    const callArgs = prismaMock.activity.findMany.mock.calls[0][0];
    expect(callArgs.where.babyId).toBe(mockBabyId);
  });

  it('[실패] DB 쿼리 에러 처리', async () => {
    // Given
    const testDate = '2024-01-15';
    const dbError = new Error('Database connection error');
    prismaMock.activity.findMany.mockRejectedValue(dbError);

    // When & Then
    await expect(getActivitiesForDateService(mockBabyId, testDate)).rejects.toThrow('Database connection error');
  });

  it('[검증] 월말 날짜 처리 (2월 28일)', async () => {
    // Given
    const testDate = '2024-02-28';
    prismaMock.activity.findMany.mockResolvedValue([]);

    // When
    await getActivitiesForDateService(mockBabyId, testDate);

    // Then
    const callArgs = prismaMock.activity.findMany.mock.calls[0][0];
    const startTime = callArgs.where.createdAt.gte;
    const endTime = callArgs.where.createdAt.lte;

    expect(startTime.getDate()).toBe(28);
    expect(startTime.getMonth()).toBe(1); // February (0-indexed)
    expect(endTime.getDate()).toBe(28);
    expect(endTime.getMonth()).toBe(1);

    // 시작과 끝 시간 검증
    expect(startTime.getHours()).toBe(0);
    expect(endTime.getHours()).toBe(23);
  });

  it('[검증] 윤년 처리 (2월 29일)', async () => {
    // Given
    const testDate = '2024-02-29'; // 2024년은 윤년
    prismaMock.activity.findMany.mockResolvedValue([]);

    // When
    await getActivitiesForDateService(mockBabyId, testDate);

    // Then
    const callArgs = prismaMock.activity.findMany.mock.calls[0][0];
    const startTime = callArgs.where.createdAt.gte;
    const endTime = callArgs.where.createdAt.lte;

    expect(startTime.getDate()).toBe(29);
    expect(startTime.getMonth()).toBe(1);
    expect(endTime.getDate()).toBe(29);
    expect(endTime.getMonth()).toBe(1);
  });
});
