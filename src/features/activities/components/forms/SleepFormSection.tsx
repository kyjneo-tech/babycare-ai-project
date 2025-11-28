import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GuidelinePanel } from "../ui/GuidelinePanel";
import { SPACING, TYPOGRAPHY } from "@/design-system";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { TimeSelector } from "@/components/common/TimeSelector";
import { format } from "date-fns";

interface SleepFormSectionProps {
  endTime: Date;
  setEndTime: (value: Date) => void;
  sleepDurationHours: string;
  setSleepDurationHours: (value: string) => void;
  sleepDurationMinutes: string;
  setSleepDurationMinutes: (value: string) => void;
  ageInMonths: number;
  errors: Record<string, string>;
  disabled?: boolean;
}

export function SleepFormSection({
  endTime,
  setEndTime,
  sleepDurationHours,
  setSleepDurationHours,
  sleepDurationMinutes,
  setSleepDurationMinutes,
  ageInMonths,
  errors,
  disabled = false,
}: SleepFormSectionProps) {
  
  const handleDurationQuickButton = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    setSleepDurationHours(hours.toString());
    setSleepDurationMinutes(minutes.toString());
  };

  // Calculate start time based on end time and duration
  const calculatedTimes = useMemo(() => {
    const durH = parseInt(sleepDurationHours) || 0;
    const durM = parseInt(sleepDurationMinutes) || 0;

    if (!endTime || (durH === 0 && durM === 0)) {
      return null;
    }

    const durationMs = (durH * 60 + durM) * 60 * 1000;
    const startTime = new Date(endTime.getTime() - durationMs);

    const isYesterday = startTime.getDate() !== endTime.getDate();
    
    return {
      startTime,
      endTime,
      isYesterday,
      totalHours: durH + durM / 60
    };
  }, [endTime, sleepDurationHours, sleepDurationMinutes]);

  return (
    <div className={SPACING.space.md}>
      {/* 언제 일어났나요? */}
      <TimeSelector
        value={endTime}
        onChange={setEndTime}
        label="😴 언제 일어났나요? "
        disabled={disabled}
      />
      
      {errors.endTime && (
        <p className={cn(TYPOGRAPHY.caption, "text-destructive -mt-2 mb-2")}>{errors.endTime}</p>
      )}

      {/* 얼마나 잤나요? */}
      <div className={SPACING.space.sm}>
        <Label className={cn(TYPOGRAPHY.body.default, "font-medium mb-2 block")}>
          얼마나 잤나요?
        </Label>
        
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[60, 120, 180, 480, 600, 720].map((min) => (
            <Button
              key={min}
              type="button"
              variant="outline"
              className="h-10 text-sm"
              onClick={() => handleDurationQuickButton(min)}
              disabled={disabled}
            >
              {min < 60 ? `${min}분` : `${min / 60}시간`}
            </Button>
          ))}
        </div>

        <Label className="text-xs text-muted-foreground mb-1 block">또는 직접 입력:</Label>
        <div className={cn("grid grid-cols-2", SPACING.gap.sm)}>
          <div className={SPACING.space.xs}>
            <Label className="text-xs text-muted-foreground mb-1 block">시간</Label>
            <Input
              type="number"
              min="0"
              max="24"
              placeholder="시간"
              value={sleepDurationHours}
              onChange={(e) => setSleepDurationHours(e.target.value)}
              className="text-lg text-center h-12"
              disabled={disabled}
            />
          </div>
          <div className={SPACING.space.xs}>
            <Label className="text-xs text-muted-foreground mb-1 block">분</Label>
            <Input
              type="number"
              min="0"
              max="59"
              placeholder="분"
              value={sleepDurationMinutes}
              onChange={(e) => setSleepDurationMinutes(e.target.value)}
              className="text-lg text-center h-12"
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      {/* 계산 결과 표시 */}
      {calculatedTimes && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">📊 자동 계산 결과</p>
            <p className="text-base font-semibold text-primary">
              🌙 {calculatedTimes.isYesterday && "어제 "}
              {calculatedTimes.startTime.getHours().toString().padStart(2, '0')}:
              {calculatedTimes.startTime.getMinutes().toString().padStart(2, '0')}
              {" → "}
              ☀️ {calculatedTimes.endTime.getFullYear() !== calculatedTimes.startTime.getFullYear() || calculatedTimes.endTime.getMonth() !== calculatedTimes.startTime.getMonth() || calculatedTimes.endTime.getDate() !== calculatedTimes.startTime.getDate() ? format(calculatedTimes.endTime, "M월 d일") : ""}
              {calculatedTimes.endTime.getHours().toString().padStart(2, '0')}:
              {calculatedTimes.endTime.getMinutes().toString().padStart(2, '0')}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              (총 {calculatedTimes.totalHours.toFixed(1)}시간)
            </p>
          </div>
        </div>
      )}

      {ageInMonths >= 0 && (
        <GuidelinePanel
          type="sleep"
          ageInMonths={ageInMonths}
          value={0}
        />
      )}
    </div>
  );
}
