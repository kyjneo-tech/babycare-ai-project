// src/app/api/families/my-family/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaFamilyRepository } from "@/features/families/repositories/PrismaFamilyRepository";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/families/my-family:
 *   get:
 *     summary: 내 가족 정보 조회
 *     description: |
 *       현재 로그인한 사용자의 가족 정보와 아기들의 목록을 조회합니다.
 *
 *       **테스트 방법:**
 *       1. 먼저 `Authorize` 버튼을 클릭하여 JWT 토큰을 입력
 *       2. `Try it out` 버튼 클릭
 *       3. `Execute` 버튼으로 실행
 *       4. 가족 정보 및 아기 목록 확인
 *     tags: [Families]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: 가족 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 babies:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       birthDate:
 *                         type: string
 *                         format: date-time
 *                 family:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     inviteCode:
 *                       type: string
 *       '401':
 *         description: 인증되지 않은 사용자
 *       '500':
 *         description: 서버 내부 오류
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const familyRepository = new PrismaFamilyRepository();
    const family = await familyRepository.findFamilyDetailsByUserId(
      session.user.id
    );

    return NextResponse.json({
      babies: family?.Babies ?? [],
      family: family
        ? {
            id: family.id,
            name: family.name,
            inviteCode: family.inviteCode,
          }
        : null,
    });
  } catch (error) {
    console.error("Failed to fetch family:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
