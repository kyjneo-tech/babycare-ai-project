import { Baby, Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/shared/lib/prisma";
import { redirect } from "next/navigation";
import { ActivityManagementClient } from "@/features/activities/components/ActivityManagementClient";
import { BabyAnalyticsView } from "@/features/babies/components/BabyAnalyticsView";
import { AIChatView } from "@/components/features/ai-chat/AIChatView";
import { MeasurementCard } from "@/features/measurements/components/MeasurementCard";
import { MilestoneCard } from "@/features/milestones/components/MilestoneCard";
import { getRecentActivities } from "@/features/activities/actions";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// 페이지 캐시 설정: 3초마다 재검증 (ISR)
export const revalidate = 3;

type TabType = "activities" | "analytics" | "ai-chat";

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
  
  // 게스트 모드가 아닐 경우에만 세션 체크
  if (!isGuestMode) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      // 현재 페이지 URL을 callbackUrl로 전달
      const currentPath = `/babies/${babyId}${searchParams.tab ? `?tab=${searchParams.tab}` : ''}`;
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
  let baby: Baby | null;
  if (isGuestMode) {
    baby = guestBaby;
  } else {
    // 아기 정보 가져오기
    baby = await prisma.baby.findUnique({
      where: { id: babyId },
    });

    if (!baby) {
      return (
        <Container>
          <Alert variant="destructive">
            <AlertTitle>아기를 찾을 수 없습니다.</AlertTitle>
            <AlertDescription>
              잘못된 접근이거나 아기가 삭제되었을 수 있습니다.
            </AlertDescription>
          </Alert>
        </Container>
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

  const tabDescriptions: Record<TabType, string> = {
    activities: "최근 활동을 기록하고 타임라인을 확인하세요.",
    analytics: "아기의 성장 패턴과 통계를 분석하세요.",
    "ai-chat": "AI 전문가에게 육아에 대해 무엇이든 물어보세요.",
  };

  return (
    <Container>
      {/* 게스트 모드 안내 배너 */}
      {isGuestMode && (
        <Alert className="mb-6 bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 border-purple-200">
          <AlertTitle className="font-bold text-purple-800">
            👀 게스트 모드로 체험 중입니다
          </AlertTitle>
          <AlertDescription className="flex flex-col md:flex-row items-center justify-between gap-4 text-purple-700">
            <p>로그인하고 내 아기의 성장을 기록해보세요! ✨</p>
            <div className="flex gap-3 mt-2 md:mt-0">
              <Button asChild>
                <Link href="/login">로그인 하기 🚀</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/signup">회원가입 하기</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <PageHeader
        title={baby.name}
        description={tabDescriptions[currentTab]}
      />

      {/* Tab Content */}
      <div className="mt-6">
        {currentTab === "activities" && (
          <div className="space-y-6">
            <div className="max-w-md space-y-6">
              <MeasurementCard babyId={baby.id} />
              <MilestoneCard babyId={baby.id} birthDate={baby.birthDate} />
            </div>
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
          <Card>
            <AIChatView babyId={babyId} />
          </Card>
        )}
      </div>
    </Container>
  );
}

