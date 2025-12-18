"use client";

import { useState, useEffect, useCallback } from "react";
import { UnifiedTimeline } from "@/features/analytics/components/UnifiedTimeline";
import { getActivitiesByDateRange } from "@/features/analytics/actions";
import { Activity, ActivityType } from "@prisma/client";
import { subDays, startOfDay, endOfDay, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartSkeleton } from "@/components/common/Skeletons";
import { Card, CardContent } from "@/components/ui/card";
import { TYPOGRAPHY, SPACING } from "@/design-system";
import { cn } from "@/lib/utils";
import { ActivityTypeFilter } from "@/features/analytics/components/ActivityTypeFilter";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { PeriodSummaryCard } from "@/features/analytics/components/PeriodSummaryCard";
import { getPeriodSummary } from "@/features/analytics/actions/summaryActions";
import { PeriodSummary } from "@/features/analytics/types/summary";

interface BabyAnalyticsViewProps {
  babyId: string;
}

export function BabyAnalyticsView({ babyId }: BabyAnalyticsViewProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(7);
  const [activeFilters, setActiveFilters] = useState<ActivityType[]>([]);
  const [summary, setSummary] = useState<PeriodSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // 기본값: 최근 7일
  const [startDate, setStartDate] = useState<Date>(
    startOfDay(subDays(new Date(), 6))
  );
  const [endDate, setEndDate] = useState<Date>(endOfDay(new Date()));

  const loadActivities = useCallback(async (start: Date, end: Date) => {
    setLoading(true);
    const result = await getActivitiesByDateRange(babyId, start, end);
    if (result.success && result.data) {
      setActivities(result.data);
    }
    setLoading(false);
  }, [babyId]);

  const loadSummary = useCallback(async (days: number) => {
    setSummaryLoading(true);
    try {
      const result = await getPeriodSummary(babyId, days);
      if (result.success && result.data) {
        setSummary(result.data);
      } else {
        console.error("Failed to load summary:", result.error);
      }
    } catch (error) {
      console.error("Failed to load summary:", error);
    } finally {
      setSummaryLoading(false);
    }
  }, [babyId]);

  useEffect(() => {
    // babyId가 변경되면 날짜 범위를 초기화하고 데이터를 다시 로드
    const newStartDate = startOfDay(subDays(new Date(), 6));
    const newEndDate = endOfDay(new Date());
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    setSelectedDays(7);
    loadActivities(newStartDate, newEndDate);
    loadSummary(7); // 요약 데이터도 함께 로드
  }, [babyId, loadActivities, loadSummary]);

  const handlePeriodChange = (days: number) => {
    setSelectedDays(days);
    const end = endOfDay(new Date());
    const start = startOfDay(subDays(end, days - 1));
    setStartDate(start);
    setEndDate(end);
    loadActivities(start, end);
    loadSummary(days); // 요약 데이터도 함께 로드
  };

  const handleCustomDateChange = (type: "start" | "end", value: string) => {
    const date = new Date(value);
    if (type === "start") {
      const newStart = startOfDay(date);
      setStartDate(newStart);
      loadActivities(newStart, endDate);
    } else {
      const newEnd = endOfDay(date);
      setEndDate(newEnd);
      loadActivities(startDate, newEnd);
    }
    setSelectedDays(0); // 커스텀 날짜 선택 시 기본 버튼 해제
  };

  const handleFilterChange = (filters: ActivityType[]) => {
    setActiveFilters(filters);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className={cn(SPACING.card.small, "space-y-4")}>
            <Skeleton className="h-7 w-24" /> {/* Title */}
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Skeleton className="h-4 w-12" /> {/* Label */}
                <Skeleton className="h-10 w-full" /> {/* Input */}
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-12" /> {/* Label */}
                <Skeleton className="h-10 w-full" /> {/* Input */}
              </div>
            </div>
          </CardContent>
        </Card>
        <ChartSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 통합 필터 카드 */}
      <Card>
        <CardContent className={cn(SPACING.card.small, "space-y-4")}>
          <h3 className={TYPOGRAPHY.h3}>📊 통계 필터</h3>

          {/* 빠른 기간 선택 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">기간 선택</Label>
            <div className="grid grid-cols-3 gap-2">
              {[7, 14, 30].map((days) => (
                <Button
                  key={days}
                  variant={selectedDays === days ? "default" : "secondary"}
                  onClick={() => handlePeriodChange(days)}
                  size="sm"
                >
                  {days}일
                </Button>
              ))}
            </div>
          </div>

          {/* 커스텀 날짜 선택 (접을 수 있음) */}
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between text-sm"
              >
                <span>상세 기간 설정</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="start-date" className="text-xs">시작일</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={format(startDate, "yyyy-MM-dd")}
                    onChange={(e) =>
                      handleCustomDateChange("start", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date" className="text-xs">종료일</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={format(endDate, "yyyy-MM-dd")}
                    onChange={(e) => handleCustomDateChange("end", e.target.value)}
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* 활동 필터 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">활동 유형</Label>
            <ActivityTypeFilter
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* 요약 카드 */}
      {summaryLoading ? (
        <Card>
          <CardContent className={cn(SPACING.card.small, "space-y-4")}>
            <Skeleton className="h-6 w-32" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </CardContent>
        </Card>
      ) : summary ? (
        <PeriodSummaryCard summary={summary} days={selectedDays} />
      ) : null}

      {/* 타임라인 */}
      <Card>
        <CardContent className={SPACING.card.medium}>
          <h3 className={cn(TYPOGRAPHY.h2, "mb-6")}>활동 타임라인</h3>
          {activities.length > 0 ? (
            <UnifiedTimeline
              activities={activities}
              startDate={startDate}
              endDate={endDate}
              activeFilters={activeFilters}
            />
          ) : (
            <div className="py-12 text-center">
              <p
                className={cn(
                  TYPOGRAPHY.body.large,
                  "text-muted-foreground",
                  "mb-2"
                )}
              >
                이 기간에 기록된 활동이 없습니다.
              </p>
              <p
                className={cn(
                  TYPOGRAPHY.body.default,
                  "text-muted-foreground"
                )}
              >
                아기의 활동을 기록해보세요!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
