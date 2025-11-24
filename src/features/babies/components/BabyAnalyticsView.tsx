"use client";

import { useState, useEffect, useCallback } from "react";
import { UnifiedTimeline } from "@/components/features/analytics/UnifiedTimeline";
import { getActivitiesByDateRange } from "@/features/analytics/actions";
import { Activity } from "@prisma/client";
import { subDays, startOfDay, endOfDay, format } from "date-fns";

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
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 기간 선택 */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">기간 선택</h3>
        
        {/* 빠른 선택 버튼 */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[7, 14, 30].map((days) => (
            <button
              key={days}
              onClick={() => handlePeriodChange(days)}
              className={`py-2 px-4 rounded-lg font-medium transition ${
                selectedDays === days
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {days}일
            </button>
          ))}
        </div>

        {/* 커스텀 날짜 선택 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              시작일
            </label>
            <input
              type="date"
              value={format(startDate, "yyyy-MM-dd")}
              onChange={(e) => handleCustomDateChange("start", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              종료일
            </label>
            <input
              type="date"
              value={format(endDate, "yyyy-MM-dd")}
              onChange={(e) => handleCustomDateChange("end", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 타임라인 */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-6 text-gray-800">
          활동 타임라인
        </h3>
        {activities.length > 0 ? (
          <UnifiedTimeline
            activities={activities}
            startDate={startDate}
            endDate={endDate}
          />
        ) : (
          <div className="py-12 text-center text-gray-500">
            <p className="text-lg mb-2">이 기간에 기록된 활동이 없습니다.</p>
            <p className="text-sm">아기의 활동을 기록해보세요!</p>
          </div>
        )}
      </div>
    </div>
  );
}
