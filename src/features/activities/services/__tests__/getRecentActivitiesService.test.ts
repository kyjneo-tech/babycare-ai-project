// src/features/activities/services/__tests__/getRecentActivitiesService.test.ts
import { getRecentActivitiesService } from '../getRecentActivitiesService';
import { IActivityRepository } from '../../repositories/IActivityRepository';
import { Activity } from '@prisma/client';

describe('최근 활동 조회 서비스 (getRecentActivitiesService)', () => {
  const mockBabyId = 'baby-123';
  const mockActivities: Activity[] = [
    {
      id: 'activity-1',
      babyId: mockBabyId,
      userId: 'user-1',
      type: 'FEEDING',
      startTime: new Date('2024-01-15T10:00:00'),
      endTime: null,
      createdAt: new Date('2024-01-15T10:00:00'),
      updatedAt: new Date('2024-01-15T10:00:00'),
      feedingAmount: 100,
      feedingType: 'BOTTLE',
      breastSide: null,
      sleepType: null,
      duration: null,
      diaperType: null,
      stoolColor: null,
      stoolCondition: null,
      medicineName: null,
      medicineAmount: null,
      medicineUnit: null,
      temperature: null,
      note: null,
      reaction: null,
      bathType: null,
      bathTemp: null,
      playType: null,
      playLocation: null,
      playDuration: null,
    },
    {
      id: 'activity-2',
      babyId: mockBabyId,
      userId: 'user-1',
      type: 'SLEEP',
      startTime: new Date('2024-01-15T13:00:00'),
      endTime: new Date('2024-01-15T15:00:00'),
      createdAt: new Date('2024-01-15T15:00:00'),
      updatedAt: new Date('2024-01-15T15:00:00'),
      feedingAmount: null,
      feedingType: null,
      breastSide: null,
      sleepType: 'nap',
      duration: 120,
      diaperType: null,
      stoolColor: null,
      stoolCondition: null,
      medicineName: null,
      medicineAmount: null,
      medicineUnit: null,
      temperature: null,
      note: null,
      reaction: null,
      bathType: null,
      bathTemp: null,
      playType: null,
      playLocation: null,
      playDuration: null,
    },
  ];

  const mockRepository: jest.Mocked<IActivityRepository> = {
    create: jest.fn(),
    findRecent: jest.fn(),
    findByDateRange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('리포지토리의 findRecent 메서드를 호출해야 한다', async () => {
    // Given
    mockRepository.findRecent.mockResolvedValue(mockActivities);

    // When
    const result = await getRecentActivitiesService(mockRepository, mockBabyId, 7);

    // Then
    expect(result).toEqual(mockActivities);
    expect(mockRepository.findRecent).toHaveBeenCalledWith(mockBabyId, 7);
  });

  it('일수가 제공되지 않으면 기본값 7일을 사용해야 한다', async () => {
    // Given
    mockRepository.findRecent.mockResolvedValue(mockActivities);

    // When
    await getRecentActivitiesService(mockRepository, mockBabyId);

    // Then
    expect(mockRepository.findRecent).toHaveBeenCalledWith(mockBabyId, 7);
  });
});
