// src/shared/lib/idempotency.ts
import { redis } from './redis';

/**
 * 중복 요청 방지를 위한 Idempotency Key 검증
 * @param userId 사용자 ID
 * @param requestKey 요청 식별 키
 * @param ttlSeconds TTL (기본 24시간)
 * @returns 중복 요청 여부 (true: 중복, false: 정상)
 */
export async function checkDuplicateRequest(
  userId: string,
  requestKey: string,
  ttlSeconds: number = 86400 // 24시간
): Promise<boolean> {
  if (!redis) return false;

  const key = `idempotency:${userId}:${requestKey}`;

  try {
    // SET NX: key가 존재하지 않을 때만 설정
    const result = await redis.set(key, '1', { nx: true, ex: ttlSeconds });

    // null이면 이미 key가 존재 (중복 요청)
    return result === null;
  } catch (error) {
    console.error('Idempotency check failed:', error);
    // Redis 오류 시 중복이 아닌 것으로 간주 (통과)
    return false;
  }
}

/**
 * 중복 요청 방지 키 삭제 (롤백 시 사용)
 */
export async function clearIdempotencyKey(
  userId: string,
  requestKey: string
): Promise<void> {
  if (!redis) return;

  const key = `idempotency:${userId}:${requestKey}`;

  try {
    await redis.del(key);
  } catch (error) {
    console.error('Idempotency key clear failed:', error);
  }
}

/**
 * 요청 데이터 기반 고유 키 생성
 */
export function generateRequestKey(data: Record<string, any>): string {
  // 중요 필드만 추출하여 키 생성
  const keyData = JSON.stringify(data);

  // 간단한 해시 함수 (실제로는 crypto 라이브러리 사용 권장)
  let hash = 0;
  for (let i = 0; i < keyData.length; i++) {
    const char = keyData.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32비트 정수로 변환
  }

  return Math.abs(hash).toString(36);
}
