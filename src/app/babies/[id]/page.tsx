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
      <Card className="bg-white/5 backdrop-blur-md border-white/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-sm text-slate-400">통계를 불러오는 중...</p>
            </div>
          </div>
        </CardContent>
      </Card>
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
          <p className="text-sm text-slate-400">일정을 불러오는 중...</p>
        </div>
      </div>
    ),
  }
);


// 페이지 캐시 설정: 동적 렌더링 (항상 최신 데이터)
// revalidate를 0으로 설정하여 캐시하지 않고, 클라이언트 사이드에서 필요시 refetch
// 활동 기록/수정/삭제 시 router.refresh()로 자동 업데이트됨
export const revalidate = 0;

type TabType = "activities" | "analytics" | "timeline";

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
  const validTabs: TabType[] = ["activities", "analytics", "timeline"];
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
    // 🔒 보안: 아기 정보 가져오기 (권한 검증 포함)
    // 반드시 현재 사용자가 해당 Family의 멤버인 경우만 조회
    baby = await prisma.baby.findFirst({
      where: {
        id: babyId,
        Family: {
          FamilyMembers: {
            some: {
              userId: session!.user!.id,
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
    });

    if (!baby) {
      return (
        <MobileContainer>
          <Alert variant="destructive">
            <AlertTitle>접근 권한이 없습니다.</AlertTitle>
            <AlertDescription>
              이 아기의 정보에 접근할 수 있는 권한이 없거나, 아기를 찾을 수 없습니다.
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
        <Alert className="bg-gradient-to-r from-purple-900/20 via-indigo-900/20 to-blue-900/20 backdrop-blur-md border-white/10 shadow-lg">
          <AlertTitle className="font-bold text-purple-300">
            👀 게스트 모드로 체험 중입니다
          </AlertTitle>
          <AlertDescription className="flex flex-col md:flex-row items-center justify-between gap-4 text-slate-300">
            <p>로그인하고 내 아기의 성장을 기록해보세요! ✨</p>
            <Button asChild className="mt-2 md:mt-0 bg-primary hover:bg-primary/90 text-white shadow-lg">
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
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
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

        {currentTab === "timeline" && (
          <InteractiveScheduleTimeline babyId={baby.id} />
        )}
      </div>
    </MobileContainer>
  );
}

