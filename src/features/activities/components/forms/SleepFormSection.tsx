import { GuidelinePanel } from "../ui/GuidelinePanel";
import { SPACING, TYPOGRAPHY } from "@/design-system";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { TimeSelector } from "@/components/common/TimeSelector";
import { differenceInMinutes } from "date-fns";
import { SleepTimer } from "../SleepTimer";

interface SleepFormSectionProps {
  startTime: Date;
  setStartTime: (value: Date) => void;
  endTime: Date;
  setEndTime: (value: Date) => void;
  sleepDurationHours: string;
  setSleepDurationHours: (value: string) => void;
  sleepDurationMinutes: string;
  setSleepDurationMinutes: (value: string) => void;
  ageInMonths: number;
  errors: Record<string, string>;
  disabled?: boolean;
  // Sleep Timer Props
  isSleeping?: boolean;
  onStartSleep?: () => void;
  onEndSleep?: () => void;
  timerLoading?: boolean;
}

export function SleepFormSection({
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  sleepDurationHours,
  setSleepDurationHours,
  sleepDurationMinutes,
  setSleepDurationMinutes,
  ageInMonths,
  errors,
  disabled = false,
  isSleeping = false,
  onStartSleep,
  onEndSleep,
  timerLoading = false,
}: SleepFormSectionProps) {
  // StartTime이나 EndTime이 변경되면 Duration을 자동 계산하여 업데이트
  useEffect(() => {
    if (startTime && endTime) {
      const diff = differenceInMinutes(endTime, startTime);
      if (diff >= 0) {
        const hours = Math.floor(diff / 60);
        const minutes = diff % 60;
        // 현재 입력된 값과 다를 때만 업데이트 (무한 루프 방지)
        if (parseInt(sleepDurationHours || '0') !== hours || parseInt(sleepDurationMinutes || '0') !== minutes) {
          setSleepDurationHours(hours.toString());
          setSleepDurationMinutes(minutes.toString());
        }
      }
    }
  }, [startTime, endTime, setSleepDurationHours, setSleepDurationMinutes]);



  return (
    <div className={SPACING.space.md}>
      {/* 1. 수면 타이머 (최상단) */}
      {onStartSleep && onEndSleep && (
        <div className="mb-6">
          <SleepTimer
            isSleeping={isSleeping}
            startTime={isSleeping ? startTime : null}
            onStartSleep={onStartSleep}
            onEndSleep={onEndSleep}
            loading={timerLoading}
            disabled={disabled}
          />
        </div>
      )}

      {/* 구분선 및 안내 문구 (수면 중이 아닐 때만 표시) */}
      {!isSleeping && (
        <div className="relative flex items-center justify-center my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/10" />
          </div>
          <span className="relative bg-background px-4 text-xs text-slate-400 font-medium">
            수면 후 기상한 상태라면?
          </span>
        </div>
      )}

      {/* 2. 수동 입력 폼 (수면 중이 아닐 때만 표시) */}
      {!isSleeping && (
        <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
          {/* 언제 잠들었나요? (Start Time) */}
          <TimeSelector
            value={startTime}
            onChange={setStartTime}
            label="🌙 언제 잠들었나요?"
            disabled={disabled}
          />

          {/* 언제 일어났나요? (End Time) */}
          <div className="relative">
            <TimeSelector
              value={endTime}
              onChange={setEndTime}
              label="☀️ 언제 일어났나요?"
              disabled={disabled}
            />
            {differenceInMinutes(endTime, startTime) < 0 && (
              <p className="text-destructive text-sm mt-1">
                일어난 시간은 잠든 시간보다 뒤여야 합니다.
              </p>
            )}
            {errors.endTime && (
              <p className={cn(TYPOGRAPHY.caption, "text-destructive mt-1")}>{errors.endTime}</p>
            )}
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
