// src/features/activities/components/forms/TemperatureForm.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TemperatureFormProps {
  temperature: string;
  setTemperature: (value: string) => void;
  errors: Record<string, string>;
  disabled?: boolean;
}

export function TemperatureForm({
  temperature,
  setTemperature,
  errors,
  disabled = false,
}: TemperatureFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="temperature">체온 (°C)</Label>
        <Input
          id="temperature"
          type="number"
          step="0.1"
          min="30"
          max="45"
          placeholder="36.5"
          value={temperature}
          onChange={(e) => setTemperature(e.target.value)}
          disabled={disabled}
          className={errors.temperature ? "border-red-500" : ""}
        />
        {errors.temperature && (
          <p className="text-xs text-red-500 mt-1">{errors.temperature}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          정상 범위: 36.0~37.5°C
        </p>
      </div>
    </div>
  );
}
