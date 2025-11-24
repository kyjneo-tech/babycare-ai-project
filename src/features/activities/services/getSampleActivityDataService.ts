// src/features/activities/services/getSampleActivityDataService.ts
import { Activity, ActivityType } from '@prisma/client';
import { PredictedActivityPatterns, PredictedPattern } from '@/shared/types/schemas';

// 샘플 활동 데이터 생성 함수
export function getSampleActivities(babyId: string, date: Date): Activity[] {
  const activities: Activity[] = [];
  const today = new Date(date);
  today.setHours(0, 0, 0, 0);

  const createActivity = (
    type: ActivityType,
    hours: number,
    minutes: number,
    details?: Partial<Activity>
  ): Activity => {
    const createdAt = new Date(today);
    createdAt.setHours(hours, minutes, 0, 0);
    return {
      id: Math.random().toString(36).substring(2, 15),
      babyId,
      userId: 'sample-user-id',
      type,
      startTime: createdAt,
      endTime: details?.endTime || (type === ActivityType.SLEEP ? new Date(createdAt.getTime() + 60 * 60 * 1000) : null), // 기본 1시간 수면
      note: details?.note || null,
      createdAt: createdAt,
      updatedAt: createdAt,
      feedingType: details?.feedingType || (type === ActivityType.FEEDING ? 'breast' : null),
      feedingAmount: details?.feedingAmount || (type === ActivityType.FEEDING ? 120 : null),
      breastSide: details?.breastSide || null,
      diaperType: details?.diaperType || (type === ActivityType.DIAPER ? 'urine' : null),
      stoolColor: details?.stoolColor || null,
      stoolCondition: details?.stoolCondition || null,
      sleepType: details?.sleepType || (type === ActivityType.SLEEP ? 'nap' : null),
      duration: details?.duration || (type === ActivityType.SLEEP ? 60 : null),
      bathType: details?.bathType || null,
      bathTemp: details?.bathTemp || null,
      medicineName: details?.medicineName || null,
      medicineAmount: details?.medicineAmount || null,
      medicineUnit: details?.medicineUnit || null,
      playType: details?.playType || null,
      playDuration: details?.playDuration || null,
      playLocation: details?.playLocation || null,
      temperature: details?.temperature || null,
      reaction: details?.reaction || null,
    };
  };

  // 특정 날짜의 샘플 데이터 (예: 오늘 또는 어제)
  // 오늘 날짜와 요청된 날짜가 같으면 좀 더 구체적인 샘플을 제공
  if (today.toDateString() === new Date().toDateString()) {
    activities.push(createActivity(ActivityType.SLEEP, 7, 0, { endTime: new Date(today.getTime() + 90 * 60 * 1000) })); // 기상 후 1시간 30분 수면
    activities.push(createActivity(ActivityType.FEEDING, 8, 45, { feedingAmount: 150 }));
    activities.push(createActivity(ActivityType.DIAPER, 9, 30, { diaperType: 'stool' }));
    activities.push(createActivity(ActivityType.PLAY, 10, 0, { playDuration: 60 }));
    activities.push(createActivity(ActivityType.SLEEP, 11, 30, { endTime: new Date(today.getTime() + (11.5 * 60 + 60) * 60 * 1000), sleepType: 'nap' })); // 낮잠 1시간
    activities.push(createActivity(ActivityType.FEEDING, 13, 0, { feedingAmount: 160 }));
    activities.push(createActivity(ActivityType.DIAPER, 13, 45, { diaperType: 'urine' }));
    activities.push(createActivity(ActivityType.PLAY, 15, 0, { playDuration: 45 }));
    activities.push(createActivity(ActivityType.FEEDING, 16, 0, { feedingAmount: 140 }));
    activities.push(createActivity(ActivityType.DIAPER, 16, 30, { diaperType: 'stool' }));
    activities.push(createActivity(ActivityType.SLEEP, 19, 0, { endTime: new Date(today.getTime() + (19 * 60 + 60) * 60 * 1000), sleepType: 'nap' })); // 저녁 잠 1시간
    activities.push(createActivity(ActivityType.FEEDING, 21, 0, { feedingAmount: 180 }));
    activities.push(createActivity(ActivityType.DIAPER, 21, 30, { diaperType: 'urine' }));
  } else {
    // 다른 날짜 (예: 어제)의 샘플 데이터
    activities.push(createActivity(ActivityType.SLEEP, 6, 30, { endTime: new Date(today.getTime() + 90 * 60 * 1000) })); // 1시간 30분 수면
    activities.push(createActivity(ActivityType.FEEDING, 8, 15, { feedingAmount: 140 }));
    activities.push(createActivity(ActivityType.DIAPER, 9, 0, { diaperType: 'urine' }));
    activities.push(createActivity(ActivityType.SLEEP, 11, 0, { endTime: new Date(today.getTime() + (11 * 60 + 60) * 60 * 1000), sleepType: 'nap' })); // 낮잠 1시간
    activities.push(createActivity(ActivityType.FEEDING, 12, 30, { feedingAmount: 150 }));
    activities.push(createActivity(ActivityType.DIAPER, 13, 15, { diaperType: 'stool' }));
    activities.push(createActivity(ActivityType.FEEDING, 15, 45, { feedingAmount: 130 }));
    activities.push(createActivity(ActivityType.SLEEP, 18, 45, { endTime: new Date(today.getTime() + (18.75 * 60 + 60) * 60 * 1000), sleepType: 'nap' })); // 저녁 잠 1시간
    activities.push(createActivity(ActivityType.FEEDING, 20, 30, { feedingAmount: 170 }));
    activities.push(createActivity(ActivityType.DIAPER, 21, 0, { diaperType: 'urine' }));
  }

  // 예측을 위한 활동은 최소 2개 이상 있어야 평균 간격을 계산할 수 있으므로,
  // 샘플 데이터는 이 점을 고려하여 충분한 양을 제공해야 합니다.
  // 여기서는 단순히 위에 나열된 활동들을 반환합니다.
  return activities.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

// 샘플 예측 패턴 데이터 생성 함수
export function getSamplePredictedPatterns(babyId: string): PredictedActivityPatterns {
  const now = new Date();
  const nextFeedingTime = new Date(now.getTime() + 3 * 60 * 60 * 1000); // 3시간 후
  const nextSleepTime = new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4시간 후
  const nextDiaperTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2시간 후

  return {
    FEEDING: {
      nextTime: nextFeedingTime,
      avgInterval: 180, // 3시간
      avgAmount: 150,
    },
    SLEEP: {
      nextTime: nextSleepTime,
      avgDuration: 60, // 1시간
      avgInterval: 240, // 4시간
    },
    DIAPER: {
      nextTime: nextDiaperTime,
      avgInterval: 120, // 2시간
    },
  };
}
