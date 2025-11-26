// src/app/api/families/invite/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/shared/lib/prisma";
import { isAdminOrOwner } from "@/features/families/utils/permissions";

// 6자리 랜덤 초대 코드 생성
function generateInviteCode(): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

// 초대 코드 생성 또는 재생성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "인증되지 않은 사용자입니다." },
        { status: 401 }
      );
    }
    const userId = session.user.id;

    // Rate limiting 적용 (스팸 방지)
    const { inviteCodeRateLimit } = await import('@/shared/lib/ratelimit');
    if (inviteCodeRateLimit) {
      const { success } = await inviteCodeRateLimit.limit(userId);
      if (!success) {
        return NextResponse.json(
          { error: "초대 코드 생성 요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
          { status: 429 }
        );
      }
    }

    const { familyId } = await request.json();

    if (!familyId) {
      return NextResponse.json(
        { error: "familyId가 필요합니다." },
        { status: 400 }
      );
    }

    // 권한 체크: Admin 또는 Owner만 초대 코드 재생성 가능
    const hasPermission = await isAdminOrOwner(userId, familyId);
    if (!hasPermission) {
      return NextResponse.json(
        { error: "초대 코드를 생성할 권한이 없습니다." },
        { status: 403 }
      );
    }

    // 고유한 초대 코드 생성 (재시도 횟수 제한 추가)
    let inviteCode = generateInviteCode();
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      const existingFamily = await prisma.family.findUnique({
        where: { inviteCode },
      });

      if (!existingFamily) {
        isUnique = true;
      } else {
        inviteCode = generateInviteCode();
        attempts++;
      }
    }

    if (!isUnique) {
      return NextResponse.json(
        { error: "초대 코드 생성에 실패했습니다. 다시 시도해주세요." },
        { status: 500 }
      );
    }

    // 초대 코드 만료 시간 설정 (7일 후)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

    // 가족 초대 코드 업데이트
    const updatedFamily = await prisma.family.update({
      where: { id: familyId },
      data: {
        inviteCode,
        inviteCodeExpiry: expiryDate,
      },
    });

    const inviteUrl = `${process.env.NEXTAUTH_URL}/join?code=${inviteCode}`;

    return NextResponse.json({
      inviteCode,
      inviteUrl,
      expiresAt: expiryDate,
      familyName: updatedFamily.name,
      message: "초대 코드가 생성되었습니다.",
    });
  } catch (error) {
    console.error("초대 코드 생성 실패:", error);
    return NextResponse.json(
      { error: "초대 코드 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}

// 초대 코드로 가족 정보 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "초대 코드가 필요합니다." },
        { status: 400 }
      );
    }

    const family = await prisma.family.findUnique({
      where: { inviteCode: code },
      include: {
        FamilyMembers: {
          include: {
            User: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        Babies: {
          select: {
            id: true,
            name: true,
            birthDate: true,
          },
        },
      },
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

    return NextResponse.json({
      familyId: family.id,
      familyName: family.name,
      memberCount: family.FamilyMembers.length,
      babyCount: family.Babies.length,
      expiresAt: family.inviteCodeExpiry,
      members: family.FamilyMembers.map((fm) => ({
        name: fm.User.name,
        role: fm.role,
        relation: fm.relation,
      })),
    });
  } catch (error) {
    console.error("초대 코드 조회 실패:", error);
    return NextResponse.json(
      { error: "초대 코드 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}
