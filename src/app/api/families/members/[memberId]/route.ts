// src/app/api/families/members/[memberId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { canRemoveMembers, canChangeRole, type Role } from "@/lib/permissions";

const prisma = new PrismaClient();

// 가족 구성원 제거
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const { memberId } = await params;
    // const result = await removeFamilyMember(memberId); // Removed invalid call
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "인증되지 않은 사용자입니다." },
        { status: 401 }
      );
    }

    // const { memberId } = params; // Removed duplicate declaration
    const { familyId } = await request.json();

    if (!familyId) {
      return NextResponse.json(
        { error: "familyId가 필요합니다." },
        { status: 400 }
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

    // 현재 사용자의 가족 멤버십 확인
    const currentUserMembership = await prisma.familyMember.findUnique({
      where: {
        userId_familyId: {
          userId: user.id,
          familyId,
        },
      },
    });

    if (!currentUserMembership) {
      return NextResponse.json(
        { error: "해당 가족에 속해 있지 않습니다." },
        { status: 403 }
      );
    }

    // 권한 확인: Owner만 구성원 제거 가능
    if (!canRemoveMembers(currentUserMembership.role as Role)) {
      return NextResponse.json(
        { error: "구성원을 제거할 권한이 없습니다." },
        { status: 403 }
      );
    }

    // 제거하려는 구성원 찾기
    const targetMember = await prisma.familyMember.findUnique({
      where: {
        userId_familyId: {
          userId: memberId,
          familyId,
        },
      },
    });

    if (!targetMember) {
      return NextResponse.json(
        { error: "해당 구성원을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // Owner는 제거할 수 없음
    if (targetMember.role === "Owner") {
      return NextResponse.json(
        { error: "Owner는 제거할 수 없습니다." },
        { status: 400 }
      );
    }

    // 자기 자신은 제거할 수 없음
    if (memberId === user.id) {
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

// 가족 구성원 역할 변경
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const { memberId } = await params;
    const session = await getServerSession(authOptions);
    const { familyId, newRole } = await request.json();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "인증되지 않은 사용자입니다." },
        { status: 401 }
      );
    }

    if (!familyId || !newRole) {
      return NextResponse.json(
        { error: "familyId와 newRole이 필요합니다." },
        { status: 400 }
      );
    }

    // 유효한 역할인지 확인
    const validRoles: Role[] = ["Owner", "Admin", "Member", "Read-Only"];
    if (!validRoles.includes(newRole as Role)) {
      return NextResponse.json(
        { error: "유효하지 않은 역할입니다." },
        { status: 400 }
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

    // 현재 사용자의 가족 멤버십 확인
    const currentUserMembership = await prisma.familyMember.findUnique({
      where: {
        userId_familyId: {
          userId: user.id,
          familyId,
        },
      },
    });

    if (!currentUserMembership) {
      return NextResponse.json(
        { error: "해당 가족에 속해 있지 않습니다." },
        { status: 403 }
      );
    }

    // 권한 확인: Owner만 역할 변경 가능
    if (!canChangeRole(currentUserMembership.role as Role)) {
      return NextResponse.json(
        { error: "역할을 변경할 권한이 없습니다." },
        { status: 403 }
      );
    }

    // 변경하려는 구성원 찾기
    const targetMember = await prisma.familyMember.findUnique({
      where: {
        userId_familyId: {
          userId: memberId,
          familyId,
        },
      },
    });

    if (!targetMember) {
      return NextResponse.json(
        { error: "해당 구성원을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // Owner 역할은 변경할 수 없음
    if (targetMember.role === "Owner") {
      return NextResponse.json(
        { error: "Owner의 역할은 변경할 수 없습니다." },
        { status: 400 }
      );
    }

    // Owner 역할로 변경하려는 경우 차단
    if (newRole === "Owner") {
      return NextResponse.json(
        { error: "Owner 역할로 변경할 수 없습니다." },
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
        role: newRole,
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
      message: "역할이 성공적으로 변경되었습니다.",
      member: {
        userId: updatedMember.userId,
        name: updatedMember.User.name,
        email: updatedMember.User.email,
        role: updatedMember.role,
        relation: updatedMember.relation,
      },
    });
  } catch (error) {
    console.error("역할 변경 실패:", error);
    return NextResponse.json(
      { error: "역할 변경에 실패했습니다." },
      { status: 500 }
    );
  }
}
