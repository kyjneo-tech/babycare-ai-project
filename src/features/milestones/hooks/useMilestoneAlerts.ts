import { useMemo } from 'react';
import { useMilestones } from './useMilestones';

export function useMilestoneAlerts(birthDate: Date) {
  const { upcomingMilestones, getDaysUntil } = useMilestones(birthDate);
  
  const alerts = useMemo(() => {
    return upcomingMilestones
      .map(milestone => ({
        milestone,
        daysUntil: getDaysUntil(milestone)
      }))
      .filter(({ daysUntil }) => daysUntil <= 14 && daysUntil >= 0);
  }, [upcomingMilestones, getDaysUntil]);

  return alerts;
}
