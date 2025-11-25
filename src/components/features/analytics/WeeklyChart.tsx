// src/app/analytics/[babyId]/components/WeeklyChart.tsx
'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function WeeklyChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip />
        <Legend />
        <Line yAxisId="left" type="monotone" dataKey="totalFeeding" stroke="#8884d8" name="총 수유량 (ml)" />
        <Line yAxisId="right" type="monotone" dataKey="totalSleep" stroke="#82ca9d" name="총 수면 시간 (분)" />
      </LineChart>
    </ResponsiveContainer>
  );
}
