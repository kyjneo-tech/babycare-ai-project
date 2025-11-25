import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { SPACING, TYPOGRAPHY } from "@/design-system";

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
    <div className={SPACING.space.md}>
      <div className={SPACING.space.sm}>
        <Label className={cn(TYPOGRAPHY.body.default, "font-medium mb-2 block")}>놀이 장소</Label>
        <div className={cn("grid grid-cols-2", SPACING.gap.sm)}>
          {[
            { key: "indoor", label: "🏡 실내놀이" },
            { key: "outdoor", label: "🌳 야외활동" },
          ].map((item) => (
            <Button
              key={item.key}
              type="button"
              variant={playLocation === item.key ? "default" : "outline"}
              onClick={() => setPlayLocation(item.key)}
              disabled={disabled}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      <div className={SPACING.space.sm}>
        <Label className={cn(TYPOGRAPHY.body.default, "font-medium mb-2 block")}>놀이 종류 (중복 선택 가능)</Label>
        <div className={cn("flex flex-wrap", SPACING.gap.sm)}>
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
              variant={playType.includes(tag) ? "default" : "secondary"}
              size="sm"
              onClick={() => togglePlayType(tag)}
              disabled={disabled}
              className="rounded-full"
            >
              {tag}
            </Button>
          ))}
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
