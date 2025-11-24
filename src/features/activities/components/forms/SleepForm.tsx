// src/features/activities/components/forms/SleepForm.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ButtonGroup } from "../ui/ButtonGroup";

interface SleepFormProps {
  sleepType: string;
  setSleepType: (value: string) => void;
  endTimeHours: string;
  setEndTimeHours: (value: string) => void;
  endTimeMinutes: string;
  setEndTimeMinutes: (value: string) => void;
  errors: Record<string, string>;
  disabled?: boolean;
}

export function SleepForm({
  sleepType,
  setSleepType,
  endTimeHours,
  setEndTimeHours,
  endTimeMinutes,
  setEndTimeMinutes,
  errors,
  disabled = false,
}: SleepFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label>수면 종류</Label>
        <ButtonGroup
          options={[
            { value: "nap", label: "낮잠" },
            { value: "night", label: "밤잠" },
          ]}
          value={sleepType}
          onChange={setSleepType}
          disabled={disabled}
        />
      </div>

      <div>
        <Label>수면 종료 시간</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="시"
            min="0"
            max="23"
            value={endTimeHours}
            onChange={(e) => setEndTimeHours(e.target.value)}
            disabled={disabled}
            className={errors.endTime ? "border-red-500" : ""}
          />
          <Input
            type="number"
            placeholder="분"
            min="0"
            max="59"
            value={endTimeMinutes}
            onChange={(e) => setEndTimeMinutes(e.target.value)}
            disabled={disabled}
            className={errors.endTime ? "border-red-500" : ""}
          />
        </div>
        {errors.endTime && (
          <p className="text-xs text-red-500 mt-1">{errors.endTime}</p>
        )}
      </div>
    </div>
  );
}
