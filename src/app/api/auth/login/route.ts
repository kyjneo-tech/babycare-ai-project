import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { loginService } from '@/features/auth/services/loginService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body; // Zod 검증은 서비스에서 수행

    const userId = await loginService({ email, password });

    if (!userId) {
      return NextResponse.json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 });
    }

    // 로그인 성공 (여기서는 간단히 userId만 반환)
    // 실제 애플리케이션에서는 JWT 토큰 등을 발급해야 합니다.
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
    console.error('로그인 API 오류:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
