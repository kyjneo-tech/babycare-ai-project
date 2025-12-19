import { PrismaClient } from '@prisma/client';
import { collectBabyActivityData } from '../src/features/ai-chat/services/dataCollector';
import { formatActivitiesForAI } from '../src/features/ai-chat/formatters';

const prisma = new PrismaClient();

const BABY_ID = 'cmiwoujws0009ue8p1rrsg8ek';

async function main() {
  console.log('🔍 AI 포맷터 테스트 시작...\n');

  // 1. 데이터 수집
  console.log('1️⃣ 데이터 수집 중...');
  const data = await collectBabyActivityData(BABY_ID, 7);

  console.log('\n📊 수집된 데이터:');
  console.log(`- 수유: ${data.feedings.length}개`);
  console.log(`- 수면: ${data.sleeps.length}개`);
  console.log(`- 기저귀: ${data.diapers.length}개`);
  console.log(`- 체온: ${data.temperatures.length}개`);
  console.log(`- 투약: ${data.medicines.length}개`);

  // 2. 샘플 확인
  console.log('\n\n📝 수유 샘플 (최근 3개):');
  data.feedings.slice(0, 3).forEach((f, i) => {
    const date = new Date(f.startTime).toLocaleDateString('ko-KR');
    const time = new Date(f.startTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    console.log(`  ${i + 1}. ${date} ${time} - 타입: ${f.feedingType}, 양: ${f.feedingAmount || 'N/A'}ml`);
  });

  console.log('\n📝 수면 샘플 (최근 3개):');
  data.sleeps.slice(0, 3).forEach((s, i) => {
    const date = new Date(s.startTime).toLocaleDateString('ko-KR');
    const start = new Date(s.startTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    const end = s.endTime ? new Date(s.endTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
    console.log(`  ${i + 1}. ${date} ${start}~${end} - 타입: ${s.sleepType}`);
  });

  console.log('\n📝 기저귀 샘플 (최근 5개):');
  data.diapers.slice(0, 5).forEach((d, i) => {
    const date = new Date(d.startTime).toLocaleDateString('ko-KR');
    const time = new Date(d.startTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    console.log(`  ${i + 1}. ${date} ${time} - 타입: ${d.diaperType}, 상태: ${d.stoolCondition || 'N/A'}`);
  });

  // 3. AI 포맷터 실행
  console.log('\n\n2️⃣ AI 포맷터 실행 중...');
  const formatted = formatActivitiesForAI(data, 7);

  console.log('\n📤 AI에게 전달될 텍스트 (처음 3000자):\n');
  console.log(formatted.substring(0, 3000));
  console.log('\n... (생략) ...\n');

  console.log(`\n✅ 총 텍스트 길이: ${formatted.length}자`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
