import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/shared/lib/prisma";
import { decrypt } from "@/shared/utils/encryption";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.error("[Chat History] No session or user ID");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const babyId = searchParams.get("babyId");

    if (!babyId) {
      console.error("[Chat History] No baby ID provided");
      return new NextResponse("Baby ID is required", { status: 400 });
    }

    // 아기 접근 권한 확인
    const baby = await prisma.baby.findFirst({
      where: {
        id: babyId,
        Family: { FamilyMembers: { some: { userId: session.user.id } } },
      },
    });

    if (!baby) {
      console.error(`[Chat History] User ${session.user.id} has no access to baby ${babyId}`);
      return new NextResponse("Forbidden", { status: 403 });
    }

    console.log(`[Chat History] Fetching messages for baby ${babyId}, user ${session.user.id}`);

    // 최근 대화 20개 조회 (최신순)
    // Privacy: 본인이 작성한 메시지 OR 가족과 공유된 메시지만 조회
    const messages = await prisma.chatMessage.findMany({
      where: {
        babyId,
        OR: [
          { userId: session.user.id },  // 본인의 메시지
          { isShared: true },            // 가족과 공유된 메시지
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    console.log(`[Chat History] Found ${messages.length} messages`);

    // 복호화 및 포맷팅 (과거순으로 재정렬하여 클라이언트에 전달)
    const formattedMessages = messages
      .map((msg) => {
        try {
          return [
            {
              id: msg.id + "-user",
              role: "user",
              content: decrypt(msg.message),
              createdAt: msg.createdAt,
              messageId: msg.id,
              userId: msg.userId,
              isShared: msg.isShared,
              sharedBy: msg.sharedBy,
              sharedAt: msg.sharedAt,
            },
            {
              id: msg.id + "-ai",
              role: "assistant", // 'model' 대신 클라이언트에서 사용하는 'assistant'로 통일
              content: decrypt(msg.reply),
              createdAt: msg.createdAt,
              messageId: msg.id,
              userId: msg.userId,
              isShared: msg.isShared,
              sharedBy: msg.sharedBy,
              sharedAt: msg.sharedAt,
            },
          ];
        } catch (e) {
          console.error(`Failed to decrypt message ${msg.id}`, e);
          return [];
        }
      })
      .reverse() // 최신순 -> 과거순 (DB) -> 다시 렌더링 순서(과거->최신)로 변경 필요?
                 // 보통 채팅 UI는 아래가 최신.
                 // map으로 [Array(2), Array(2)] 형태가 됨. flat 필요.
      .flat();
      
    // DB에서 desc로 가져왔으므로 [최신, 덜최신, 더덜최신...]
    // reverse() 하면 [더덜최신, 덜최신, 최신...] 순서가 되어 채팅 로그처럼 위에서 아래로 시간순 배치 가능

    return NextResponse.json(formattedMessages);
  } catch (error) {
    console.error("[Chat History] ERROR:", error);
    console.error("[Chat History] Stack:", error instanceof Error ? error.stack : "No stack trace");
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error",
        details: process.env.NODE_ENV === "development" ? error : undefined
      },
      { status: 500 }
    );
  }
}
