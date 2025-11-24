import { createActivityService } from '../services/createActivityService';
import { prismaMock } from '../../../../jest.setup';
import { Activity, ActivityType } from '@prisma/client';
import { z } from 'zod';

describe('활동 기록 서비스 (createActivityService)', () => {
  const mockUserId = 'test-user-id';
  const mockBabyId = 'test-baby-id';

  beforeEach(() => {
    prismaMock.activity.create.mockReset();
  });

  it('[성공] 수유 기록을 생성해야 한다', async () => {
    // Given
    const feedingInput = {
      babyId: mockBabyId,
      type: ActivityType.FEEDING,
      startTime: new Date('2024-01-15T10:00:00Z'),
      feedingType: 'breast',
      feedingAmount: 120,
      breastSide: 'left',
    };
    const mockActivity: Activity = {
      id: 'activity-id-1',
      userId: mockUserId,
      ...feedingInput,
      endTime: null,
      note: null,
      sleepType: null,
      duration: null,
      diaperType: null,
      stoolColor: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    prismaMock.activity.create.mockResolvedValue(mockActivity);

    // When
    const result = await createActivityService(mockUserId, feedingInput);

    // Then
    expect(result.id).toBe('activity-id-1');
    expect(result.type).toBe(ActivityType.FEEDING);
    expect(result.feedingAmount).toBe(120);
    expect(prismaMock.activity.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: mockUserId,
        ...feedingInput,
      }),
    });
  });

  it('[성공] 수면 기록 생성 시 duration을 자동 계산해야 한다', async () => {
    // Given
    const sleepInput = {
      babyId: mockBabyId,
      type: ActivityType.SLEEP,
      startTime: new Date('2024-01-15T14:00:00Z'),
      endTime: new Date('2024-01-15T16:30:00Z'), // 2시간 30분 = 150분
      sleepType: 'nap',
    };
    const mockActivity: Activity = {
      id: 'activity-id-2',
      userId: mockUserId,
      ...sleepInput,
      duration: 150, // 계산된 duration
      feedingType: null,
      feedingAmount: null,
      breastSide: null,
      note: null,
      diaperType: null,
      stoolColor: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    prismaMock.activity.create.mockResolvedValue(mockActivity);

    // When
    const result = await createActivityService(mockUserId, sleepInput);

    // Then
    expect(result.id).toBe('activity-id-2');
    expect(result.type).toBe(ActivityType.SLEEP);
    expect(result.duration).toBe(150);
    expect(prismaMock.activity.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: mockUserId,
        ...sleepInput,
        duration: 150, // 서비스에서 계산된 duration
      }),
    });
  });
  it('[실패] 필수 필드 누락 시 에러를 발생시켜야 한다 (수유량 누락)', async () => {
    // Given
    const invalidFeedingInput = {
      babyId: mockBabyId,
      type: ActivityType.FEEDING,
      startTime: new Date('2024-01-15T10:00:00Z'),
      feedingType: 'breast',
      // feedingAmount 누락
    };

    // When & Then
    try {
      await createActivityService(mockUserId, invalidFeedingInput);
      // 서비스 호출이 성공하면 테스트 실패
      // expect(true).toBe(false); // fail('ZodError가 발생해야 합니다.');
    } catch (error) {
      // ZodError의 'issues' 속성을 직접 확인하여 ZodError임을 검증
      const zodError = error as z.ZodError;
      expect(zodError.issues).toBeDefined();
      expect(Array.isArray(zodError.issues)).toBe(true);
      expect(zodError.issues.length).toBeGreaterThan(0); // 최소 하나의 이슈가 있어야 함
      const feedingAmountError = zodError.issues.find(e => e.path.includes('feedingAmount'));
      expect(feedingAmountError).toBeDefined();
      expect(feedingAmountError?.message).toBe('수유량은 필수입니다.');
    }
    expect(prismaMock.activity.create).not.toHaveBeenCalled();
  });
});
