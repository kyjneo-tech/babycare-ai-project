import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SPACING, TYPOGRAPHY } from "@/design-system";
import { cn } from "@/lib/utils";

interface TemperatureFormSectionProps {
  temperature: string;
  setTemperature: (value: string) => void;
  errors: Record<string, string>;
  disabled?: boolean;
}

export function TemperatureFormSection({
  temperature,
  setTemperature,
  errors,
  disabled = false,
}: TemperatureFormSectionProps) {
  const adjustTemperature = (amount: number) => {
    const current = parseFloat(temperature) || 36.5;
    setTemperature((current + amount).toFixed(1));
  };

  return (
    <div className={SPACING.space.md}>
      <div className={SPACING.space.sm}>
        <Label className={cn(TYPOGRAPHY.body.default, "font-medium mb-2 block")}>체온 (°C)</Label>
        <div className={cn("flex items-center", SPACING.gap.md)}>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => adjustTemperature(-0.1)}
            disabled={disabled}
            className="w-12 h-12 rounded-full"
          >
            <span className="text-2xl font-bold">-</span>
          </Button>
          <Input
            type="number"
            step="0.1"
            inputMode="decimal"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            className={cn(
              "flex-1 text-center text-2xl font-bold h-12",
              errors.temperature && "border-destructive",
              parseFloat(temperature) >= 38 && "text-destructive"
            )}
            disabled={disabled}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => adjustTemperature(0.1)}
            disabled={disabled}
            className="w-12 h-12 rounded-full"
          >
            <span className="text-2xl font-bold">+</span>
          </Button>
        </div>
        {errors.temperature && (
          <p className={cn(TYPOGRAPHY.caption, "text-center text-destructive mt-2")}>
            {errors.temperature}
          </p>
        )}
      </div>
    </div>
  );
}
