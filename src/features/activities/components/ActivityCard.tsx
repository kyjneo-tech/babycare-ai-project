"use client";

import { useState } from "react";
import { Activity } from "@prisma/client";
import { deleteActivity } from "@/features/activities/actions";
import {
  activityTypeLabels,
  formatActivityTime,
  feedingTypeLabels,
  diaperTypeLabels,
  breastSideLabels,
} from "@/shared/utils/activityLabels";

interface ActivityCardProps {
  activity: Activity;
  onDelete?: (id: string) => void;
}

export function ActivityCard({ activity, onDelete }: ActivityCardProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("이 활동을 정말 삭제하시겠습니까?")) return;

    setDeleting(true);
    try {
      const result = await deleteActivity(activity.id, activity.userId);
      if (result.success) {
        onDelete?.(activity.id);
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
          <p className="text-sm text-gray-600">
            {activity.feedingType &&
              feedingTypeLabels[
                activity.feedingType as keyof typeof feedingTypeLabels
              ]}
            {activity.feedingType === "breast" &&
              activity.breastSide &&
              ` (${breastSideLabels[activity.breastSide as keyof typeof breastSideLabels]})`}
            {activity.feedingAmount && ` ${activity.feedingAmount}ml`}
            {activity.feedingType === "breast" &&
              activity.duration &&
              ` ${activity.duration}분`}
          </p>
        );
      case "SLEEP":
        return (
          <>
            {activity.duration && (
              <p className="text-sm text-gray-600">
                {Math.floor(activity.duration / 60) > 0 &&
                  `${Math.floor(activity.duration / 60)}시간 `}
                {activity.duration % 60 > 0 && `${activity.duration % 60}분`}
              </p>
            )}
          </>
        );
      case "DIAPER":
        return (
          <>
            <p className="text-sm text-gray-600">
              {activity.diaperType &&
                diaperTypeLabels[
                  activity.diaperType as keyof typeof diaperTypeLabels
                ]}
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
              <p className="text-sm text-gray-600">{activity.playDuration}분</p>
            )}
          </>
        );
      case "MEDICINE":
        return (
          <>
            <p className="text-sm text-gray-600">{activity.medicineName}</p>
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
            {activity.temperature && (
              <p className="text-sm text-gray-600">{activity.temperature}°C</p>
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition border border-gray-100 flex justify-between items-start">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-gray-800">
            {activityTypeLabels[activity.type]}
          </span>
          <span className="text-xs text-gray-500">
            {formatActivityTime(activity.startTime)}
          </span>
        </div>
        {renderActivityDetails()}
        {activity.note && (
          <p className="text-sm mt-2 text-gray-600 italic">{activity.note}</p>
        )}
      </div>
      {onDelete && (
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex-shrink-0 ml-3 px-3 py-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-sm rounded transition"
          title="삭제"
        >
          {deleting ? "..." : "삭제"}
        </button>
      )}
    </div>
  );
}
