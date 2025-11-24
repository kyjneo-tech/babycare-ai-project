import { prisma } from '@/shared/lib/prisma';
import { redis } from '@/shared/lib/redis';
import { IActivityRepository } from './IActivityRepository';
import { Activity, Prisma } from '@prisma/client';

export class PrismaActivityRepository implements IActivityRepository {
  async create(data: Prisma.ActivityCreateInput): Promise<Activity> {
    const activity = await prisma.activity.create({
      data,
    });
    
    // Invalidate cache
    const babyId = data.Baby.connect?.id;
    if (babyId) {
      await this.invalidateCache(babyId);
    }

    return activity;
  }

  async findRecent(babyId: string, days: number): Promise<Activity[]> {
    const cacheKey = `baby:${babyId}:recent-activities:${days}-days`;
    const cachedActivities = await redis.get(cacheKey);

    if (cachedActivities) {
      if (typeof cachedActivities === 'string') {
        try {
          const parsed = JSON.parse(cachedActivities);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          console.error('Error parsing cached activities:', e);
        }
      } else if (Array.isArray(cachedActivities)) {
        return cachedActivities as Activity[];
      }
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activities = await prisma.activity.findMany({
      where: {
        babyId,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        User: {
          select: { name: true },
        },
      },
      take: 100,
    });

    await redis.setex(cacheKey, 300, JSON.stringify(activities));

    return activities;
  }

  async findByDateRange(babyId: string, start: Date, end: Date): Promise<Activity[]> {
    return prisma.activity.findMany({
      where: {
        babyId,
        startTime: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  private async invalidateCache(babyId: string) {
    const keys = await redis.keys(`baby:${babyId}:recent-activities:*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}
