import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { signupService } from '@/features/auth/services/signupService';
import { PrismaUserRepository } from '@/features/auth/repositories/PrismaUserRepository'; // New import

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: 회원가입
 *     description: |
 *       새로운 사용자를 등록합니다.
 *
 *       **테스트 방법:**
 *       1. `Try it out` 버튼 클릭
 *       2. 이름, 이메일, 비밀번호를 입력
 *       3. `Execute` 버튼으로 실행
 *       4. `201` 응답 코드와 함께 사용자 ID 반환 확인
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: 사용자 이름
 *                 example: 홍길동
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 이메일 주소
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: 비밀번호 (최소 8자)
 *                 example: password123
 *     responses:
 *       '201':
 *         description: 회원가입 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 회원가입 성공
 *                 userId:
 *                   type: string
 *                   example: clx1234567890
 *       '400':
 *         description: 잘못된 요청 (유효성 검증 실패)
 *       '409':
 *         description: 이미 존재하는 이메일
 *       '500':
 *         description: 서버 내부 오류
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { name: string; email: string; password: string };
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
