import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GuidelinePanel } from "../ui/GuidelinePanel";

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
    <div className="space-y-4">
      <div>
        <Label className="mb-2 block">종료 시간</Label>
        <div className="flex items-center gap-2 mb-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={setNow}
            disabled={disabled}
            className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200"
          >
            지금 일어남
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Input
              type="number"
              min="0"
              max="23"
              placeholder="시"
              value={endTimeHours}
              onChange={(e) => setEndTimeHours(e.target.value)}
              className={errors.endTime ? "border-red-500" : ""}
              disabled={disabled}
            />
          </div>
          <div className="space-y-1">
            <Input
              type="number"
              min="0"
              max="59"
              placeholder="분"
              value={endTimeMinutes}
              onChange={(e) => setEndTimeMinutes(e.target.value)}
              className={errors.endTime ? "border-red-500" : ""}
              disabled={disabled}
            />
          </div>
        </div>
        {errors.endTime && (
          <p className="text-xs text-red-500 mt-1">{errors.endTime}</p>
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
