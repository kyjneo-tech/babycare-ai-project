"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Activity, ActivityType } from "@prisma/client";
import { activityTypeLabels } from "@/shared/utils/activityLabels";
import { Baby, Bed, Droplet, Bath, Gamepad2, Pill, Thermometer } from "lucide-react";

interface DailyActivityChartProps {
  date: Date;
  activities: Activity[];
}

const activityTypeIcons: Record<string, any> = {
  FEEDING: Baby,
  SLEEP: Bed,
  DIAPER: Droplet,
  BATH: Bath,
  PLAY: Gamepad2,
  MEDICINE: Pill,
  TEMPERATURE: Thermometer,
};

const colors: Record<string, string> = {
  수유: "#3b82f6",
  수면: "#8b5cf6",
  기저귀: "#f59e0b",
  목욕: "#10b981",
  놀이: "#ec4899",
  약: "#ef4444",
  체온: "#f97316",
};

export function DailyActivityChart({ date, activities }: DailyActivityChartProps) {
  const chartData = useMemo(() => {
    // 3시간 단위로 데이터 집계
    const hourlyData: Record<string, Record<string, number>> = {};

    for (let i = 0; i < 24; i += 3) {
      const hourLabel = `${i.toString().padStart(2, "0")}:00`;
      hourlyData[hourLabel] = {};
    }

    activities.forEach((activity) => {
      const hour = new Date(activity.startTime).getHours();
      const hourBucket = Math.floor(hour / 3) * 3;
      const hourLabel = `${hourBucket.toString().padStart(2, "0")}:00`;
      const typeLabel = activityTypeLabels[activity.type];

      if (!hourlyData[hourLabel][typeLabel]) {
        hourlyData[hourLabel][typeLabel] = 0;
      }
      hourlyData[hourLabel][typeLabel]++;
    });

    return Object.entries(hourlyData).map(([hour, data]) => ({
      hour,
      ...data,
    }));
  }, [activities]);

  const activityTypes = useMemo(() => {
    const types = new Set<string>();
    activities.forEach((activity) => {
      types.add(activityTypeLabels[activity.type]);
    });
    return Array.from(types);
  }, [activities]);

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm text-center text-gray-500">
        이 날짜에 기록된 활동이 없습니다.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {date.toLocaleDateString("ko-KR", {
          month: "long",
          day: "numeric",
          weekday: "short",
        })}
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          layout="horizontal"
          margin={{ top: 5, right: 20, left: 50, bottom: 5 }}
        >
          <XAxis type="number" />
          <YAxis dataKey="hour" type="category" />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
          {activityTypes.map((type) => (
            <Bar
              key={type}
              dataKey={type}
              fill={colors[type as keyof typeof colors]}
              stackId="a"
              radius={[0, 4, 4, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>

      {/* 활동 타입 범례 */}
      <div className="flex flex-wrap gap-3 mt-4">
        {activityTypes.map((type) => {
          const Icon = activityTypeIcons[
            Object.keys(activityTypeLabels).find(
              (key) => activityTypeLabels[key as ActivityType] === type
            ) as ActivityType
          ];
          return (
            <div key={type} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: colors[type as keyof typeof colors] }}
              />
              {Icon && <Icon className="w-4 h-4 text-gray-600" />}
              <span className="text-sm text-gray-700">{type}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
