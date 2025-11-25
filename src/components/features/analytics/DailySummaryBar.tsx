// src/components/features/analytics/DailySummaryBar.tsx
"use client";

import { Activity } from "@prisma/client";
import { useMemo } from "react";
import { calculateActivityStats, formatDuration } from "@/features/analytics/utils/statsCalculator";

interface DailySummaryBarProps {
  date: Date;
  activities: Activity[];
}

interface QuickStatProps {
  icon: string;
  label: string;
  value: string;
  subValue?: string;
  colorClass?: string;
}

function QuickStat({ icon, label, value, subValue, colorClass = "bg-blue-50" }: QuickStatProps) {
  return (
    <div className={`${colorClass} px-3 py-2 rounded-lg flex items-center gap-2 min-w-fit`}>
      <span className="text-lg">{icon}</span>
      <div className="flex flex-col">
        <span className="text-xs text-gray-600 whitespace-nowrap">{label}</span>
        <div className="flex items-baseline gap-1">
          <span className="font-bold text-gray-900 text-sm">{value}</span>
          {subValue && <span className="text-xs text-gray-500">{subValue}</span>}
        </div>
      </div>
    </div>
  );
}

export function DailySummaryBar({ date, activities }: DailySummaryBarProps) {
  const stats = useMemo(() => calculateActivityStats(activities), [activities]);

  const dateLabel = useMemo(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return "오늘";
    if (isYesterday) return "어제";

    return date.toLocaleDateString("ko-KR", {
      month: "long",
      day: "numeric",
      weekday: "short"
    });
  }, [date]);

  const totalActivities = activities.length;

  return (
    <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-4 rounded-lg shadow-sm border border-indigo-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-gray-800 text-base">{dateLabel}</h3>
          <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full">
            총 {totalActivities}개 활동
          </span>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {/* 수유 */}
        <QuickStat
          icon="🍼"
          label="수유"
          value={`${stats.feeding.count}회`}
          subValue={stats.feeding.totalAmount > 0 ? `${stats.feeding.totalAmount}ml` : undefined}
          colorClass="bg-blue-50"
        />

        {/* 수면 */}
        <QuickStat
          icon="😴"
          label="수면"
          value={formatDuration(stats.sleep.totalDuration)}
          subValue={stats.sleep.napCount > 0 ? `낮잠 ${stats.sleep.napCount}회` : undefined}
          colorClass="bg-indigo-50"
        />

        {/* 기저귀 */}
        <QuickStat
          icon="💩"
          label="기저귀"
          value={`${stats.diaper.count}회`}
          subValue={
            stats.diaper.count > 0
              ? `소${stats.diaper.urine} 대${stats.diaper.stool}`
              : undefined
          }
          colorClass="bg-amber-50"
        />

        {/* 놀이 (있는 경우만) */}
        {stats.play.count > 0 && (
          <QuickStat
            icon="🎮"
            label="놀이"
            value={`${stats.play.count}회`}
            subValue={formatDuration(stats.play.totalDuration)}
            colorClass="bg-green-50"
          />
        )}

        {/* 목욕 (있는 경우만) */}
        {stats.bath.count > 0 && (
          <QuickStat
            icon="🛁"
            label="목욕"
            value={`${stats.bath.count}회`}
            colorClass="bg-cyan-50"
          />
        )}

        {/* 약 (있는 경우만) */}
        {stats.medicine.count > 0 && (
          <QuickStat
            icon="💊"
            label="약"
            value={`${stats.medicine.count}회`}
            colorClass="bg-pink-50"
          />
        )}

        {/* 체온 (있는 경우만) */}
        {stats.temperature.count > 0 && (
          <QuickStat
            icon="🌡️"
            label="체온"
            value={`${stats.temperature.avg}°C`}
            colorClass="bg-red-50"
          />
        )}
      </div>

    </div>
  );
}
