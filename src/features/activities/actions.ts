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
  input: CreateActivityInput
): Promise<{ success: boolean; data?: Activity; error?: string }> {
  // 🔒 보안: 세션에서 userId 가져오기
  const { getServerSession } = await import('next-auth');
  const { authOptions } = await import('@/app/api/auth/[...nextauth]/route');
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { success: false, error: "로그인이 필요합니다." };
  }
  const userId = session.user.id;

  // 🔒 보안: 아기가 사용자의 가족에 속하는지 검증
  const baby = await prisma.baby.findFirst({
    where: {
      id: input.babyId,
      Family: {
        FamilyMembers: {
          some: {
            userId: userId,
          },
        },
      },
    },
  });

  if (!baby) {
    return {
      success: false,
      error: "해당 아기에 대한 활동을 기록할 권한이 없습니다."
    };
  }

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

  // 🔒 보안: 세션 검증
  const { getServerSession } = await import('next-auth');
  const { authOptions } = await import('@/app/api/auth/[...nextauth]/route');
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  // 🔒 보안: 아기가 사용자의 가족에 속하는지 검증
  const baby = await prisma.baby.findFirst({
    where: {
      id: babyId,
      Family: {
        FamilyMembers: {
          some: {
            userId: session.user.id,
          },
        },
      },
    },
  });

  if (!baby) {
    return {
      success: false,
      error: "해당 아기의 활동을 조회할 권한이 없습니다."
    };
  }

  try {
    const activities = await getRecentActivitiesService(repository, babyId, days);
    return { success: true, data: activities };
  } catch (error) {
    console.error("최근 활동 조회 실패:", error);
    return { success: false, error: "최근 활동 조회에 실패했습니다" };
  }
}

export async function updateActivity(
  activityId: string,
  data: Partial<CreateActivityInput>
): Promise<{ success: boolean; data?: Activity; error?: string }> {
  // 🔒 보안: 세션에서 userId 가져오기
  const { getServerSession } = await import('next-auth');
  const { authOptions } = await import('@/app/api/auth/[...nextauth]/route');
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { success: false, error: "로그인이 필요합니다." };
  }
  const userId = session.user.id;

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
      return { success: false, error: "이 활동을 수정할 권한이 없습니다." };
    }

    // 분할 레코드 처리
    const { needsSplit, splitActivityByMidnight, calculateDuration, determineSleepType } = await import('./lib/sleepSplitUtils');
    
    // 기존 분할 레코드 삭제 (원본인 경우)
    if (activity.isSplit && !activity.originalActivityId) {
      await prisma.activity.deleteMany({
        where: { originalActivityId: activityId },
      });
    }

    // 새로운 시간 정보
    const newStartTime = data.startTime || activity.startTime;
    const newEndTime = data.endTime !== undefined ? data.endTime : activity.endTime;
    const newType = data.type || activity.type;

    // 분할이 필요한지 체크
    const shouldSplit = newEndTime && needsSplit(newStartTime, newEndTime, newType);

    if (shouldSplit && newEndTime) {
      // 1. 원본 레코드 업데이트
      const duration = calculateDuration(newStartTime, newEndTime);
      const sleepType = newType === 'SLEEP' 
        ? (data.sleepType || determineSleepType(newStartTime, newEndTime))
        : null;

      // note를 memo로 변환
      const { note, ...restData } = data;
      const prismaData = {
        ...restData,
        ...(note !== undefined && { memo: note }),
        startTime: newStartTime,
        endTime: newEndTime,
        duration: newType === 'SLEEP' ? duration : data.duration,
        sleepType,
        isSplit: true,
        splitSequence: null,
        updatedAt: new Date(),
      };

      const updatedActivity = await prisma.activity.update({
        where: { id: activityId },
        data: prismaData,
      });

      // 2. 새로운 분할 레코드 생성
      const splits = splitActivityByMidnight(newStartTime, newEndTime, newType);
      
      for (const split of splits) {
        await prisma.activity.create({
          data: {
            babyId: activity.babyId,
            userId: activity.userId,
            type: newType,
            startTime: split.startTime,
            endTime: split.endTime,
            memo: data.note !== undefined ? data.note : activity.memo,
            feedingType: data.feedingType !== undefined ? data.feedingType : activity.feedingType,
            feedingAmount: data.feedingAmount !== undefined ? data.feedingAmount : activity.feedingAmount,
            breastSide: data.breastSide !== undefined ? data.breastSide : activity.breastSide,
            sleepType: split.sleepType,
            duration: split.duration,
            diaperType: data.diaperType !== undefined ? data.diaperType : activity.diaperType,
            stoolCondition: data.stoolCondition !== undefined ? data.stoolCondition : activity.stoolCondition,
            medicineName: data.medicineName !== undefined ? data.medicineName : activity.medicineName,
            medicineAmount: data.medicineAmount !== undefined ? data.medicineAmount : activity.medicineAmount,
            medicineUnit: data.medicineUnit !== undefined ? data.medicineUnit : activity.medicineUnit,
            temperature: data.temperature !== undefined ? data.temperature : activity.temperature,
            isSplit: true,
            splitSequence: split.splitSequence,
            originalActivityId: activityId,
          },
        });
      }

      // Redis 캐시 무효화
      await redis.del(`baby:${activity.babyId}:recent-activities:7-days`);

      revalidatePath(`/babies/${activity.babyId}`);
      revalidatePath("/");
      revalidatePath(`/analytics/${activity.babyId}`);

      return { success: true, data: updatedActivity };
    } else {
      // 분할 불필요 - 기존 로직
      // note를 memo로 변환
      const { note, ...restData } = data;
      const prismaData = {
        ...restData,
        ...(note !== undefined && { memo: note }),
        isSplit: false,
        splitSequence: null,
        updatedAt: new Date(),
      };
      
      const updatedActivity = await prisma.activity.update({
        where: { id: activityId },
        data: prismaData,
      });

      // Redis 캐시 무효화
      await redis.del(`baby:${activity.babyId}:recent-activities:7-days`);

      revalidatePath(`/babies/${activity.babyId}`);
      revalidatePath("/");
      revalidatePath(`/analytics/${activity.babyId}`);

      return { success: true, data: updatedActivity };
    }
  } catch (error: any) {
    console.error("활동 수정 실패:", error);
    return {
      success: false,
      error: error.message || "활동 기록 수정에 실패했습니다.",
    };
  }
}

export async function deleteActivity(activityId: string) {
  // 🔒 보안: 세션에서 userId 가져오기
  const { getServerSession } = await import('next-auth');
  const { authOptions } = await import('@/app/api/auth/[...nextauth]/route');
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { success: false, error: "로그인이 필요합니다." };
  }
  const userId = session.user.id;

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
  // 🔒 보안: 세션 검증
  const { getServerSession } = await import('next-auth');
  const { authOptions } = await import('@/app/api/auth/[...nextauth]/route');
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  // 🔒 보안: 아기가 사용자의 가족에 속하는지 검증
  const baby = await prisma.baby.findFirst({
    where: {
      id: babyId,
      Family: {
        FamilyMembers: {
          some: {
            userId: session.user.id,
          },
        },
      },
    },
  });

  if (!baby) {
    return {
      success: false,
      error: "해당 아기의 활동을 조회할 권한이 없습니다."
    };
  }

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
              memo: '낮잠',
              reaction: null,
              createdAt: now,
              updatedAt: now,
              feedingType: null,
              feedingAmount: null,
              breastSide: null,
              sleepType: 'nap',
              duration: 120,
              diaperType: null,
                            stoolCondition: null,
              medicineName: null,
              medicineAmount: null,
              medicineUnit: null,
              temperature: null,
              originalActivityId: null,
              isSplit: false,
              splitSequence: null,
            },
            lastFeeding: {
              id: 'guest-feed-1',
              babyId: 'guest-baby-id',
              userId: 'guest-user-id',
              type: 'FEEDING',
              startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000),
              endTime: null,
              memo: '분유 150ml',
              reaction: 'good',
              createdAt: now,
              updatedAt: now,
              feedingType: 'formula',
              feedingAmount: 150,
              breastSide: null,
              sleepType: null,
              duration: null,
              diaperType: null,
                            stoolCondition: null,
              medicineName: null,
              medicineAmount: null,
              medicineUnit: null,
              temperature: null,
              originalActivityId: null,
              isSplit: false,
              splitSequence: null,
            },
          },
        };
      }

      // 🔒 보안: 세션 검증
      const { getServerSession } = await import('next-auth');
      const { authOptions } = await import('@/app/api/auth/[...nextauth]/route');
      const session = await getServerSession(authOptions);

      if (!session?.user?.id) {
        return { success: false, error: "로그인이 필요합니다." };
      }

      // 🔒 보안: 아기가 사용자의 가족에 속하는지 검증
      const baby = await prisma.baby.findFirst({
        where: {
          id: babyId,
          Family: {
            FamilyMembers: {
              some: {
                userId: session.user.id,
              },
            },
          },
        },
      });

      if (!baby) {
        return {
          success: false,
          error: "해당 아기의 정보를 조회할 권한이 없습니다."
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

export async function bulkDeleteActivities(
  activityIds: string[]
): Promise<{ success: boolean; data?: { count: number }; error?: string }> {
  // 🔒 보안: 세션에서 userId 가져오기
  const { getServerSession } = await import('next-auth');
  const { authOptions } = await import('@/app/api/auth/[...nextauth]/route');
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { success: false, error: "로그인이 필요합니다." };
  }
  const userId = session.user.id;

  try {
    if (!activityIds.length) {
      return { success: false, error: "삭제할 활동이 선택되지 않았습니다." };
    }

    // 🔒 보안: 모든 활동이 사용자의 가족에 속하는지 검증
    const activities = await prisma.activity.findMany({
      where: { id: { in: activityIds } },
      include: { Baby: { include: { Family: { include: { FamilyMembers: true } } } } },
    });

    // 🔒 보안: 모든 활동에 대한 권한 검증
    for (const activity of activities) {
      const isFamilyMember = activity.Baby.Family.FamilyMembers.some(
        (member) => member.userId === userId
      );

      if (!isFamilyMember) {
        return {
          success: false,
          error: "삭제할 권한이 없는 활동이 포함되어 있습니다."
        };
      }
    }

    const firstActivity = activities[0];

    const result = await prisma.activity.deleteMany({
      where: {
        id: { in: activityIds }
      }
    });

    if (firstActivity) {
      // Redis 캐시 무효화
      await redis.del(`baby:${firstActivity.babyId}:recent-activities:7-days`);

      revalidatePath(`/babies/${firstActivity.babyId}`);
      revalidatePath("/");
      revalidatePath(`/analytics/${firstActivity.babyId}`);
    }

    return { success: true, data: { count: result.count } };
  } catch (error) {
    console.error("활동 일괄 삭제 실패:", error);
    return { success: false, error: "활동 삭제 중 오류가 발생했습니다." };
  }
}

export async function getLastActivity(
  babyId: string,
  type: string
): Promise<{ success: boolean; data?: Activity | null; error?: string }> {
  if (babyId === 'guest-baby-id') {
    return { success: true, data: null };
  }

  // 🔒 보안: 세션 검증
  const { getServerSession } = await import('next-auth');
  const { authOptions } = await import('@/app/api/auth/[...nextauth]/route');
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  // 🔒 보안: 아기가 사용자의 가족에 속하는지 검증
  const baby = await prisma.baby.findFirst({
    where: {
      id: babyId,
      Family: {
        FamilyMembers: {
          some: {
            userId: session.user.id,
          },
        },
      },
    },
  });

  if (!baby) {
    return {
      success: false,
      error: "해당 아기의 활동을 조회할 권한이 없습니다."
    };
  }

  try {
    const lastActivity = await prisma.activity.findFirst({
      where: {
        babyId,
        type: type as any,
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    return { success: true, data: lastActivity };
  } catch (error) {
    console.error("마지막 활동 조회 실패:", error);
    return { success: false, error: "마지막 활동 조회에 실패했습니다" };
  }
}

export async function endSleepActivity(
  activityId: string,
  endTime: Date
): Promise<{ success: boolean; data?: Activity; error?: string }> {
  // 🔒 보안: 세션 검증
  const { getServerSession } = await import('next-auth');
  const { authOptions } = await import('@/app/api/auth/[...nextauth]/route');
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  try {
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: { Baby: { include: { Family: { include: { FamilyMembers: true } } } } },
    });

    if (!activity) {
      return { success: false, error: "활동 기록을 찾을 수 없습니다." };
    }

    // 🔒 보안: 권한 검증
    const isFamilyMember = activity.Baby.Family.FamilyMembers.some(
      (member) => member.userId === session.user.id
    );

    if (!isFamilyMember) {
      return { success: false, error: "이 활동을 수정할 권한이 없습니다." };
    }

    if (activity.type !== "SLEEP") {
      return { success: false, error: "수면 활동만 종료할 수 있습니다." };
    }

    const durationMinutes = Math.floor(
      (endTime.getTime() - activity.startTime.getTime()) / (1000 * 60)
    );

    // 분할 레코드 처리
    const { needsSplit, splitActivityByMidnight, determineSleepType } = await import('./lib/sleepSplitUtils');
    
    // 기존 분할 레코드 삭제 (원본인 경우)
    if (activity.isSplit && !activity.originalActivityId) {
      await prisma.activity.deleteMany({
        where: { originalActivityId: activityId },
      });
    }

    // 분할이 필요한지 체크
    const shouldSplit = needsSplit(activity.startTime, endTime, activity.type);

    if (shouldSplit) {
      // 1. 원본 레코드 업데이트
      const sleepType = determineSleepType(activity.startTime, endTime);

      const updatedActivity = await prisma.activity.update({
        where: { id: activityId },
        data: {
          endTime: endTime,
          duration: durationMinutes > 0 ? durationMinutes : 0,
          sleepType,
          isSplit: true,
          splitSequence: null,
          updatedAt: new Date(),
        },
      });

      // 2. 새로운 분할 레코드 생성
      const splits = splitActivityByMidnight(activity.startTime, endTime, activity.type);
      
      for (const split of splits) {
        await prisma.activity.create({
          data: {
            babyId: activity.babyId,
            userId: activity.userId,
            type: activity.type,
            startTime: split.startTime,
            endTime: split.endTime,
            memo: activity.memo,
            sleepType: split.sleepType,
            duration: split.duration,
            isSplit: true,
            splitSequence: split.splitSequence,
            originalActivityId: activityId,
          },
        });
      }

      // Redis 캐시 무효화
      await redis.del(`baby:${activity.babyId}:recent-activities:7-days`);

      revalidatePath(`/babies/${activity.babyId}`);
      revalidatePath("/");
      revalidatePath(`/analytics/${activity.babyId}`);

      return { success: true, data: updatedActivity };
    } else {
      // 분할 불필요 - 기존 로직
      const updatedActivity = await prisma.activity.update({
        where: { id: activityId },
        data: {
          endTime: endTime,
          duration: durationMinutes > 0 ? durationMinutes : 0,
          isSplit: false,
          splitSequence: null,
          updatedAt: new Date(),
        },
      });

      // Redis 캐시 무효화
      await redis.del(`baby:${activity.babyId}:recent-activities:7-days`);

      revalidatePath(`/babies/${activity.babyId}`);
      revalidatePath("/");
      revalidatePath(`/analytics/${activity.babyId}`);

      return { success: true, data: updatedActivity };
    }
  } catch (error) {
    console.error("수면 종료 처리 실패:", error);
    return { success: false, error: "수면 종료 처리에 실패했습니다." };
  }
}

export async function getOngoingSleep(
  babyId: string
): Promise<{ success: boolean; data?: Activity | null; error?: string }> {
  if (babyId === 'guest-baby-id') {
    return { success: true, data: null };
  }

  // 🔒 보안: 세션 검증
  const { getServerSession } = await import('next-auth');
  const { authOptions } = await import('@/app/api/auth/[...nextauth]/route');
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  // 🔒 보안: 아기가 사용자의 가족에 속하는지 검증
  const baby = await prisma.baby.findFirst({
    where: {
      id: babyId,
      Family: {
        FamilyMembers: {
          some: {
            userId: session.user.id,
          },
        },
      },
    },
  });

  if (!baby) {
    return {
      success: false,
      error: "해당 아기의 활동을 조회할 권한이 없습니다."
    };
  }

  try {
    const ongoingSleep = await prisma.activity.findFirst({
      where: {
        babyId,
        type: "SLEEP",
        endTime: null,
      },
      orderBy: {
        startTime: "desc",
      },
    });

    return { success: true, data: ongoingSleep };
  } catch (error) {
    console.error("진행 중인 수면 조회 실패:", error);
    return { success: false, error: "진행 중인 수면 조회에 실패했습니다." };
  }
}