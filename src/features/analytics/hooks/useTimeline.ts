"use client";

import { Activity, ActivityType } from "@prisma/client";
import { useState, useMemo } from "react";
import { getActivityColors, getActivityIcon, getActivityLabel, getActivityDetails } from "@/features/activities/lib/activityUtils";

interface UseTimelineProps {
  activities: Activity[];
  startDate: Date;
  endDate: Date;
}

interface ActivityDetail {
  activity: Activity;
  label: string;
  details: string[];
}

export function useTimeline({ activities, startDate, endDate }: UseTimelineProps) {
  const [selectedCell, setSelectedCell] = useState<ActivityDetail | null>(null);

  // 날짜 배열 생성 (최신순으로 정렬)
  const dates = useMemo(() => {
    const d: Date[] = [];
    const current = new Date(startDate);
    current.setHours(0, 0, 0, 0); // Ensure consistent start of day
    while (current <= endDate) {
      d.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return d.reverse(); // 최신 날짜가 왼쪽에 오도록
  }, [startDate, endDate]);

  // 24시간 배열
  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);

  // 오늘 날짜 (훅 내부에서만 사용되므로 useMemo로 최적화)
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  // 특정 날짜의 모든 지속 활동 찾기
  const getOngoingActivitiesForDate = (date: Date) => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    return activities.filter((a) => {
      if (!a.endTime) return false;
      if (a.type !== ActivityType.SLEEP && a.type !== ActivityType.PLAY) return false; // 지속 활동만
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
      if (a.type === ActivityType.SLEEP || a.type === ActivityType.PLAY) return false; // 순간 활동만
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

    // 활동 시작일이 현재 날짜보다 이전인 경우
    if (start < dayStart) {
      adjustedStartHour = 0;
    }
    // 활동 종료일이 현재 날짜보다 이후인 경우
    // 현재 날짜의 끝 (23:59:59) 보다 end가 크면 24시로 간주
    if (end > new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)) {
      adjustedEndHour = 24;
    }
    // 활동 시작일과 종료일이 모두 현재 날짜가 아닌 경우 (예: 전날 시작해서 다음날 끝나는 활동)
    if (start.getDate() !== date.getDate() && end.getDate() !== date.getDate()) {
      adjustedStartHour = 0;
      adjustedEndHour = 24;
    }
    // 만약 활동이 하루를 넘어가는 경우, 종료 시간이 다음 날로 넘어갔을 때 24시로 설정
    // (예: 23시 시작, 다음날 01시 종료 -> 23시부터 24시까지로 표시)
    if (end.getDate() !== start.getDate() && end.getDate() === date.getDate() && start.getDate() === date.getDate() && endHour < startHour) {
      adjustedEndHour = 24;
    }
    
    // 하루 이상 지속되는 활동에 대한 오차 수정
    if (start.getDate() < date.getDate() && end.getDate() > date.getDate()) {
        adjustedStartHour = 0;
        adjustedEndHour = 24;
    } else if (start.getDate() < date.getDate() && end.getDate() === date.getDate()) {
        adjustedStartHour = 0;
    } else if (start.getDate() === date.getDate() && end.getDate() > date.getDate()) {
        adjustedEndHour = 24;
    }
    

    const top = adjustedStartHour * cellHeight;
    const height = (adjustedEndHour - adjustedStartHour) * cellHeight;

    return { top, height };
  };

  // 셀 클릭 핸들러 (훅에서 반환하여 컴포넌트에서 사용)
  const handleCellClick = (activity: Activity) => {
    setSelectedCell({
      activity,
      label: getActivityLabel(activity),
      details: getActivityDetails(activity),
    });
  };

  // 렌더링에 필요한 최종 데이터 구조화
  const timelineData = useMemo(() => {
    return dates.map((date) => {
      const isCurrentDay = date.getTime() === today.getTime();
      const dayOngoingActivities = getOngoingActivitiesForDate(date);
      const hourlySlices = hours.map(hour => ({
        hour,
        instantActivities: getInstantActivitiesAtDateAndHour(date, hour),
      }));

      return {
        date,
        isCurrentDay,
        ongoingActivities: dayOngoingActivities.map(activity => {
          const isNightSleep =
            activity.type === ActivityType.SLEEP &&
            (new Date(activity.startTime).getHours() >= 18 ||
              new Date(activity.startTime).getHours() < 6);
          return {
            ...activity,
            position: getActivityPosition(activity, date),
            bgColor: getActivityColors(activity.type, isNightSleep).bg,
            isNightSleep, // 필요한 경우 외부에서 사용
          };
        }),
        hourlyData: hourlySlices.map(slice => ({
          ...slice,
          instantActivities: slice.instantActivities.map(activity => ({
            ...activity,
            bgColor: getActivityColors(activity.type).bg,
          }))
        }))
      };
    });
  }, [activities, dates, hours, today]);


  return {
    dates,
    hours,
    today, // 오늘 날짜는 뷰에서 오늘 표시용으로 필요
    timelineData,
    selectedCell,
    setSelectedCell,
    handleCellClick,
  };
}
