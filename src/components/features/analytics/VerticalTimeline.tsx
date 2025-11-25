"use client";

import { Activity, ActivityType } from "@prisma/client";
import { useState } from "react";
import { formatDuration } from "@/features/analytics/utils/statsCalculator";

interface VerticalTimelineProps {
  activities: Activity[];
  date: Date;
}

interface TimeSlot {
  hour: number;
  activities: Activity[];
}

export function VerticalTimeline({ activities, date }: VerticalTimelineProps) {
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);

  // 24시간 배열 생성
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // 활동 타입별 색상
  const getActivityColor = (type: ActivityType): { bg: string; border: string; hex: string } => {
    switch (type) {
      case ActivityType.SLEEP:
        return { bg: "bg-indigo-500", border: "border-indigo-500", hex: "#6366f1" };
      case ActivityType.FEEDING:
        return { bg: "bg-blue-500", border: "border-blue-500", hex: "#3b82f6" };
      case ActivityType.DIAPER:
        return { bg: "bg-yellow-500", border: "border-yellow-500", hex: "#eab308" };
      case ActivityType.MEDICINE:
        return { bg: "bg-purple-500", border: "border-purple-500", hex: "#a855f7" };
      case ActivityType.TEMPERATURE:
        return { bg: "bg-red-500", border: "border-red-500", hex: "#ef4444" };
      case ActivityType.BATH:
        return { bg: "bg-cyan-500", border: "border-cyan-500", hex: "#06b6d4" };
      case ActivityType.PLAY:
        return { bg: "bg-pink-500", border: "border-pink-500", hex: "#ec4899" };
      default:
        return { bg: "bg-gray-500", border: "border-gray-500", hex: "#6b7280" };
    }
  };

  // 활동 아이콘
  const getActivityIcon = (activity: Activity): string => {
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

  // 활동 레이블
  const getActivityLabel = (activity: Activity): string => {
    switch (activity.type) {
      case ActivityType.FEEDING:
        if (activity.feedingType === "breast") return "모유 수유";
        if (activity.feedingType === "formula") return "분유 수유";
        if (activity.feedingType === "baby_food") return "이유식";
        return "수유";
      case ActivityType.SLEEP:
        const startHour = new Date(activity.startTime).getHours();
        const isNightSleep = startHour >= 18 || startHour < 6;
        return isNightSleep ? "밤잠" : "낮잠";
      case ActivityType.DIAPER:
        return "기저귀";
      case ActivityType.MEDICINE:
        return "약";
      case ActivityType.TEMPERATURE:
        return "체온 측정";
      case ActivityType.BATH:
        return "목욕";
      case ActivityType.PLAY:
        return "놀이";
      default:
        return "활동";
    }
  };

  // 특정 시간에 진행 중인 지속 활동 찾기
  const getOngoingActivityAtHour = (hour: number): Activity | null => {
    const hourStart = new Date(date);
    hourStart.setHours(hour, 0, 0, 0);
    const hourEnd = new Date(date);
    hourEnd.setHours(hour, 59, 59, 999);

    // 수면, 놀이 등 지속 활동만
    const ongoingActivities = activities.filter((a) => {
      if (!a.endTime) return false;
      if (a.type !== ActivityType.SLEEP && a.type !== ActivityType.PLAY) return false;

      const start = new Date(a.startTime);
      const end = new Date(a.endTime);

      // 이 시간대에 진행 중인지 확인
      return start <= hourEnd && end >= hourStart;
    });

    return ongoingActivities[0] || null;
  };

  // 특정 시간의 순간 활동 찾기
  const getInstantActivitiesAtHour = (hour: number): Activity[] => {
    const hourStart = new Date(date);
    hourStart.setHours(hour, 0, 0, 0);
    const hourEnd = new Date(date);
    hourEnd.setHours(hour, 59, 59, 999);

    return activities.filter((a) => {
      // 수면, 놀이는 제외 (이미 바로 표시)
      if (a.type === ActivityType.SLEEP || a.type === ActivityType.PLAY) return false;

      const start = new Date(a.startTime);
      return start >= hourStart && start <= hourEnd;
    });
  };

  // 활동 상세 정보
  const getActivityDetails = (activity: Activity): string[] => {
    const details: string[] = [];

    const startTime = new Date(activity.startTime).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    details.push(`시작: ${startTime}`);

    if (activity.endTime) {
      const endTime = new Date(activity.endTime).toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      details.push(`종료: ${endTime}`);

      const duration = Math.floor((new Date(activity.endTime).getTime() - new Date(activity.startTime).getTime()) / 60000);
      details.push(`총 시간: ${formatDuration(duration)}`);
    }

    switch (activity.type) {
      case ActivityType.FEEDING:
        if (activity.feedingType === "breast") {
          details.push(`시간: ${activity.duration}분`);
          details.push(`쪽: ${activity.breastSide === "left" ? "왼쪽" : "오른쪽"}`);
        } else {
          details.push(`양: ${activity.feedingAmount}ml`);
        }
        break;
      case ActivityType.DIAPER:
        const type = activity.diaperType === "urine" ? "소변" : activity.diaperType === "stool" ? "대변" : "소변+대변";
        details.push(`종류: ${type}`);
        break;
      case ActivityType.MEDICINE:
        details.push(`약: ${activity.medicineName}`);
        details.push(`용량: ${activity.medicineAmount}${activity.medicineUnit}`);
        break;
      case ActivityType.TEMPERATURE:
        details.push(`체온: ${activity.temperature}°C`);
        break;
    }

    if (activity.note) {
      details.push(`메모: ${activity.note}`);
    }

    return details;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* 날짜 헤더 */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 border-b border-indigo-100">
        <h3 className="font-bold text-gray-800 text-lg">
          {date.toLocaleDateString("ko-KR", {
            month: "long",
            day: "numeric",
            weekday: "short",
          })}
        </h3>
      </div>

      {/* 타임라인 */}
      <div className="divide-y divide-gray-100">
        {hours.map((hour) => {
          const ongoingActivity = getOngoingActivityAtHour(hour);
          const instantActivities = getInstantActivitiesAtHour(hour);
          const isExpanded = ongoingActivity && expandedActivity === ongoingActivity.id;

          return (
            <div key={hour} className="flex hover:bg-gray-50 transition-colors">
              {/* 시간 레이블 */}
              <div className="w-16 sm:w-20 flex-shrink-0 p-4 text-center border-r border-gray-200">
                <span className="text-sm font-semibold text-gray-600">
                  {hour.toString().padStart(2, "0")}:00
                </span>
              </div>

              {/* 활동 영역 */}
              <div className="flex-1 relative min-h-[60px]">
                {/* 지속 활동 바 */}
                {ongoingActivity && (
                  <div
                    className={`absolute inset-0 ${getActivityColor(ongoingActivity.type).bg} bg-opacity-20 hover:bg-opacity-30 cursor-pointer transition-all border-l-4 ${getActivityColor(ongoingActivity.type).border}`}
                    onClick={() => setExpandedActivity(isExpanded ? null : ongoingActivity.id)}
                  >
                    <div className="flex items-center h-full px-4">
                      <span className="text-2xl mr-2">{getActivityIcon(ongoingActivity)}</span>
                      <span className="text-sm font-medium text-gray-700">
                        {getActivityLabel(ongoingActivity)}
                      </span>
                    </div>
                  </div>
                )}

                {/* 인라인 확장 상세 정보 */}
                {isExpanded && ongoingActivity && (
                  <div
                    className="absolute inset-x-0 top-full z-10 bg-white border-l-4 border-t border-b shadow-lg"
                    style={{ borderLeftColor: getActivityColor(ongoingActivity.type).hex }}
                  >
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-3xl">{getActivityIcon(ongoingActivity)}</span>
                        <h4 className="font-bold text-gray-800">{getActivityLabel(ongoingActivity)}</h4>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        {getActivityDetails(ongoingActivity).map((detail, idx) => (
                          <p key={idx}>{detail}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 순간 활동 아이콘 */}
                {!ongoingActivity && instantActivities.length > 0 && (
                  <div className="flex items-center h-full px-4 gap-3">
                    {instantActivities.map((activity) => {
                      const colors = getActivityColor(activity.type);
                      return (
                        <div
                          key={activity.id}
                          className="relative group cursor-pointer"
                          onClick={() => setExpandedActivity(expandedActivity === activity.id ? null : activity.id)}
                        >
                          <div className={`${colors.bg} rounded-full p-2 shadow-sm hover:shadow-md transition-shadow`}>
                            <span className="text-xl">{getActivityIcon(activity)}</span>
                          </div>

                          {/* 인라인 확장 */}
                          {expandedActivity === activity.id && (
                            <div
                              className="absolute left-0 top-full mt-2 z-20 bg-white border-2 rounded-lg shadow-xl p-4 w-64"
                              style={{ borderColor: colors.hex }}
                            >
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-2xl">{getActivityIcon(activity)}</span>
                                <h4 className="font-bold text-gray-800">{getActivityLabel(activity)}</h4>
                              </div>
                              <div className="space-y-1 text-sm text-gray-600">
                                {getActivityDetails(activity).map((detail, idx) => (
                                  <p key={idx}>{detail}</p>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
