// src/app/analytics/[babyId]/components/PatternChart.tsx
'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function PatternChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="hour" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="FEEDING" fill="#8884d8" name="수유" />
        <Bar dataKey="SLEEP" fill="#82ca9d" name="수면" />
        <Bar dataKey="DIAPER" fill="#ffc658" name="배변" />
      </BarChart>
    </ResponsiveContainer>
  );
}
