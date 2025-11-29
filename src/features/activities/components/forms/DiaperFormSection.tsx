import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { SPACING, TYPOGRAPHY } from "@/design-system";
import { useEffect } from "react";

interface DiaperFormSectionProps {
  diaperType: string;
  setDiaperType: (value: string) => void;
  stoolCondition: string;
  setStoolCondition: (value: string) => void;
  errors: Record<string, string>;
  disabled?: boolean;
  babyId?: string; // 아기별로 선호도 저장
}

interface DiaperPreferences {
  lastDiaperType: string;
  lastStoolCondition: string;
  lastUpdated: number;
}

const STORAGE_KEY_PREFIX = "diaperPrefs_";

export function DiaperFormSection({
  diaperType,
  setDiaperType,
  stoolCondition,
  setStoolCondition,
  errors,
  disabled = false,
  babyId,
}: DiaperFormSectionProps) {
  // localStorage에서 마지막 선택 값 불러오기
  useEffect(() => {
    if (!babyId) return;

    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${babyId}`);
      if (stored) {
        const prefs: DiaperPreferences = JSON.parse(stored);
        // 7일 이내의 기록만 사용
        const isRecent = Date.now() - prefs.lastUpdated < 7 * 24 * 60 * 60 * 1000;
        if (isRecent && prefs.lastDiaperType) {
          setDiaperType(prefs.lastDiaperType);
          if (prefs.lastDiaperType === "stool" && prefs.lastStoolCondition) {
            setStoolCondition(prefs.lastStoolCondition);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load diaper preferences:", error);
    }
  }, [babyId]); // babyId만 의존성에 포함

  // 선택 변경 시 localStorage에 저장
  useEffect(() => {
    if (!babyId || !diaperType) return;

    try {
      const prefs: DiaperPreferences = {
        lastDiaperType: diaperType,
        lastStoolCondition: diaperType === "stool" ? stoolCondition : "normal",
        lastUpdated: Date.now(),
      };
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${babyId}`, JSON.stringify(prefs));
    } catch (error) {
      console.error("Failed to save diaper preferences:", error);
    }
  }, [babyId, diaperType, stoolCondition]);

  return (
    <div className={SPACING.space.md}>
      <div className={SPACING.space.sm}>
        <Label className={cn(TYPOGRAPHY.body.default, "font-medium mb-2 block")}>배변 종류</Label>
        <div className={cn("grid grid-cols-2", SPACING.gap.sm)}>
          <Button
            type="button"
            variant={diaperType === "urine" ? "default" : "outline"}
            onClick={() => setDiaperType("urine")}
            disabled={disabled}
            className="h-auto py-3 flex flex-col gap-1"
          >
            <span className="text-xl">💧</span>
            <span className={TYPOGRAPHY.body.small}>소변</span>
          </Button>
          <Button
            type="button"
            variant={diaperType === "stool" ? "default" : "outline"}
            onClick={() => setDiaperType("stool")}
            disabled={disabled}
            className="h-auto py-3 flex flex-col gap-1"
          >
            <span className="text-xl">💩</span>
            <span className={TYPOGRAPHY.body.small}>대변 (정상)</span>
          </Button>
        </div>
      </div>

      {diaperType === "stool" && (
        <div className={SPACING.space.sm}>
          <Label className={cn(TYPOGRAPHY.body.default, "font-medium mb-2 block")}>
            대변 상태 <span className="text-muted-foreground font-normal text-xs">(비정상 시만 선택)</span>
          </Label>
          <div className={cn("grid grid-cols-3", SPACING.gap.sm)}>
            {[
              { label: "물설사", value: "watery", icon: "🌊" },
              { label: "묽은변", value: "loose", icon: "🫠" },
              { label: "된변", value: "hard", icon: "🪨" },
            ].map((cond) => (
              <Button
                key={cond.value}
                type="button"
                variant={stoolCondition === cond.value ? "default" : "outline"}
                onClick={() => setStoolCondition(stoolCondition === cond.value ? "normal" : cond.value)}
                disabled={disabled}
                className="h-auto py-3 flex flex-col gap-1"
              >
                <span className="text-xl">{cond.icon}</span>
                <span className={TYPOGRAPHY.body.small}>{cond.label}</span>
              </Button>
            ))}
          </div>
          {stoolCondition === "normal" && (
            <p className="text-xs text-muted-foreground mt-2">
              정상 대변으로 기록됩니다
            </p>
          )}
        </div>
      )}
    </div>
  );
}
