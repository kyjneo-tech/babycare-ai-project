// src/components/features/analytics/ActivityStatsSidebar.tsx
"use client";

import { Activity } from "@prisma/client";
import { useMemo } from "react";
import { calculateActivityStats, formatDuration } from "@/features/analytics/utils/statsCalculator";

interface ActivityStatsSidebarProps {
  activities: Activity[];
  startDate: Date;
  endDate: Date;
}

interface StatCardProps {
  icon: string;
  title: string;
  main: string;
  sub?: string;
  detail?: string;
  trend?: number;
}

function TrendBadge({ value }: { value: number }) {
  if (value === 0) return <span className="text-gray-400 text-xs">→</span>;

  const isIncrease = value > 0;
  return (
    <span className={`text-xs font-semibold flex items-center gap-0.5 ${isIncrease ? 'text-green-600' : 'text-orange-600'}`}>
      {isIncrease ? '↑' : '↓'} {Math.abs(value)}%
    </span>
  );
}

function StatCard({ icon, title, main, sub, detail, trend }: StatCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <span className="font-semibold text-gray-700 text-sm">{title}</span>
        </div>
        {trend !== undefined && <TrendBadge value={trend} />}
      </div>

      <div className="text-2xl font-bold text-gray-900 mb-1">
        {main}
      </div>

      {sub && (
        <div className="text-sm text-gray-600">
          {sub}
        </div>
      )}

      {detail && (
        <div className="text-xs text-gray-500 mt-1">
          {detail}
        </div>
      )}
    </div>
  );
}

export function ActivityStatsSidebar({ activities, startDate, endDate }: ActivityStatsSidebarProps) {
  const stats = useMemo(() => calculateActivityStats(activities), [activities]);

  // 기간 정보
  const dayCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const periodLabel = dayCount === 1 ? '오늘' : dayCount === 7 ? '이번 주' : `${dayCount}일간`;

  return (
    <div className="w-full lg:w-72 bg-gradient-to-b from-blue-50 to-white p-4 rounded-lg shadow-sm space-y-4 flex-shrink-0">
      <div className="mb-4">
        <h3 className="font-bold text-gray-800 text-lg">기간 통계</h3>
        <p className="text-xs text-gray-500 mt-1">{periodLabel} 요약</p>
      </div>

      {/* 수유 통계 */}
      <StatCard
        icon="🍼"
        title="수유"
        main={`${stats.feeding.count}회`}
        sub={stats.feeding.totalAmount > 0 ? `총 ${stats.feeding.totalAmount}ml` : undefined}
        detail={
          stats.feeding.count > 0
            ? `평균 ${stats.feeding.avgAmount}ml · ` +
              `모유 ${stats.feeding.byType.breast}회 · ` +
              `분유 ${stats.feeding.byType.formula}회`
            : '기록 없음'
        }
      />

      {/* 수면 통계 */}
      <StatCard
        icon="😴"
        title="수면"
        main={formatDuration(stats.sleep.totalDuration)}
        sub={stats.sleep.napCount > 0 ? `낮잠 ${stats.sleep.napCount}회` : undefined}
        detail={
          stats.sleep.totalDuration > 0
            ? `밤잠 ${formatDuration(stats.sleep.nightSleepDuration)} · ` +
              (stats.sleep.napCount > 0 ? `평균 낮잠 ${formatDuration(stats.sleep.avgNapDuration)}` : '')
            : '기록 없음'
        }
      />

      {/* 기저귀 통계 */}
      <StatCard
        icon="💩"
        title="기저귀"
        main={`${stats.diaper.count}회`}
        detail={
          stats.diaper.count > 0
            ? `소변 ${stats.diaper.urine}회 · 대변 ${stats.diaper.stool}회` +
              (stats.diaper.both > 0 ? ` · 둘다 ${stats.diaper.both}회` : '')
            : '기록 없음'
        }
      />

      {/* 기타 활동 */}
      {(stats.medicine.count > 0 || stats.temperature.count > 0) && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-700 text-sm mb-3">기타 활동</h4>
          <div className="space-y-2 text-sm">
            {stats.medicine.count > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">💊 투약</span>
                <span className="font-semibold">{stats.medicine.count}회</span>
              </div>
            )}
            {stats.temperature.count > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">🌡️ 체온</span>
                <span className="font-semibold">
                  평균 {stats.temperature.avg}°C
                </span>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
