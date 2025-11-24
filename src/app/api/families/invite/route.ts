// src/app/api/families/invite/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { canInviteMembers, type Role } from "@/lib/permissions";

const prisma = new PrismaClient();

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

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "인증되지 않은 사용자입니다." },
        { status: 401 }
      );
    }

    const { familyId } = await request.json();

    if (!familyId) {
      return NextResponse.json(
        { error: "familyId가 필요합니다." },
        { status: 400 }
      );
    }

    // 해당 가족에 대한 권한 확인 (Owner 또는 Admin만 초대 코드 생성 가능)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const familyMember = await prisma.familyMember.findUnique({
      where: {
        userId_familyId: {
          userId: user.id,
          familyId,
        },
      },
    });

    if (!familyMember) {
      return NextResponse.json(
        { error: "해당 가족에 속해 있지 않습니다." },
        { status: 403 }
      );
    }

    // Owner 또는 Admin 권한 체크
    if (!canInviteMembers(familyMember.role as Role)) {
      return NextResponse.json(
        { error: "초대 코드를 생성할 권한이 없습니다." },
        { status: 403 }
      );
    }

    // 고유한 초대 코드 생성
    let inviteCode = generateInviteCode();
    let isUnique = false;

    while (!isUnique) {
      const existingFamily = await prisma.family.findUnique({
        where: { inviteCode },
      });

      if (!existingFamily) {
        isUnique = true;
      } else {
        inviteCode = generateInviteCode();
      }
    }

    // 가족 초대 코드 업데이트
    const updatedFamily = await prisma.family.update({
      where: { id: familyId },
      data: { inviteCode },
    });

    const inviteUrl = `${process.env.NEXTAUTH_URL}/join?code=${inviteCode}`;

    return NextResponse.json({
      inviteCode,
      inviteUrl,
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

    return NextResponse.json({
      familyId: family.id,
      familyName: family.name,
      memberCount: family.FamilyMembers.length,
      babyCount: family.Babies.length,
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
