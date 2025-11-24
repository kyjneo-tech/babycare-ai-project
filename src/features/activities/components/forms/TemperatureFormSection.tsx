import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <div className="space-y-4">
      <div>
        <Label className="mb-2 block">체온 (°C)</Label>
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => adjustTemperature(-0.1)}
            disabled={disabled}
            className="w-12 h-12 rounded-full bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
          >
            <span className="text-2xl font-bold">-</span>
          </Button>
          <Input
            type="number"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            className="flex-1 text-center text-2xl font-bold h-12 border-red-200 focus-visible:ring-red-500"
            disabled={disabled}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => adjustTemperature(0.1)}
            disabled={disabled}
            className="w-12 h-12 rounded-full bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
          >
            <span className="text-2xl font-bold">+</span>
          </Button>
        </div>
        {errors.temperature && (
          <p className="text-xs text-center text-red-500 mt-2">
            {errors.temperature}
          </p>
        )}
      </div>
    </div>
  );
}
