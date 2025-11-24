// src/features/activities/services/getActivitiesForDateService.ts
import { prisma } from '@/shared/lib/prisma';
import { Activity } from '@prisma/client';

export async function getActivitiesForDateService(babyId: string, dateString: string): Promise<Activity[]> {
  try {
    const startOfDay = new Date(dateString);
    startOfDay.setHours(0, 0, 0, 0); // 날짜의 시작 시간 (00:00:00.000)

    const endOfDay = new Date(dateString);
    endOfDay.setHours(23, 59, 59, 999); // 날짜의 끝 시간 (23:59:59.999)
    
    const activities = await prisma.activity.findMany({
      where: {
        babyId,
        createdAt: {
          gte: startOfDay, // 시작 시간 >= dateString의 00:00:00
          lte: endOfDay,   // 종료 시간 <= dateString의 23:59:59
        },
      },
      orderBy: { createdAt: 'asc' }, // 시간 순으로 정렬
      include: {
        User: {
          select: { name: true }
        }
      }
    });

    return activities;
  } catch (error) {
    console.error('Error in getActivitiesForDateService:', error);
    throw error;
  }
}