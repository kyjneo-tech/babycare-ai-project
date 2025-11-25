/**
 * 국민건강보험공단 영유아 건강검진 일정
 * 출처: 국민건강보험공단
 */

export type HealthCheckSchedule = {
  id: string;
  name: string;
  ageMonthsMin: number; // 최소 개월수
  ageMonthsMax: number; // 최대 개월수
  ageDaysMin: number; // 최소 일수 (신생아용)
  ageDaysMax: number; // 최대 일수 (신생아용)
  description: string;
  checkItems: string[];
  reminderDays: number[];
};

export const HEALTH_CHECK_SCHEDULES: HealthCheckSchedule[] = [
  {
    id: 'health-check-1',
    name: '영유아 건강검진 1차',
    ageMonthsMin: 0,
    ageMonthsMax: 0,
    ageDaysMin: 14,
    ageDaysMax: 35,
    description: '생후 14-35일',
    checkItems: [
      '문진 및 진찰',
      '신체 계측 (키, 몸무게, 머리둘레)',
      '건강교육 (안전사고 예방, 영양, 수면)',
    ],
    reminderDays: [7, 3, 0],
  },
  {
    id: 'health-check-2',
    name: '영유아 건강검진 2차',
    ageMonthsMin: 4,
    ageMonthsMax: 6,
    ageDaysMin: 0,
    ageDaysMax: 0,
    description: '생후 4-6개월',
    checkItems: [
      '문진 및 진찰',
      '신체 계측',
      '건강교육 (안전사고 예방, 영양, 구강)',
    ],
    reminderDays: [14, 7, 0],
  },
  {
    id: 'health-check-3',
    name: '영유아 건강검진 3차',
    ageMonthsMin: 9,
    ageMonthsMax: 12,
    ageDaysMin: 0,
    ageDaysMax: 0,
    description: '생후 9-12개월',
    checkItems: [
      '문진 및 진찰',
      '신체 계측',
      '발달 선별검사',
      '건강교육 (안전사고 예방, 영양, 대소변 가리기)',
    ],
    reminderDays: [14, 7, 0],
  },
  {
    id: 'health-check-4',
    name: '영유아 건강검진 4차',
    ageMonthsMin: 18,
    ageMonthsMax: 24,
    ageDaysMin: 0,
    ageDaysMax: 0,
    description: '생후 18-24개월',
    checkItems: [
      '문진 및 진찰',
      '신체 계측',
      '발달 선별검사',
      '건강교육 (안전사고 예방, 영양, 정서 및 사회성)',
    ],
    reminderDays: [14, 7, 0],
  },
  {
    id: 'dental-check-1',
    name: '구강검진 1차',
    ageMonthsMin: 18,
    ageMonthsMax: 29,
    ageDaysMin: 0,
    ageDaysMax: 0,
    description: '생후 18-29개월',
    checkItems: ['구강 문진 및 진찰', '구강보건교육'],
    reminderDays: [14, 7, 0],
  },
];
