"use client";

import { useEffect, useState } from "react";
import { BabyMeasurement } from "@prisma/client";
import { getMeasurementHistory } from "@/features/measurements/actions";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface GrowthChartProps {
  babyId: string;
}

interface ChartDataPoint {
  date: string;
  displayDate: string;
  weight: number;
  height: number;
}

export function GrowthChart({ babyId }: GrowthChartProps) {
  const [measurements, setMeasurements] = useState<BabyMeasurement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMeasurements = async () => {
      try {
        setLoading(true);
        const result = await getMeasurementHistory(babyId);

        if (result.success && result.data) {
          // 날짜 순으로 정렬 (오래된 것부터)
          const sorted = result.data.sort(
            (a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime()
          );
          setMeasurements(sorted);
        }
      } catch (error) {
        console.error("성장 데이터 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMeasurements();
  }, [babyId]);

  // recharts용 데이터 포맷
  const chartData: ChartDataPoint[] = measurements.map((m) => ({
    date: new Date(m.measuredAt).toISOString(),
    displayDate: format(new Date(m.measuredAt), "M/d", { locale: ko }),
    weight: m.weight,
    height: m.height,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">성장 데이터를 불러오는 중...</div>
      </div>
    );
  }

  if (measurements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="text-4xl mb-4">📊</div>
        <h4 className="font-bold text-gray-700 mb-2">성장 데이터가 없습니다</h4>
        <p className="text-sm text-gray-500">
          체중과 키를 기록하면 성장 곡선을 확인할 수 있어요
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 체중 차트 */}
      <div>
        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-lg">⚖️</span>
          체중 변화 (kg)
        </h4>
        <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
              <XAxis
                dataKey="displayDate"
                tick={{ fontSize: 12, fill: "#6b7280" }}
                stroke="#9ca3af"
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#6b7280" }}
                stroke="#9ca3af"
                domain={["auto", "auto"]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #dbeafe",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelFormatter={(label) => `날짜: ${label}`}
                formatter={(value: number) => [`${value}kg`, "체중"]}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: "#3b82f6", r: 4 }}
                activeDot={{ r: 6 }}
                name="체중 (kg)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 키 차트 */}
      <div>
        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-lg">📏</span>
          키 변화 (cm)
        </h4>
        <div className="bg-green-50/50 rounded-lg p-4 border border-green-100">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
              <XAxis
                dataKey="displayDate"
                tick={{ fontSize: 12, fill: "#6b7280" }}
                stroke="#9ca3af"
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#6b7280" }}
                stroke="#9ca3af"
                domain={["auto", "auto"]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #d1fae5",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelFormatter={(label) => `날짜: ${label}`}
                formatter={(value: number) => [`${value}cm`, "키"]}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Line
                type="monotone"
                dataKey="height"
                stroke="#16a34a"
                strokeWidth={3}
                dot={{ fill: "#16a34a", r: 4 }}
                activeDot={{ r: 6 }}
                name="키 (cm)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 통계 요약 */}
      {measurements.length >= 2 && (
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <div className="text-xs text-blue-600 mb-1">체중 증가</div>
            <div className="text-lg font-bold text-blue-900">
              +{(measurements[measurements.length - 1].weight - measurements[0].weight).toFixed(1)}kg
            </div>
            <div className="text-[10px] text-blue-700 mt-0.5">
              {measurements[0].weight}kg → {measurements[measurements.length - 1].weight}kg
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 border border-green-100">
            <div className="text-xs text-green-600 mb-1">키 증가</div>
            <div className="text-lg font-bold text-green-900">
              +{(measurements[measurements.length - 1].height - measurements[0].height).toFixed(1)}cm
            </div>
            <div className="text-[10px] text-green-700 mt-0.5">
              {measurements[0].height}cm → {measurements[measurements.length - 1].height}cm
            </div>
          </div>
        </div>
      )}

      {/* 데이터 수 표시 */}
      <div className="text-center text-xs text-gray-500 mt-4">
        총 {measurements.length}개의 기록
      </div>
    </div>
  );
}
