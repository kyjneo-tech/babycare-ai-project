/**
 * 질병관리청 2024 표준 예방접종 일정
 * 출처: 질병관리청 예방접종도우미
 */

export type VaccinationSchedule = {
  id: string;
  name: string;
  disease: string;
  ageMonths?: number; // 생후 개월수
  ageWeeks?: number; // 생후 주수
  ageYears?: number; // 생후 년수
  description: string;
  isRequired: boolean; // 필수 여부
  reminderDays: number[]; // 알림 설정 (기본값)
  notes?: string;
};

export const VACCINATION_SCHEDULES: VaccinationSchedule[] = [
  // B형간염
  {
    id: 'hepb-1',
    name: 'B형간염 1차',
    disease: 'B형간염',
    ageMonths: 0,
    description: '출생 직후 (12시간 이내)',
    isRequired: true,
    reminderDays: [3, 0],
    notes: '생후 12시간 이내 접종 권장',
  },
  {
    id: 'hepb-2',
    name: 'B형간염 2차',
    disease: 'B형간염',
    ageMonths: 1,
    description: '생후 1개월',
    isRequired: true,
    reminderDays: [7, 3, 0],
  },
  {
    id: 'hepb-3',
    name: 'B형간염 3차',
    disease: 'B형간염',
    ageMonths: 6,
    description: '생후 6개월',
    isRequired: true,
    reminderDays: [7, 3, 0],
  },

  // BCG
  {
    id: 'bcg',
    name: 'BCG (피내용)',
    disease: '결핵',
    ageWeeks: 4,
    description: '생후 4주 이내',
    isRequired: true,
    reminderDays: [7, 3, 0],
    notes: '생후 4주 이내 접종',
  },

  // DTaP (디프테리아, 파상풍, 백일해)
  {
    id: 'dtap-1',
    name: 'DTaP 1차',
    disease: '디프테리아/파상풍/백일해',
    ageMonths: 2,
    description: '생후 2개월',
    isRequired: true,
    reminderDays: [7, 3, 0],
  },
  {
    id: 'dtap-2',
    name: 'DTaP 2차',
    disease: '디프테리아/파상풍/백일해',
    ageMonths: 4,
    description: '생후 4개월',
    isRequired: true,
    reminderDays: [7, 3, 0],
  },
  {
    id: 'dtap-3',
    name: 'DTaP 3차',
    disease: '디프테리아/파상풍/백일해',
    ageMonths: 6,
    description: '생후 6개월',
    isRequired: true,
    reminderDays: [7, 3, 0],
  },
  {
    id: 'dtap-4',
    name: 'DTaP 4차',
    disease: '디프테리아/파상풍/백일해',
    ageMonths: 15,
    description: '생후 15-18개월',
    isRequired: true,
    reminderDays: [14, 7, 0],
  },
  {
    id: 'dtap-5',
    name: 'DTaP 5차',
    disease: '디프테리아/파상풍/백일해',
    ageMonths: 19,
    description: '생후 19-23개월',
    isRequired: true,
    reminderDays: [14, 7, 0],
  },

  // IPV (폴리오)
  {
    id: 'ipv-1',
    name: 'IPV 1차',
    disease: '폴리오',
    ageMonths: 2,
    description: '생후 2개월',
    isRequired: true,
    reminderDays: [7, 3, 0],
  },
  {
    id: 'ipv-2',
    name: 'IPV 2차',
    disease: '폴리오',
    ageMonths: 4,
    description: '생후 4개월',
    isRequired: true,
    reminderDays: [7, 3, 0],
  },
  {
    id: 'ipv-3',
    name: 'IPV 3차',
    disease: '폴리오',
    ageMonths: 6,
    description: '생후 6개월',
    isRequired: true,
    reminderDays: [7, 3, 0],
  },
  {
    id: 'ipv-4',
    name: 'IPV 4차',
    disease: '폴리오',
    ageMonths: 18,
    description: '생후 18개월',
    isRequired: true,
    reminderDays: [14, 7, 0],
  },

  // Hib (b형헤모필루스인플루엔자)
  {
    id: 'hib-1',
    name: 'Hib 1차',
    disease: 'b형헤모필루스인플루엔자',
    ageMonths: 2,
    description: '생후 2개월',
    isRequired: true,
    reminderDays: [7, 3, 0],
  },
  {
    id: 'hib-2',
    name: 'Hib 2차',
    disease: 'b형헤모필루스인플루엔자',
    ageMonths: 4,
    description: '생후 4개월',
    isRequired: true,
    reminderDays: [7, 3, 0],
  },
  {
    id: 'hib-3',
    name: 'Hib 3차',
    disease: 'b형헤모필루스인플루엔자',
    ageMonths: 6,
    description: '생후 6개월',
    isRequired: true,
    reminderDays: [7, 3, 0],
  },
  {
    id: 'hib-4',
    name: 'Hib 4차',
    disease: 'b형헤모필루스인플루엔자',
    ageMonths: 12,
    description: '생후 12-15개월',
    isRequired: true,
    reminderDays: [14, 7, 0],
  },

  // PCV (폐렴구균)
  {
    id: 'pcv-1',
    name: 'PCV 1차',
    disease: '폐렴구균',
    ageMonths: 2,
    description: '생후 2개월',
    isRequired: true,
    reminderDays: [7, 3, 0],
  },
  {
    id: 'pcv-2',
    name: 'PCV 2차',
    disease: '폐렴구균',
    ageMonths: 4,
    description: '생후 4개월',
    isRequired: true,
    reminderDays: [7, 3, 0],
  },
  {
    id: 'pcv-3',
    name: 'PCV 3차',
    disease: '폐렴구균',
    ageMonths: 6,
    description: '생후 6개월',
    isRequired: true,
    reminderDays: [7, 3, 0],
  },
  {
    id: 'pcv-4',
    name: 'PCV 4차',
    disease: '폐렴구균',
    ageMonths: 12,
    description: '생후 12-15개월',
    isRequired: true,
    reminderDays: [14, 7, 0],
  },

  // 로타바이러스 (RV1 - 2회)
  {
    id: 'rv1-1',
    name: '로타바이러스 1차 (RV1)',
    disease: '로타바이러스 감염증',
    ageMonths: 2,
    description: '생후 2개월',
    isRequired: false,
    reminderDays: [7, 3, 0],
    notes: 'RV1 제품은 2회 접종',
  },
  {
    id: 'rv1-2',
    name: '로타바이러스 2차 (RV1)',
    disease: '로타바이러스 감염증',
    ageMonths: 4,
    description: '생후 4개월',
    isRequired: false,
    reminderDays: [7, 3, 0],
  },

  // MMR (홍역, 유행성이하선염, 풍진)
  {
    id: 'mmr-1',
    name: 'MMR 1차',
    disease: '홍역/유행성이하선염/풍진',
    ageMonths: 12,
    description: '생후 12-15개월',
    isRequired: true,
    reminderDays: [14, 7, 0],
  },
  {
    id: 'mmr-2',
    name: 'MMR 2차',
    disease: '홍역/유행성이하선염/풍진',
    ageMonths: 19,
    description: '생후 19-23개월',
    isRequired: true,
    reminderDays: [14, 7, 0],
  },

  // 수두
  {
    id: 'var',
    name: '수두',
    disease: '수두',
    ageMonths: 12,
    description: '생후 12-15개월',
    isRequired: true,
    reminderDays: [14, 7, 0],
  },

  // A형간염
  {
    id: 'hepa-1',
    name: 'A형간염 1차',
    disease: 'A형간염',
    ageMonths: 12,
    description: '생후 12-23개월',
    isRequired: true,
    reminderDays: [14, 7, 0],
  },
  {
    id: 'hepa-2',
    name: 'A형간염 2차',
    disease: 'A형간염',
    ageMonths: 18,
    description: '1차 접종 6개월 후',
    isRequired: true,
    reminderDays: [14, 7, 0],
    notes: '제품마다 간격 상이 (6-12개월)',
  },

  // 일본뇌염 (불활성화 백신)
  {
    id: 'je-inactivated-1',
    name: '일본뇌염 1차 (불활성화)',
    disease: '일본뇌염',
    ageMonths: 12,
    description: '생후 12-23개월',
    isRequired: true,
    reminderDays: [14, 7, 0],
  },
  {
    id: 'je-inactivated-2',
    name: '일본뇌염 2차 (불활성화)',
    disease: '일본뇌염',
    ageMonths: 13,
    description: '1차 접종 1개월 후',
    isRequired: true,
    reminderDays: [14, 7, 0],
  },

  // 인플루엔자
  {
    id: 'flu-1',
    name: '인플루엔자 1차',
    disease: '인플루엔자',
    ageMonths: 6,
    description: '생후 6개월 이상 (매년 접종)',
    isRequired: false,
    reminderDays: [14, 7, 0],
    notes: '매년 9월~2월 접종 권장',
  },
];
