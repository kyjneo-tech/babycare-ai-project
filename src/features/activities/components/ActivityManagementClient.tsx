"use client";

import { useState, useCallback } from "react";
import { ActivityForm } from "./ActivityForm";
import { ActivityList } from "./ActivityList";
import { Activity } from "@prisma/client"; // Prisma Activity 타입 임포트

export function ActivityManagementClient({
  babyId,
  initialActivities,
}: {
  babyId: string;
  initialActivities: Activity[];
}) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);

  // ActivityForm에서 호출될 콜백 함수
  const handleActivityCreated = useCallback((newActivity: Activity) => {
    // 낙관적 업데이트: 이미 존재하는 활동이면 업데이트, 아니면 추가
    setActivities((prev) => {
      const exists = prev.some((a) => a.id === newActivity.id);
      if (exists) {
        return prev.map((a) => (a.id === newActivity.id ? newActivity : a));
      }
      return [newActivity, ...prev];
    });
  }, []);

  // ActivityList에서 삭제 발생 시 호출될 콜백 함수 (Supabase Realtime과는 별개)
  const handleActivityDeleted = useCallback((deletedActivityId: string) => {
    setActivities((prev) => prev.filter((act) => act.id !== deletedActivityId));
  }, []);

  return (
    <>
      {/* 활동 기록 폼 */}
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4">새 활동 기록</h2>
        <ActivityForm babyId={babyId} onActivityCreated={handleActivityCreated} />
      </div>

      {/* 최근 활동 목록 */}
      <div className="mt-8">
        <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4">최근 활동</h2>
        <ActivityList
          babyId={babyId}
          activities={activities} // ActivityList에 상태 전달
          onActivityDeleted={handleActivityDeleted} // ActivityList의 삭제 콜백
        />
      </div>
    </>
  );
}