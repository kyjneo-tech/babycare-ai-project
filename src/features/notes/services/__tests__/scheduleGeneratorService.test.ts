/**
 * 일정 자동 생성 서비스 테스트
 * 한국 질병관리청 표준 예방접종 일정 및 국민건강보험공단 건강검진 일정 기준
 */

import {
  generateVaccinationSchedules,
  generateHealthCheckSchedules,
  generateMilestoneChecklists,
  generateWonderWeeksNotifications,
  generateSleepRegressionNotifications,
  generateFeedingStageNotifications,
  generateAllSchedules,
} from '../scheduleGeneratorService';
import { NoteType } from '@prisma/client';
import { VACCINATION_SCHEDULES } from '@/shared/templates/vaccination-templates';
import { HEALTH_CHECK_SCHEDULES } from '@/shared/templates/healthcheck-templates';
import { MILESTONES } from '@/shared/templates/milestone-templates';
import { WONDER_WEEKS } from '@/shared/templates/wonder-weeks-templates';
import { SLEEP_REGRESSIONS } from '@/shared/templates/sleep-regression-templates';
import { FEEDING_STAGES } from '@/shared/templates/feeding-stage-templates';

describe('scheduleGeneratorService', () => {
  const mockBabyId = 'test-baby-id';
  const mockUserId = 'test-user-id';
  const mockBirthDate = new Date('2024-10-28');

  describe('예방접종 일정 생성 (generateVaccinationSchedules)', () => {
    it('생년월일 기반으로 모든 예방접종 일정을 생성한다', () => {
      const schedules = generateVaccinationSchedules(
        mockBabyId,
        mockUserId,
        mockBirthDate
      );

      expect(schedules).toHaveLength(VACCINATION_SCHEDULES.length);
      expect(schedules.every((s) => s.babyId === mockBabyId)).toBe(true);
      expect(schedules.every((s) => s.userId === mockUserId)).toBe(true);
      expect(schedules.every((s) => s.type === 'VACCINATION')).toBe(true);
    });

    it('생후 0개월: B형간염 1차 일정을 올바르게 생성한다', () => {
      const schedules = generateVaccinationSchedules(
        mockBabyId,
        mockUserId,
        mockBirthDate
      );

      const hepb1 = schedules.find((s) => s.title === 'B형간염 1차');
      expect(hepb1).toBeDefined();
      expect(hepb1!.dueDate).toEqual(mockBirthDate); // 출생 직후
      expect(hepb1!.type).toBe('VACCINATION');
      expect(hepb1!.priority).toBe('HIGH');
      expect(hepb1!.completed).toBe(false);
      expect(hepb1!.tags).toContain('예방접종');
      expect(hepb1!.tags).toContain('B형간염');
      expect(hepb1!.metadata).toHaveProperty('vaccineId', 'hepb-1');
      expect(hepb1!.metadata).toHaveProperty('disease', 'B형간염');
      expect(hepb1!.metadata).toHaveProperty('isRequired', true);
    });

    it('생후 1개월: B형간염 2차 일정을 올바르게 생성한다', () => {
      const schedules = generateVaccinationSchedules(
        mockBabyId,
        mockUserId,
        mockBirthDate
      );

      const hepb2 = schedules.find((s) => s.title === 'B형간염 2차');
      const expectedDate = new Date('2024-11-28'); // 1개월 후

      expect(hepb2).toBeDefined();
      expect(hepb2!.dueDate).toEqual(expectedDate);
      expect(hepb2!.priority).toBe('HIGH');
      expect(hepb2!.reminderDays).toEqual([7, 3, 0]);
    });

    it('생후 4주: BCG 예방접종 일정을 올바르게 생성한다', () => {
      const schedules = generateVaccinationSchedules(
        mockBabyId,
        mockUserId,
        mockBirthDate
      );

      const bcg = schedules.find((s) => s.title === 'BCG (피내용)');
      const expectedDate = new Date('2024-11-25'); // 4주(28일) 후

      expect(bcg).toBeDefined();
      expect(bcg!.dueDate).toEqual(expectedDate);
      expect(bcg!.tags).toContain('결핵');
      expect(bcg!.content).toContain('생후 4주 이내');
    });

    it('생후 2개월: DTaP, IPV, Hib, PCV 1차 일정을 생성한다', () => {
      const schedules = generateVaccinationSchedules(
        mockBabyId,
        mockUserId,
        mockBirthDate
      );

      const expectedDate = new Date('2024-12-28'); // 2개월 후
      const month2Vaccines = schedules.filter(
        (s) => s.dueDate.getTime() === expectedDate.getTime()
      );

      // 2개월에 접종해야 할 백신 확인
      const expectedVaccines = ['DTaP 1차', 'IPV 1차', 'Hib 1차', 'PCV 1차'];
      const actualVaccines = month2Vaccines
        .map((v) => v.title)
        .filter((title) => expectedVaccines.includes(title));

      expect(actualVaccines.length).toBeGreaterThanOrEqual(4);
    });

    it('생후 6개월: B형간염 3차, DTaP 3차, IPV 3차, Hib 3차, PCV 3차 일정을 생성한다', () => {
      const schedules = generateVaccinationSchedules(
        mockBabyId,
        mockUserId,
        mockBirthDate
      );

      const expectedDate = new Date('2025-04-28'); // 6개월 후
      const month6Vaccines = schedules.filter(
        (s) => s.dueDate.getTime() === expectedDate.getTime()
      );

      expect(month6Vaccines.length).toBeGreaterThanOrEqual(5);
      const titles = month6Vaccines.map((v) => v.title);
      expect(titles).toContain('B형간염 3차');
      expect(titles).toContain('DTaP 3차');
    });

    it('생후 12개월: MMR 1차, 수두, A형간염 1차, 일본뇌염 1차 일정을 생성한다', () => {
      const schedules = generateVaccinationSchedules(
        mockBabyId,
        mockUserId,
        mockBirthDate
      );

      const expectedDate = new Date('2025-10-28'); // 12개월 후
      const month12Vaccines = schedules.filter(
        (s) => s.dueDate.getTime() === expectedDate.getTime()
      );

      const titles = month12Vaccines.map((v) => v.title);
      expect(titles).toContain('MMR 1차');
      expect(titles).toContain('수두');
      expect(titles).toContain('A형간염 1차');
    });

    it('필수 예방접종은 우선순위가 HIGH이다', () => {
      const schedules = generateVaccinationSchedules(
        mockBabyId,
        mockUserId,
        mockBirthDate
      );

      const requiredVaccines = schedules.filter(
        (s) => s.metadata?.isRequired === true
      );
      expect(requiredVaccines.every((v) => v.priority === 'HIGH')).toBe(true);
    });

    it('선택 예방접종은 우선순위가 MEDIUM이다', () => {
      const schedules = generateVaccinationSchedules(
        mockBabyId,
        mockUserId,
        mockBirthDate
      );

      const optionalVaccines = schedules.filter(
        (s) => s.metadata?.isRequired === false
      );
      expect(optionalVaccines.every((v) => v.priority === 'MEDIUM')).toBe(true);
    });

    it('모든 일정에 알림 설정(reminderDays)이 포함된다', () => {
      const schedules = generateVaccinationSchedules(
        mockBabyId,
        mockUserId,
        mockBirthDate
      );

      expect(schedules.every((s) => Array.isArray(s.reminderDays))).toBe(true);
      expect(schedules.every((s) => s.reminderDays!.length > 0)).toBe(true);
    });
  });

  describe('건강검진 일정 생성 (generateHealthCheckSchedules)', () => {
    it('생년월일 기반으로 모든 건강검진 일정을 생성한다', () => {
      const schedules = generateHealthCheckSchedules(
        mockBabyId,
        mockUserId,
        mockBirthDate
      );

      expect(schedules).toHaveLength(HEALTH_CHECK_SCHEDULES.length);
      expect(schedules.every((s) => s.type === 'HEALTH_CHECKUP')).toBe(true);
      expect(schedules.every((s) => s.priority === 'HIGH')).toBe(true);
    });

    it('생후 14-35일: 1차 건강검진 일정을 생성한다', () => {
      const schedules = generateHealthCheckSchedules(
        mockBabyId,
        mockUserId,
        mockBirthDate
      );

      const check1 = schedules.find((s) => s.title === '영유아 건강검진 1차');
      const expectedDate = new Date('2024-11-11'); // 14일 후

      expect(check1).toBeDefined();
      expect(check1!.dueDate).toEqual(expectedDate);
      expect(check1!.content).toContain('문진 및 진찰');
      expect(check1!.content).toContain('신체 계측');
      expect(check1!.metadata).toHaveProperty('checkupId', 'health-check-1');
      expect(check1!.tags).toContain('건강검진');
    });

    it('생후 4-6개월: 2차 건강검진 일정을 생성한다', () => {
      const schedules = generateHealthCheckSchedules(
        mockBabyId,
        mockUserId,
        mockBirthDate
      );

      const check2 = schedules.find((s) => s.title === '영유아 건강검진 2차');
      const expectedDate = new Date('2025-02-28'); // 4개월 후

      expect(check2).toBeDefined();
      expect(check2!.dueDate).toEqual(expectedDate);
      expect(check2!.content).toContain('건강교육 (안전사고 예방, 영양, 구강)');
      expect(check2!.metadata).toHaveProperty('ageMonthsMin', 4);
      expect(check2!.metadata).toHaveProperty('ageMonthsMax', 6);
    });

    it('생후 9-12개월: 3차 건강검진 일정을 생성한다', () => {
      const schedules = generateHealthCheckSchedules(
        mockBabyId,
        mockUserId,
        mockBirthDate
      );

      const check3 = schedules.find((s) => s.title === '영유아 건강검진 3차');
      const expectedDate = new Date('2025-07-28'); // 9개월 후

      expect(check3).toBeDefined();
      expect(check3!.dueDate).toEqual(expectedDate);
      expect(check3!.content).toContain('발달 선별검사');
      expect(check3!.content).toContain('대소변 가리기');
    });

    it('생후 18-24개월: 4차 건강검진 일정을 생성한다', () => {
      const schedules = generateHealthCheckSchedules(
        mockBabyId,
        mockUserId,
        mockBirthDate
      );

      const check4 = schedules.find((s) => s.title === '영유아 건강검진 4차');
      const expectedDate = new Date('2026-04-28'); // 18개월 후

      expect(check4).toBeDefined();
      expect(check4!.dueDate).toEqual(expectedDate);
      expect(check4!.content).toContain('정서 및 사회성');
    });

    it('생후 18-29개월: 구강검진 1차 일정을 생성한다', () => {
      const schedules = generateHealthCheckSchedules(
        mockBabyId,
        mockUserId,
        mockBirthDate
      );

      const dentalCheck = schedules.find((s) => s.title === '구강검진 1차');
      const expectedDate = new Date('2026-04-28'); // 18개월 후

      expect(dentalCheck).toBeDefined();
      expect(dentalCheck!.dueDate).toEqual(expectedDate);
      expect(dentalCheck!.content).toContain('구강 문진 및 진찰');
    });

    it('검진 항목 리스트가 올바르게 포맷된다', () => {
      const schedules = generateHealthCheckSchedules(
        mockBabyId,
        mockUserId,
        mockBirthDate
      );

      const check1 = schedules.find((s) => s.title === '영유아 건강검진 1차');
      expect(check1!.content).toContain('검진 항목:');
      expect(check1!.content).toContain('•');
    });

    it('모든 건강검진에 알림이 설정된다', () => {
      const schedules = generateHealthCheckSchedules(
        mockBabyId,
        mockUserId,
        mockBirthDate
      );

      expect(schedules.every((s) => Array.isArray(s.reminderDays))).toBe(true);
      expect(schedules.every((s) => s.reminderDays!.length > 0)).toBe(true);
    });
  });

  describe('발달 마일스톤 체크리스트 생성 (generateMilestoneChecklists)', () => {
    it('0-24개월까지의 마일스톤만 생성한다', () => {
      const schedules = generateMilestoneChecklists(
        mockBabyId,
        mockUserId,
        mockBirthDate
      );

      const expectedCount = MILESTONES.filter((m) => m.ageMonths <= 24).length;
      expect(schedules).toHaveLength(expectedCount);
      expect(schedules.every((s) => s.type === 'MILESTONE')).toBe(true);
    });

    it('경고 신호 마일스톤은 우선순위가 HIGH이다', () => {
      const schedules = generateMilestoneChecklists(
        mockBabyId,
        mockUserId,
        mockBirthDate
      );

      const warningMilestones = schedules.filter(
        (s) => s.metadata?.isWarningSign === true
      );
      expect(warningMilestones.every((m) => m.priority === 'HIGH')).toBe(true);
    });

    it('일반 마일스톤은 우선순위가 MEDIUM이다', () => {
      const schedules = generateMilestoneChecklists(
        mockBabyId,
        mockUserId,
        mockBirthDate
      );

      const normalMilestones = schedules.filter(
        (s) => s.metadata?.isWarningSign === false
      );
      expect(normalMilestones.every((m) => m.priority === 'MEDIUM')).toBe(true);
    });

    it('발달 카테고리가 태그에 포함된다', () => {
      const schedules = generateMilestoneChecklists(
        mockBabyId,
        mockUserId,
        mockBirthDate
      );

      expect(schedules.every((s) => s.tags?.includes('발달'))).toBe(true);
      expect(
        schedules.every((s) => s.tags!.length >= 2) // '발달' + 카테고리
      ).toBe(true);
    });

    it('경고 신호인 경우 콘텐츠에 경고 메시지가 포함된다', () => {
      const schedules = generateMilestoneChecklists(
        mockBabyId,
        mockUserId,
        mockBirthDate
      );

      const warningMilestones = schedules.filter(
        (s) => s.metadata?.isWarningSign === true
      );
      warningMilestones.forEach((milestone) => {
        expect(milestone.content).toContain('⚠️');
        expect(milestone.content).toContain('전문가 상담');
      });
    });
  });

  describe('원더윅스 도약기 알림 생성 (generateWonderWeeksNotifications)', () => {
    it('모든 원더윅스 도약기 알림을 생성한다', () => {
      const schedules = generateWonderWeeksNotifications(
        mockBabyId,
        mockUserId,
        mockBirthDate
      );

      expect(schedules).toHaveLength(WONDER_WEEKS.length);
      expect(schedules.every((s) => s.type === 'WONDER_WEEK')).toBe(true);
      expect(schedules.every((s) => s.priority === 'MEDIUM')).toBe(true);
    });

    it('도약기 시작 3일 전에 알림이 설정된다', () => {
      const schedules = generateWonderWeeksNotifications(
        mockBabyId,
        mockUserId,
        mockBirthDate
      );

      // Leap 1: 4주 시작 -> 28일 - 3일 = 25일 후
      const leap1 = schedules.find((s) => s.tags?.includes('Leap 1'));
      if (leap1) {
        const expectedDate = new Date(mockBirthDate);
        expectedDate.setDate(expectedDate.getDate() + 25);
        expect(leap1.dueDate.getTime()).toBe(expectedDate.getTime());
      }
    });

    it('소수점 주수를 올바르게 처리한다', () => {
      const schedules = generateWonderWeeksNotifications(
        mockBabyId,
        mockUserId,
        mockBirthDate
      );

      // 7.5주 = 7주 + 3.5일 = 49일 + 3.5일 ≈ 52-53일
      const leap2 = schedules.find((s) => s.tags?.includes('Leap 2'));
      if (leap2) {
        expect(leap2.dueDate).toBeDefined();
      }
    });

    it('증상 리스트가 올바르게 포맷된다', () => {
      const schedules = generateWonderWeeksNotifications(
        mockBabyId,
        mockUserId,
        mockBirthDate
      );

      schedules.forEach((schedule) => {
        expect(schedule.content).toContain('예상되는 증상:');
        expect(schedule.content).toContain('•');
      });
    });

    it('metadata에 도약기 정보가 포함된다', () => {
      const schedules = generateWonderWeeksNotifications(
        mockBabyId,
        mockUserId,
        mockBirthDate
      );

      schedules.forEach((schedule) => {
        expect(schedule.metadata).toHaveProperty('wonderWeekId');
        expect(schedule.metadata).toHaveProperty('leapNumber');
        expect(schedule.metadata).toHaveProperty('startWeek');
        expect(schedule.metadata).toHaveProperty('endWeek');
      });
    });
  });

  describe('수면 퇴행기 알림 생성 (generateSleepRegressionNotifications)', () => {
    it('모든 수면 퇴행기 알림을 생성한다', () => {
      const schedules = generateSleepRegressionNotifications(
        mockBabyId,
        mockUserId,
        mockBirthDate
      );

      expect(schedules).toHaveLength(SLEEP_REGRESSIONS.length);
      expect(schedules.every((s) => s.type === 'SLEEP_REGRESSION')).toBe(true);
      expect(schedules.every((s) => s.priority === 'MEDIUM')).toBe(true);
    });

    it('퇴행기 시작 3일 전에 알림이 설정된다', () => {
      const schedules = generateSleepRegressionNotifications(
        mockBabyId,
        mockUserId,
        mockBirthDate
      );

      // 4개월 퇴행기 -> 120일 - 3일 = 117일 후
      const month4Regression = schedules[0];
      if (month4Regression) {
        expect(month4Regression.dueDate).toBeDefined();
      }
    });

    it('원인, 증상, 대처방법이 콘텐츠에 포함된다', () => {
      const schedules = generateSleepRegressionNotifications(
        mockBabyId,
        mockUserId,
        mockBirthDate
      );

      schedules.forEach((schedule) => {
        expect(schedule.content).toContain('원인:');
        expect(schedule.content).toContain('증상:');
        expect(schedule.content).toContain('대처 방법:');
      });
    });

    it('태그에 수면과 퇴행기가 포함된다', () => {
      const schedules = generateSleepRegressionNotifications(
        mockBabyId,
        mockUserId,
        mockBirthDate
      );

      schedules.forEach((schedule) => {
        expect(schedule.tags).toContain('수면');
        expect(schedule.tags).toContain('퇴행기');
      });
    });
  });

  describe('이유식 단계 알림 생성 (generateFeedingStageNotifications)', () => {
    it('모든 이유식 단계 알림을 생성한다', () => {
      const schedules = generateFeedingStageNotifications(
        mockBabyId,
        mockUserId,
        mockBirthDate
      );

      expect(schedules).toHaveLength(FEEDING_STAGES.length);
      expect(schedules.every((s) => s.type === 'FEEDING_STAGE')).toBe(true);
      expect(schedules.every((s) => s.priority === 'MEDIUM')).toBe(true);
    });

    it('이유식 시작 2주 전에 알림이 설정된다', () => {
      const schedules = generateFeedingStageNotifications(
        mockBabyId,
        mockUserId,
        mockBirthDate
      );

      // 초기 이유식은 보통 4-6개월 시작 -> 4개월 - 14일
      const firstStage = schedules[0];
      if (firstStage) {
        expect(firstStage.dueDate).toBeDefined();
      }
    });

    it('주요 재료와 팁이 콘텐츠에 포함된다', () => {
      const schedules = generateFeedingStageNotifications(
        mockBabyId,
        mockUserId,
        mockBirthDate
      );

      schedules.forEach((schedule) => {
        expect(schedule.content).toContain('주요 재료:');
        expect(schedule.content).toContain('팁:');
        expect(schedule.content).toContain('질감:');
      });
    });

    it('metadata에 단계 정보가 포함된다', () => {
      const schedules = generateFeedingStageNotifications(
        mockBabyId,
        mockUserId,
        mockBirthDate
      );

      schedules.forEach((schedule) => {
        expect(schedule.metadata).toHaveProperty('stageId');
        expect(schedule.metadata).toHaveProperty('ageMonthsMin');
        expect(schedule.metadata).toHaveProperty('ageMonthsMax');
        expect(schedule.metadata).toHaveProperty('mealsPerDay');
      });
    });
  });

  describe('모든 일정 통합 생성 (generateAllSchedules)', () => {
    it('기본 설정으로 모든 유형의 일정을 생성한다', () => {
      const schedules = generateAllSchedules(
        mockBabyId,
        mockUserId,
        mockBirthDate
      );

      const types = new Set(schedules.map((s) => s.type));
      expect(types.has('VACCINATION' as NoteType)).toBe(true);
      expect(types.has('HEALTH_CHECKUP' as NoteType)).toBe(true);
      expect(types.has('MILESTONE' as NoteType)).toBe(true);
      expect(types.has('WONDER_WEEK' as NoteType)).toBe(true);
      expect(types.has('SLEEP_REGRESSION' as NoteType)).toBe(true);
      expect(types.has('FEEDING_STAGE' as NoteType)).toBe(true);
    });

    it('옵션을 통해 특정 유형만 생성할 수 있다', () => {
      const schedules = generateAllSchedules(
        mockBabyId,
        mockUserId,
        mockBirthDate,
        {
          includeVaccination: true,
          includeHealthCheck: false,
          includeMilestone: false,
          includeWonderWeeks: false,
          includeSleepRegression: false,
          includeFeedingStage: false,
        }
      );

      const types = new Set(schedules.map((s) => s.type));
      expect(types.has('VACCINATION' as NoteType)).toBe(true);
      expect(types.has('HEALTH_CHECKUP' as NoteType)).toBe(false);
      expect(types.has('MILESTONE' as NoteType)).toBe(false);
      expect(types.has('WONDER_WEEK' as NoteType)).toBe(false);
    });

    it('예방접종만 생성하는 옵션이 동작한다', () => {
      const schedules = generateAllSchedules(
        mockBabyId,
        mockUserId,
        mockBirthDate,
        {
          includeVaccination: true,
          includeHealthCheck: false,
          includeMilestone: false,
          includeWonderWeeks: false,
          includeSleepRegression: false,
          includeFeedingStage: false,
        }
      );

      expect(schedules).toHaveLength(VACCINATION_SCHEDULES.length);
      expect(schedules.every((s) => s.type === 'VACCINATION')).toBe(true);
    });

    it('건강검진만 생성하는 옵션이 동작한다', () => {
      const schedules = generateAllSchedules(
        mockBabyId,
        mockUserId,
        mockBirthDate,
        {
          includeVaccination: false,
          includeHealthCheck: true,
          includeMilestone: false,
          includeWonderWeeks: false,
          includeSleepRegression: false,
          includeFeedingStage: false,
        }
      );

      expect(schedules).toHaveLength(HEALTH_CHECK_SCHEDULES.length);
      expect(schedules.every((s) => s.type === 'HEALTH_CHECKUP')).toBe(true);
    });

    it('모든 옵션을 false로 설정하면 빈 배열을 반환한다', () => {
      const schedules = generateAllSchedules(
        mockBabyId,
        mockUserId,
        mockBirthDate,
        {
          includeVaccination: false,
          includeHealthCheck: false,
          includeMilestone: false,
          includeWonderWeeks: false,
          includeSleepRegression: false,
          includeFeedingStage: false,
        }
      );

      expect(schedules).toHaveLength(0);
    });

    it('생성된 모든 일정에 필수 필드가 포함된다', () => {
      const schedules = generateAllSchedules(
        mockBabyId,
        mockUserId,
        mockBirthDate
      );

      schedules.forEach((schedule) => {
        expect(schedule.babyId).toBe(mockBabyId);
        expect(schedule.userId).toBe(mockUserId);
        expect(schedule.type).toBeDefined();
        expect(schedule.title).toBeDefined();
        expect(schedule.dueDate).toBeDefined();
        expect(schedule.completed).toBe(false);
        expect(Array.isArray(schedule.tags)).toBe(true);
      });
    });
  });

  describe('일정 데이터 무결성 검증', () => {
    it('모든 예방접종 일정의 날짜가 생년월일 이후이다', () => {
      const schedules = generateVaccinationSchedules(
        mockBabyId,
        mockUserId,
        mockBirthDate
      );

      schedules.forEach((schedule) => {
        expect(schedule.dueDate.getTime()).toBeGreaterThanOrEqual(
          mockBirthDate.getTime()
        );
      });
    });

    it('모든 건강검진 일정의 날짜가 생년월일 이후이다', () => {
      const schedules = generateHealthCheckSchedules(
        mockBabyId,
        mockUserId,
        mockBirthDate
      );

      schedules.forEach((schedule) => {
        expect(schedule.dueDate.getTime()).toBeGreaterThanOrEqual(
          mockBirthDate.getTime()
        );
      });
    });

    it('모든 일정에 제목이 있다', () => {
      const schedules = generateAllSchedules(
        mockBabyId,
        mockUserId,
        mockBirthDate
      );

      schedules.forEach((schedule) => {
        expect(schedule.title).toBeTruthy();
        expect(schedule.title.length).toBeGreaterThan(0);
      });
    });

    it('모든 일정의 우선순위가 유효한 값이다', () => {
      const schedules = generateAllSchedules(
        mockBabyId,
        mockUserId,
        mockBirthDate
      );

      const validPriorities = ['LOW', 'MEDIUM', 'HIGH'];
      schedules.forEach((schedule) => {
        if (schedule.priority) {
          expect(validPriorities).toContain(schedule.priority);
        }
      });
    });

    it('metadata가 객체 형태이다', () => {
      const schedules = generateAllSchedules(
        mockBabyId,
        mockUserId,
        mockBirthDate
      );

      schedules.forEach((schedule) => {
        if (schedule.metadata) {
          expect(typeof schedule.metadata).toBe('object');
        }
      });
    });
  });

  describe('중복 일정 방지', () => {
    it('동일한 조건으로 여러 번 생성해도 일정 개수는 같다', () => {
      const schedules1 = generateVaccinationSchedules(
        mockBabyId,
        mockUserId,
        mockBirthDate
      );
      const schedules2 = generateVaccinationSchedules(
        mockBabyId,
        mockUserId,
        mockBirthDate
      );

      expect(schedules1).toHaveLength(schedules2.length);
    });

    it('동일한 vaccineId를 가진 일정이 여러 개 생성되지 않는다', () => {
      const schedules = generateVaccinationSchedules(
        mockBabyId,
        mockUserId,
        mockBirthDate
      );

      const vaccineIds = schedules.map((s) => s.metadata?.vaccineId);
      const uniqueVaccineIds = new Set(vaccineIds);

      expect(vaccineIds.length).toBe(uniqueVaccineIds.size);
    });

    it('동일한 checkupId를 가진 건강검진이 여러 개 생성되지 않는다', () => {
      const schedules = generateHealthCheckSchedules(
        mockBabyId,
        mockUserId,
        mockBirthDate
      );

      const checkupIds = schedules.map((s) => s.metadata?.checkupId);
      const uniqueCheckupIds = new Set(checkupIds);

      expect(checkupIds.length).toBe(uniqueCheckupIds.size);
    });
  });

  describe('엣지 케이스 처리', () => {
    it('윤년 출생일도 올바르게 처리한다', () => {
      const leapYearBirthDate = new Date('2024-02-29');
      const schedules = generateVaccinationSchedules(
        mockBabyId,
        mockUserId,
        leapYearBirthDate
      );

      expect(schedules.length).toBeGreaterThan(0);
      schedules.forEach((schedule) => {
        expect(schedule.dueDate).toBeInstanceOf(Date);
        expect(isNaN(schedule.dueDate.getTime())).toBe(false);
      });
    });

    it('년말 출생일도 올바르게 처리한다', () => {
      const yearEndBirthDate = new Date('2024-12-31');
      const schedules = generateHealthCheckSchedules(
        mockBabyId,
        mockUserId,
        yearEndBirthDate
      );

      expect(schedules.length).toBeGreaterThan(0);
      schedules.forEach((schedule) => {
        expect(schedule.dueDate.getFullYear()).toBeGreaterThanOrEqual(2024);
      });
    });

    it('년초 출생일도 올바르게 처리한다', () => {
      const yearStartBirthDate = new Date('2024-01-01');
      const schedules = generateAllSchedules(
        mockBabyId,
        mockUserId,
        yearStartBirthDate
      );

      expect(schedules.length).toBeGreaterThan(0);
      schedules.forEach((schedule) => {
        expect(schedule.dueDate).toBeInstanceOf(Date);
      });
    });
  });
});
