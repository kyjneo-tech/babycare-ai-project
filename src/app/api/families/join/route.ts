// src/app/api/families/join/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

    const { inviteCode, role, relation } = await request.json();

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

    // 현재 사용자 찾기
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
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
