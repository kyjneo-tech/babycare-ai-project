import { useMemo, useCallback } from 'react';
import { differenceInMonths, differenceInDays, addMonths } from 'date-fns';
import { MILESTONES, Milestone } from '@/shared/templates/milestone-templates';

type MilestoneStatus = 'completed' | 'current' | 'upcoming';

export function useMilestones(birthDate: Date) {
  const currentAgeMonths = differenceInMonths(new Date(), birthDate);
  
  const upcomingMilestones = useMemo(() => 
    MILESTONES
      .filter(m => m.ageMonths >= currentAgeMonths)
      .sort((a, b) => a.ageMonths - b.ageMonths),
    [currentAgeMonths]
  );

  const getMilestoneStatus = useCallback((milestone: Milestone): MilestoneStatus => {
    if (milestone.ageMonths < currentAgeMonths) return 'completed';
    if (milestone.ageMonths === currentAgeMonths) return 'current';
    return 'upcoming';
  }, [currentAgeMonths]);

  const getDaysUntil = useCallback((milestone: Milestone): number => {
    const targetDate = addMonths(birthDate, milestone.ageMonths);
    return differenceInDays(targetDate, new Date());
  }, [birthDate]);

  return { 
    currentAgeMonths, 
    upcomingMilestones, 
    getMilestoneStatus,
    getDaysUntil
  };
}
