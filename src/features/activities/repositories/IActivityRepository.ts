import { Activity, Prisma } from '@prisma/client';

export interface IActivityRepository {
  create(data: Prisma.ActivityCreateInput): Promise<Activity>;
  findRecent(babyId: string, days: number): Promise<Activity[]>;
  findByDateRange(babyId: string, start: Date, end: Date): Promise<Activity[]>;
  findForStats(babyId: string, start: Date, end: Date): Promise<Activity[]>;
}
