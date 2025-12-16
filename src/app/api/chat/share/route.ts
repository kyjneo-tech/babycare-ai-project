import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/shared/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/chat/share
 * 채팅 메시지를 가족과 공유하거나 공유 해제
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { messageId, isShared } = body;

    if (!messageId || typeof isShared !== "boolean") {
      return new NextResponse("Invalid request body", { status: 400 });
    }

    // 메시지 조회 및 권한 확인
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
      include: {
        Baby: {
          include: {
            Family: {
              include: {
                FamilyMembers: {
                  where: { userId: session.user.id },
                },
              },
            },
          },
        },
      },
    });

    if (!message) {
      return new NextResponse("Message not found", { status: 404 });
    }

    // 권한 확인: 본인이 작성한 메시지만 공유/해제 가능
    if (message.userId !== session.user.id) {
      return new NextResponse("Forbidden: You can only share your own messages", {
        status: 403,
      });
    }

    // 가족 구성원인지 확인
    if (message.Baby.Family.FamilyMembers.length === 0) {
      return new NextResponse("Forbidden: Not a family member", { status: 403 });
    }

    // 공유 상태 업데이트
    const updatedMessage = await prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        isShared,
        sharedBy: isShared ? session.user.id : null,
        sharedAt: isShared ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: isShared ? "메시지가 가족과 공유되었습니다." : "공유가 해제되었습니다.",
      data: {
        messageId: updatedMessage.id,
        isShared: updatedMessage.isShared,
        sharedBy: updatedMessage.sharedBy,
        sharedAt: updatedMessage.sharedAt,
      },
    });
  } catch (error) {
    console.error("Failed to update message sharing status:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
