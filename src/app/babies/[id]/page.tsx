import { Baby, Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/shared/lib/prisma";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import { ActivityManagementClient } from "@/features/activities/components/ActivityManagementClient";

import { MeasurementCard } from "@/features/measurements/components/MeasurementCard";
import { CompactScheduleCarousel } from "@/features/schedules/components/CompactScheduleCarousel";
import { getRecentActivities } from "@/features/activities/actions";
import { MobileContainer } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BabyStoreInitializer } from "@/features/babies/components/BabyStoreInitializer";

// 동적 import로 변경하여 초기 번들 크기 최적화
const BabyAnalyticsView = dynamic(
  () => import("@/features/babies/components/BabyAnalyticsView").then(mod => ({ default: mod.BabyAnalyticsView })),
  {
    loading: () => (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-sm text-gray-500">통계를 불러오는 중...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    ),
  }
);

const AIChatView = dynamic(
  () => import("@/features/ai-chat/components/AIChatView").then(mod => ({ default: mod.AIChatView })),
  {
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">AI 채팅을 불러오는 중...</p>
        </div>
      </div>
    ),
  }
);

const InteractiveScheduleTimeline = dynamic(
  () => import("@/features/schedules/components/InteractiveScheduleTimeline").then(mod => ({ default: mod.InteractiveScheduleTimeline })),
  {
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">일정을 불러오는 중...</p>
        </div>
      </div>
    ),
  }
);


// 페이지 캐시 설정: 3초마다 재검증 (ISR)
export const revalidate = 3;

type TabType = "activities" | "analytics" | "ai-chat" | "timeline";

const guestBaby: Baby = {
  id: "guest-baby-id",
  name: "샘플 아기",
  birthDate: new Date(new Date().getTime() - 180 * 24 * 60 * 60 * 1000), // 6개월 전
  birthTime: "00:00", // 기본값 추가
  gender: "MALE",
  familyId: "guest-family-id",
  photoUrl: null, // 기본값 추가
  createdAt: new Date(),
  updatedAt: new Date(),
  aiSettings: {} as Prisma.JsonValue, // JsonValue 타입 명시
};

export default async function BabyDetailPage({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}: {
  params: Promise<{ id:string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await paramsPromise;
  const searchParams = await searchParamsPromise;
  const babyId = params.id;
  
  // 게스트 모드 체크
  const isGuestMode = babyId === "guest-baby-id";

  // 세션 가져오기
  const session = !isGuestMode ? await getServerSession(authOptions) : null;

  // 게스트 모드가 아닐 경우에만 세션 체크
  if (!isGuestMode && !session?.user?.id) {
    // 현재 페이지 URL을 callbackUrl로 전달
    const currentPath = `/babies/${babyId}${searchParams.tab ? `?tab=${searchParams.tab}` : ''}`;
    redirect(`/login?callbackUrl=${encodeURIComponent(currentPath)}`);
  }


  // 유효한 탭 값 검증
  const validTabs: TabType[] = ["activities", "analytics", "ai-chat", "timeline"];
  const currentTab: TabType =
    searchParams.tab && validTabs.includes(searchParams.tab as TabType)
      ? (searchParams.tab as TabType)
      : "activities";

  // 게스트 모드일 경우 샘플 데이터 사용
  let baby: Baby | null;
  let allBabies: Baby[] = [];

  if (isGuestMode) {
    baby = guestBaby;
    allBabies = [guestBaby];
  } else {
    // 아기 정보 가져오기 (필요한 필드만 select)
    baby = await prisma.baby.findUnique({
      where: { id: babyId },
      select: {
        id: true,
        name: true,
        birthDate: true,
        birthTime: true,
        gender: true,
        familyId: true,
        photoUrl: true,
        createdAt: true,
        updatedAt: true,
        aiSettings: true,
      },
    });

    if (!baby) {
      return (
        <MobileContainer>
          <Alert variant="destructive">
            <AlertTitle>아기를 찾을 수 없습니다.</AlertTitle>
            <AlertDescription>
              잘못된 접근이거나 아기가 삭제되었을 수 있습니다.
            </AlertDescription>
          </Alert>
        </MobileContainer>
      );
    }

    // 🔥 현재 사용자의 모든 babies 가져오기 (AppHeader BabySwitcher용)
    if (session?.user?.id) {
      allBabies = await prisma.baby.findMany({
        where: {
          Family: {
            FamilyMembers: {
              some: {
                userId: session.user.id,
              },
            },
          },
        },
        select: {
          id: true,
          name: true,
          birthDate: true,
          birthTime: true,
          gender: true,
          familyId: true,
          photoUrl: true,
          createdAt: true,
          updatedAt: true,
          aiSettings: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
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
    <MobileContainer>
      {/* 🔥 Zustand Store 초기화 (AppHeader BabySwitcher용) */}
      {!isGuestMode && allBabies.length > 0 && (
        <BabyStoreInitializer babies={allBabies} currentBabyId={babyId} />
      )}

      {/* 게스트 모드 안내 배너 */}
      {isGuestMode && (
        <Alert className="bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 border-purple-200">
          <AlertTitle className="font-bold text-purple-800">
            👀 게스트 모드로 체험 중입니다
          </AlertTitle>
          <AlertDescription className="flex flex-col md:flex-row items-center justify-between gap-4 text-purple-700">
            <p>로그인하고 내 아기의 성장을 기록해보세요! ✨</p>
            <Button asChild className="mt-2 md:mt-0">
              <Link href="/login">로그인 하기 🚀</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Tab Navigation - 제거됨 */}
      {/* <BabyDetailTabs babyId={baby.id} /> */}

      {/* Tab Content */}
      <div className="mt-0">
        {currentTab === "activities" && (
          <div className="space-y-4">
            {/* 일정 캐러셀 - 최상단 */}
            <CompactScheduleCarousel babyId={baby.id} />

            {/* 성장 기록 - 축소 버전 */}
            <MeasurementCard babyId={baby.id} />

            {/* 최근 활동 - 메인 콘텐츠 */}
            <Card>
              <CardContent className="p-6">
                <ActivityManagementClient
                  babyId={baby.id}
                  initialActivities={initialActivities}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {currentTab === "analytics" && <BabyAnalyticsView babyId={babyId} />}

        {currentTab === "ai-chat" && (
          <Card className="overflow-hidden relative z-0" data-testid="ai-chat-card">
            <AIChatView babyId={babyId} />
          </Card>
        )}

        {currentTab === "timeline" && (
          <Card>
            <CardContent className="p-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900">전체 일정</h2>
                <p className="text-sm text-gray-500 mt-1">
                  예방접종, 건강검진, 발달 이정표 등 모든 일정을 확인하고 관리하세요
                </p>
              </div>
              <InteractiveScheduleTimeline babyId={baby.id} />
            </CardContent>
          </Card>
        )}
      </div>
    </MobileContainer>
  );
}

