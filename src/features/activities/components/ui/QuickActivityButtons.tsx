// src/features/activities/components/ui/QuickActivityButtons.tsx
"use client";

import { Button } from "@/components/ui/button";
import type { ActivityType } from "@/shared/types/activity.types";

interface QuickActivityButtonsProps {
  onActivitySelect: (type: ActivityType) => void;
  disabled?: boolean;
}

const ACTIVITY_ICONS: Record<ActivityType, string> = {
  FEEDING: "🍼",
  SLEEP: "😴",
  DIAPER: "💩",
  MEDICINE: "💊",
  TEMPERATURE: "🌡️",
  BATH: "🛁",
  PLAY: "🧸",
};

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  FEEDING: "수유",
  SLEEP: "수면",
  DIAPER: "배변",
  MEDICINE: "약",
  TEMPERATURE: "체온",
  BATH: "목욕",
  PLAY: "놀이",
};

const ACTIVITY_TYPES: ActivityType[] = [
  "FEEDING",
  "SLEEP",
  "DIAPER",
  "MEDICINE",
  "TEMPERATURE",
  "BATH",
  "PLAY",
];

export function QuickActivityButtons({
  onActivitySelect,
  disabled = false,
}: QuickActivityButtonsProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-gray-700">
        🎯 활동 선택 (클릭하면 상세 입력)
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
        {ACTIVITY_TYPES.map((type) => (
          <div key={type} className="space-y-1">
            <Button
              type="button"
              onClick={() => onActivitySelect(type)}
              variant="outline"
              disabled={disabled}
              className="w-full aspect-square flex items-center justify-center text-2xl sm:text-3xl hover:bg-blue-200 hover:border-blue-400"
            >
              {ACTIVITY_ICONS[type]}
            </Button>
            <p className="text-xs text-center text-gray-600">
              {ACTIVITY_LABELS[type]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
