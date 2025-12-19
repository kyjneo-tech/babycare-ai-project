import { PrismaClient, ActivityType } from '@prisma/client';

const prisma = new PrismaClient();

// 홍길순 아기 ID
const BABY_ID = 'cmiwoujws0009ue8p1rrsg8ek';
const USER_ID = 'cmib7rbf30000uewanot3b9jo';

// 한국 시간 기준 날짜 생성 헬퍼
function getKSTDate(year: number, month: number, day: number, hour: number, minute: number) {
  return new Date(year, month - 1, day, hour, minute, 0);
}

// 생후 월수에 따른 정상 스케줄 패턴
function getNormalSchedule(birthDate: Date, targetDate: Date) {
  const ageInMonths = Math.floor(
    (targetDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );

  // 신생아~2개월 (약 2-3시간 간격 수유)
  if (ageInMonths < 2) {
    return {
      feedingInterval: 3,
      sleepInterval: 2,
      feedingAmount: 90, // 90ml (신생아)
    };
  }
  // 2-6개월 아기 기준 (약 3-4시간 간격 수유)
  else if (ageInMonths < 6) {
    return {
      feedingInterval: 3,
      sleepInterval: 2,
      feedingAmount: 120,
    };
  }
  // 6-12개월 아기 (약 4시간 간격 수유)
  else if (ageInMonths < 12) {
    return {
      feedingInterval: 4,
      sleepInterval: 3,
      feedingAmount: 180,
    };
  }
  // 12개월 이상 (3끼 + 간식)
  else {
    return {
      feedingInterval: 5,
      sleepInterval: 4,
      feedingAmount: 200,
    };
  }
}

// 의미있는 메모 생성
function generateMemo(type: ActivityType, hour: number, temp?: number) {
  const memos = {
    FEEDING: [
      '잘 먹었어요 ❤️',
      '배고팠나봐요. 꿀꺽꿀꺽 잘 먹네요',
      '오늘은 조금 덜 먹었어요',
      '식욕이 좋아요!',
      '트림도 잘 했어요',
    ],
    SLEEP: [
      '꿀잠 자는 중 💤',
      '잘 자고 있어요',
      '낮잠 시간이에요',
      '자다가 한번 깼다가 다시 잠들었어요',
      '푹 자고 일어났어요',
    ],
    DIAPER: [
      '기저귀 교체 완료!',
      '응가 잘 했어요 💩',
      '소변 기저귀 갈아줬어요',
      '기저귀 발진 없이 깨끗해요',
      '묽은 변이에요. 조금 주의 필요',
    ],
    TEMPERATURE: temp && temp >= 37.5
      ? ['열이 조금 있어요. 계속 관찰 중', '체온이 높네요. 주의해서 봐야겠어요', '미열이 있어요']
      : ['정상 체온이에요', '체온 정상', '건강해요!'],
    MEDICINE: [
      '해열제 먹였어요',
      '열 때문에 약 복용',
      '의사 선생님 처방대로 먹였어요',
      '약 잘 먹었어요',
    ],
  };

  const options = memos[type] || [''];
  return options[Math.floor(Math.random() * options.length)];
}

// 하루 스케줄 생성
async function generateDaySchedule(date: Date, babyBirthDate: Date) {
  const activities = [];
  const schedule = getNormalSchedule(babyBirthDate, date);

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // 체온 측정 (아침 1회, 저녁 1회)
  const morningTemp = 36.5 + Math.random() * 0.8; // 36.5 ~ 37.3
  const eveningTemp = 36.5 + Math.random() * 1.2; // 36.5 ~ 37.7
  const hasFever = eveningTemp >= 37.5;

  // 1. 새벽 수유 (06:00)
  activities.push({
    babyId: BABY_ID,
    userId: USER_ID,
    type: ActivityType.FEEDING,
    startTime: getKSTDate(year, month, day, 6, 0),
    endTime: getKSTDate(year, month, day, 6, 20),
    feedingType: 'formula',
    feedingAmount: schedule.feedingAmount,
    memo: generateMemo(ActivityType.FEEDING, 6),
  });

  // 2. 아침 기저귀 (07:00)
  activities.push({
    babyId: BABY_ID,
    userId: USER_ID,
    type: ActivityType.DIAPER,
    startTime: getKSTDate(year, month, day, 7, 0),
    diaperType: Math.random() > 0.5 ? 'stool' : 'urine',
    stoolCondition: Math.random() > 0.7 ? 'loose' : 'normal',
    memo: generateMemo(ActivityType.DIAPER, 7),
  });

  // 3. 오전 수유 (10:00)
  activities.push({
    babyId: BABY_ID,
    userId: USER_ID,
    type: ActivityType.FEEDING,
    startTime: getKSTDate(year, month, day, 10, 0),
    endTime: getKSTDate(year, month, day, 10, 25),
    feedingType: 'formula',
    feedingAmount: schedule.feedingAmount + Math.floor(Math.random() * 30 - 15),
    memo: generateMemo(ActivityType.FEEDING, 10),
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
    memo: generateMemo(ActivityType.SLEEP, 11),
  });

  // 5. 점심 수유 (14:00)
  activities.push({
    babyId: BABY_ID,
    userId: USER_ID,
    type: ActivityType.FEEDING,
    startTime: getKSTDate(year, month, day, 14, 0),
    endTime: getKSTDate(year, month, day, 14, 20),
    feedingType: 'formula',
    feedingAmount: schedule.feedingAmount,
    memo: generateMemo(ActivityType.FEEDING, 14),
  });

  // 6. 오후 기저귀 (15:00)
  activities.push({
    babyId: BABY_ID,
    userId: USER_ID,
    type: ActivityType.DIAPER,
    startTime: getKSTDate(year, month, day, 15, 0),
    diaperType: 'urine',
    memo: generateMemo(ActivityType.DIAPER, 15),
  });

  // 7. 저녁 수유 (18:00)
  activities.push({
    babyId: BABY_ID,
    userId: USER_ID,
    type: ActivityType.FEEDING,
    startTime: getKSTDate(year, month, day, 18, 0),
    endTime: getKSTDate(year, month, day, 18, 25),
    feedingType: 'formula',
    feedingAmount: schedule.feedingAmount + 20,
    memo: generateMemo(ActivityType.FEEDING, 18),
  });

  // 8. 저녁 체온 측정 (19:00)
  activities.push({
    babyId: BABY_ID,
    userId: USER_ID,
    type: ActivityType.TEMPERATURE,
    startTime: getKSTDate(year, month, day, 19, 0),
    temperature: parseFloat(eveningTemp.toFixed(1)),
    memo: generateMemo(ActivityType.TEMPERATURE, 19, eveningTemp),
  });

  // 9. 해열제 (열이 있을 경우)
  if (hasFever) {
    activities.push({
      babyId: BABY_ID,
      userId: USER_ID,
      type: ActivityType.MEDICINE,
      startTime: getKSTDate(year, month, day, 19, 30),
      medicineName: '타이레놀',
      medicineAmount: '5',
      medicineUnit: 'ml',
      memo: generateMemo(ActivityType.MEDICINE, 19),
    });
  }

  // 10. 밤 수유 (21:00)
  activities.push({
    babyId: BABY_ID,
    userId: USER_ID,
    type: ActivityType.FEEDING,
    startTime: getKSTDate(year, month, day, 21, 0),
    endTime: getKSTDate(year, month, day, 21, 20),
    feedingType: 'formula',
    feedingAmount: schedule.feedingAmount,
    memo: generateMemo(ActivityType.FEEDING, 21),
  });

  // 11. 밤잠 (22:00 - 익일 06:00)
  activities.push({
    babyId: BABY_ID,
    userId: USER_ID,
    type: ActivityType.SLEEP,
    startTime: getKSTDate(year, month, day, 22, 0),
    endTime: getKSTDate(year, month, day + 1, 6, 0),
    duration: 480, // 8시간
    sleepType: 'night',
    memo: generateMemo(ActivityType.SLEEP, 22),
  });

  return activities;
}

async function main() {
  console.log('🚀 홍길순 과거 데이터 생성 시작...');

  // 먼저 홍길순 정보 조회
  const baby = await prisma.baby.findFirst({
    where: {
      name: '홍길순',
    },
  });

  if (!baby) {
    console.error('❌ 홍길순을 찾을 수 없습니다.');
    return;
  }

  console.log(`✅ 아기 정보: ${baby.name} (${baby.birthDate})`);

  // 사용자 정보 가져오기
  const family = await prisma.family.findUnique({
    where: { id: baby.familyId },
    include: { FamilyMembers: true },
  });

  const userId = family?.FamilyMembers[0]?.userId;
  if (!userId) {
    console.error('❌ 사용자를 찾을 수 없습니다.');
    return;
  }

  // 7일 전부터 어제까지 (12월 12일 ~ 12월 18일)
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 7); // 7일 전

  const endDate = new Date(today);
  endDate.setDate(today.getDate() - 1); // 어제

  console.log(`📅 기간: ${startDate.toLocaleDateString()} ~ ${endDate.toLocaleDateString()}`);

  let currentDate = new Date(startDate);
  let totalActivities = 0;

  while (currentDate <= endDate) {
    console.log(`📆 ${currentDate.toLocaleDateString()} 데이터 생성 중...`);

    const dayActivities = await generateDaySchedule(currentDate, baby.birthDate);

    // babyId와 userId 주입
    const activitiesWithIds = dayActivities.map((act) => ({
      ...act,
      babyId: baby.id,
      userId,
    }));

    // DB에 삽입
    for (const activity of activitiesWithIds) {
      await prisma.activity.create({
        data: activity,
      });
      totalActivities++;
    }

    // 다음 날로
    currentDate.setDate(currentDate.getDate() + 1);
  }

  console.log(`✅ 완료! 총 ${totalActivities}개의 과거 활동 기록 생성`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
