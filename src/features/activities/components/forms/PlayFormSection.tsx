import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface PlayFormSectionProps {
  playLocation: string;
  setPlayLocation: (value: string) => void;
  playType: string[];
  togglePlayType: (value: string) => void;
  reaction: string;
  setReaction: (value: string) => void;
  disabled?: boolean;
}

export function PlayFormSection({
  playLocation,
  setPlayLocation,
  playType,
  togglePlayType,
  reaction,
  setReaction,
  disabled = false,
}: PlayFormSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="mb-2 block">놀이 장소</Label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: "indoor", label: "🏡 실내놀이" },
            { key: "outdoor", label: "🌳 야외활동" },
          ].map((item) => (
            <Button
              key={item.key}
              type="button"
              variant="outline"
              onClick={() => setPlayLocation(item.key)}
              disabled={disabled}
              className={cn(
                playLocation === item.key
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
        <Label className="mb-2 block">놀이 종류 (중복 선택 가능)</Label>
        <div className="flex flex-wrap gap-2">
          {[
            "#신체활동",
            "#두뇌/감각",
            "#교감/사회성",
            "#책읽기",
            "#휴식",
          ].map((tag) => (
            <Button
              key={tag}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => togglePlayType(tag)}
              disabled={disabled}
              className={cn(
                "rounded-full",
                playType.includes(tag)
                  ? "bg-green-500 text-white hover:bg-green-600 border-green-600"
                  : "bg-gray-100 text-gray-900 hover:bg-gray-200 border-transparent"
              )}
            >
              {tag}
            </Button>
          ))}
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
