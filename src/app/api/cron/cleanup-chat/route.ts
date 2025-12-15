import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";

// Vercel Cron 등 외부 스케줄러가 호출
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // 보안: CRON_SECRET 헤더 확인 (선택 사항, 로컬 테스트 편의를 위해 일단 주석 처리 or 간단 체크)
    // const authHeader = req.headers.get('authorization');
    // if (authHeader !== \`Bearer \${process.env.CRON_SECRET}\`) {
    //   return new NextResponse('Unauthorized', { status: 401 });
    // }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    /*
    const result = await prisma.chatMessage.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo,
        },
      },
    });
    */

    console.log(`[Cron] Cleanup skipped. Target date: ${thirtyDaysAgo.toISOString()}`);

    return NextResponse.json({
      success: true,
      deletedCount: 0,
      message: `[DISABLED] Would have deleted messages older than ${thirtyDaysAgo.toISOString()}`,
    });
  } catch (error) {
    console.error("Cleanup Cron Job Failed:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
