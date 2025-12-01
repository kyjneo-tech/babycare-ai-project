"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { differenceInMinutes, differenceInSeconds } from "date-fns";
import { cn } from "@/lib/utils";
import { SPACING, TYPOGRAPHY } from "@/design-system";

interface SleepTimerProps {
  isSleeping: boolean;
  startTime: Date | null;
  onStartSleep: () => void;
  onEndSleep: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function SleepTimer({
  isSleeping,
  startTime,
  onStartSleep,
  onEndSleep,
  loading = false,
  disabled = false,
}: SleepTimerProps) {
  const [elapsedTime, setElapsedTime] = useState<string>("");

  useEffect(() => {
    if (!isSleeping || !startTime) {
      setElapsedTime("");
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const diffMinutes = differenceInMinutes(now, startTime);
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      
      if (hours > 0) {
        setElapsedTime(`${hours}시간 ${minutes}분`);
      } else {
        setElapsedTime(`${minutes}분`);
      }
    };

    updateTimer(); // 초기 실행
    const interval = setInterval(updateTimer, 60000); // 1분마다 갱신

    return () => clearInterval(interval);
  }, [isSleeping, startTime]);

  if (isSleeping) {
    return (
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 text-center animate-in fade-in zoom-in duration-300">
        <div className="mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 mb-3 animate-pulse">
            <Moon className="w-6 h-6" />
          </div>
          <h3 className={cn(TYPOGRAPHY.h3, "text-indigo-900 mb-1")}>
            아기가 자고 있어요 💤
          </h3>
          <p className="text-indigo-600 font-medium text-lg">
            {elapsedTime}째 수면 중
          </p>
          <p className="text-xs text-indigo-400 mt-1">
            {startTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}부터
          </p>
        </div>

        <Button
          onClick={onEndSleep}
          disabled={loading || disabled}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-lg shadow-md transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "저장 중..." : (
            <>
              <Sun className="w-5 h-5 mr-2" />
              지금 기상 ☀️
            </>
          )}
        </Button>
        {disabled && (
          <p className="text-xs text-indigo-500 mt-2">
            💡 게스트 모드에서는 수면 타이머를 사용할 수 없습니다
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <Button
        onClick={onStartSleep}
        disabled={loading || disabled}
        className={cn(
          "w-full h-14 text-lg font-semibold shadow-sm",
          "bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600",
          "transition-all hover:scale-[1.01]",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        {loading ? "시작 중..." : (
          <>
            <Moon className="w-5 h-5 mr-2" />
            지금 잠들기 시작 🌙
          </>
        )}
      </Button>
      {disabled && (
        <p className="text-xs text-slate-500 mt-2 text-center">
          💡 게스트 모드에서는 수면 타이머를 사용할 수 없습니다
        </p>
      )}
    </div>
  );
}
