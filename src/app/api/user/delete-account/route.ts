import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/shared/lib/prisma";

/**
 * DELETE /api/user/delete-account
 * 사용자 계정 완전 삭제 (회원 탈퇴)
 *
 * 삭제되는 데이터:
 * 1. 사용자가 유일한 멤버인 Family → Family와 연관된 모든 Baby, Activity 등
 * 2. User 삭제 → Cascade로 자동 삭제:
 *    - UserSettings
 *    - FamilyMember (다른 Family에 속한 경우)
 *    - Activity
 *    - ChatMessage
 *    - Note
 *    - ChatMetrics
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "인증되지 않은 사용자입니다." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 트랜잭션으로 모든 삭제 작업 수행
    await prisma.$transaction(async (tx) => {
      // 1. 사용자가 속한 모든 Family 조회
      const familyMembers = await tx.familyMember.findMany({
        where: { userId },
        include: {
          Family: {
            include: {
              FamilyMembers: true,
            },
          },
        },
      });

      // 2. 각 Family에서 사용자가 유일한 멤버인지 확인 후 처리
      for (const member of familyMembers) {
        const family = member.Family;

        // 해당 Family의 멤버가 1명(본인)뿐이면 Family 전체 삭제
        if (family.FamilyMembers.length === 1) {
          console.log(`[DELETE_ACCOUNT] Deleting family ${family.id} (user is the only member)`);

          // Family 삭제 → Cascade로 Baby, Activity 등 모두 삭제됨
          await tx.family.delete({
            where: { id: family.id },
          });
        }
        // 다른 멤버가 있으면 FamilyMember만 삭제 (User 삭제 시 Cascade로 자동 삭제됨)
      }

      // 3. User 삭제 → Cascade로 나머지 데이터 자동 삭제
      console.log(`[DELETE_ACCOUNT] Deleting user ${userId}`);
      await tx.user.delete({
        where: { id: userId },
      });
    });

    console.log(`[DELETE_ACCOUNT] Successfully deleted user ${userId}`);

    return NextResponse.json(
      { message: "계정이 성공적으로 삭제되었습니다." },
      { status: 200 }
    );
  } catch (error) {
    console.error("[DELETE_ACCOUNT] Error:", error);

    return NextResponse.json(
      { error: "계정 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
