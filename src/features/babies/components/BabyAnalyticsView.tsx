"use client";

import { useState, useEffect, useCallback } from "react";
import { UnifiedTimeline } from "@/components/features/analytics/UnifiedTimeline";
import { getActivitiesByDateRange } from "@/features/analytics/actions";
import { Activity } from "@prisma/client";
import { subDays, startOfDay, endOfDay, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartSkeleton } from "@/components/common/Skeletons";
import { Card, CardContent } from "@/components/ui/card";
import { TYPOGRAPHY, SPACING } from "@/design-system";
import { cn } from "@/lib/utils";

interface BabyAnalyticsViewProps {
  babyId: string;
}

export function BabyAnalyticsView({ babyId }: BabyAnalyticsViewProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(7);
  
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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    loadActivities(startDate, endDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [babyId]);

  const handlePeriodChange = (days: number) => {
    setSelectedDays(days);
    const end = endOfDay(new Date());
    const start = startOfDay(subDays(end, days - 1));
    setStartDate(start);
    setEndDate(end);
    loadActivities(start, end);
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
    <div className="space-y-6">
      {/* 기간 선택 */}
      <Card>
        <CardContent className={cn(SPACING.card.small, "space-y-4")}>
          <h3 className={TYPOGRAPHY.h3}>기간 선택</h3>
          
          {/* 빠른 선택 버튼 */}
          <div className="grid grid-cols-3 gap-2">
            {[7, 14, 30].map((days) => (
              <Button
                key={days}
                variant={selectedDays === days ? "default" : "secondary"}
                onClick={() => handlePeriodChange(days)}
              >
                {days}일
              </Button>
            ))}
          </div>

          {/* 커스텀 날짜 선택 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="start-date">시작일</Label>
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
              <Label htmlFor="end-date">종료일</Label>
              <Input
                id="end-date"
                type="date"
                value={format(endDate, "yyyy-MM-dd")}
                onChange={(e) => handleCustomDateChange("end", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 타임라인 */}
      <Card>
        <CardContent className={SPACING.card.medium}>
          <h3 className={cn(TYPOGRAPHY.h2, "mb-6")}>활동 타임라인</h3>
          {activities.length > 0 ? (
            <UnifiedTimeline
              activities={activities}
              startDate={startDate}
              endDate={endDate}
            />
          ) : (
            <div className="py-12 text-center">
              <p className={cn(TYPOGRAPHY.body.large, "text-muted-foreground", "mb-2")}>
                이 기간에 기록된 활동이 없습니다.
              </p>
              <p className={cn(TYPOGRAPHY.body.default, "text-muted-foreground")}>
                아기의 활동을 기록해보세요!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
