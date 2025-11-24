"use client";

import { useEffect, useRef, useState } from "react";
import { getActivitiesPaginated } from "@/features/activities/actions";
import { DailySeparator } from "./DailySeparator";
import { DailySummary } from "./DailySummary";
import { ActivityCard } from "./ActivityCard";
import { Activity } from "@prisma/client";

interface InfiniteActivityListProps {
  babyId: string;
  initialData?: {
    activities: Activity[];
    nextCursor: string | null;
    hasMore: boolean;
    dailySummaries: Record<string, any>;
  };
}

export function InfiniteActivityList({
  babyId,
  initialData,
}: InfiniteActivityListProps) {
  const [activities, setActivities] = useState<Activity[]>(
    initialData?.activities || []
  );
  const [dailySummaries, setDailySummaries] = useState<Record<string, any>>(
    initialData?.dailySummaries || {}
  );
  const [cursor, setCursor] = useState<string | null>(
    initialData?.nextCursor || null
  );
  const [hasMore, setHasMore] = useState(initialData?.hasMore ?? true);
  const [isLoading, setIsLoading] = useState(false);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const loadMore = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    const result = await getActivitiesPaginated(babyId, cursor || undefined);

    if (result.success && result.data) {
      setActivities((prev) => [...prev, ...result.data!.activities]);
      setDailySummaries((prev) => ({
        ...prev,
        ...result.data!.dailySummaries,
      }));
      setCursor(result.data.nextCursor);
      setHasMore(result.data.hasMore);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [hasMore, isLoading, cursor]);

  // 날짜별 그룹핑
  const groupedByDate: Record<string, Activity[]> = {};
  activities.forEach((activity) => {
    const dateKey = new Date(activity.startTime).toISOString().split("T")[0];
    if (!groupedByDate[dateKey]) {
      groupedByDate[dateKey] = [];
    }
    groupedByDate[dateKey].push(activity);
  });

  const handleActivityDelete = (activityId: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== activityId));
  };

  return (
    <div className="space-y-4">
      {Object.entries(groupedByDate).map(([dateKey, dayActivities]) => (
        <div key={dateKey}>
          <DailySeparator date={new Date(dateKey)} />
          <DailySummary summary={dailySummaries[dateKey] || {}} />
          <div className="space-y-2">
            {dayActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onDelete={handleActivityDelete}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Load More Trigger */}
      <div ref={loadMoreRef} className="h-10 flex items-center justify-center">
        {isLoading && (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
        )}
      </div>

      {!hasMore && activities.length > 0 && (
        <p className="text-center text-gray-500 text-sm py-4">
          모든 활동을 불러왔습니다
        </p>
      )}

      {!isLoading && activities.length === 0 && (
        <p className="text-center text-gray-500 py-8">
          아직 기록된 활동이 없습니다.
        </p>
      )}
    </div>
  );
}
