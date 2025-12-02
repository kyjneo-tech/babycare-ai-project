"use client";

import { useState, useEffect } from "react";
import { BabyMeasurement } from "@prisma/client";
import { getMeasurementHistory } from "../actions";
import { MeasurementHistoryCard } from "./MeasurementHistoryCard";
import { Skeleton } from "@/components/ui/skeleton";

interface MeasurementHistoryListProps {
  babyId: string;
  onEdit: (measurement: BabyMeasurement) => void;
  refreshTrigger?: number; // 외부에서 새로고침을 트리거하기 위한 prop
}

export function MeasurementHistoryList({
  babyId,
  onEdit,
  refreshTrigger = 0,
}: MeasurementHistoryListProps) {
  const [measurements, setMeasurements] = useState<BabyMeasurement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMeasurements();
  }, [babyId, refreshTrigger]);

  const loadMeasurements = async () => {
    setLoading(true);
    try {
      const result = await getMeasurementHistory(babyId);
      if (result.success && result.data) {
        setMeasurements(result.data);
      }
    } catch (error) {
      console.error("Failed to load measurements:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setMeasurements((prev) => prev.filter((m) => m.id !== id));
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (measurements.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">아직 기록된 측정값이 없습니다.</p>
        <p className="text-xs mt-1">위에서 키와 체중을 기록해보세요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-700 mb-2">최근 활동</h4>
      {measurements.map((measurement) => (
        <MeasurementHistoryCard
          key={measurement.id}
          measurement={measurement}
          onDelete={handleDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
