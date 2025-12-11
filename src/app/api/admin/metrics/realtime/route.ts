
import { NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    // 🔒 보안: 관리자 권한 확인 (임시: 로그인한 사용자면 허용, 실제로는 role 체크 필요)
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: 관리자 Role 체크 로직 추가 필요
    // if (session.user.role !== 'admin') ...

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // 1. 최근 24시간 데이터 조회
    const metrics = await prisma.chatMetrics.findMany({
      where: {
        createdAt: {
          gte: oneDayAgo,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 2. 통계 집계
    const totalCount = metrics.length;
    const successCount = metrics.filter((m) => m.success).length;
    const errorCount = totalCount - successCount;
    const totalCost = metrics.reduce((sum, m) => sum + (m.estimatedCost || 0), 0);
    const avgResponseTime =
      totalCount > 0
        ? metrics.reduce((sum, m) => sum + m.totalTime, 0) / totalCount
        : 0;

    // 3. 시간대별 차트 데이터
    const hourlyStats = new Array(24).fill(0).map((_, i) => {
      const hourStart = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
      
      // 시간대 매칭
      const hourMetrics = metrics.filter(
        (m) => m.createdAt >= hourStart && m.createdAt < hourEnd
      );

      return {
        hour: hourStart.getHours(),
        label: `${hourStart.getHours()}시`,
        count: hourMetrics.length,
        avgTime:
          hourMetrics.length > 0
            ? hourMetrics.reduce((sum, m) => sum + m.totalTime, 0) /
              hourMetrics.length
            : 0,
        errors: hourMetrics.filter((m) => !m.success).length,
      };
    });

    // 4. 최근 로그 (최대 50개)
    const recentLogs = metrics.slice(0, 50).map((m) => ({
      id: m.id,
      question: m.question,
      answer: m.answer,
      totalTime: m.totalTime,
      cost: m.estimatedCost,
      success: m.success,
      createdAt: m.createdAt,
      complexity: m.complexity,
      mode: m.mode,
    }));

    return NextResponse.json({
      summary: {
        totalCount,
        successRate: totalCount > 0 ? (successCount / totalCount) * 100 : 0,
        errorCount,
        totalCost,
        avgResponseTime,
      },
      hourlyStats,
      recentLogs,
    });
  } catch (error) {
    console.error("통계 조회 실패:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
