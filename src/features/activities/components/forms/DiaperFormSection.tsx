import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
    <div className="space-y-4">
      <div>
        <Label className="mb-2 block">배변 종류</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setDiaperType("urine")}
            disabled={disabled}
            className={cn(
              "h-auto py-3 flex flex-col gap-1",
              diaperType === "urine"
                ? "bg-yellow-100 border-yellow-400 ring-2 ring-yellow-400 text-yellow-900 hover:bg-yellow-200"
                : "hover:bg-yellow-50"
            )}
          >
            <span className="text-xl">💧</span>
            <span className="text-sm font-medium">소변</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setDiaperType("stool")}
            disabled={disabled}
            className={cn(
              "h-auto py-3 flex flex-col gap-1",
              diaperType === "stool"
                ? "bg-yellow-100 border-yellow-400 ring-2 ring-yellow-400 text-yellow-900 hover:bg-yellow-200"
                : "hover:bg-yellow-50"
            )}
          >
            <span className="text-xl">💩</span>
            <span className="text-sm font-medium">대변</span>
          </Button>
        </div>
      </div>

      {diaperType === "stool" && (
        <div>
          <Label className="mb-2 block">대변 상태 (필수)</Label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "물설사", value: "watery", icon: "🌊" },
              { label: "묽은변", value: "loose", icon: "🫠" },
              { label: "정상변", value: "normal", icon: "🙂" },
              { label: "된변(토끼똥)", value: "hard", icon: "🪨" },
            ].map((cond) => (
              <Button
                key={cond.value}
                type="button"
                variant="outline"
                onClick={() => setStoolCondition(cond.value)}
                disabled={disabled}
                className={cn(
                  "justify-start gap-2",
                  stoolCondition === cond.value
                    ? "bg-yellow-100 border-yellow-400 ring-1 ring-yellow-400 text-yellow-900 hover:bg-yellow-200"
                    : "hover:bg-yellow-50"
                )}
              >
                <span>{cond.icon}</span>
                <span>{cond.label}</span>
              </Button>
            ))}
          </div>
          {errors.stoolCondition && (
            <p className="text-xs text-red-500 mt-1">{errors.stoolCondition}</p>
          )}
        </div>
      )}
    </div>
  );
}
