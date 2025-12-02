import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { loginService } from '@/features/auth/services/loginService';
import { loginRateLimit } from '@/shared/lib/ratelimit';
import { logger } from '@/shared/lib/logger';

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 로그인
 *     description: |
 *       이메일과 비밀번호로 로그인합니다.
 *       Rate limit이 적용되어 있어 너무 많은 시도 시 429 에러가 발생합니다.
 *
 *       **테스트 방법:**
 *       1. `Try it out` 버튼 클릭
 *       2. 이메일과 비밀번호 입력
 *       3. `Execute` 버튼으로 실행
 *       4. `200` 응답 코드와 함께 사용자 ID 반환 확인
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 이메일 주소
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: 비밀번호
 *                 example: password123
 *     responses:
 *       '200':
 *         description: 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 로그인 성공
 *                 userId:
 *                   type: string
 *                   example: clx1234567890
 *       '400':
 *         description: 잘못된 요청
 *       '401':
 *         description: 이메일 또는 비밀번호가 올바르지 않음
 *       '429':
 *         description: 너무 많은 로그인 시도
 *         headers:
 *           X-RateLimit-Limit:
 *             schema:
 *               type: integer
 *             description: 시간당 허용된 요청 수
 *           X-RateLimit-Remaining:
 *             schema:
 *               type: integer
 *             description: 남은 요청 수
 *           X-RateLimit-Reset:
 *             schema:
 *               type: integer
 *             description: Rate limit 리셋 시각 (Unix timestamp)
 *       '500':
 *         description: 서버 내부 오류
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    if (loginRateLimit) {
      const identifier = request.headers.get('x-forwarded-for') || 'anonymous';
      const { success, limit, remaining, reset } = await loginRateLimit.limit(identifier);
      
      if (!success) {
        logger.warn('로그인 rate limit 초과', { identifier });
        return NextResponse.json(
          { error: '너무 많은 로그인 시도입니다. 잠시 후 다시 시도해주세요.' },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': remaining.toString(),
              'X-RateLimit-Reset': reset.toString(),
            }
          }
        );
      }
    }

    const body = await request.json() as { email: string; password: string };
    const { email, password } = body;

    const userId = await loginService({ email, password });

    if (!userId) {
      return NextResponse.json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 });
    }

    return NextResponse.json(
      {
        message: '로그인 성공',
        userId: userId,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    logger.error('로그인 API 오류');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
