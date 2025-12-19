import { redis } from '../src/shared/lib/redis';

/**
 * AI 채팅 캐시를 삭제하는 스크립트
 * 포맷터 수정 후 오래된 캐시를 제거할 때 사용
 */

const BABY_IDS = [
  'cmiwoujws0009ue8p1rrsg8ek', // 홍길순
  'cmiwnlajn001uuef9cme5atq1', // 김철수
];

async function main() {
  console.log('🗑️  Redis 캐시 삭제 시작...\n');

  for (const babyId of BABY_IDS) {
    const cacheKey = `baby:${babyId}:chat-context:7-days`;

    try {
      const result = await redis.del(cacheKey);
      if (result === 1) {
        console.log(`✅ 삭제 성공: ${cacheKey}`);
      } else {
        console.log(`⚠️  키 없음: ${cacheKey}`);
      }
    } catch (error) {
      console.error(`❌ 삭제 실패: ${cacheKey}`, error);
    }
  }

  console.log('\n✅ 캐시 삭제 완료!');
  console.log('💡 다음 AI 채팅 시 최신 포맷으로 데이터가 생성됩니다.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
