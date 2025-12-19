import { PrismaClient, ActivityType } from '@prisma/client';

const prisma = new PrismaClient();

// 홍길순 아기 ID
const BABY_ID = 'cmiwoujws0009ue8p1rrsg8ek';
const USER_ID = 'cmib7rbf30000uewanot3b9jo';

// 한국 시간 기준 날짜 생성 헬퍼
function getKSTDate(year: number, month: number, day: number, hour: number, minute: number) {
  return new Date(year, month - 1, day, hour, minute, 0);
}

// 생후 월수에 따른 기본 수유량
function getBaseAmount(birthDate: Date, targetDate: Date) {
  const ageInMonths = Math.floor(
    (targetDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );

  if (ageInMonths < 2) return 90;
  if (ageInMonths < 6) return 120;
  if (ageInMonths < 12) return 180;
  return 200;
}

// 7일 주기 다양성 패턴
interface DayPattern {
  feedingTypes: string[];  // 하루에 사용할 수유 타입들
  diaperTypes: { morning: string; afternoon: string; evening: string };
  stoolCondition: string | null;
  hasFever: boolean;
  feverTemp?: number;
  medicine?: {
    name: string;
    amount: string;
    unit: string;
  };
}

const SEVEN_DAY_PATTERNS: DayPattern[] = [
  // Day 0 (목): 모유 중심, 정상
  {
    feedingTypes: ['breast', 'breast', 'breast', 'breast', 'breast'],
    diaperTypes: { morning: 'urine', afternoon: 'stool', evening: 'urine' },
    stoolCondition: 'normal',
    hasFever: false,
  },
  // Day 1 (금): 분유 중심, 묽은변, 고열
  {
    feedingTypes: ['formula', 'formula', 'formula', 'formula', 'formula'],
    diaperTypes: { morning: 'stool', afternoon: 'urine', evening: 'both' },
    stoolCondition: 'loose',
    hasFever: true,
    feverTemp: 39.2,
    medicine: {
      name: '타이레놀 (아세트아미노펜)',
      amount: '160',
      unit: 'mg (80mg/ml, 2ml)',
    },
  },
  // Day 2 (토): 유축 모유, 물설사, 고열
  {
    feedingTypes: ['pumped', 'pumped', 'pumped', 'pumped', 'pumped'],
    diaperTypes: { morning: 'both', afternoon: 'stool', evening: 'urine' },
    stoolCondition: 'watery',
    hasFever: true,
    feverTemp: 39.5,
    medicine: {
      name: '부루펜 (이부프로펜)',
      amount: '100',
      unit: 'mg (100mg/5ml, 5ml)',
    },
  },
  // Day 3 (일): 이유식 시작, 된변
  {
    feedingTypes: ['baby_food', 'formula', 'baby_food', 'formula', 'baby_food'],
    diaperTypes: { morning: 'urine', afternoon: 'stool', evening: 'urine' },
    stoolCondition: 'hard',
    hasFever: false,
  },
  // Day 4 (월): 모유+분유 혼합, 고열
  {
    feedingTypes: ['breast', 'formula', 'breast', 'formula', 'breast'],
    diaperTypes: { morning: 'stool', afternoon: 'urine', evening: 'both' },
    stoolCondition: 'normal',
    hasFever: true,
    feverTemp: 39.8,
    medicine: {
      name: '이지엔6 (덱시부프로펜)',
      amount: '75',
      unit: 'mg (50mg/5ml, 7.5ml)',
    },
  },
  // Day 5 (화): 분유+유축, 묽은변
  {
    feedingTypes: ['pumped', 'formula', 'pumped', 'formula', 'pumped'],
    diaperTypes: { morning: 'both', afternoon: 'stool', evening: 'urine' },
    stoolCondition: 'loose',
    hasFever: false,
  },
  // Day 6 (수): 모유+이유식, 정상
  {
    feedingTypes: ['breast', 'baby_food', 'breast', 'baby_food', 'breast'],
    diaperTypes: { morning: 'urine', afternoon: 'both', evening: 'stool' },
    stoolCondition: 'normal',
    hasFever: false,
  },
];

function getPatternForDay(dayIndex: number): DayPattern {
  return SEVEN_DAY_PATTERNS[dayIndex % 7];
}

// 의미있는 메모 생성
function generateMemo(type: ActivityType, pattern: DayPattern, timeIndex: number): string {
  const memos = {
    FEEDING: {
      breast: ['모유 수유 잘했어요 💕', '직수 20분 동안 먹었어요', '양쪽 가슴 골고루 먹었어요'],
      formula: ['분유 잘 먹었어요 🍼', '트림도 잘했어요', '배고팠나봐요 꿀꺽꿀꺽'],
      pumped: ['유축 모유 먹였어요', '냉동 모유 해동해서 먹였어요', '유축 모유 잘 먹네요'],
      baby_food: ['이유식 잘 먹었어요 🥄', '새 재료 넣어봤어요', '한 그릇 다 먹었어요'],
    },
    SLEEP: ['꿀잠 자는 중 💤', '잘 자고 있어요', '푹 자고 일어났어요'],
    DIAPER: {
      normal: ['기저귀 교체 완료!', '응가 잘 했어요 💩', '정상 변이에요'],
      loose: ['묽은 변이에요. 관찰 중', '설사 기운이 있어요', '물 많이 먹이는 중'],
      watery: ['물설사예요 ⚠️', '탈수 주의 필요', '소아과 전화 상담했어요'],
      hard: ['된 변이에요', '변비 기운 있어요', '수분 섭취 늘려야겠어요'],
    },
    TEMPERATURE: (temp: number) =>
      temp >= 39 ? ['고열이에요! 주의 필요', '열이 많이 나요', '약 먹여야겠어요']
               : temp >= 37.5 ? ['미열 있어요', '열 올라가는 중', '계속 체크 중']
               : ['정상 체온이에요', '체온 정상', '건강해요!'],
    MEDICINE: ['약 잘 먹였어요', '의사 선생님 처방대로', '열 떨어지길 기도'],
  };

  if (type === ActivityType.FEEDING) {
    const feedingType = pattern.feedingTypes[timeIndex] || 'formula';
    const options = memos.FEEDING[feedingType as keyof typeof memos.FEEDING] || memos.FEEDING.formula;
    return options[Math.floor(Math.random() * options.length)];
  }

  if (type === ActivityType.DIAPER && pattern.stoolCondition) {
    const options = memos.DIAPER[pattern.stoolCondition as keyof typeof memos.DIAPER] || memos.DIAPER.normal;
    return options[Math.floor(Math.random() * options.length)];
  }

  if (type === ActivityType.TEMPERATURE) {
    const temp = pattern.feverTemp || 36.8;
    const options = memos.TEMPERATURE(temp);
    return options[Math.floor(Math.random() * options.length)];
  }

  const defaultOptions = memos[type] as string[] || [''];
  return defaultOptions[Math.floor(Math.random() * defaultOptions.length)];
}

// 하루 스케줄 생성
async function generateDaySchedule(date: Date, babyBirthDate: Date, dayOfWeek: number) {
  const activities = [];
  const pattern = getPatternForDay(dayOfWeek);
  const baseAmount = getBaseAmount(babyBirthDate, date);

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // 1. 새벽 수유 (06:00)
  const feeding1Type = pattern.feedingTypes[0];
  activities.push({
    babyId: BABY_ID,
    userId: USER_ID,
    type: ActivityType.FEEDING,
    startTime: getKSTDate(year, month, day, 6, 0),
    endTime: getKSTDate(year, month, day, 6, feeding1Type === 'breast' ? 25 : 20),
    feedingType: feeding1Type,
    feedingAmount: feeding1Type === 'breast' ? null : baseAmount,
    duration: feeding1Type === 'breast' ? 25 : null,
    breastSide: feeding1Type === 'breast' ? 'both' : null,
    memo: generateMemo(ActivityType.FEEDING, pattern, 0),
  });

  // 2. 아침 기저귀 (07:00)
  activities.push({
    babyId: BABY_ID,
    userId: USER_ID,
    type: ActivityType.DIAPER,
    startTime: getKSTDate(year, month, day, 7, 0),
    diaperType: pattern.diaperTypes.morning,
    stoolCondition: pattern.diaperTypes.morning.includes('stool') ? pattern.stoolCondition : null,
    memo: generateMemo(ActivityType.DIAPER, pattern, 0),
  });

  // 3. 오전 수유 (10:00)
  const feeding2Type = pattern.feedingTypes[1];
  activities.push({
    babyId: BABY_ID,
    userId: USER_ID,
    type: ActivityType.FEEDING,
    startTime: getKSTDate(year, month, day, 10, 0),
    endTime: getKSTDate(year, month, day, 10, feeding2Type === 'breast' ? 20 : 25),
    feedingType: feeding2Type,
    feedingAmount: feeding2Type === 'breast' ? null : (feeding2Type === 'baby_food' ? 150 : baseAmount + Math.floor(Math.random() * 30 - 15)),
    duration: feeding2Type === 'breast' ? 20 : null,
    breastSide: feeding2Type === 'breast' ? 'left' : null,
    memo: generateMemo(ActivityType.FEEDING, pattern, 1),
  });

  // 4. 낮잠 (11:00 - 13:00)
  activities.push({
    babyId: BABY_ID,
    userId: USER_ID,
    type: ActivityType.SLEEP,
    startTime: getKSTDate(year, month, day, 11, 0),
    endTime: getKSTDate(year, month, day, 13, 0),
    duration: 120,
    sleepType: 'nap',
    memo: generateMemo(ActivityType.SLEEP, pattern, 0),
  });

  // 5. 점심 수유 (14:00)
  const feeding3Type = pattern.feedingTypes[2];
  activities.push({
    babyId: BABY_ID,
    userId: USER_ID,
    type: ActivityType.FEEDING,
    startTime: getKSTDate(year, month, day, 14, 0),
    endTime: getKSTDate(year, month, day, 14, feeding3Type === 'breast' ? 22 : 20),
    feedingType: feeding3Type,
    feedingAmount: feeding3Type === 'breast' ? null : (feeding3Type === 'baby_food' ? 180 : baseAmount),
    duration: feeding3Type === 'breast' ? 22 : null,
    breastSide: feeding3Type === 'breast' ? 'right' : null,
    memo: generateMemo(ActivityType.FEEDING, pattern, 2),
  });

  // 6. 오후 기저귀 (15:00)
  activities.push({
    babyId: BABY_ID,
    userId: USER_ID,
    type: ActivityType.DIAPER,
    startTime: getKSTDate(year, month, day, 15, 0),
    diaperType: pattern.diaperTypes.afternoon,
    stoolCondition: pattern.diaperTypes.afternoon.includes('stool') ? pattern.stoolCondition : null,
    memo: generateMemo(ActivityType.DIAPER, pattern, 1),
  });

  // 7. 저녁 수유 (18:00)
  const feeding4Type = pattern.feedingTypes[3];
  activities.push({
    babyId: BABY_ID,
    userId: USER_ID,
    type: ActivityType.FEEDING,
    startTime: getKSTDate(year, month, day, 18, 0),
    endTime: getKSTDate(year, month, day, 18, feeding4Type === 'breast' ? 25 : 25),
    feedingType: feeding4Type,
    feedingAmount: feeding4Type === 'breast' ? null : (feeding4Type === 'baby_food' ? 200 : baseAmount + 20),
    duration: feeding4Type === 'breast' ? 25 : null,
    breastSide: feeding4Type === 'breast' ? 'both' : null,
    memo: generateMemo(ActivityType.FEEDING, pattern, 3),
  });

  // 8. 저녁 체온 측정 (19:00)
  const eveningTemp = pattern.hasFever
    ? (pattern.feverTemp || 39.0)
    : 36.5 + Math.random() * 0.8; // 36.5 ~ 37.3

  activities.push({
    babyId: BABY_ID,
    userId: USER_ID,
    type: ActivityType.TEMPERATURE,
    startTime: getKSTDate(year, month, day, 19, 0),
    temperature: parseFloat(eveningTemp.toFixed(1)),
    memo: generateMemo(ActivityType.TEMPERATURE, pattern, 0),
  });

  // 9. 해열제 (고열일 경우)
  if (pattern.hasFever && pattern.medicine) {
    activities.push({
      babyId: BABY_ID,
      userId: USER_ID,
      type: ActivityType.MEDICINE,
      startTime: getKSTDate(year, month, day, 19, 30),
      medicineName: pattern.medicine.name,
      medicineAmount: pattern.medicine.amount,
      medicineUnit: pattern.medicine.unit,
      memo: generateMemo(ActivityType.MEDICINE, pattern, 0),
    });
  }

  // 10. 저녁 기저귀 (20:00)
  activities.push({
    babyId: BABY_ID,
    userId: USER_ID,
    type: ActivityType.DIAPER,
    startTime: getKSTDate(year, month, day, 20, 0),
    diaperType: pattern.diaperTypes.evening,
    stoolCondition: pattern.diaperTypes.evening.includes('stool') ? pattern.stoolCondition : null,
    memo: generateMemo(ActivityType.DIAPER, pattern, 2),
  });

  // 11. 밤 수유 (21:00)
  const feeding5Type = pattern.feedingTypes[4];
  activities.push({
    babyId: BABY_ID,
    userId: USER_ID,
    type: ActivityType.FEEDING,
    startTime: getKSTDate(year, month, day, 21, 0),
    endTime: getKSTDate(year, month, day, 21, feeding5Type === 'breast' ? 20 : 20),
    feedingType: feeding5Type,
    feedingAmount: feeding5Type === 'breast' ? null : (feeding5Type === 'baby_food' ? 100 : baseAmount),
    duration: feeding5Type === 'breast' ? 20 : null,
    breastSide: feeding5Type === 'breast' ? 'both' : null,
    memo: generateMemo(ActivityType.FEEDING, pattern, 4),
  });

  // 12. 밤잠 (22:00 - 익일 06:00)
  activities.push({
    babyId: BABY_ID,
    userId: USER_ID,
    type: ActivityType.SLEEP,
    startTime: getKSTDate(year, month, day, 22, 0),
    endTime: getKSTDate(year, month, day + 1, 6, 0),
    duration: 480, // 8시간
    sleepType: 'night',
    memo: generateMemo(ActivityType.SLEEP, pattern, 1),
  });

  return activities;
}

async function main() {
  console.log('🚀 홍길순 다양한 데이터 생성 시작...\n');

  // 홍길순 정보 조회
  const baby = await prisma.baby.findFirst({
    where: {
      name: '홍길순',
    },
  });

  if (!baby) {
    console.error('❌ 홍길순을 찾을 수 없습니다.');
    return;
  }

  console.log(`✅ 아기 정보: ${baby.name} (생년월일: ${baby.birthDate.toLocaleDateString('ko-KR')})\n`);

  // 기존 데이터 삭제
  console.log('🗑️  기존 데이터 삭제 중...');
  const deleted = await prisma.activity.deleteMany({
    where: { babyId: baby.id },
  });
  console.log(`   삭제된 기록: ${deleted.count}개\n`);

  // 오늘을 제외한 과거 7일 (12월 12일 ~ 12월 18일)
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 7); // 7일 전

  const endDate = new Date(today);
  endDate.setDate(today.getDate() - 1); // 어제

  console.log(`📅 과거 데이터 생성: ${startDate.toLocaleDateString('ko-KR')} ~ ${endDate.toLocaleDateString('ko-KR')}\n`);

  let currentDate = new Date(startDate);
  let totalActivities = 0;
  let dayCount = 0;

  // 과거 7일
  while (currentDate <= endDate) {
    const pattern = getPatternForDay(dayCount);
    console.log(`📆 ${currentDate.toLocaleDateString('ko-KR')} (${['일','월','화','수','목','금','토'][currentDate.getDay()]}) - ${pattern.feedingTypes[0] === 'breast' ? '모유' : pattern.feedingTypes[0] === 'formula' ? '분유' : pattern.feedingTypes[0] === 'pumped' ? '유축' : '이유식'} 중심${pattern.hasFever ? ', 고열+투약' : ''}`);

    const dayActivities = await generateDaySchedule(currentDate, baby.birthDate, dayCount);

    for (const activity of dayActivities) {
      await prisma.activity.create({
        data: { ...activity, babyId: baby.id },
      });
      totalActivities++;
    }

    currentDate.setDate(currentDate.getDate() + 1);
    dayCount++;
  }

  // 오늘부터 1월 31일까지
  const futureStart = new Date(today);
  const futureEnd = new Date(2026, 0, 31); // 2026년 1월 31일

  console.log(`\n📅 미래 데이터 생성: ${futureStart.toLocaleDateString('ko-KR')} ~ ${futureEnd.toLocaleDateString('ko-KR')}\n`);

  currentDate = new Date(futureStart);

  while (currentDate <= futureEnd) {
    const pattern = getPatternForDay(dayCount);
    console.log(`📆 ${currentDate.toLocaleDateString('ko-KR')} (${['일','월','화','수','목','금','토'][currentDate.getDay()]}) - ${pattern.feedingTypes[0] === 'breast' ? '모유' : pattern.feedingTypes[0] === 'formula' ? '분유' : pattern.feedingTypes[0] === 'pumped' ? '유축' : '이유식'} 중심${pattern.hasFever ? ', 고열+투약' : ''}`);

    const dayActivities = await generateDaySchedule(currentDate, baby.birthDate, dayCount);

    for (const activity of dayActivities) {
      await prisma.activity.create({
        data: { ...activity, babyId: baby.id },
      });
      totalActivities++;
    }

    currentDate.setDate(currentDate.getDate() + 1);
    dayCount++;
  }

  console.log(`\n✅ 완료! 총 ${totalActivities}개의 다양한 활동 기록 생성`);
  console.log(`\n📊 생성된 데이터 요약:`);
  console.log(`   - 수유: 모유, 분유, 유축, 이유식 골고루 포함`);
  console.log(`   - 기저귀: 소변, 대변, 둘다 포함`);
  console.log(`   - 변 상태: 정상, 묽은변, 물설사, 된변 포함`);
  console.log(`   - 투약: 아세트아미노펜, 이부프로펜, 덱시부프로펜 (용량/농도 포함)`);
  console.log(`   - 체온: 정상~고열(39도 이상) 포함`);
  console.log(`   - 수면: 낮잠, 밤잠 포함`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
