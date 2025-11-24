import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

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
    <div className="space-y-4">
      <div>
        <Label className="mb-2 block">목욕 종류</Label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: "tub", label: "🛁 통목욕" },
            { key: "shower", label: "🚿 샤워" },
            { key: "wipe", label: "🧽 닦기" },
          ].map((item) => (
            <Button
              key={item.key}
              type="button"
              variant="outline"
              onClick={() => setBathType(item.key)}
              disabled={disabled}
              className={cn(
                bathType === item.key
                  ? "bg-blue-500 text-white hover:bg-blue-600 border-blue-600"
                  : "hover:bg-blue-50"
              )}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <Label className="mb-2 block">물 온도 (°C)</Label>
        <div className="flex items-center gap-4">
          <Slider
            value={[parseFloat(bathTemp) || 38]}
            min={34}
            max={42}
            step={1}
            onValueChange={(vals) => setBathTemp(vals[0].toString())}
            disabled={disabled}
            className="flex-1"
          />
          <span className="font-bold text-blue-600 w-12 text-right">
            {bathTemp}°C
          </span>
        </div>
      </div>

      <div>
        <Label className="mb-2 block">아기 반응</Label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: "good", label: "😄 좋음" },
            { key: "neutral", label: "😐 보통" },
            { key: "bad", label: "😭 싫음" },
          ].map((item) => (
            <Button
              key={item.key}
              type="button"
              variant="outline"
              onClick={() => setReaction(item.key)}
              disabled={disabled}
              className={cn(
                reaction === item.key
                  ? "bg-blue-500 text-white hover:bg-blue-600 border-blue-600"
                  : "hover:bg-blue-50"
              )}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
