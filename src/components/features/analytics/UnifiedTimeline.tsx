"use client";

import { Activity, ActivityType } from "@prisma/client";
import { MobileOptimizedTimeline } from "./MobileOptimizedTimeline";

interface UnifiedTimelineProps {
  activities: Activity[];
  startDate: Date;
  endDate: Date;
  activeFilters: ActivityType[];
}

export function UnifiedTimeline({
  activities,
  startDate,
  endDate,
  activeFilters,
}: UnifiedTimelineProps) {
  // 클라이언트 사이드에서 필터링 적용
  const filteredActivities =
    activeFilters.length > 0
      ? activities.filter((activity) => activeFilters.includes(activity.type))
      : activities;

  return (
    <div>
      {/* 모바일 최적화 타임라인 */}
      <MobileOptimizedTimeline
        activities={filteredActivities}
        startDate={startDate}
        endDate={endDate}
      />

      {/* 활동이 없는 경우 */}
      {activities.length > 0 && filteredActivities.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-12 text-center mt-6">
          <p className="text-gray-500 text-lg">선택한 필터에 해당하는 활동이 없습니다.</p>
          <p className="text-gray-400 text-sm mt-2">다른 활동을 선택해보세요.</p>
        </div>
      )}

      {activities.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-12 text-center mt-6">
          <p className="text-gray-500 text-lg">
            선택한 기간에 활동 기록이 없습니다.
          </p>
          <p className="text-gray-400 text-sm mt-2">활동을 기록해보세요!</p>
        </div>
      )}
    </div>
  );
}
