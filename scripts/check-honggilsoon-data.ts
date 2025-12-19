import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BABY_ID = 'cmiwoujws0009ue8p1rrsg8ek';

async function main() {
  console.log('🔍 홍길순 데이터 확인 중...\n');

  // 12월 13일 ~ 19일 데이터 조회
  const startDate = new Date(2025, 11, 13, 0, 0, 0); // 12월 13일
  const endDate = new Date(2025, 11, 19, 23, 59, 59); // 12월 19일

  const activities = await prisma.activity.findMany({
    where: {
      babyId: BABY_ID,
      startTime: {
        gte: startDate,
        lte: endDate,
      },
      type: 'FEEDING',
    },
    select: {
      startTime: true,
      feedingType: true,
      feedingAmount: true,
      breastSide: true,
      memo: true,
    },
    orderBy: {
      startTime: 'asc',
    },
  });

  console.log(`📅 12월 13일 ~ 19일 수유 기록 (총 ${activities.length}개)\n`);

  const grouped = activities.reduce((acc, act) => {
    const date = act.startTime.toLocaleDateString('ko-KR');
    if (!acc[date]) acc[date] = [];
    acc[date].push(act);
    return acc;
  }, {} as Record<string, typeof activities>);

  for (const [date, acts] of Object.entries(grouped)) {
    console.log(`\n📆 ${date}`);
    acts.forEach((act, idx) => {
      const time = act.startTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
      console.log(`   ${idx + 1}. ${time} - 타입: ${act.feedingType}, 양: ${act.feedingAmount || 'N/A'}ml, 가슴: ${act.breastSide || 'N/A'}`);
    });

    // 타입별 집계
    const typeCount = acts.reduce((acc, act) => {
      acc[act.feedingType || 'unknown'] = (acc[act.feedingType || 'unknown'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log(`   → 타입별: ${JSON.stringify(typeCount)}`);
  }

  // 전체 타입별 통계
  console.log('\n\n📊 전체 타입별 통계:');
  const allTypes = activities.reduce((acc, act) => {
    acc[act.feedingType || 'unknown'] = (acc[act.feedingType || 'unknown'] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log(allTypes);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
