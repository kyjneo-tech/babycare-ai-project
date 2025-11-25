import { Activity } from "@prisma/client";

export type DailySummary = Record<string, Record<string, {
  count: number;
  totalAmount: number;
  totalDuration: number;
}>>;

export function calculateDailySummaries(activities: Activity[]): DailySummary {
  const dailySummaries: DailySummary = {};
  
  activities.forEach((activity) => {
    const dateKey = new Date(activity.startTime).toISOString().split('T')[0];
    
    if (!dailySummaries[dateKey]) {
      dailySummaries[dateKey] = {};
    }

    const typeKey = activity.type;
    if (!dailySummaries[dateKey][typeKey]) {
      dailySummaries[dateKey][typeKey] = {
        count: 0,
        totalAmount: 0,
        totalDuration: 0,
      };
    }

    dailySummaries[dateKey][typeKey].count++;

    if (activity.feedingAmount) {
      dailySummaries[dateKey][typeKey].totalAmount += activity.feedingAmount;
    }
    if (activity.duration) {
      dailySummaries[dateKey][typeKey].totalDuration += activity.duration;
    }
  });

  return dailySummaries;
}
