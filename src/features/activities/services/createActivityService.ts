import { z } from 'zod';
import { CreateActivitySchema } from '@/shared/types/schemas';
import { Activity } from '@prisma/client';
import { IActivityRepository } from '../repositories/IActivityRepository';
import {
  needsSplit,
  splitActivityByMidnight,
  calculateDuration,
  determineSleepType,
} from '../lib/sleepSplitUtils';

type CreateActivityInput = z.infer<typeof CreateActivitySchema>;

export async function createActivityService(
  repository: IActivityRepository,
  userId: string,
  input: CreateActivityInput
): Promise<Activity> {
  const validated = CreateActivitySchema.parse(input);

  // 수면 시간 자동 계산
  let duration: number | null = null;
  if (validated.type === 'SLEEP' && validated.startTime && validated.endTime) {
    duration = calculateDuration(validated.startTime, validated.endTime);
  }

  // 날짜 경계 분할 체크
  const shouldSplit = validated.endTime && needsSplit(
    validated.startTime,
    validated.endTime,
    validated.type
  );

  if (shouldSplit && validated.endTime) {
    // 분할이 필요한 경우: 원본 + 분할 레코드 생성
    
    // 1. 원본 레코드 생성 (사용자가 입력한 그대로)
    const originalActivity = await repository.create({
      User: {
        connect: { id: userId },
      },
      Baby: {
        connect: { id: validated.babyId },
      },
      type: validated.type,
      startTime: validated.startTime,
      endTime: validated.endTime,
      memo: validated.note,
      feedingType: validated.feedingType,
      feedingAmount: validated.feedingAmount,
      breastSide: validated.breastSide,
      sleepType: validated.sleepType || (validated.type === 'SLEEP' 
        ? determineSleepType(validated.startTime, validated.endTime)
        : null),
      duration: duration,
      diaperType: validated.diaperType,
      stoolCondition: validated.stoolCondition,
      medicineName: validated.medicineName,
      medicineAmount: validated.medicineAmount,
      medicineUnit: validated.medicineUnit,
      temperature: validated.temperature,
      isSplit: true, // 분할됨 표시
      splitSequence: null, // 원본은 null
    });

    // 2. 분할 레코드 생성 (통계용)
    const splits = splitActivityByMidnight(
      validated.startTime,
      validated.endTime,
      validated.type
    );

    // 각 분할 레코드 생성
    for (const split of splits) {
      await repository.create({
        User: {
          connect: { id: userId },
        },
        Baby: {
          connect: { id: validated.babyId },
        },
        type: validated.type,
        startTime: split.startTime,
        endTime: split.endTime,
        memo: validated.note,
        feedingType: validated.feedingType,
        feedingAmount: validated.feedingAmount,
        breastSide: validated.breastSide,
        sleepType: split.sleepType,
        duration: split.duration,
        diaperType: validated.diaperType,
        stoolCondition: validated.stoolCondition,
        medicineName: validated.medicineName,
        medicineAmount: validated.medicineAmount,
        medicineUnit: validated.medicineUnit,
        temperature: validated.temperature,
        isSplit: true,
        splitSequence: split.splitSequence,
        OriginalActivity: {
          connect: { id: originalActivity.id },
        },
      });
    }

    return originalActivity;
  } else {
    // 분할이 필요 없는 경우: 기존 로직 유지
    return repository.create({
      User: {
        connect: { id: userId },
      },
      Baby: {
        connect: { id: validated.babyId },
      },
      type: validated.type,
      startTime: validated.startTime,
      endTime: validated.endTime,
      memo: validated.note,
      feedingType: validated.feedingType,
      feedingAmount: validated.feedingAmount,
      breastSide: validated.breastSide,
      sleepType: validated.sleepType,
      duration: duration,
      diaperType: validated.diaperType,
      stoolCondition: validated.stoolCondition,
      medicineName: validated.medicineName,
      medicineAmount: validated.medicineAmount,
      medicineUnit: validated.medicineUnit,
      temperature: validated.temperature,
      isSplit: false,
      splitSequence: null,
    });
  }
}