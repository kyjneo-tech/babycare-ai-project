import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 홍길순 아기 ID
const BABY_ID = 'cmiwoujws0009ue8p1rrsg8ek';

async function main() {
  console.log('🗑️  홍길순 데이터 삭제 시작...');

  // 먼저 홍길순 정보 조회
  const baby = await prisma.baby.findUnique({
    where: { id: BABY_ID },
  });

  if (!baby) {
    console.error('❌ 홍길순을 찾을 수 없습니다.');
    return;
  }

  console.log(`✅ 아기 정보: ${baby.name} (${baby.birthDate})`);

  // 활동 데이터 삭제
  const deletedActivities = await prisma.activity.deleteMany({
    where: {
      babyId: BABY_ID,
    },
  });

  console.log(`🗑️  삭제된 활동 기록: ${deletedActivities.count}개`);
  console.log('✅ 완료!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
