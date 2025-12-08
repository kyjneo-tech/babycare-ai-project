
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const lastMetric = await prisma.chatMetrics.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    
    if (lastMetric) {
      console.log('✅ 모니터링 데이터 확인됨:');
      console.log(JSON.stringify(lastMetric, null, 2));
    } else {
      console.log('⚠️ 모니터링 데이터가 없습니다.');
    }
  } catch (error) {
    console.error('❌ 조회 실패:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
