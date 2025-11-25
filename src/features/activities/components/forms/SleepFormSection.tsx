import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GuidelinePanel } from "../ui/GuidelinePanel";
import { SPACING, TYPOGRAPHY } from "@/design-system";
import { cn } from "@/lib/utils";

interface SleepFormSectionProps {
  endTimeHours: string;
  setEndTimeHours: (value: string) => void;
  endTimeMinutes: string;
  setEndTimeMinutes: (value: string) => void;
  ageInMonths: number;
  errors: Record<string, string>;
  disabled?: boolean;
}

export function SleepFormSection({
  endTimeHours,
  setEndTimeHours,
  endTimeMinutes,
  setEndTimeMinutes,
  ageInMonths,
  errors,
  disabled = false,
}: SleepFormSectionProps) {
  const setNow = () => {
    const now = new Date();
    setEndTimeHours(now.getHours().toString());
    setEndTimeMinutes(now.getMinutes().toString());
  };

  return (
    <div className={SPACING.space.md}>
      <div className={SPACING.space.sm}>
        <Label className={cn(TYPOGRAPHY.body.default, "font-medium mb-2 block")}>종료 시간</Label>
        <div className={cn("flex items-center mb-2", SPACING.gap.sm)}>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={setNow}
            disabled={disabled}
          >
            지금 일어남
          </Button>
        </div>
        <div className={cn("grid grid-cols-2", SPACING.gap.sm)}>
          <div className={SPACING.space.xs}>
            <Input
              type="number"
              min="0"
              max="23"
              placeholder="시"
              value={endTimeHours}
              onChange={(e) => setEndTimeHours(e.target.value)}
              className={errors.endTime ? "border-destructive" : ""}
              disabled={disabled}
            />
          </div>
          <div className={SPACING.space.xs}>
            <Input
              type="number"
              min="0"
              max="59"
              placeholder="분"
              value={endTimeMinutes}
              onChange={(e) => setEndTimeMinutes(e.target.value)}
              className={errors.endTime ? "border-destructive" : ""}
              disabled={disabled}
            />
          </div>
        </div>
        {errors.endTime && (
          <p className={cn(TYPOGRAPHY.caption, "text-destructive mt-1")}>{errors.endTime}</p>
        )}

        {ageInMonths >= 0 && (
          <GuidelinePanel
            type="sleep"
            ageInMonths={ageInMonths}
            value={0} // Value not used for sleep guideline display only
          />
        )}
      </div>
    </div>
  );
}
