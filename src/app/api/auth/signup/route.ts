import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { signupService } from '@/features/auth/services/signupService';
import { PrismaUserRepository } from '@/features/auth/repositories/PrismaUserRepository'; // New import

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userRepository = new PrismaUserRepository(); // Instantiate repository
    const newUser = await signupService(body, userRepository); // Pass repository

    return NextResponse.json(
      {
        message: '회원가입 성공',
        userId: newUser.id,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    if (error instanceof Error && 'code' in error && (error as any).code === 'P2002') {
      return NextResponse.json({ error: '이미 존재하는 이메일입니다.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
