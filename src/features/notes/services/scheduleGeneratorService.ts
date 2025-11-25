/**
 * 일정 자동 생성 서비스
 * 템플릿 데이터를 기반으로 예방접종, 건강검진 등의 일정을 자동 생성합니다.
 */

import { NoteType, Prisma } from '@prisma/client';
import { VACCINATION_SCHEDULES } from '@/shared/templates/vaccination-templates';
import { HEALTH_CHECK_SCHEDULES } from '@/shared/templates/healthcheck-templates';
import { MILESTONES } from '@/shared/templates/milestone-templates';
import { WONDER_WEEKS } from '@/shared/templates/wonder-weeks-templates';
import { SLEEP_REGRESSIONS } from '@/shared/templates/sleep-regression-templates';
import { FEEDING_STAGES } from '@/shared/templates/feeding-stage-templates';
import {
  addMonthsToBirthDate,
  addWeeksToBirthDate,
  addDaysToBirthDate,
} from '@/shared/utils/schedule-calculator';

export type CreateNoteInput = Omit<
  Prisma.NoteCreateInput,
  'Baby' | 'User'
> & {
  babyId: string;
  userId: string;
};

/**
 * 예방접종 일정 생성
 */
export function generateVaccinationSchedules(
  babyId: string,
  userId: string,
  birthDate: Date
): CreateNoteInput[] {
  return VACCINATION_SCHEDULES.map((schedule) => {
    let dueDate: Date;

    if (schedule.ageMonths !== undefined) {
      dueDate = addMonthsToBirthDate(birthDate, schedule.ageMonths);
    } else if (schedule.ageWeeks !== undefined) {
      dueDate = addWeeksToBirthDate(birthDate, schedule.ageWeeks);
    } else {
      // 기본값: 생후 0개월 (출생 직후)
      dueDate = birthDate;
    }

    return {
      babyId,
      userId,
      type: 'VACCINATION' as NoteType,
      title: schedule.name,
      content: `${schedule.description}\n\n대상 질병: ${schedule.disease}\n${
        schedule.notes ? `참고: ${schedule.notes}` : ''
      }` || undefined,
      dueDate,
      completed: false,
      priority: schedule.isRequired ? 'HIGH' : 'MEDIUM',
      tags: ['예방접종', schedule.disease],
      metadata: {
        vaccineId: schedule.id,
        disease: schedule.disease,
        isRequired: schedule.isRequired,
      },
      reminderDays: schedule.reminderDays,
    };
  });
}

/**
 * 건강검진 일정 생성
 */
export function generateHealthCheckSchedules(
  babyId: string,
  userId: string,
  birthDate: Date
): CreateNoteInput[] {
  return HEALTH_CHECK_SCHEDULES.map((schedule) => {
    let dueDate: Date;

    if (schedule.ageDaysMin > 0) {
      // 신생아 검진 (일 단위)
      dueDate = addDaysToBirthDate(birthDate, schedule.ageDaysMin);
    } else {
      // 일반 검진 (월 단위) - 최소 개월수 기준
      dueDate = addMonthsToBirthDate(birthDate, schedule.ageMonthsMin);
    }

    const checkItemsList = schedule.checkItems
      .map((item) => `• ${item}`)
      .join('\n');

    return {
      babyId,
      userId,
      type: 'HEALTH_CHECKUP' as NoteType,
      title: schedule.name,
      content: `${schedule.description}\n\n검진 항목:\n${checkItemsList}`,
      dueDate,
      completed: false,
      priority: 'HIGH',
      tags: ['건강검진'],
      metadata: {
        checkupId: schedule.id,
        ageMonthsMin: schedule.ageMonthsMin,
        ageMonthsMax: schedule.ageMonthsMax,
        checkItems: schedule.checkItems,
      },
      reminderDays: schedule.reminderDays,
    };
  });
}

/**
 * 발달 마일스톤 체크리스트 생성
 * 0-24개월까지의 마일스톤만 생성
 */
export function generateMilestoneChecklists(
  babyId: string,
  userId: string,
  birthDate: Date
): CreateNoteInput[] {
  return MILESTONES.filter((milestone) => milestone.ageMonths <= 24).map(
    (milestone) => {
      const dueDate = addMonthsToBirthDate(birthDate, milestone.ageMonths);

      return {
        babyId,
        userId,
        type: 'MILESTONE' as NoteType,
        title: milestone.title,
        content: `발달 영역: ${milestone.category}\n\n${milestone.description}${
          milestone.isWarningSign
            ? '\n\n⚠️ 이 시기까지 해당 발달이 이루어지지 않으면 전문가 상담이 필요합니다.'
            : ''
        }`,
        dueDate,
        completed: false,
        priority: milestone.isWarningSign ? 'HIGH' : 'MEDIUM',
        tags: ['발달', milestone.category],
        metadata: {
          milestoneId: milestone.id,
          category: milestone.category,
          isWarningSign: milestone.isWarningSign || false,
        },
        reminderDays: [7, 0],
      };
    }
  );
}

/**
 * 원더윅스 도약기 알림 생성
 */
export function generateWonderWeeksNotifications(
  babyId: string,
  userId: string,
  birthDate: Date
): CreateNoteInput[] {
  return WONDER_WEEKS.map((wonderWeek) => {
    // 시작 주수의 소수점 처리 (예: 7.5주 = 7주 + 3.5일)
    const weeks = Math.floor(wonderWeek.startWeek);
    const days = Math.round((wonderWeek.startWeek - weeks) * 7);
    let dueDate = addWeeksToBirthDate(birthDate, weeks);
    if (days > 0) {
      dueDate = addDaysToBirthDate(dueDate, days);
    }

    // 도약기 시작 3일 전에 알림
    const notificationDate = addDaysToBirthDate(dueDate, -3);

    const symptomsList = wonderWeek.symptoms
      .map((symptom) => `• ${symptom}`)
      .join('\n');

    return {
      babyId,
      userId,
      type: 'WONDER_WEEK' as NoteType,
      title: `${wonderWeek.name} 시작 예정`,
      content: `${wonderWeek.description}\n\n발달 변화:\n${wonderWeek.developmentChange}\n\n예상되는 증상:\n${symptomsList}\n\nℹ️ 이 기간 동안 아기가 평소보다 더 보챌 수 있습니다. 인내심을 가지고 충분한 스킨십과 관심을 주세요.`,
      dueDate: notificationDate,
      completed: false,
      priority: 'MEDIUM',
      tags: ['원더윅스', `Leap ${wonderWeek.leapNumber}`],
      metadata: {
        wonderWeekId: wonderWeek.id,
        leapNumber: wonderWeek.leapNumber,
        startWeek: wonderWeek.startWeek,
        endWeek: wonderWeek.endWeek,
      },
      reminderDays: [3, 0],
    };
  });
}

/**
 * 수면 퇴행기 알림 생성
 */
export function generateSleepRegressionNotifications(
  babyId: string,
  userId: string,
  birthDate: Date
): CreateNoteInput[] {
  return SLEEP_REGRESSIONS.map((regression) => {
    const dueDate = addMonthsToBirthDate(birthDate, regression.ageMonths);
    // 퇴행기 시작 3일 전에 알림
    const notificationDate = addDaysToBirthDate(dueDate, -3);

    const causesList = regression.causes.map((cause) => `• ${cause}`).join('\n');
    const symptomsList = regression.symptoms
      .map((symptom) => `• ${symptom}`)
      .join('\n');
    const tipsList = regression.tips.map((tip) => `• ${tip}`).join('\n');

    return {
      babyId,
      userId,
      type: 'SLEEP_REGRESSION' as NoteType,
      title: regression.name,
      content: `${regression.description}\n\n원인:\n${causesList}\n\n증상:\n${symptomsList}\n\n대처 방법:\n${tipsList}`,
      dueDate: notificationDate,
      completed: false,
      priority: 'MEDIUM',
      tags: ['수면', '퇴행기'],
      metadata: {
        regressionId: regression.id,
        ageMonths: regression.ageMonths,
      },
      reminderDays: [3, 0],
    };
  });
}

/**
 * 이유식 단계 알림 생성
 */
export function generateFeedingStageNotifications(
  babyId: string,
  userId: string,
  birthDate: Date
): CreateNoteInput[] {
  return FEEDING_STAGES.map((stage) => {
    const dueDate = addMonthsToBirthDate(birthDate, stage.ageMonthsMin);
    // 이유식 단계 시작 2주 전에 알림 (준비 기간)
    const notificationDate = addDaysToBirthDate(dueDate, -14);

    const ingredientsList = stage.mainIngredients
      .map((ingredient) => `• ${ingredient}`)
      .join('\n');
    const tipsList = stage.tips.map((tip) => `• ${tip}`).join('\n');

    return {
      babyId,
      userId,
      type: 'FEEDING_STAGE' as NoteType,
      title: `${stage.name} 시작 준비`,
      content: `${stage.ageMonthsMin}-${stage.ageMonthsMax}개월\n\n하루 횟수: ${stage.mealsPerDay}회\n질감: ${stage.texture}\n\n주요 재료:\n${ingredientsList}\n\n팁:\n${tipsList}`,
      dueDate: notificationDate,
      completed: false,
      priority: 'MEDIUM',
      tags: ['이유식', stage.name],
      metadata: {
        stageId: stage.id,
        ageMonthsMin: stage.ageMonthsMin,
        ageMonthsMax: stage.ageMonthsMax,
        mealsPerDay: stage.mealsPerDay,
      },
      reminderDays: [14, 7, 0],
    };
  });
}

/**
 * 모든 일정 생성 (All-in-One)
 */
export function generateAllSchedules(
  babyId: string,
  userId: string,
  birthDate: Date,
  options: {
    includeVaccination?: boolean;
    includeHealthCheck?: boolean;
    includeMilestone?: boolean;
    includeWonderWeeks?: boolean;
    includeSleepRegression?: boolean;
    includeFeedingStage?: boolean;
  } = {}
): CreateNoteInput[] {
  const {
    includeVaccination = true,
    includeHealthCheck = true,
    includeMilestone = true,
    includeWonderWeeks = true,
    includeSleepRegression = true,
    includeFeedingStage = true,
  } = options;

  const allSchedules: CreateNoteInput[] = [];

  if (includeVaccination) {
    allSchedules.push(
      ...generateVaccinationSchedules(babyId, userId, birthDate)
    );
  }

  if (includeHealthCheck) {
    allSchedules.push(
      ...generateHealthCheckSchedules(babyId, userId, birthDate)
    );
  }

  if (includeMilestone) {
    allSchedules.push(
      ...generateMilestoneChecklists(babyId, userId, birthDate)
    );
  }

  if (includeWonderWeeks) {
    allSchedules.push(
      ...generateWonderWeeksNotifications(babyId, userId, birthDate)
    );
  }

  if (includeSleepRegression) {
    allSchedules.push(
      ...generateSleepRegressionNotifications(babyId, userId, birthDate)
    );
  }

  if (includeFeedingStage) {
    allSchedules.push(
      ...generateFeedingStageNotifications(babyId, userId, birthDate)
    );
  }

  return allSchedules;
}
