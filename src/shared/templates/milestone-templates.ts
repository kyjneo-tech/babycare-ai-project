/**
 * 대한소아청소년과학회 발달 마일스톤
 * 출처: 대한소아청소년과학회, CDC
 */

export type MilestoneCategory =
  | '대근육발달'
  | '소근육발달'
  | '언어발달'
  | '인지사회성발달';

export type Milestone = {
  id: string;
  category: MilestoneCategory;
  ageMonths: number;
  title: string;
  description: string;
  isWarningSign?: boolean; // 이 시기까지 못하면 전문가 상담 필요
};

export const MILESTONES: Milestone[] = [
  // 대근육 발달
  {
    id: 'gross-motor-2m',
    category: '대근육발달',
    ageMonths: 2,
    title: '엎드려서 머리 들기',
    description: '배를 바닥에 대고 엎드린 상태에서 머리를 들 수 있습니다.',
  },
  {
    id: 'gross-motor-4m',
    category: '대근육발달',
    ageMonths: 4,
    title: '뒤집기',
    description: '배에서 등으로, 또는 등에서 배로 몸을 뒤집을 수 있습니다.',
  },
  {
    id: 'gross-motor-6m',
    category: '대근육발달',
    ageMonths: 6,
    title: '혼자 앉기',
    description: '도움 없이 혼자 앉아 있을 수 있습니다.',
  },
  {
    id: 'gross-motor-7m',
    category: '대근육발달',
    ageMonths: 7,
    title: '배밀이',
    description: '배를 바닥에 대고 팔과 다리로 밀며 앞으로 나아갑니다.',
  },
  {
    id: 'gross-motor-9m',
    category: '대근육발달',
    ageMonths: 9,
    title: '기어다니기',
    description: '네 발로 기어다닐 수 있습니다.',
  },
  {
    id: 'gross-motor-10m',
    category: '대근육발달',
    ageMonths: 10,
    title: '잡고 서기',
    description: '가구나 손잡이를 잡고 일어서거나 서 있을 수 있습니다.',
  },
  {
    id: 'gross-motor-12m',
    category: '대근육발달',
    ageMonths: 12,
    title: '혼자 걷기',
    description: '도움 없이 혼자 몇 걸음 걸을 수 있습니다.',
    isWarningSign: true,
  },
  {
    id: 'gross-motor-15m',
    category: '대근육발달',
    ageMonths: 15,
    title: '안정적으로 걷기',
    description: '넘어지지 않고 안정적으로 걸을 수 있습니다.',
    isWarningSign: true,
  },
  {
    id: 'gross-motor-18m',
    category: '대근육발달',
    ageMonths: 18,
    title: '달리기',
    description: '빠르게 달릴 수 있습니다.',
  },
  {
    id: 'gross-motor-24m',
    category: '대근육발달',
    ageMonths: 24,
    title: '계단 오르기',
    description: '난간을 잡고 계단을 오르내릴 수 있습니다.',
  },

  // 소근육 발달
  {
    id: 'fine-motor-3m',
    category: '소근육발달',
    ageMonths: 3,
    title: '손을 입으로 가져가기',
    description: '손을 입으로 가져가 빨 수 있습니다.',
  },
  {
    id: 'fine-motor-6m',
    category: '소근육발달',
    ageMonths: 6,
    title: '물건 잡고 옮기기',
    description: '물건을 잡고 한 손에서 다른 손으로 옮길 수 있습니다.',
  },
  {
    id: 'fine-motor-9m',
    category: '소근육발달',
    ageMonths: 9,
    title: '엄지-검지로 집기',
    description: '엄지와 검지를 사용해 작은 물건을 집을 수 있습니다.',
  },
  {
    id: 'fine-motor-12m',
    category: '소근육발달',
    ageMonths: 12,
    title: '블록 2-3개 쌓기',
    description: '블록을 2-3개 정도 쌓을 수 있습니다.',
  },
  {
    id: 'fine-motor-15m',
    category: '소근육발달',
    ageMonths: 15,
    title: '숟가락질 시도',
    description: '숟가락을 들고 음식을 먹으려고 시도합니다.',
  },
  {
    id: 'fine-motor-18m',
    category: '소근육발달',
    ageMonths: 18,
    title: '낙서하기',
    description: '크레용이나 연필을 잡고 종이에 낙서할 수 있습니다.',
  },
  {
    id: 'fine-motor-24m',
    category: '소근육발달',
    ageMonths: 24,
    title: '블록 4개 이상 쌓기',
    description: '블록을 4개 이상 쌓을 수 있습니다.',
  },

  // 언어 발달
  {
    id: 'language-2m',
    category: '언어발달',
    ageMonths: 2,
    title: '옹알이 시작',
    description: '"아~", "우~" 같은 소리를 냅니다.',
  },
  {
    id: 'language-6m',
    category: '언어발달',
    ageMonths: 6,
    title: '자음 포함 옹알이',
    description: '"바바", "마마" 같은 자음이 포함된 옹알이를 합니다.',
  },
  {
    id: 'language-9m',
    category: '언어발달',
    ageMonths: 9,
    title: '의미 있는 단어',
    description: '"엄마", "아빠" 같은 의미 있는 단어를 말합니다.',
  },
  {
    id: 'language-12m',
    category: '언어발달',
    ageMonths: 12,
    title: '1-2개 단어 사용',
    description: '1-2개의 단어를 사용합니다.',
    isWarningSign: true,
  },
  {
    id: 'language-15m',
    category: '언어발달',
    ageMonths: 15,
    title: '5-10개 단어',
    description: '5-10개의 단어를 사용합니다.',
  },
  {
    id: 'language-18m',
    category: '언어발달',
    ageMonths: 18,
    title: '15개 이상 단어',
    description: '15개 이상의 단어를 사용합니다.',
    isWarningSign: true,
  },
  {
    id: 'language-24m',
    category: '언어발달',
    ageMonths: 24,
    title: '2-4단어 문장',
    description: '"엄마 주세요", "물 먹고 싶어" 같은 2-4단어 문장을 말합니다.',
    isWarningSign: true,
  },

  // 인지·사회성 발달
  {
    id: 'cognitive-2m',
    category: '인지사회성발달',
    ageMonths: 2,
    title: '얼굴 응시와 미소',
    description: '사람 얼굴을 응시하고 미소로 반응합니다.',
  },
  {
    id: 'cognitive-6m',
    category: '인지사회성발달',
    ageMonths: 6,
    title: '낯가림 시작',
    description: '낯선 사람을 경계하기 시작합니다.',
  },
  {
    id: 'cognitive-9m',
    category: '인지사회성발달',
    ageMonths: 9,
    title: '까꿍놀이와 물체 지속성',
    description: '까꿍놀이를 즐기고, 보이지 않는 물건도 존재한다는 것을 이해합니다.',
  },
  {
    id: 'cognitive-12m',
    category: '인지사회성발달',
    ageMonths: 12,
    title: '간단한 지시 따르기',
    description: '"주세요", "안녕" 같은 간단한 지시를 따릅니다.',
  },
  {
    id: 'cognitive-18m',
    category: '인지사회성발달',
    ageMonths: 18,
    title: '가상 놀이',
    description: '인형에게 밥 먹이기, 전화하는 흉내 등 가상 놀이를 합니다.',
    isWarningSign: true,
  },
  {
    id: 'cognitive-24m',
    category: '인지사회성발달',
    ageMonths: 24,
    title: '병렬놀이와 모방',
    description: '다른 아이 옆에서 같이 놀고, 행동을 모방합니다.',
  },
];
