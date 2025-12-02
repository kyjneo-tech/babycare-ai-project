// src/app/api/families/members/[memberId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/shared/lib/prisma";
import { isOwner, getMyPermission } from "@/features/families/utils/permissions";

/**
 * @swagger
 * /api/families/members/{memberId}:
 *   delete:
 *     summary: 가족 구성원 제거
 *     description: |
 *       가족 구성원을 제거합니다. Owner 권한만 가능하며, Owner 본인과 자기 자신은 제거할 수 없습니다.
 *
 *       **테스트 방법:**
 *       1. `Authorize` 버튼으로 JWT 토큰 입력
 *       2. `Try it out` 버튼 클릭
 *       3. memberId와 familyId 입력
 *       4. `Execute` 버튼으로 실행
 *     tags: [Families]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *         description: 제거할 구성원의 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - familyId
 *             properties:
 *               familyId:
 *                 type: string
 *                 description: 가족 ID
 *     responses:
 *       '200':
 *         description: 구성원 제거 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '400':
 *         description: 잘못된 요청 (Owner나 자기 자신을 제거하려는 경우)
 *       '401':
 *         description: 인증되지 않은 사용자
 *       '403':
 *         description: 권한 없음 (Owner가 아닌 경우)
 *       '500':
 *         description: 서버 내부 오류
 */
// 가족 구성원 제거
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const { memberId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "인증되지 않은 사용자입니다." },
        { status: 401 }
      );
    }
    const userId = session.user.id;

    const { familyId } = await request.json() as {
      familyId: string;
    };

    if (!familyId) {
      return NextResponse.json(
        { error: "familyId가 필요합니다." },
        { status: 400 }
      );
    }
    
    // 권한 확인: Owner만 구성원 제거 가능
    const hasPermission = await isOwner(userId, familyId);
    if (!hasPermission) {
        return NextResponse.json(
            { error: "구성원을 제거할 권한이 없습니다." },
            { status: 403 }
        );
    }

    // Owner는 제거할 수 없음
    const targetPermission = await getMyPermission(memberId, familyId);
    if (targetPermission === 'owner') {
        return NextResponse.json(
            { error: "Owner는 제거할 수 없습니다." },
            { status: 400 }
        );
    }

    // 자기 자신은 제거할 수 없음
    if (memberId === userId) {
      return NextResponse.json(
        { error: "자기 자신은 제거할 수 없습니다." },
        { status: 400 }
      );
    }

    // 구성원 제거
    await prisma.familyMember.delete({
      where: {
        userId_familyId: {
          userId: memberId,
          familyId,
        },
      },
    });

    return NextResponse.json({
      message: "구성원이 성공적으로 제거되었습니다.",
    });
  } catch (error) {
    console.error("구성원 제거 실패:", error);
    return NextResponse.json(
      { error: "구성원 제거에 실패했습니다." },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/families/members/{memberId}:
 *   patch:
 *     summary: 가족 구성원 권한 변경
 *     description: |
 *       가족 구성원의 권한을 변경합니다. Owner 권한만 가능하며, Owner의 권한과 자신의 권한은 변경할 수 없습니다.
 *
 *       **테스트 방법:**
 *       1. `Authorize` 버튼으로 JWT 토큰 입력
 *       2. `Try it out` 버튼 클릭
 *       3. memberId, familyId, newPermission 입력
 *       4. `Execute` 버튼으로 실행
 *     tags: [Families]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *         description: 권한을 변경할 구성원의 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - familyId
 *               - newPermission
 *             properties:
 *               familyId:
 *                 type: string
 *                 description: 가족 ID
 *               newPermission:
 *                 type: string
 *                 description: 새로운 권한 (owner, admin, member 등)
 *                 example: admin
 *     responses:
 *       '200':
 *         description: 권한 변경 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 member:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     permission:
 *                       type: string
 *                     relation:
 *                       type: string
 *       '400':
 *         description: 잘못된 요청 (Owner의 권한이나 자신의 권한을 변경하려는 경우)
 *       '401':
 *         description: 인증되지 않은 사용자
 *       '403':
 *         description: 권한 없음 (Owner가 아닌 경우)
 *       '500':
 *         description: 서버 내부 오류
 */
// 가족 구성원 권한 변경 (역할 role이 아니라 permission을 변경해야 하지만, 일단 기존 로직 유지)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const { memberId } = await params;
    const session = await getServerSession(authOptions);
    const { familyId, newPermission } = await request.json() as {
      familyId: string;
      newPermission: string;
    };

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "인증되지 않은 사용자입니다." },
        { status: 401 }
      );
    }
    const userId = session.user.id;

    if (!familyId || !newPermission) {
      return NextResponse.json(
        { error: "familyId와 newPermission이 필요합니다." },
        { status: 400 }
      );
    }
    
    // 권한 확인: Owner만 역할 변경 가능
    const hasPermission = await isOwner(userId, familyId);
    if (!hasPermission) {
        return NextResponse.json(
            { error: "권한을 변경할 권한이 없습니다." },
            { status: 403 }
        );
    }

    // Owner의 권한은 변경할 수 없음
    const targetPermission = await getMyPermission(memberId, familyId);
    if (targetPermission === 'owner') {
        return NextResponse.json(
            { error: "Owner의 권한은 변경할 수 없습니다." },
            { status: 400 }
        );
    }

    // 자신의 권한은 변경할 수 없음
    if (memberId === userId) {
        return NextResponse.json(
            { error: "자신의 권한은 변경할 수 없습니다." },
            { status: 400 }
        );
    }

    // 역할 변경
    const updatedMember = await prisma.familyMember.update({
      where: {
        userId_familyId: {
          userId: memberId,
          familyId,
        },
      },
      data: {
        permission: newPermission,
      },
      include: {
        User: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "권한이 성공적으로 변경되었습니다.",
      member: {
        userId: updatedMember.userId,
        name: updatedMember.User.name,
        email: updatedMember.User.email,
        permission: updatedMember.permission,
        relation: updatedMember.relation,
      },
    });
  } catch (error) {
    console.error("권한 변경 실패:", error);
    return NextResponse.json(
      { error: "권한 변경에 실패했습니다." },
      { status: 500 }
    );
  }
}
