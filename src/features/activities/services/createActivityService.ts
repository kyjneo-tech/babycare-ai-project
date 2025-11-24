import { z } from 'zod';
import { CreateActivitySchema } from '@/shared/types/schemas';
import { Activity } from '@prisma/client';
import { IActivityRepository } from '../repositories/IActivityRepository';

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
    const durationMs = validated.endTime.getTime() - validated.startTime.getTime();
    duration = Math.floor(durationMs / (1000 * 60)); // 분 단위
  }

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
    note: validated.note,
    feedingType: validated.feedingType,
    feedingAmount: validated.feedingAmount,
    breastSide: validated.breastSide,
    sleepType: validated.sleepType,
    duration: duration,
    diaperType: validated.diaperType,
    stoolColor: validated.stoolColor,
    stoolCondition: validated.stoolCondition,
    medicineName: validated.medicineName,
    medicineAmount: validated.medicineAmount,
    medicineUnit: validated.medicineUnit,
    temperature: validated.temperature,
  });
}