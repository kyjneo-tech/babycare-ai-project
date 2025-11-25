import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { SPACING, TYPOGRAPHY } from "@/design-system";

interface DiaperFormSectionProps {
  diaperType: string;
  setDiaperType: (value: string) => void;
  stoolCondition: string;
  setStoolCondition: (value: string) => void;
  errors: Record<string, string>;
  disabled?: boolean;
}

export function DiaperFormSection({
  diaperType,
  setDiaperType,
  stoolCondition,
  setStoolCondition,
  errors,
  disabled = false,
}: DiaperFormSectionProps) {
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
            <span className={TYPOGRAPHY.body.small}>대변</span>
          </Button>
        </div>
      </div>

      {diaperType === "stool" && (
        <div className={SPACING.space.sm}>
          <Label className={cn(TYPOGRAPHY.body.default, "font-medium mb-2 block")}>대변 상태 (필수)</Label>
          <div className={cn("grid grid-cols-2", SPACING.gap.sm)}>
            {[
              { label: "물설사", value: "watery", icon: "🌊" },
              { label: "묽은변", value: "loose", icon: "🫠" },
              { label: "정상변", value: "normal", icon: "🙂" },
              { label: "된변(토끼똥)", value: "hard", icon: "🪨" },
            ].map((cond) => (
              <Button
                key={cond.value}
                type="button"
                variant={stoolCondition === cond.value ? "default" : "outline"}
                onClick={() => setStoolCondition(cond.value)}
                disabled={disabled}
                className="justify-start gap-2"
              >
                <span>{cond.icon}</span>
                <span>{cond.label}</span>
              </Button>
            ))}
          </div>
          {errors.stoolCondition && (
            <p className={cn(TYPOGRAPHY.caption, "text-destructive mt-1")}>{errors.stoolCondition}</p>
          )}
        </div>
      )}
    </div>
  );
}
