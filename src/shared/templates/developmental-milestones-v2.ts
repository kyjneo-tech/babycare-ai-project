/**
 * 발달 이정표 데이터 (통합 버전 v2)
 *
 * 단일 소스 오브 트루스 (Single Source of Truth)
 * - 기존 milestone-templates.ts와 developmental-milestones.ts를 통합
 * - 2개월 단위로 24개월까지 제공
 * - 4가지 카테고리: 사회/정서, 언어, 대근육, 소근육
 */

export type MilestoneCategory = 'social' | 'language' | 'grossMotor' | 'fineMotor';

export interface CategoryInfo {
  icon: string;
  label: string;
  color: 'blue' | 'green' | 'orange' | 'purple';
  items: string[];
}

export interface DevelopmentalMilestone {
  id: string;
  ageMonths: number;
  title: string;
  categories: {
    social: CategoryInfo;
    language: CategoryInfo;
    grossMotor: CategoryInfo;
    fineMotor: CategoryInfo;
  };
}

export const DEVELOPMENTAL_MILESTONES: readonly DevelopmentalMilestone[] = [
  // 🎯 2개월
  {
    id: '2m',
    ageMonths: 2,
    title: '2개월 발달 이정표',
    categories: {
      social: {
        icon: '👥',
        label: '사회/정서',
        color: 'blue',
        items: [
          '사람에게 미소 짓기',
          '얼굴 보며 행복해함',
        ],
      },
      language: {
        icon: '💬',
        label: '언어',
        color: 'green',
        items: [
          '옹알이',
          '소리 나는 쪽 고개 돌림',
        ],
      },
      grossMotor: {
        icon: '🏃',
        label: '대근육',
        color: 'orange',
        items: [
          '엎드릴 때 머리·가슴 살짝 들기',
        ],
      },
      fineMotor: {
        icon: '✋',
        label: '소근육',
        color: 'purple',
        items: [
          '얼굴 주시',
          '물체 눈으로 따라감',
        ],
      },
    },
  },

  // 🎯 4개월
  {
    id: '4m',
    ageMonths: 4,
    title: '4개월 발달 이정표',
    categories: {
      social: {
        icon: '👥',
        label: '사회/정서',
        color: 'blue',
        items: [
          '낯익은 사람에 크게 웃음',
          '거울 반응',
        ],
      },
      language: {
        icon: '💬',
        label: '언어',
        color: 'green',
        items: [
          '웃음소리',
          '다양한 옹알이 (ba-ba)',
        ],
      },
      grossMotor: {
        icon: '🏃',
        label: '대근육',
        color: 'orange',
        items: [
          '머리 안정 가누기',
          '양방향 뒤집기',
        ],
      },
      fineMotor: {
        icon: '✋',
        label: '소근육',
        color: 'purple',
        items: [
          '장난감 향해 손 뻗기',
          '손-손 옮기기',
        ],
      },
    },
  },

  // 🎯 6개월
  {
    id: '6m',
    ageMonths: 6,
    title: '6개월 발달 이정표',
    categories: {
      social: {
        icon: '👥',
        label: '사회/정서',
        color: 'blue',
        items: [
          '낯 익은 사람 구분',
          '이름 부르면 반응',
        ],
      },
      language: {
        icon: '💬',
        label: '언어',
        color: 'green',
        items: [
          '자음 옹알이 (ba-ma-da)',
          '웃음으로 반응 끌어냄',
        ],
      },
      grossMotor: {
        icon: '🏃',
        label: '대근육',
        color: 'orange',
        items: [
          '혼자 앉기 시도',
          '양방향 뒤집기',
        ],
      },
      fineMotor: {
        icon: '✋',
        label: '소근육',
        color: 'purple',
        items: [
          '장난감 집고 흔들기',
          '일부러 떨어뜨리기',
        ],
      },
    },
  },

  // 🎯 9개월
  {
    id: '9m',
    ageMonths: 9,
    title: '9개월 발달 이정표',
    categories: {
      social: {
        icon: '👥',
        label: '사회/정서',
        color: 'blue',
        items: [
          '낯가림 시작',
          '까꿍놀이 즐김',
        ],
      },
      language: {
        icon: '💬',
        label: '언어',
        color: 'green',
        items: [
          '이름 부르면 고개 돌림',
          '자음 반복 옹알이',
        ],
      },
      grossMotor: {
        icon: '🏃',
        label: '대근육',
        color: 'orange',
        items: [
          '혼자 앉기',
          '배밀이/기기 시작',
        ],
      },
      fineMotor: {
        icon: '✋',
        label: '소근육',
        color: 'purple',
        items: [
          '엄지-검지 핀셋 집기',
          '물건 넣기/빼기',
        ],
      },
    },
  },

  // 🎯 12개월
  {
    id: '12m',
    ageMonths: 12,
    title: '12개월 발달 이정표',
    categories: {
      social: {
        icon: '👥',
        label: '사회/정서',
        color: 'blue',
        items: [
          '바이바이 손 흔들기',
          '물건 가리키며 요구',
        ],
      },
      language: {
        icon: '💬',
        label: '언어',
        color: 'green',
        items: [
          '엄마/아빠 의미있게 사용',
          '간단 지시 이해',
        ],
      },
      grossMotor: {
        icon: '🏃',
        label: '대근육',
        color: 'orange',
        items: [
          '잡고 서기',
          '가구 잡고 걷기',
          '첫걸음 시도',
        ],
      },
      fineMotor: {
        icon: '✋',
        label: '소근육',
        color: 'purple',
        items: [
          '블록 2개 쌓기',
          '컵 잡기',
        ],
      },
    },
  },

  // 🎯 15개월
  {
    id: '15m',
    ageMonths: 15,
    title: '15개월 발달 이정표',
    categories: {
      social: {
        icon: '👥',
        label: '사회/정서',
        color: 'blue',
        items: [
          '간단한 따라하기',
          '자기 주장 표현',
        ],
      },
      language: {
        icon: '💬',
        label: '언어',
        color: 'green',
        items: [
          '1-2개 단어 더 사용',
          '몸짓+말 조합',
        ],
      },
      grossMotor: {
        icon: '🏃',
        label: '대근육',
        color: 'orange',
        items: [
          '혼자 잘 걷기',
          '계단 시도',
        ],
      },
      fineMotor: {
        icon: '✋',
        label: '소근육',
        color: 'purple',
        items: [
          '블록 2-3개 쌓기',
          '숟가락질 시도',
        ],
      },
    },
  },

  // 🎯 18개월
  {
    id: '18m',
    ageMonths: 18,
    title: '18개월 발달 이정표',
    categories: {
      social: {
        icon: '👥',
        label: '사회/정서',
        color: 'blue',
        items: [
          '인형 밥먹이기 (가상놀이)',
          '평행놀이 시작',
        ],
      },
      language: {
        icon: '💬',
        label: '언어',
        color: 'green',
        items: [
          '3개 이상 단어 (엄마/아빠 제외)',
          '1단계 지시 따르기',
        ],
      },
      grossMotor: {
        icon: '🏃',
        label: '대근육',
        color: 'orange',
        items: [
          '계단 난간 잡고 오르기',
          '공 굴리기',
        ],
      },
      fineMotor: {
        icon: '✋',
        label: '소근육',
        color: 'purple',
        items: [
          '블록 3-4개 쌓기',
          '낙서 시작',
        ],
      },
    },
  },

  // 🎯 24개월
  {
    id: '24m',
    ageMonths: 24,
    title: '24개월 발달 이정표',
    categories: {
      social: {
        icon: '👥',
        label: '사회/정서',
        color: 'blue',
        items: [
          '역할놀이 확대',
          '그림에서 물건 찾기',
        ],
      },
      language: {
        icon: '💬',
        label: '언어',
        color: 'green',
        items: [
          '2단어 문장 (엄마 물)',
          '단어 50개',
        ],
      },
      grossMotor: {
        icon: '🏃',
        label: '대근육',
        color: 'orange',
        items: [
          '뛰기',
          '계단 한 칸씩 오르기',
          '공 던지기',
        ],
      },
      fineMotor: {
        icon: '✋',
        label: '소근육',
        color: 'purple',
        items: [
          '간단 퍼즐',
          '숟가락·포크 사용',
        ],
      },
    },
  },
] as const;

/**
 * 카테고리별 색상 매핑
 */
export const CATEGORY_COLORS: Record<MilestoneCategory, { bg: string; text: string; border: string }> = {
  social: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  language: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
  },
  grossMotor: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
  },
  fineMotor: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
  },
};

/**
 * 아기의 생년월일로부터 현재 개월수 계산
 */
export function calculateAgeInMonths(birthDate: Date): number {
  const now = new Date();
  const diffInMs = now.getTime() - birthDate.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  return Math.floor(diffInDays / 30.44); // 평균 월 일수
}

/**
 * 현재 개월수에 가장 가까운 이정표 찾기
 */
export function getNearestMilestone(ageMonths: number): DevelopmentalMilestone {
  const milestones = [...DEVELOPMENTAL_MILESTONES];

  // 정확히 일치하는 이정표가 있으면 반환
  const exactMatch = milestones.find(m => m.ageMonths === ageMonths);
  if (exactMatch) return exactMatch;

  // 가장 가까운 이정표 찾기
  const nearest = milestones.reduce((prev, curr) => {
    const prevDiff = Math.abs(prev.ageMonths - ageMonths);
    const currDiff = Math.abs(curr.ageMonths - ageMonths);
    return currDiff < prevDiff ? curr : prev;
  });

  return nearest;
}

/**
 * 현재 개월수에 권장되는 이정표 ID 찾기 (자동 포커스용)
 */
export function getRecommendedMilestoneId(ageMonths: number): string {
  return getNearestMilestone(ageMonths).id;
}
