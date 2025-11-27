import { getActivitiesByDateRange } from '../actions';
import { prisma } from '@/shared/lib/prisma'; // Assuming this is how prisma client is imported
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { Activity } from '@prisma/client';

// Mock the entire @prisma/client module
jest.mock('@/shared/lib/prisma', () => ({
  __esModule: true,
  prisma: mockDeep<any>(), // Mock the default export (prisma client)
}));

const mockPrisma = prisma as unknown as DeepMockProxy<any>;

describe('getActivitiesByDateRange', () => {
  beforeEach(() => {
    mockPrisma.activity.findMany.mockClear();
  });

  it('should return activities within the specified date range, ordered by startTime', async () => {
    const babyId = 'test-baby-id';
    const startDate = new Date('2023-01-01T00:00:00Z');
    const endDate = new Date('2023-01-03T23:59:59Z');

    const mockActivities: Activity[] = [
      { id: '1', babyId, startTime: new Date('2023-01-01T10:00:00Z'), endTime: new Date('2023-01-01T11:00:00Z'), type: 'SLEEP', createdAt: new Date(), updatedAt: new Date(),
        feedingType: null, feedingAmount: null, duration: null, breastSide: null,
        diaperType: null, stoolCondition: null, medicineName: null, medicineAmount: null, medicineUnit: null,
        temperature: null, bathType: null, bathTemp: null, reaction: null, playLocation: null, playType: null, note: null, userId: null
      },
      { id: '2', babyId, startTime: new Date('2023-01-02T08:00:00Z'), endTime: new Date('2023-01-02T08:30:00Z'), type: 'FEEDING', createdAt: new Date(), updatedAt: new Date(),
        feedingType: 'formula', feedingAmount: 100, duration: null, breastSide: null,
        diaperType: null, stoolCondition: null, medicineName: null, medicineAmount: null, medicineUnit: null,
        temperature: null, bathType: null, bathTemp: null, reaction: null, playLocation: null, playType: null, note: null, userId: null
      },
      { id: '3', babyId, startTime: new Date('2023-01-03T14:00:00Z'), endTime: new Date('2023-01-03T14:30:00Z'), type: 'DIAPER', createdAt: new Date(), updatedAt: new Date(),
        feedingType: null, feedingAmount: null, duration: null, breastSide: null,
        diaperType: 'poo', stoolCondition: 'SOFT', medicineName: null, medicineAmount: null, medicineUnit: null,
        temperature: null, bathType: null, bathTemp: null, reaction: null, playLocation: null, playType: null, note: null, userId: null
      },
      // Activity outside the range
      { id: '4', babyId, startTime: new Date('2023-01-04T09:00:00Z'), endTime: new Date('2023-01-04T10:00:00Z'), type: 'SLEEP', createdAt: new Date(), updatedAt: new Date(),
        feedingType: null, feedingAmount: null, duration: null, breastSide: null,
        diaperType: null, stoolCondition: null, medicineName: null, medicineAmount: null, medicineUnit: null,
        temperature: null, bathType: null, bathTemp: null, reaction: null, playLocation: null, playType: null, note: null, userId: null
      },
      // Activity before the range
      { id: '5', babyId, startTime: new Date('2022-12-31T22:00:00Z'), endTime: new Date('2022-12-31T23:00:00Z'), type: 'SLEEP', createdAt: new Date(), updatedAt: new Date(),
        feedingType: null, feedingAmount: null, duration: null, breastSide: null,
        diaperType: null, stoolCondition: null, medicineName: null, medicineAmount: null, medicineUnit: null,
        temperature: null, bathType: null, bathTemp: null, reaction: null, playLocation: null, playType: null, note: null, userId: null
      },
    ];

    mockPrisma.activity.findMany.mockResolvedValue(mockActivities.filter(a => a.startTime >= startDate && a.startTime <= endDate));

    const result = await getActivitiesByDateRange(babyId, startDate, endDate);

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(3);
    expect(result.data?.[0].id).toBe('1');
    expect(result.data?.[1].id).toBe('2');
    expect(result.data?.[2].id).toBe('3');
    expect(mockPrisma.activity.findMany).toHaveBeenCalledWith({
      where: {
        babyId,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { startTime: 'asc' },
    });
  });

  it('should return an empty array if no activities are found', async () => {
    const babyId = 'test-baby-id';
    const startDate = new Date('2023-01-01T00:00:00Z');
    const endDate = new Date('2023-01-03T23:59:59Z');

    mockPrisma.activity.findMany.mockResolvedValue([]);

    const result = await getActivitiesByDateRange(babyId, startDate, endDate);

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(0);
  });

  it('should return success: false and an error message on Prisma error', async () => {
    const babyId = 'test-baby-id';
    const startDate = new Date('2023-01-01T00:00:00Z');
    const endDate = new Date('2023-01-03T23:59:59Z');

    const errorMessage = 'Database connection failed';
    mockPrisma.activity.findMany.mockRejectedValue(new Error(errorMessage));

    const result = await getActivitiesByDateRange(babyId, startDate, endDate);

    expect(result.success).toBe(false);
    expect(result.error).toBe('활동 내역 조회에 실패했습니다'); // The action catches and re-throws a generic error message
  });

  // Test for guest-baby-id (sample data)
  it('should return sample data for guest-baby-id', async () => {
    const babyId = 'guest-baby-id';
    const startDate = new Date('2023-01-01T00:00:00Z');
    const endDate = new Date('2023-01-03T23:59:59Z');

    const result = await getActivitiesByDateRange(babyId, startDate, endDate);
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    // Since getSampleActivities generates random data, we can't assert exact values
    // but can check the structure and a reasonable number of activities.
    expect(result.data?.length).toBeGreaterThan(0); 
    expect(result.data?.[0]).toHaveProperty('id');
    expect(result.data?.[0]).toHaveProperty('babyId');
    expect(result.data?.[0]).toHaveProperty('startTime');
    expect(mockPrisma.activity.findMany).not.toHaveBeenCalled(); // Ensure Prisma is not called for guest mode
  });
});
