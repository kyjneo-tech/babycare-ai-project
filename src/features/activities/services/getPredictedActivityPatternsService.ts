// src/features/activities/services/getPredictedActivityPatternsService.ts
import { prisma } from '@/shared/lib/prisma';
import { Activity, ActivityType } from '@prisma/client';
import { PredictedActivityPatterns, PredictedPattern } from '@/shared/types/schemas';

const PREDICTION_PERIOD_DAYS = 30; // 최근 30일간의 데이터를 기반으로 예측

// 활동 데이터의 간격 및 지속 시간을 계산하는 헬퍼 함수
function calculatePatternMetrics(activities: Activity[], type: ActivityType): { avgInterval?: number, avgDuration?: number, avgAmount?: number } {
  const filteredActivities = activities.filter(activity => activity.type === type);

  if (filteredActivities.length < 2) {
    return {}; // 패턴 분석을 위한 충분한 데이터가 없음
  }

  // 최신 활동부터 정렬 (데이터베이스 조회 시 이미 desc로 정렬되어 있다고 가정)
  // filteredActivities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  let intervals: number[] = []; // 활동 간 간격 (분)
  let durations: number[] = []; // 활동 지속 시간 (분)
  let amounts: number[] = []; // 수유량 (ml)

  for (let i = 0; i < filteredActivities.length - 1; i++) {
    const current = filteredActivities[i];
    const previous = filteredActivities[i + 1];

    // 간격 계산 (분)
    const interval = (current.createdAt.getTime() - previous.createdAt.getTime()) / (1000 * 60);
    intervals.push(interval);

    // 지속 시간 계산 (SLEEP만 해당)
    if (type === ActivityType.SLEEP && current.startTime && current.endTime) {
      const duration = (current.endTime.getTime() - current.startTime.getTime()) / (1000 * 60);
      durations.push(duration);
    }

    // 수유량 계산 (FEEDING만 해당)
    if (type === ActivityType.FEEDING && current.feedingAmount) {
      amounts.push(current.feedingAmount);
    }
  }

  const avgInterval = intervals.length > 0 ? intervals.reduce((sum, val) => sum + val, 0) / intervals.length : undefined;
  const avgDuration = durations.length > 0 ? durations.reduce((sum, val) => sum + val, 0) / durations.length : undefined;
  const avgAmount = amounts.length > 0 ? amounts.reduce((sum, val) => sum + val, 0) / amounts.length : undefined;

  return { avgInterval, avgDuration, avgAmount };
}

export async function getPredictedActivityPatternsService(babyId: string): Promise<PredictedActivityPatterns> {
  const predictedPatterns: PredictedActivityPatterns = {};

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - PREDICTION_PERIOD_DAYS);

    // 특정 아기의 최근 활동 기록 조회
    const activities = await prisma.activity.findMany({
      where: {
        babyId,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'desc' }, // 최신 순으로 정렬
    });

    const activityTypesToPredict: ActivityType[] = [
      ActivityType.FEEDING,
      ActivityType.SLEEP,
      ActivityType.DIAPER,
    ];

    for (const type of activityTypesToPredict) {
      const typeActivities = activities.filter(activity => activity.type === type);
      if (typeActivities.length === 0) {
        continue; // 해당 활동 유형의 기록이 없으면 예측하지 않음
      }

      const latestActivity = typeActivities[0]; // 가장 최근 활동
      const { avgInterval, avgDuration, avgAmount } = calculatePatternMetrics(activities, type);

      const prediction: PredictedPattern = {};

      if (avgInterval !== undefined) {
        const nextTime = new Date(latestActivity.createdAt.getTime() + avgInterval * 60 * 1000);
        prediction.nextTime = nextTime;
        prediction.avgInterval = avgInterval;
      }

      if (avgDuration !== undefined) {
        prediction.avgDuration = avgDuration;
      }

      if (avgAmount !== undefined) {
        prediction.avgAmount = avgAmount;
      }
      
      if (Object.keys(prediction).length > 0) {
        (predictedPatterns as any)[type] = prediction;
      }
    }

  } catch (error) {
    console.error('Error in getPredictedActivityPatternsService:', error);
    // 에러 발생 시 빈 객체 또는 부분적인 예측 반환
    return predictedPatterns;
  }

  return predictedPatterns;
}
