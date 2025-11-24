// src/app/dashboard/babies/[id]/components/ActivityList.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/shared/lib/supabase/client";
import { Activity } from "@prisma/client";
import { deleteActivity } from "@/features/activities/actions";

import { activityTypeLabels, getActivityDescription, formatActivityTime, feedingTypeLabels, diaperTypeLabels, breastSideLabels } from "@/shared/utils/activityLabels";

// ActivityCard는 별도의 컴포넌트로 분리하거나 여기에 간단히 정의할 수 있습니다.
// 여기서는 간단히 정의합니다.
function ActivityCard({
  activity,
  onDelete,
}: {
  activity: Activity;
  onDelete: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("이 활동을 정말 삭제하시겠습니까?")) return;

    setDeleting(true);
    try {
      const result = await deleteActivity(activity.id, activity.userId);
      if (result.success) {
        // 즉시 UI에서 제거
        onDelete(activity.id);
      } else {
        alert(result.error || "삭제에 실패했습니다.");
      }
    } catch (error) {
      alert("삭제 중 오류가 발생했습니다.");
    } finally {
      setDeleting(false);
    }
  };

  const renderActivityDetails = () => {
    switch (activity.type) {
      case "FEEDING":
        return (
          <>
            <p className="text-sm text-gray-600">
              {activity.feedingType && feedingTypeLabels[activity.feedingType as keyof typeof feedingTypeLabels]}
              {activity.feedingType === "breast" && activity.breastSide && 
                ` (${breastSideLabels[activity.breastSide as keyof typeof breastSideLabels]})`}
              {activity.feedingAmount && ` ${activity.feedingAmount}ml`}
              {activity.feedingType === "breast" && activity.duration && ` ${activity.duration}분`}
            </p>
          </>
        );
      case "SLEEP":
        return (
          <>
            {activity.duration && (
              <p className="text-sm text-gray-600">
                {Math.floor(activity.duration / 60) > 0 && `${Math.floor(activity.duration / 60)}시간 `}
                {activity.duration % 60 > 0 && `${activity.duration % 60}분`}
              </p>
            )}
          </>
        );
      case "DIAPER":
        return (
          <>
            <p className="text-sm text-gray-600">
              {activity.diaperType && diaperTypeLabels[activity.diaperType as keyof typeof diaperTypeLabels]}
            </p>
            {activity.stoolColor && (
              <p className="text-sm text-gray-500">
                색상: {activity.stoolColor}
              </p>
            )}
          </>
        );
      case "BATH":
        return (
          <>
            {activity.bathTemp && (
              <p className="text-sm text-gray-600">
                온도: {activity.bathTemp}°C
              </p>
            )}
          </>
        );
      case "PLAY":
        return (
          <>
            {activity.playDuration && (
              <p className="text-sm text-gray-600">
                {activity.playDuration}분
              </p>
            )}
          </>
        );
      case "MEDICINE":
        return (
          <>
            <p className="text-sm text-gray-600">
              {activity.medicineName}
            </p>
            {activity.medicineAmount && (
              <p className="text-sm text-gray-500">
                {activity.medicineAmount} {activity.medicineUnit}
              </p>
            )}
          </>
        );
      case "TEMPERATURE":
        return (
          <>
            <p className="text-sm text-gray-600">
              {activity.temperature}°C
            </p>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div
      key={activity.id}
      className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition border border-gray-100 flex justify-between items-start"
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-gray-800">
            {activityTypeLabels[activity.type]}
          </span>
          <span className="text-xs text-gray-500">
            {formatActivityTime(activity.startTime)}
          </span>
        </div>
        {renderActivityDetails()} {/* 상세 정보 렌더링 */}
        {activity.note && <p className="text-sm mt-2 text-gray-600 italic">{activity.note}</p>}
      </div>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="flex-shrink-0 ml-3 px-3 py-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-sm rounded transition"
        title="삭제"
      >
        {deleting ? "..." : "삭제"}
      </button>
    </div>
  );
}

export function ActivityList({
  babyId,
  activities: initialActivities,
  onActivityDeleted,
}: {
  babyId: string;
  activities: Activity[];
  onActivityDeleted: (id: string) => void;
}) {
  const [activities, setActivities] = useState(initialActivities);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setActivities(initialActivities);
  }, [initialActivities]);

  useEffect(() => {
    let channel: any;
    let isActive = true;

    const setupSubscription = async () => {
      try {
        // Realtime 구독
        channel = supabase
          .channel(`activities-${babyId}`, {
            config: {
              broadcast: { self: true },
            },
          })

          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "Activity",
              filter: `babyId=eq.${babyId}`,
            },
            (payload) => {
              if (isActive) {
                console.log("✏️ 활동 수정 감지:", payload.new);
                setActivities((prev) =>
                  prev.map((a) =>
                    a.id === payload.new.id ? (payload.new as Activity) : a
                  )
                );
              }
            }
          )
          .on(
            "postgres_changes",
            {
              event: "DELETE",
              schema: "public",
              table: "Activity",
              filter: `babyId=eq.${babyId}`,
            },
            (payload) => {
              if (isActive) {
                console.log("🗑️ 활동 삭제 감지:", payload.old);
                setActivities((prev) =>
                  prev.filter((a) => a.id !== payload.old.id)
                );
              }
            }
          )
          .subscribe((status) => {
            if (status === "SUBSCRIBED") {
              console.log("✅ Supabase 구독 성공");
              setIsSubscribed(true);
            } else if (status === "CHANNEL_ERROR") {
              // console.error("❌ Supabase 구독 실패");
            }
          });
      } catch (error) {
        // console.error("구독 설정 오류:", error);
      }
    };

    setupSubscription();

    return () => {
      isActive = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [babyId, supabase, onActivityDeleted]); // onActivityDeleted 의존성 추가

  const handleActivityDelete = (activityId: string) => {
    onActivityDeleted(activityId); // 부모 컴포넌트의 콜백 호출
  };

  return (
    <div className="space-y-4">
      {!isSubscribed && (
        <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded border border-yellow-200">
          실시간 업데이트 연결 중...
        </div>
      )}
      {activities.length === 0 ? (
        <p className="text-gray-500">아직 기록된 활동이 없습니다.</p>
      ) : (
        activities.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            onDelete={handleActivityDelete}
          />
        ))
      )}
    </div>
  );
}
