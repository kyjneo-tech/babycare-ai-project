import { IActivityRepository } from '../repositories/IActivityRepository';
import { Activity } from '@prisma/client';

export async function getRecentActivitiesService(
  repository: IActivityRepository,
  babyId: string,
  days: number = 7
): Promise<Activity[]> {
  return repository.findRecent(babyId, days);
}
