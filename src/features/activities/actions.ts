// src/features/activities/actions.ts
"use server";

import { type CreateActivityInput } from "@/shared/types/schemas";
import { Activity } from "@prisma/client";
import { z } from "zod";
import { createActivityService } from "./services/createActivityService";
import { getRecentActivitiesService } from "./services/getRecentActivitiesService";
import { prisma } from "@/shared/lib/prisma";
import { redis } from '@/shared/lib/redis'; // Redis 임포트 추가
import { revalidatePath } from "next/cache";
import { getPredictedActivityPatternsService } from "./services/getPredictedActivityPatternsService";
import { type PredictedActivityPatterns } from "@/shared/types/schemas";
import { getActivitiesForDateService } from "./services/getActivitiesForDateService";

import { calculateDailySummaries } from "./lib/summary";

// Consolidated sample data service
import { 
  getSampleActivities, 
  getSamplePredictedPatterns 
} from "@/features/analytics/services/getSampleData";


import { PrismaActivityRepository } from "./repositories/PrismaActivityRepository";

const repository = new PrismaActivityRepository();

export async function createActivity(
  input: CreateActivityInput,
  userId: string // User ID passed from an authenticated context
): Promise<{ success: boolean; data?: Activity; error?: string }> {
  // Rate limiting 적용
  const { activityCreateRateLimit } = await import('@/shared/lib/ratelimit');
  if (activityCreateRateLimit) {
    const { success } = await activityCreateRateLimit.limit(userId);
    if (!success) {
      const { logger } = await import('@/shared/lib/logger');
      logger.warn('활동 기록 생성 rate limit 초과', { userId });
      return {
        success: false,
        error: "너무 많은 활동 기록을 생성하고 있습니다. 잠시 후 다시 시도해주세요."
      };
    }
  }

  // 중복 요청 방지 (같은 시간, 같은 타입, 같은 아기 = 중복)
  const { checkDuplicateRequest, generateRequestKey, clearIdempotencyKey } = await import('@/shared/lib/idempotency');
  const requestKey = generateRequestKey({
    babyId: input.babyId,
    type: input.type,
    startTime: input.startTime.toISOString(),
  });

  const isDuplicate = await checkDuplicateRequest(userId, requestKey, 60); // 1분 TTL
  if (isDuplicate) {
    const { logger } = await import('@/shared/lib/logger');
    logger.warn('중복 활동 기록 생성 시도', { userId, requestKey });
    return {
      success: false,
      error: "동일한 활동이 이미 기록되었습니다. 중복 등록을 방지했습니다."
    };
  }

  try {
    const activity = await createActivityService(repository, userId, input);

    if (activity.babyId) {
      revalidatePath(`/babies/${activity.babyId}`);
      revalidatePath("/");
      revalidatePath(`/analytics/${activity.babyId}`);
      // Redis 캐시 무효화 (getRecentActivitiesService와 동일한 키 사용)
      // Repository 내부에서 처리하므로 여기서는 제거 가능하지만, 명시적으로 남겨둘 수도 있음.
      // 하지만 Repository에서 invalidateCache를 호출하므로 중복 제거.
      revalidatePath('/', 'layout'); // 전체 레이아웃 재검증 추가
    }

    return { success: true, data: activity };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map((e) => e.message).join(", "),
      };
    }
    console.error("활동 기록 실패:", error);
    return { success: false, error: "활동 기록에 실패했습니다" };
  }
}

export async function getRecentActivities(
  babyId: string,
  days: number = 7
): Promise<{ success: boolean; data?: Activity[]; error?: string }> {
  if (babyId === 'guest-baby-id') {
    // For now, return today's sample activities. This can be expanded if needed.
    return { success: true, data: getSampleActivities(new Date()) }; 
  }

  try {
    const activities = await getRecentActivitiesService(repository, babyId, days);
    return { success: true, data: activities };
  } catch (error) {
    console.error("최근 활동 조회 실패:", error);
    return { success: false, error: "최근 활동 조회에 실패했습니다" };
  }
}

export async function deleteActivity(activityId: string, userId: string) {
  try {
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: { Baby: { include: { Family: true } } },
    });

    if (!activity) {
      return { success: false, error: "활동 기록을 찾을 수 없습니다." };
    }

    const isFamilyMember = await prisma.familyMember.findFirst({
      where: {
        familyId: activity.Baby.familyId,
        userId: userId,
      },
    });

    if (!isFamilyMember) {
      return { success: false, error: "이 활동을 삭제할 권한이 없습니다." };
    }

    await prisma.activity.delete({
      where: { id: activityId },
    });

    // Redis 캐시 무효화 (getRecentActivitiesService와 동일한 키 사용)
    await redis.del(`baby:${activity.babyId}:recent-activities:7-days`);

    revalidatePath(`/babies/${activity.babyId}`);
    revalidatePath("/");
    revalidatePath(`/analytics/${activity.babyId}`);

    return { success: true, message: "활동 기록이 삭제되었습니다." };
  } catch (error: any) {
    console.error("활동 삭제 실패:", error);
    return {
      success: false,
      error: error.message || "활동 기록 삭제에 실패했습니다.",
    };
  }
}

export async function getPredictedActivityPatterns(
  babyId: string
): Promise<{ success: boolean; data?: PredictedActivityPatterns; error?: string }> {
  if (babyId === 'guest-baby-id') {
    return { success: true, data: getSamplePredictedPatterns() };
  }

  try {
    const predictedPatterns = await getPredictedActivityPatternsService(babyId);
    return { success: true, data: predictedPatterns };
  } catch (error) {
    console.error("활동 패턴 예측 조회 실패:", error);
    return { success: false, error: "활동 패턴 예측 조회에 실패했습니다" };
  }
}

export async function getActivitiesForDate(
  babyId: string,
  dateString: string // ISO 8601 형식의 날짜 문자열 (YYYY-MM-DD)
): Promise<{ success: boolean; data?: Activity[]; error?: string }> {
  if (babyId === 'guest-baby-id') {
    const date = new Date(dateString);
    return { success: true, data: getSampleActivities(date) };
  }

  try {
    const activities = await getActivitiesForDateService(babyId, dateString);
    return { success: true, data: activities };
  } catch (error) {
    console.error(`활동 기록 조회 실패 (날짜: ${dateString}):`, error);
    return { success: false, error: "날짜별 활동 기록 조회에 실패했습니다" };
  }
}

export async function getActivitiesPaginated(
  babyId: string,
  cursor?: string,
  limit: number = 20
): Promise<{
  success: boolean;
  data?: {
    activities: Activity[];
    nextCursor: string | null;
    hasMore: boolean;
    dailySummaries: Record<string, any>;
  };
  error?: string;
}> {
  try {
    const activities = await prisma.activity.findMany({
      where: { babyId },
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { startTime: "desc" },
    });

    const hasMore = activities.length > limit;
    const paginatedActivities = hasMore ? activities.slice(0, limit) : activities;
    const nextCursor = hasMore ? paginatedActivities[paginatedActivities.length - 1].id : null;

    // 날짜별 요약 계산
        const dailySummaries = calculateDailySummaries(paginatedActivities);
    
        return {
          success: true,
          data: {
            activities: paginatedActivities,
            nextCursor,
            hasMore,
            dailySummaries,
          },
        };
      } catch (error) {
        console.error("페이지네이션 활동 조회 실패:", error);
        return { success: false, error: "활동 조회에 실패했습니다" };
      }
    }
    
    export async function getBabyQuickStats(babyId: string): Promise<{
      success: boolean;
      data?: {
        lastSleep: Activity | null;
        lastFeeding: Activity | null;
      };
      error?: string;
    }> {
      if (babyId === 'guest-baby-id') {
        const now = new Date();
        return {
          success: true,
          data: {
            lastSleep: {
              id: 'guest-sleep-1',
              babyId: 'guest-baby-id',
              userId: 'guest-user-id',
              type: 'SLEEP',
              startTime: new Date(now.getTime() - 3 * 60 * 60 * 1000),
              endTime: new Date(now.getTime() - 1 * 60 * 60 * 1000),
              note: '낮잠',
              reaction: null,
              createdAt: now,
              updatedAt: now,
              feedingType: null,
              feedingAmount: null,
              breastSide: null,
              sleepType: 'nap',
              duration: 120,
              diaperType: null,
              stoolColor: null,
              stoolCondition: null,
              bathType: null,
              bathTemp: null,
              playType: null,
              playLocation: null,
              playDuration: null,
              medicineName: null,
              medicineAmount: null,
              medicineUnit: null,
              temperature: null,
            },
            lastFeeding: {
              id: 'guest-feed-1',
              babyId: 'guest-baby-id',
              userId: 'guest-user-id',
              type: 'FEEDING',
              startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000),
              endTime: null,
              note: '분유 150ml',
              reaction: 'good',
              createdAt: now,
              updatedAt: now,
              feedingType: 'formula',
              feedingAmount: 150,
              breastSide: null,
              sleepType: null,
              duration: null,
              diaperType: null,
              stoolColor: null,
              stoolCondition: null,
              bathType: null,
              bathTemp: null,
              playType: null,
              playLocation: null,
              playDuration: null,
              medicineName: null,
              medicineAmount: null,
              medicineUnit: null,
              temperature: null,
            },
          },
        };
      }
    
      try {
        const [lastSleep, lastFeeding] = await prisma.$transaction([
          prisma.activity.findFirst({
            where: { babyId, type: 'SLEEP' },
            orderBy: { startTime: 'desc' },
          }),
          prisma.activity.findFirst({
            where: { babyId, type: 'FEEDING' },
            orderBy: { startTime: 'desc' },
          }),
        ]);
    
        return { success: true, data: { lastSleep, lastFeeding } };
      } catch (error) {
        console.error("아기 빠른 통계 조회 실패:", error);
        return { success: false, error: "아기 상태 요약 조회에 실패했습니다." };
      }
    }    