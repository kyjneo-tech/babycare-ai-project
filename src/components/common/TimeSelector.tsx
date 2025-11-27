// src/features/activities/components/ui/TimeSelector.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface TimeSelectorProps {
  hours: number;
  minutes: number;
  onTimeChange: (hours: number, minutes: number) => void;
  disabled?: boolean;
}

export function TimeSelector({
  hours,
  minutes,
  onTimeChange,
  disabled = false,
}: TimeSelectorProps) {
  const totalMinutes = hours * 60 + minutes;

  const handleSliderChange = (value: number[]) => {
    const newTotalMinutes = value[0];
    const newHours = Math.floor(newTotalMinutes / 60);
    const newMinutes = newTotalMinutes % 60;
    onTimeChange(newHours, newMinutes);
  };

  const setNow = () => {
    const now = new Date();
    onTimeChange(now.getHours(), Math.floor(now.getMinutes() / 5) * 5);
  };

  const adjustTime = (hoursOffset: number, minutesOffset: number = 0) => {
    let newHours = hours + hoursOffset;
    let newMinutes = minutes + minutesOffset;

    while (newMinutes >= 60) {
      newMinutes -= 60;
      newHours += 1;
    }
    while (newMinutes < 0) {
      newMinutes += 60;
      newHours -= 1;
    }
    while (newHours >= 24) newHours -= 24;
    while (newHours < 0) newHours += 24;

    onTimeChange(newHours, newMinutes);
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold text-gray-700">
        🕐 시간 선택 (시작 시간)
      </Label>
      
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold text-blue-600 min-w-20 text-center">
          {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}
        </span>
        <Slider
          value={[totalMinutes]}
          onValueChange={handleSliderChange}
          max={1439}
          step={5}
          disabled={disabled}
          className="flex-1"
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          type="button"
          onClick={setNow}
          variant="default"
          size="sm"
          disabled={disabled}
          className="flex-1 min-w-16 bg-green-500 hover:bg-green-600"
        >
          지금
        </Button>
        <Button
          type="button"
          onClick={() => adjustTime(0, -15)}
          variant="outline"
          size="sm"
          disabled={disabled}
          className="flex-1 min-w-16"
        >
          -15분
        </Button>
        <Button
          type="button"
          onClick={() => adjustTime(0, -30)}
          variant="outline"
          size="sm"
          disabled={disabled}
          className="flex-1 min-w-16"
        >
          -30분
        </Button>
        <Button
          type="button"
          onClick={() => adjustTime(-1)}
          variant="outline"
          size="sm"
          disabled={disabled}
          className="flex-1 min-w-16"
        >
          -1시간
        </Button>
      </div>
    </div>
  );
}
