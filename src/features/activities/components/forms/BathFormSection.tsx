import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { SPACING, TYPOGRAPHY } from "@/design-system";

interface BathFormSectionProps {
  bathType: string;
  setBathType: (value: string) => void;
  bathTemp: string;
  setBathTemp: (value: string) => void;
  reaction: string;
  setReaction: (value: string) => void;
  disabled?: boolean;
}

export function BathFormSection({
  bathType,
  setBathType,
  bathTemp,
  setBathTemp,
  reaction,
  setReaction,
  disabled = false,
}: BathFormSectionProps) {
  return (
    <div className={SPACING.space.md}>
      <div className={SPACING.space.sm}>
        <Label className={cn(TYPOGRAPHY.body.default, "font-medium mb-2 block")}>목욕 종류</Label>
        <div className={cn("grid grid-cols-3", SPACING.gap.sm)}>
          {[
            { key: "tub", label: "🛁 통목욕" },
            { key: "shower", label: "🚿 샤워" },
            { key: "wipe", label: "🧽 닦기" },
          ].map((item) => (
            <Button
              key={item.key}
              type="button"
              variant={bathType === item.key ? "default" : "outline"}
              onClick={() => setBathType(item.key)}
              disabled={disabled}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      <div className={SPACING.space.sm}>
        <Label className={cn(TYPOGRAPHY.body.default, "font-medium mb-2 block")}>물 온도 (°C)</Label>
        <div className={cn("flex items-center", SPACING.gap.md)}>
          <Slider
            value={[parseFloat(bathTemp) || 38]}
            min={34}
            max={42}
            step={1}
            onValueChange={(vals) => setBathTemp(vals[0].toString())}
            disabled={disabled}
            className="flex-1"
          />
          <span className={cn(TYPOGRAPHY.h3, "text-primary w-12 text-right")}>
            {bathTemp}°C
          </span>
        </div>
      </div>

      <div className={SPACING.space.sm}>
        <Label className={cn(TYPOGRAPHY.body.default, "font-medium mb-2 block")}>아기 반응</Label>
        <div className={cn("grid grid-cols-3", SPACING.gap.sm)}>
          {[
            { key: "good", label: "😄 좋음" },
            { key: "neutral", label: "😐 보통" },
            { key: "bad", label: "😭 싫음" },
          ].map((item) => (
            <Button
              key={item.key}
              type="button"
              variant={reaction === item.key ? "default" : "outline"}
              onClick={() => setReaction(item.key)}
              disabled={disabled}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
