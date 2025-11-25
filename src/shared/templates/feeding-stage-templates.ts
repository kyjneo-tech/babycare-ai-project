/**
 * 이유식 단계별 일정
 * 출처: 대한소아청소년과학회, WHO
 */

export type FeedingStage = {
  id: string;
  name: string;
  ageMonthsMin: number;
  ageMonthsMax: number;
  mealsPerDay: number;
  texture: string;
  mainIngredients: string[];
  tips: string[];
};

export const FEEDING_STAGES: FeedingStage[] = [
  {
    id: 'feeding-stage-early',
    name: '초기 이유식',
    ageMonthsMin: 5,
    ageMonthsMax: 6,
    mealsPerDay: 1,
    texture: '묽은 미음 (수프 농도)',
    mainIngredients: [
      '쌀미음',
      '단일 채소 (브로콜리, 감자, 단호박, 당근 등)',
    ],
    tips: [
      'WHO 권장: 만 6개월 시작',
      '한 가지 재료씩 3-5일 간격으로 시도',
      '알레르기 반응 관찰',
      '모유/분유는 계속 수유',
    ],
  },
  {
    id: 'feeding-stage-middle',
    name: '중기 이유식',
    ageMonthsMin: 7,
    ageMonthsMax: 8,
    mealsPerDay: 2,
    texture: '입자감 있는 죽',
    mainIngredients: [
      '곡류 (쌀, 현미 등)',
      '다양한 채소',
      '단백질 (쇠고기, 닭고기, 생선, 두부)',
    ],
    tips: [
      '하루 2회 이유식',
      '다양한 식재료 조합',
      '고기는 소량부터 시작',
    ],
  },
  {
    id: 'feeding-stage-late',
    name: '후기 이유식',
    ageMonthsMin: 9,
    ageMonthsMax: 11,
    mealsPerDay: 3,
    texture: '진밥 형태',
    mainIngredients: [
      '다양한 곡류',
      '모든 채소',
      '다양한 단백질',
      '손가락 음식 시작',
    ],
    tips: [
      '하루 3회 식사',
      '손가락 음식 제공 (스스로 먹기 연습)',
      '가족 식사 시간에 함께',
    ],
  },
  {
    id: 'feeding-stage-completion',
    name: '완료기 이유식',
    ageMonthsMin: 12,
    ageMonthsMax: 18,
    mealsPerDay: 3,
    texture: '밥 형태',
    mainIngredients: [
      '가족 식사 적응',
      '유제품 추가 (우유, 치즈, 요거트)',
      '다양한 간식',
    ],
    tips: [
      '하루 3회 식사 + 간식 2회',
      '가족과 같은 음식 (간은 약하게)',
      '우유 섭취 시작 (생후 12개월 이후)',
      '스스로 먹기 격려',
    ],
  },
];
