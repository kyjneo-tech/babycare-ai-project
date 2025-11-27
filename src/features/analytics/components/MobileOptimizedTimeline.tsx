"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Activity, ActivityType } from "@prisma/client";
import { useState } from "react";
import { getActivityColors, getActivityIcon, getActivityLabel, getActivityDetails } from "@/features/activities/lib/activityUtils";
import { ActivityDetailDialog } from "./ActivityDetailDialog";

interface MobileOptimizedTimelineProps {
  activities: Activity[];
  startDate: Date;
  endDate: Date;
}

interface ActivityDetail {
  activity: Activity;
  label: string;
  details: string[];
}

export function MobileOptimizedTimeline({
  activities,
  startDate,
  endDate,
}: MobileOptimizedTimelineProps) {
  const [selectedCell, setSelectedCell] = useState<ActivityDetail | null>(null);

  // 날짜 배열 생성 (최신순으로 정렬)
  const dates: Date[] = [];
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  dates.reverse(); // 최신 날짜가 왼쪽에 오도록

  // 24시간 배열
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // 오늘 날짜
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 특정 날짜의 모든 지속 활동 찾기
  const getOngoingActivitiesForDate = (date: Date) => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    return activities.filter((a) => {
      if (!a.endTime) return false;
      if (a.type !== ActivityType.SLEEP && a.type !== ActivityType.PLAY) return false;

      const start = new Date(a.startTime);
      const end = new Date(a.endTime);

      // 이 날짜에 걸쳐있는 활동
      return start <= dayEnd && end >= dayStart;
    });
  };

  // 특정 날짜와 시간에 순간 활동 찾기
  const getInstantActivitiesAtDateAndHour = (date: Date, hour: number) => {
    const hourStart = new Date(date);
    hourStart.setHours(hour, 0, 0, 0);
    const hourEnd = new Date(date);
    hourEnd.setHours(hour, 59, 59, 999);

    return activities.filter((a) => {
      if (a.type === ActivityType.SLEEP || a.type === ActivityType.PLAY) return false;

      const start = new Date(a.startTime);
      return start >= hourStart && start <= hourEnd;
    });
  };

  // 활동의 시작/종료 위치 계산 (픽셀 단위)
  const getActivityPosition = (activity: Activity, date: Date) => {
    const cellHeight = 40; // min-h-[40px]와 동일
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const start = new Date(activity.startTime);
    const end = activity.endTime ? new Date(activity.endTime) : start;

    // 시작 시간 (시간 + 분을 소수로 변환)
    const startHour = start.getHours() + start.getMinutes() / 60;
    // 종료 시간
    const endHour = end.getHours() + end.getMinutes() / 60;

    // 날짜가 다른 경우 처리
    let adjustedStartHour = startHour;
    let adjustedEndHour = endHour;

    if (start < dayStart) {
      adjustedStartHour = 0;
    }
    if (end > new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)) {
      adjustedEndHour = 24;
    }
    if (start.getDate() !== date.getDate() && end.getDate() !== date.getDate()) {
      // 이 날짜 전체를 걸쳐있는 경우
      adjustedStartHour = 0;
      adjustedEndHour = 24;
    }

    const top = adjustedStartHour * cellHeight;
    const height = (adjustedEndHour - adjustedStartHour) * cellHeight;

    return { top, height };
  };

  // 셀 클릭 핸들러
  const handleCellClick = (activity: Activity) => {
    setSelectedCell({
      activity,
      label: getActivityLabel(activity),
      details: getActivityDetails(activity),
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* 범례 - 상단으로 이동 */}
      <div className="border-b border-gray-200 bg-gray-50 p-3">
        <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-indigo-600 rounded"></div>
            <span className="text-gray-700">밤잠</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-indigo-300 rounded"></div>
            <span className="text-gray-700">낮잠</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-gray-700">수유</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-yellow-400 rounded"></div>
            <span className="text-gray-700">기저귀</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span className="text-gray-700">약</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-gray-700">체온</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-cyan-500 rounded"></div>
            <span className="text-gray-700">목욕</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-primary rounded"></div>
            <span className="text-gray-700">놀이</span>
          </div>
        </div>
      </div>

      {/* 전체 스크롤 컨테이너 */}
      <div className="overflow-x-auto">
        <div className="min-w-[334px]">
          {/* 헤더: 날짜들 */}
          <div className="sticky top-0 bg-white z-20 border-b-2 border-gray-300 shadow-sm">
            <div className="flex">
              {/* 시간 레이블 공간 */}
              <div className="w-10 flex-shrink-0 border-r-2 border-gray-300 sticky left-0 bg-white z-30"></div>

              {/* 날짜 헤더 */}
              <div className="flex flex-1">
                {dates.map((date) => {
                  const isToday = date.getTime() === today.getTime();
                  return (
                    <div
                      key={date.toISOString()}
                      className={`flex-1 min-w-[42px] p-2 text-center border-r border-gray-200 ${
                        isToday ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className={`text-xs font-bold ${isToday ? "text-blue-600" : "text-gray-700"}`}>
                        {date.getDate()}일
                      </div>
                      <div className={`text-[10px] ${isToday ? "text-blue-500" : "text-gray-500"}`}>
                        ({date.toLocaleDateString("ko-KR", { weekday: "short" })})
                      </div>
                      {isToday && (
                        <div className="text-[9px] text-blue-600 font-semibold mt-0.5">오늘</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 타임라인 바디 */}
          <div className="flex relative">
            {/* 시간 레이블 컬럼 */}
            <div className="w-10 flex-shrink-0 border-r-2 border-gray-200 bg-white sticky left-0 z-10">
              {hours.map((hour) => (
                <div key={hour} className="min-h-[40px] py-1 text-center flex items-center justify-center">
                  <span className="text-[9px] font-medium text-gray-500">
                    {hour.toString().padStart(2, "0")}
                  </span>
                </div>
              ))}
            </div>

            {/* 날짜별 컬럼 */}
            <div className="flex flex-1">
              {dates.map((date) => {
                const isToday = date.getTime() === today.getTime();
                const ongoingActivities = getOngoingActivitiesForDate(date);

                return (
                  <div
                    key={date.toISOString()}
                    className="flex-1 min-w-[42px] border-r border-gray-200 relative"
                  >
                {/* 지속 활동 바들 (absolute positioning) */}
                {ongoingActivities.map((activity) => {
                  const { top, height } = getActivityPosition(activity, date);
                  const isNightSleep =
                    activity.type === ActivityType.SLEEP &&
                    (new Date(activity.startTime).getHours() >= 18 ||
                      new Date(activity.startTime).getHours() < 6);

                  const bgColor = getActivityColors(activity.type, isNightSleep).bg;

                  return (
                    <div
                      key={activity.id}
                      className={`absolute left-0 right-0 z-[5] ${bgColor} cursor-pointer hover:brightness-110 transition-all`}
                      style={{ top: `${top}px`, height: `${height}px` }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCellClick(activity);
                      }}
                    />
                  );
                })}

                {/* 시간대별 셀들 (순간 활동용) */}
                {hours.map((hour) => {
                  const instantActivities = getInstantActivitiesAtDateAndHour(
                    date,
                    hour
                  );

                  return (
                    <div
                      key={`${date.toISOString()}-${hour}`}
                      className={`min-h-[40px] relative ${
                        isToday ? "bg-blue-50/20" : ""
                      }`}
                    >
                      {/* 순간 활동 바 */}
                      {instantActivities.length > 0 && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 p-1 z-10 pointer-events-none">
                          {instantActivities.map((activity) => (
                            <div
                              key={activity.id}
                              className={`${
                                getActivityColors(activity.type).bg
                              } h-1.5 w-full cursor-pointer hover:brightness-110 transition-all shadow-sm pointer-events-auto`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCellClick(activity);
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>


      {/* 상세 정보 모달 */}
      <ActivityDetailDialog selectedCell={selectedCell} onClose={() => setSelectedCell(null)} />
    </div>
  );
}