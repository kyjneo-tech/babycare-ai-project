/**
 * 원더윅스 (Wonder Weeks) 도약기 데이터
 * 출처: The Wonder Weeks 연구
 */

export type WonderWeek = {
  id: string;
  leapNumber: number;
  name: string;
  startWeek: number; // 시작 주수
  endWeek: number; // 종료 주수
  description: string;
  developmentChange: string;
  symptoms: string[];
};

export const WONDER_WEEKS: WonderWeek[] = [
  {
    id: 'leap-1',
    leapNumber: 1,
    name: 'Leap 1: 감각의 변화',
    startWeek: 4,
    endWeek: 5,
    description: '생후 4-5주',
    developmentChange: '주변 세계에 대한 감각이 변화하고 주변을 인식하기 시작합니다.',
    symptoms: ['보챔', '울음 증가', '엄마 집착'],
  },
  {
    id: 'leap-2',
    leapNumber: 2,
    name: 'Leap 2: 패턴 인식',
    startWeek: 7.5,
    endWeek: 9.5,
    description: '생후 7.5-9.5주 (약 2개월)',
    developmentChange: '패턴을 인식하고 일정한 리듬을 이해하기 시작합니다.',
    symptoms: ['보챔', '수면 패턴 변화', '젖병 거부'],
  },
  {
    id: 'leap-3',
    leapNumber: 3,
    name: 'Leap 3: 부드러운 변화',
    startWeek: 11.5,
    endWeek: 12.5,
    description: '생후 11.5-12.5주 (약 3개월)',
    developmentChange: '부드러운 변화와 움직임을 인식합니다.',
    symptoms: ['보챔', '낮잠 거부', '더 많은 관심 요구'],
  },
  {
    id: 'leap-4',
    leapNumber: 4,
    name: 'Leap 4: 사건의 연결',
    startWeek: 14.5,
    endWeek: 19.5,
    description: '생후 14.5-19.5주 (약 4-5개월)',
    developmentChange:
      '사건들이 연결되어 있다는 것을 이해합니다. 첫 번째 수면 퇴행기와 겹칩니다.',
    symptoms: ['심한 보챔', '밤잠 깸', '낮잠 거부', '먹기 거부'],
  },
  {
    id: 'leap-5',
    leapNumber: 5,
    name: 'Leap 5: 거리 개념',
    startWeek: 22.5,
    endWeek: 26.5,
    description: '생후 22.5-26.5주 (약 6개월)',
    developmentChange: '거리와 공간 개념을 인식하기 시작합니다.',
    symptoms: ['보챔', '엄마와의 거리에 민감', '분리불안 시작'],
  },
  {
    id: 'leap-6',
    leapNumber: 6,
    name: 'Leap 6: 물체 지속성',
    startWeek: 33.5,
    endWeek: 37.5,
    description: '생후 33.5-37.5주 (약 8-9개월)',
    developmentChange:
      '물체가 보이지 않아도 존재한다는 것을 이해합니다. 두 번째 수면 퇴행기와 겹칩니다.',
    symptoms: ['심한 보챔', '밤잠 깸', '분리불안 증가'],
  },
  {
    id: 'leap-7',
    leapNumber: 7,
    name: 'Leap 7: 순서 개념',
    startWeek: 41.5,
    endWeek: 46.5,
    description: '생후 41.5-46.5주 (약 10-11개월)',
    developmentChange: '사물과 행동의 순서를 이해하기 시작합니다.',
    symptoms: ['보챔', '고집 증가', '분리불안'],
  },
  {
    id: 'leap-8',
    leapNumber: 8,
    name: 'Leap 8: 프로그램 이해',
    startWeek: 50.5,
    endWeek: 54.5,
    description: '생후 50.5-54.5주 (약 12-13개월)',
    developmentChange: '목표를 달성하기 위한 프로그램을 이해합니다.',
    symptoms: ['보챔', '떼쓰기', '독립심과 의존 사이 갈등'],
  },
  {
    id: 'leap-9',
    leapNumber: 9,
    name: 'Leap 9: 원리 이해',
    startWeek: 59.5,
    endWeek: 64.5,
    description: '생후 59.5-64.5주 (약 15개월)',
    developmentChange: '사물과 행동의 원리를 이해하기 시작합니다.',
    symptoms: ['보챔', '고집', '감정 기복'],
  },
  {
    id: 'leap-10',
    leapNumber: 10,
    name: 'Leap 10: 시스템 이해',
    startWeek: 70.5,
    endWeek: 75.5,
    description: '생후 70.5-75.5주 (약 17-18개월)',
    developmentChange:
      '복잡한 시스템을 이해합니다. 세 번째 수면 퇴행기와 겹칩니다.',
    symptoms: ['심한 보챔', '떼쓰기', '밤잠 깸'],
  },
];
