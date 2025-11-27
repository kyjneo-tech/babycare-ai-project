import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { loginService } from '@/features/auth/services/loginService';
import { loginRateLimit } from '@/shared/lib/ratelimit';
import { logger } from '@/shared/lib/logger';

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
