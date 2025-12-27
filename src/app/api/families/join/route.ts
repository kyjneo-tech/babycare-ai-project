// src/app/api/families/join/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/families/join:
 *   post:
 *     summary: 초대 코드로 가족에 참여
 *     description: |
 *       초대 코드를 사용하여 가족에 참여합니다.
 *       이미 가족의 구성원인 경우 오류를 반환합니다.
 *
 *       **테스트 방법:**
 *       1. `Authorize` 버튼으로 JWT 토큰 입력
 *       2. `Try it out` 버튼 클릭
 *       3. inviteCode, role(선택), relation(선택) 입력
 *       4. `Execute` 버튼으로 실행
 *       5. 가족 참여 성공 확인
 *     tags: [Families]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inviteCode
 *             properties:
 *               inviteCode:
 *                 type: string
 *                 description: 초대 코드 (6자리)
 *                 example: ABC123
 *               role:
 *                 type: string
 *                 description: 역할 (기본값 Member)
 *                 example: Member
 *               relation:
 *                 type: string
 *                 description: 관계 (기본값 가족)
 *                 example: 아빠
 *     responses:
 *       '200':
 *         description: 가족 참여 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 가족에 성공적으로 참여했습니다.
 *                 familyId:
 *                   type: string
 *                 familyName:
 *                   type: string
 *                 role:
 *                   type: string
 *                 relation:
 *                   type: string
 *       '400':
 *         description: 잘못된 요청 또는 이미 가족 구성원
 *       '401':
 *         description: 인증되지 않은 사용자
 *       '404':
 *         description: 유효하지 않은 초대 코드 또는 사용자를 찾을 수 없음
 *       '410':
 *         description: 만료된 초대 코드
 *       '500':
 *         description: 서버 내부 오류
 */
// 초대 코드로 가족에 참여
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "인증되지 않은 사용자입니다." },
        { status: 401 }
      );
    }

    const { inviteCode, role, relation } = await request.json() as {
      inviteCode: string;
      role?: string;
      relation?: string;
    };

    if (!inviteCode) {
      return NextResponse.json(
        { error: "초대 코드가 필요합니다." },
        { status: 400 }
      );
    }

    // 초대 코드로 가족 찾기
    const family = await prisma.family.findUnique({
      where: { inviteCode },
    });

    if (!family) {
      return NextResponse.json(
        { error: "유효하지 않은 초대 코드입니다." },
        { status: 404 }
      );
    }

    // 초대 코드 만료 확인
    if (family.inviteCodeExpiry && new Date() > family.inviteCodeExpiry) {
      return NextResponse.json(
        { error: "만료된 초대 코드입니다. 가족 관리자에게 새 코드 발급을 요청해주세요." },
        { status: 410 }
      );
    }

    // 현재 사용자 찾기
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 이미 해당 가족의 구성원인지 확인
    const existingMember = await prisma.familyMember.findUnique({
      where: {
        userId_familyId: {
          userId: user.id,
          familyId: family.id,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "이미 해당 가족의 구성원입니다." },
        { status: 400 }
      );
    }

    // 가족 구성원으로 추가
    const newMember = await prisma.familyMember.create({
      data: {
        userId: user.id,
        familyId: family.id,
        role: role || "Member", // 기본 역할: Member
        relation: relation || "가족", // 기본 관계: 가족
      },
    });

    return NextResponse.json({
      message: "가족에 성공적으로 참여했습니다.",
      familyId: family.id,
      familyName: family.name,
      role: newMember.role,
      relation: newMember.relation,
    });
  } catch (error) {
    console.error("가족 참여 실패:", error);
    return NextResponse.json(
      { error: "가족 참여에 실패했습니다." },
      { status: 500 }
    );
  }
}
