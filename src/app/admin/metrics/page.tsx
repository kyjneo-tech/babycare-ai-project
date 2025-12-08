"use client";

import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Activity, AlertCircle, CheckCircle, DollarSign, Clock } from "lucide-react";

interface MetricsSummary {
  totalCount: number;
  successRate: number;
  errorCount: number;
  totalCost: number;
  avgResponseTime: number;
}

interface HourlyStat {
  hour: number;
  label: string;
  count: number;
  avgTime: number;
  errors: number;
}

interface LogEntry {
  id: string;
  question: string;
  answer: string;
  totalTime: number;
  cost: number;
  success: boolean;
  createdAt: string;
  complexity: string;
  mode: string;
}

interface DashboardData {
  summary: MetricsSummary;
  hourlyStats: HourlyStat[];
  recentLogs: LogEntry[];
}

export default function AIMetricsDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/metrics/realtime");
      if (!res.ok) throw new Error("데이터를 불러오는데 실패했습니다.");
      const newData = await res.json();
      setData(newData);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // 5초마다 갱신
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) return <div className="p-8 text-center">로딩 중...</div>;
  if (error) return <div className="p-8 text-center text-red-500">에러: {error}</div>;
  if (!data) return null;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">🤖 AI 채팅 모니터링 (Live)</h1>
        <span className="text-sm text-gray-500">
          마지막 업데이트: {new Date().toLocaleTimeString()}
        </span>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="총 상담 (24h)"
          value={data.summary.totalCount.toLocaleString()}
          icon={<Activity className="w-5 h-5 text-blue-500" />}
          subValue={`성공률 ${data.summary.successRate.toFixed(1)}%`}
        />
        <StatCard
          title="평균 응답 시간"
          value={`${(data.summary.avgResponseTime / 1000).toFixed(2)}s`}
          icon={<Clock className="w-5 h-5 text-green-500" />}
          subValue="target: < 3.0s"
        />
        <StatCard
          title="총 예상 비용 (24h)"
          value={`$${data.summary.totalCost.toFixed(4)}`}
          icon={<DollarSign className="w-5 h-5 text-yellow-500" />}
          subValue="Based on tokens"
        />
        <StatCard
          title="에러 발생"
          value={data.summary.errorCount.toString()}
          icon={<AlertCircle className="w-5 h-5 text-red-500" />}
          subValue="시스템/AI 에러"
          highlight={data.summary.errorCount > 0}
        />
      </div>

      {/* 차트 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">시간대별 요청 수</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.hourlyStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="요청 수" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="errors" name="에러" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">응답 시간 추이 (ms)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.hourlyStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="avgTime"
                  name="평균 시간"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 최근 로그 테이블 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700">최근 상담 로그</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Mode</th>
                <th className="px-4 py-3">Question</th>
                <th className="px-4 py-3 text-right">Latency</th>
                <th className="px-4 py-3 text-right">Cost</th>
              </tr>
            </thead>
            <tbody>
              {data.recentLogs.map((log) => (
                <tr key={log.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </td>
                  <td className="px-4 py-3">
                    {log.success ? (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Success
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Fail
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">
                      {log.mode}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate" title={log.question}>
                    {log.question}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {(log.totalTime / 1000).toFixed(2)}s
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">
                    ${log.cost?.toFixed(5) ?? "0.00000"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  subValue,
  highlight = false,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  subValue?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`bg-white p-5 rounded-xl shadow-sm border ${
        highlight ? "border-red-200 bg-red-50" : "border-gray-100"
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-sm font-medium text-gray-500">{title}</h4>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-800 mb-1">{value}</div>
      {subValue && <div className="text-xs text-gray-400">{subValue}</div>}
    </div>
  );
}
