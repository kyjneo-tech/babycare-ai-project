"use client";

import { AddMeasurementForm } from "./AddMeasurementForm";

interface MeasurementCardProps {
  babyId: string;
}

export function MeasurementCard({ babyId }: MeasurementCardProps) {
  const handleMeasurementAdded = () => {
    // 성공 시 추가 작업이 필요하면 여기에 구현
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold text-gray-800 mb-4">성장 기록</h3>
      <AddMeasurementForm
        babyId={babyId}
        onSuccess={handleMeasurementAdded}
      />
    </div>
  );
}
