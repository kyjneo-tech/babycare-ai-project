/**
 * Schedules Page
 * 일정 전용 페이지 (예방접종, 건강검진, 마일스톤 등)
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/shared/lib/prisma";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getNoteIcon, getNoteTypeLabel } from "@/shared/utils/note-helpers";

export default async function SchedulesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/schedules");
  }

  // 첫 번째 아기 가져오기
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      FamilyMembers: {
        include: {
          Family: {
            include: {
              Babies: true,
            },
          },
        },
      },
    },
  });

  const babies = user?.FamilyMembers[0]?.Family?.Babies ?? [];
  const mainBaby = babies[0];

  if (!mainBaby) {
    redirect("/");
  }

  // 일정만 가져오기 (투두 제외)
  const schedules = await prisma.note.findMany({
    where: {
      babyId: mainBaby.id,
      type: {
        in: ['VACCINATION', 'HEALTH_CHECKUP', 'MILESTONE', 'WONDER_WEEK', 'SLEEP_REGRESSION', 'FEEDING_STAGE', 'APPOINTMENT'],
      },
    },
    orderBy: [
      { completed: 'asc' },
      { dueDate: 'asc' },
      { createdAt: 'desc' },
    ],
    take: 100,
  });

  const activeSchedules = schedules.filter((s) => !s.completed);
  const completedSchedules = schedules.filter((s) => s.completed);

  // 타입별로 그룹핑
  const groupedSchedules = activeSchedules.reduce((acc, schedule) => {
    if (!acc[schedule.type]) {
      acc[schedule.type] = [];
    }
    acc[schedule.type].push(schedule);
    return acc;
  }, {} as Record<string, typeof schedules>);

  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            홈으로 돌아가기
          </Link>
          <h1 className="text-2xl font-bold">일정 관리 📅</h1>
          <p className="text-gray-600 mt-1">
            {mainBaby.name}의 모든 일정을 확인하세요
          </p>
        </div>

        {/* 예정된 일정 - 타입별 섹션 */}
        {Object.keys(groupedSchedules).length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500">예정된 일정이 없습니다. 📅</p>
            <p className="text-sm text-gray-400 mt-2">
              "일정 자동 생성" 버튼으로 일정을 추가해보세요!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedSchedules).map(([type, items]) => (
              <div key={type} className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span>{getNoteIcon(type as any)}</span>
                  {getNoteTypeLabel(type as any)}
                  <span className="text-sm font-normal text-gray-500">({items.length})</span>
                </h2>
                <div className="space-y-3">
                  {items.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium">{schedule.title}</h3>
                          {schedule.content && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {schedule.content}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            {schedule.dueDate && (
                              <span>
                                📅 {new Date(schedule.dueDate).toLocaleDateString('ko-KR')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 완료된 일정 */}
        {completedSchedules.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-600">
              완료된 일정 ({completedSchedules.length})
            </h2>
            <div className="space-y-2">
              {completedSchedules.slice(0, 20).map((schedule) => (
                <div
                  key={schedule.id}
                  className="border rounded-lg p-3 bg-gray-50 opacity-60"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-sm">{getNoteIcon(schedule.type)}</span>
                    <h3 className="text-sm line-through">{schedule.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
