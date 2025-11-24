// src/features/analytics/actions.ts
'use server';

import { prisma } from '@/shared/lib/prisma';
import { 
  getSampleDailyStats, 
  getSample24HourPattern, 
  getSampleWeeklyStats,
  getSampleActivities 
} from './services/getSampleData';

export async function getDailyStats(babyId: string, date: Date) {
  if (babyId === 'guest-baby-id') {
    return { success: true, data: getSampleDailyStats() };
  }

  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const [feedingStats, sleepActivities, diaperGroups] = await Promise.all([
      prisma.activity.aggregate({
        where: {
          babyId,
          type: 'FEEDING',
          createdAt: { gte: startOfDay, lte: endOfDay }
        },
        _sum: { feedingAmount: true },
        _count: true
      }),
      
      prisma.activity.findMany({
        where: {
          babyId,
          type: 'SLEEP',
          startTime: { lte: endOfDay },
          endTime: { gte: startOfDay, not: null },
        },
      }),
      
      prisma.activity.groupBy({
        by: ['diaperType'],
        where: {
          babyId,
          type: 'DIAPER',
          createdAt: { gte: startOfDay, lte: endOfDay }
        },
        _count: { _all: true }
      })
    ]);

    const totalSleepDuration = sleepActivities.reduce((acc, activity) => {
        if (activity.endTime) {
            const duration = activity.endTime.getTime() - activity.startTime.getTime();
            return acc + duration;
        }
        return acc;
    }, 0);
    
    const totalSleepHours = totalSleepDuration / (1000 * 60 * 60);

    const diaperCounts = diaperGroups.reduce((acc, group) => {
        if (group.diaperType) {
            acc[group.diaperType] = group._count._all;
        }
        return acc;
    }, {} as Record<string, number>);
    
    return {
      success: true,
      data: {
        feeding: {
          count: feedingStats._count,
          totalAmount: feedingStats._sum.feedingAmount || 0,
          avgAmount: feedingStats._count > 0 
            ? Math.round((feedingStats._sum.feedingAmount || 0) / feedingStats._count)
            : 0
        },
        sleep: {
          count: sleepActivities.length,
          totalHours: Math.round(totalSleepHours * 10) / 10
        },
        diaper: {
            urine: (diaperCounts.WET || 0) + (diaperCounts.BOTH || 0),
            stool: (diaperCounts.DIRTY || 0) + (diaperCounts.BOTH || 0),
        }
      }
    };
    
  } catch (error) {
    console.error('일간 통계 조회 실패:', error);
    return { success: false, error: '통계 조회에 실패했습니다' };
  }
}

export async function get24HourPattern(babyId: string) {
  if (babyId === 'guest-baby-id') {
    return { success: true, data: getSample24HourPattern() };
  }

  try {
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);
    
    const activities = await prisma.activity.findMany({
      where: {
        babyId,
        createdAt: { gte: oneDayAgo }
      },
      orderBy: { createdAt: 'asc' }
    });
    
    const hourlyData = Array.from({ length: 24 }, (_, i) => {
        const hour = (new Date().getHours() - (23 - i) + 24) % 24;
        return {
          hour: `${hour}:00`,
          FEEDING: 0,
          SLEEP: 0,
          DIAPER: 0
        }
    });
    
    activities.forEach(activity => {
      const hour = new Date(activity.createdAt).getHours();
      const hourEntry = hourlyData.find(h => h.hour === `${hour}:00`);
      if (hourEntry) {
          if (activity.type === 'FEEDING') hourEntry.FEEDING++;
          if (activity.type === 'SLEEP') hourEntry.SLEEP++;
          if (activity.type === 'DIAPER') hourEntry.DIAPER++;
      }
    });
    
    return { success: true, data: hourlyData };
    
  } catch (error) {
    console.error('24시간 패턴 조회 실패:', error);
    return { success: false, error: '패턴 조회에 실패했습니다' };
  }
}

export async function getWeeklyStats(babyId: string) {
  if (babyId === 'guest-baby-id') {
    return { success: true, data: getSampleWeeklyStats() };
  }

  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // To include today
    sevenDaysAgo.setHours(0, 0, 0, 0);
    
    const activities = await prisma.activity.findMany({
      where: {
        babyId,
        createdAt: { gte: sevenDaysAgo }
      },
      orderBy: { createdAt: 'asc' }
    });
    
    const dailyStats = new Map<string, any>();

    for (let i = 0; i < 7; i++) {
        const date = new Date(sevenDaysAgo);
        date.setDate(date.getDate() + i);
        const dateKey = date.toISOString().split('T')[0];
        dailyStats.set(dateKey, {
            date: dateKey,
            totalFeeding: 0,
            totalSleep: 0,
        });
    }
    
    activities.forEach(activity => {
      const dateKey = activity.createdAt.toISOString().split('T')[0];
      const stats = dailyStats.get(dateKey);

      if (stats) {
        if (activity.type === 'FEEDING' && activity.feedingAmount) {
          stats.totalFeeding += activity.feedingAmount;
        }
        if (activity.type === 'SLEEP' && activity.startTime && activity.endTime) {
          const duration = activity.endTime.getTime() - activity.startTime.getTime();
          stats.totalSleep += duration / (1000 * 60 * 60);
        }
      }
    });
    
    const result = Array.from(dailyStats.values()).map(stat => ({
        ...stat,
        totalSleep: parseFloat(stat.totalSleep.toFixed(1))
    }));

    return {
      success: true,
      data: result
    };
    
  } catch (error) {
    console.error('주간 통계 조회 실패:', error);
    return { success: false, error: '통계 조회에 실패했습니다' };
  }
}


export async function getActivitiesByDateRange(babyId: string, startDate: Date, endDate: Date) {
  if (babyId === 'guest-baby-id') {
    // Generate sample data for the date range
    const activities = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      activities.push(...getSampleActivities(new Date(currentDate)));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Filter to only include activities within the range
    const filtered = activities.filter(a => {
      const activityDate = new Date(a.startTime);
      return activityDate >= startDate && activityDate <= endDate;
    });
    
    return { success: true, data: filtered };
  }

  try {
    const activities = await prisma.activity.findMany({
      where: {
        babyId,
        startTime: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { startTime: 'asc' }
    });

    return { success: true, data: activities };
  } catch (error) {
    console.error('활동 내역 조회 실패:', error);
    return { success: false, error: '활동 내역 조회에 실패했습니다' };
  }
}
