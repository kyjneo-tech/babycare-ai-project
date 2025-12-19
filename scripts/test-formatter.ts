import { PrismaClient } from '@prisma/client';
import { collectBabyActivityData } from '../src/features/ai-chat/services/dataCollector';
import { removeNulls } from '../src/features/ai-chat/utils/dataCleanup';
import { toKoreanData } from '../src/features/ai-chat/formatters';

const prisma = new PrismaClient();

const BABY_ID = 'cmiwoujws0009ue8p1rrsg8ek';

async function main() {
  console.log('🧪 포맷터 테스트 시작...\n');

  // 12월 13일 ~ 19일 데이터 수집
  const rawData = await collectBabyActivityData(BABY_ID, 7);
  const cleanedData = removeNulls(rawData);
  const formattedData = toKoreanData(cleanedData, 7);

  console.log('📄 포맷팅된 데이터:\n');
  console.log(formattedData);
  console.log('\n\n✅ 테스트 완료!');

  // 주요 체크 포인트 출력
  console.log('\n📊 체크 포인트:');
  console.log('1. 모유/분유/유축/이유식 모두 표시되는가?');
  console.log('2. 기저귀 both 타입이 소변+대변 둘 다 카운트되는가?');
  console.log('3. 변 상태(물설사/묽은변/정상/된변)가 표시되는가?');
  console.log('4. 투약 정보가 완전히 표시되는가?');
  console.log('5. 메모 내용이 그대로 표시되는가?');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
