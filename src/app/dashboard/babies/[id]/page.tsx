import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/shared/lib/prisma";
import { redirect } from "next/navigation";
import { ActivityManagementClient } from "@/features/activities/components/ActivityManagementClient";
import { BabyDetailTabs } from "@/features/babies/components/BabyDetailTabs";
import { BabyAnalyticsView } from "@/features/babies/components/BabyAnalyticsView";
import { AIChatView } from "@/components/features/ai-chat/AIChatView";
import { MeasurementCard } from "@/features/measurements/components/MeasurementCard";
import { getRecentActivities } from "@/features/activities/actions";

// 페이지 캐시 설정: 3초마다 재검증 (ISR)
export const revalidate = 3;

type TabType = "activities" | "analytics" | "ai-chat";

export default async function BabyDetailPage({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await paramsPromise;
  const searchParams = await searchParamsPromise;
  const babyId = params.id;
  
  // 게스트 모드 체크
  const isGuestMode = babyId === "guest-baby-id";
  
  // 게스트 모드가 아닐 경우에만 세션 체크
  if (!isGuestMode) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      // 현재 페이지 URL을 callbackUrl로 전달
      const currentPath = `/dashboard/babies/${babyId}${searchParams.tab ? `?tab=${searchParams.tab}` : ''}`;
      redirect(`/login?callbackUrl=${encodeURIComponent(currentPath)}`);
    }
  }

  
  // 유효한 탭 값 검증
  const validTabs: TabType[] = ["activities", "analytics", "ai-chat"];
  const currentTab: TabType =
    searchParams.tab && validTabs.includes(searchParams.tab as TabType)
      ? (searchParams.tab as TabType)
      : "activities";

  // 게스트 모드일 경우 샘플 데이터 사용
  let baby;
  if (isGuestMode) {
    baby = {
      id: "guest-baby-id",
      name: "샘플 아기",
      birthDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 6개월 전
      gender: "male" as const,
    };
  } else {
    // 아기 정보 가져오기
    baby = await prisma.baby.findUnique({
      where: { id: babyId },
    });

    if (!baby) {
      return (
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md text-center">
            <h1 className="text-2xl font-bold text-red-600">
              아기를 찾을 수 없습니다.
            </h1>
            <p className="text-gray-600 mt-2">
              잘못된 접근이거나 아기가 삭제되었을 수 있습니다.
            </p>
          </div>
        </main>
      );
    }
  }

  // 최근 활동 기록 가져오기 (activities 탭에서만 필요)
  const initialActivities =
    currentTab === "activities"
      ? await getRecentActivities(babyId).then((result) =>
          result.success ? result.data || [] : []
        )
      : [];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 게스트 모드 안내 배너 */}
      {isGuestMode && (
        <div className="bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 border-b-4 border-purple-300">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">👀</span>
                <div>
                  <h3 className="text-lg font-bold text-purple-800">
                    게스트 모드로 체험 중입니다
                  </h3>
                  <p className="text-sm text-purple-600">
                    로그인하고 내 아기의 성장을 기록해보세요! ✨
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <a
                  href="/login"
                  className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:from-pink-600 hover:to-purple-700 transition-all"
                >
                  로그인 하기 🚀
                </a>
                <a
                  href="/signup"
                  className="px-6 py-2 bg-white text-purple-600 font-semibold rounded-lg border-2 border-purple-600 hover:bg-purple-50 transition-all"
                >
                  회원가입 하기
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Baby Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800">{baby.name}</h1>
          <p className="text-gray-600 mt-2">
            {new Date(baby.birthDate).toLocaleDateString("ko-KR")} 출생 (
            {baby.gender === "male" ? "남아" : "여아"})
          </p>
        </div>
      </div>

      {/* Tabs */}
      <BabyDetailTabs babyId={babyId} />

      {/* Tab Content */}
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {currentTab === "activities" && (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* 성장 기록 카드 */}
            <div className="max-w-md">
              <MeasurementCard babyId={baby.id} />
            </div>

            {/* 활동 기록 */}
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                활동 기록
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ActivityManagementClient
                  babyId={baby.id}
                  initialActivities={initialActivities}
                />
              </div>
            </div>
          </div>
        )}

        {currentTab === "analytics" && (
          <div className="max-w-6xl mx-auto">
            <BabyAnalyticsView babyId={babyId} />
          </div>
        )}

        {currentTab === "ai-chat" && (
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-white border-b px-6 py-4">
              <h2 className="text-2xl font-bold text-gray-800">
                AI 육아 상담
              </h2>
            </div>
            <AIChatView babyId={babyId} />
          </div>
        )}
      </div>
    </main>
  );
}

