/**
 * 수면 퇴행기 데이터
 * 출처: 수면 전문가 연구 및 소아과 자료
 */

export type SleepRegression = {
  id: string;
  name: string;
  ageMonths: number;
  description: string;
  causes: string[];
  symptoms: string[];
  tips: string[];
};

export const SLEEP_REGRESSIONS: SleepRegression[] = [
  {
    id: 'sleep-regression-4m',
    name: '4개월 수면 퇴행기',
    ageMonths: 4,
    description: '수면 호르몬 균형 변화로 인한 첫 번째 수면 퇴행기',
    causes: [
      '수면 사이클 변화 (성인형으로 전환)',
      '멜라토닌 분비 시작',
      '원더윅스 Leap 4와 겹침',
    ],
    symptoms: [
      '밤잠 자주 깸',
      '낮잠 짧아짐',
      '재우기 어려움',
      '보챔 증가',
    ],
    tips: [
      '일정한 수면 루틴 확립',
      '낮 활동량 충분히 유지',
      '수면 환경 어둡고 조용하게',
    ],
  },
  {
    id: 'sleep-regression-8m',
    name: '8-10개월 수면 퇴행기',
    ageMonths: 8,
    description: '대근육 발달과 분리불안으로 인한 수면 퇴행',
    causes: [
      '기기, 잡고 서기 등 대근육 발달',
      '분리불안 시작',
      '원더윅스 Leap 6와 겹침',
    ],
    symptoms: [
      '밤에 자다가 일어나서 앉거나 섬',
      '엄마 찾으며 울음',
      '낮잠 거부',
      '밤중 수유 증가',
    ],
    tips: [
      '낮에 충분히 기고 서는 연습',
      '잠들기 전 충분한 스킨십',
      '안정적인 수면 루틴 유지',
    ],
  },
  {
    id: 'sleep-regression-12m',
    name: '12개월 수면 퇴행기',
    ageMonths: 12,
    description: '걷기 시작과 독립심 증가로 인한 수면 퇴행',
    causes: ['걷기 시작', '독립심 증가', '낮잠 2회→1회 전환 시기'],
    symptoms: [
      '낮잠 거부',
      '밤에 놀고 싶어함',
      '재우기 오래 걸림',
    ],
    tips: [
      '낮잠 스케줄 조정 (2회→1회)',
      '저녁 활동량 조절',
      '일정한 취침 시간 유지',
    ],
  },
  {
    id: 'sleep-regression-15m',
    name: '15-18개월 수면 퇴행기',
    ageMonths: 15,
    description: '언어 폭발기와 독립심 충돌로 인한 수면 퇴행',
    causes: [
      '언어 폭발기',
      '독립심과 분리불안 충돌',
      '어금니 나기 (통증)',
    ],
    symptoms: [
      '낮잠/밤잠 거부',
      '떼쓰기',
      '밤중에 울며 깸',
    ],
    tips: [
      '일관된 수면 루틴',
      '낮 동안 충분한 감정 표현 기회',
      '잠들기 전 진정 활동',
    ],
  },
  {
    id: 'sleep-regression-24m',
    name: '24개월 수면 퇴행기',
    ageMonths: 24,
    description: '낮잠 감소 전환기와 악몽 시작',
    causes: ['낮잠 1회→0회 전환', '악몽 시작', '상상력 발달'],
    symptoms: [
      '낮잠 거부 또는 너무 늦게 잠',
      '밤에 악몽으로 깸',
      '침대 나오기',
    ],
    tips: [
      '낮잠 시간 조정 또는 제거',
      '잠들기 전 무서운 콘텐츠 피하기',
      '야간 조명 사용 고려',
    ],
  },
];
