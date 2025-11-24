"use client";

import { Activity, ActivityType } from "@prisma/client";
import { useState } from "react";

interface UnifiedTimelineProps {
  activities: Activity[];
  startDate: Date;
  endDate: Date;
}

export function UnifiedTimeline({ activities, startDate, endDate }: UnifiedTimelineProps) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  // Generate array of dates in range
  const dates: Date[] = [];
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getActivityIcon = (activity: Activity) => {
    switch (activity.type) {
      case ActivityType.FEEDING:
        if (activity.feedingType === "breast") return "🤱";
        if (activity.feedingType === "formula") return "🍼";
        if (activity.feedingType === "baby_food") return "🥄";
        return "🍼";
      case ActivityType.SLEEP:
        return "😴";
      case ActivityType.DIAPER:
        return "💩";
      case ActivityType.MEDICINE:
        return "💊";
      case ActivityType.TEMPERATURE:
        return "🌡️";
      case ActivityType.BATH:
        return "🛁";
      case ActivityType.PLAY:
        return "🎮";
      default:
        return "📝";
    }
  };

  const getActivityColor = (activity: Activity) => {
    switch (activity.type) {
      case ActivityType.FEEDING:
        return "bg-blue-500";
      case ActivityType.SLEEP:
        return "bg-indigo-500";
      case ActivityType.DIAPER:
        return "bg-yellow-500";
      case ActivityType.MEDICINE:
        return "bg-purple-500";
      case ActivityType.TEMPERATURE:
        return "bg-red-500";
      case ActivityType.BATH:
        return "bg-cyan-500";
      case ActivityType.PLAY:
        return "bg-pink-500";
      default:
        return "bg-gray-500";
    }
  };

  const getActivityTooltip = (activity: Activity) => {
    const time = new Date(activity.startTime).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    switch (activity.type) {
      case ActivityType.FEEDING:
        if (activity.feedingType === "breast") {
          return `${time} 모유 ${activity.duration || 0}분 (${activity.breastSide === "left" ? "왼쪽" : "오른쪽"})`;
        }
        return `${time} ${activity.feedingType === "formula" ? "분유" : "이유식"} ${activity.feedingAmount || 0}ml`;
      case ActivityType.SLEEP:
        const endTime = activity.endTime
          ? new Date(activity.endTime).toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "진행중";
        return `${time} ~ ${endTime}`;
      case ActivityType.DIAPER:
        return `${time} ${activity.diaperType === "urine" ? "소변" : activity.diaperType === "stool" ? "대변" : "소변+대변"}`;
      case ActivityType.MEDICINE:
        return `${time} ${activity.medicineName} ${activity.medicineAmount}${activity.medicineUnit}`;
      case ActivityType.TEMPERATURE:
        return `${time} 체온 ${activity.temperature}°C`;
      default:
        return time;
    }
  };

  // 날짜와 시간별로 활동 그룹핑
  const getActivitiesForDateAndHour = (date: Date, hour: number) => {
    const dayStart = new Date(date);
    dayStart.setHours(hour, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(hour, 59, 59, 999);

    return activities.filter((a) => {
      const activityTime = new Date(a.startTime);
      return activityTime >= dayStart && activityTime <= dayEnd;
    });
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-max">
        {/* 헤더: 날짜들 */}
        <div className="flex sticky top-0 bg-white z-10 border-b-2 border-gray-300">
          <div className="w-12 sm:w-16 flex-shrink-0 border-r border-gray-300 p-2 text-center font-semibold text-gray-700 text-xs sm:text-base flex items-center justify-center">
            시간
          </div>
          {dates.map((date) => (
            <div
              key={date.toISOString()}
              className="w-12 sm:w-24 flex-shrink-0 border-r border-gray-200 p-1 sm:p-2 text-center"
            >
              <div className="text-xs sm:text-sm font-semibold text-gray-700">
                {date.toLocaleDateString("ko-KR", {
                  month: "numeric",
                  day: "numeric",
                })}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500">
                {date.toLocaleDateString("ko-KR", {
                  weekday: "short",
                })}
              </div>
            </div>
          ))}
        </div>

        {/* 시간별 행 */}
        {hours.map((hour) => (
          <div key={hour} className="flex border-b border-gray-200 hover:bg-blue-50/30">
            {/* 시간 레이블 */}
            <div className="w-12 sm:w-16 flex-shrink-0 border-r border-gray-300 p-1 sm:p-2 text-center text-xs sm:text-sm font-medium text-gray-600 flex items-center justify-center">
              {hour.toString().padStart(2, "0")}:00
            </div>

            {/* 각 날짜별 셀 */}
            {dates.map((date) => {
              const cellActivities = getActivitiesForDateAndHour(date, hour);
              
              return (
                <div
                  key={`${date.toISOString()}-${hour}`}
                  className="w-12 sm:w-24 flex-shrink-0 border-r border-gray-200 p-0.5 sm:p-1 min-h-[40px] sm:min-h-[48px] relative flex items-center justify-center"
                >
                  {cellActivities.length > 0 && (
                    <div className="flex flex-wrap gap-0.5 justify-center">
                      {cellActivities.map((activity) => (
                        <div
                          key={activity.id}
                          className={`${getActivityColor(activity)} text-white text-[10px] rounded-sm px-0.5 py-0.5 cursor-pointer hover:opacity-80 transition`}
                          onClick={() => setSelectedActivity(activity)}
                          title={getActivityTooltip(activity)}
                        >
                          <span className="text-xs sm:text-sm">{getActivityIcon(activity)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* 활동 상세 모달 */}
      {selectedActivity && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedActivity(null)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">활동 상세</h3>
              <button
                onClick={() => setSelectedActivity(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <p>{getActivityTooltip(selectedActivity)}</p>
              {selectedActivity.note && (
                <p className="text-gray-600 italic">{selectedActivity.note}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
