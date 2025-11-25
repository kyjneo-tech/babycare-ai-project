import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { GuidelinePanel } from "../ui/GuidelinePanel";
import { SPACING, TYPOGRAPHY } from "@/design-system";

interface FeedingFormSectionProps {
  feedingType: string;
  setFeedingType: (value: string) => void;
  feedingAmount: string;
  setFeedingAmount: (value: string) => void;
  feedingDuration: string;
  setFeedingDuration: (value: string) => void;
  breastSide: string;
  setBreastSide: (value: string) => void;
  babyFoodMenu: string;
  setBabyFoodMenu: (value: string) => void;
  latestWeight: number | null;
  errors: Record<string, string>;
  disabled?: boolean;
}

export function FeedingFormSection({
  feedingType,
  setFeedingType,
  feedingAmount,
  setFeedingAmount,
  feedingDuration,
  setFeedingDuration,
  breastSide,
  setBreastSide,
  babyFoodMenu,
  setBabyFoodMenu,
  latestWeight,
  errors,
  disabled = false,
}: FeedingFormSectionProps) {
  return (
    <div className={SPACING.space.md}>
      <div className={SPACING.space.sm}>
        <Label className={cn(TYPOGRAPHY.body.default, "font-medium mb-2 block")}>수유 종류</Label>
        <div className={cn("grid grid-cols-4", SPACING.gap.sm)}>
          {[
            { key: "breast", label: "모유" },
            { key: "formula", label: "분유" },
            { key: "pumped", label: "유축" },
            { key: "baby_food", label: "이유식" },
          ].map((ft) => (
            <Button
              key={ft.key}
              type="button"
              variant={feedingType === ft.key ? "default" : "outline"}
              onClick={() => setFeedingType(ft.key)}
              disabled={disabled}
            >
              {ft.label}
            </Button>
          ))}
        </div>
      </div>

      {feedingType === "breast" && (
        <>
          <div className={SPACING.space.sm}>
            <Label className={cn(TYPOGRAPHY.body.default, "font-medium mb-2 block")}>수유 시간 (분)</Label>
            <div className={cn("flex flex-wrap mb-2", SPACING.gap.sm)}>
              {[10, 15, 20, 30, 40].map((min) => (
                <Button
                  key={min}
                  type="button"
                  variant={feedingDuration === min.toString() ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setFeedingDuration(min.toString())}
                  disabled={disabled}
                  className="rounded-full"
                >
                  {min}분
                </Button>
              ))}
            </div>
            <Input
              type="number"
              placeholder="분 단위 입력"
              value={feedingDuration}
              onChange={(e) => setFeedingDuration(e.target.value)}
              className={errors.feedingDuration ? "border-destructive" : ""}
              disabled={disabled}
            />
          </div>
          <div className={SPACING.space.sm}>
            <Label className={cn(TYPOGRAPHY.body.default, "font-medium mb-2 block")}>수유 방향</Label>
            <div className={cn("grid grid-cols-2", SPACING.gap.sm)}>
              <Button
                type="button"
                variant={breastSide === "left" ? "default" : "outline"}
                onClick={() => setBreastSide("left")}
                disabled={disabled}
              >
                왼쪽
              </Button>
              <Button
                type="button"
                variant={breastSide === "right" ? "default" : "outline"}
                onClick={() => setBreastSide("right")}
                disabled={disabled}
              >
                오른쪽
              </Button>
            </div>
          </div>
        </>
      )}

      {(feedingType === "formula" ||
        feedingType === "pumped" ||
        feedingType === "baby_food") && (
        <div className={SPACING.space.sm}>
          <Label className={cn(TYPOGRAPHY.body.default, "font-medium mb-2 block")}>
            {feedingType === "baby_food" ? "섭취량 (ml/g)" : "수유량 (ml)"}
          </Label>
          <div className={cn("flex flex-wrap mb-2", SPACING.gap.sm)}>
            {[60, 90, 120, 160, 200, 240].map((amount) => (
              <Button
                key={amount}
                type="button"
                variant={feedingAmount === amount.toString() ? "default" : "secondary"}
                size="sm"
                onClick={() => setFeedingAmount(amount.toString())}
                disabled={disabled}
                className="rounded-full"
              >
                {amount}
              </Button>
            ))}
          </div>
          <Input
            type="number"
            placeholder="직접 입력"
            value={feedingAmount}
            onChange={(e) => setFeedingAmount(e.target.value)}
            className={errors.feedingAmount ? "border-destructive" : ""}
            disabled={disabled}
          />

          {latestWeight && feedingAmount && (
            <GuidelinePanel
              type="feeding"
              value={parseFloat(feedingAmount)}
              weight={latestWeight}
            />
          )}
          {errors.feedingAmount && (
            <p className={cn(TYPOGRAPHY.caption, "text-destructive mt-1")}>{errors.feedingAmount}</p>
          )}
        </div>
      )}

      {feedingType === "baby_food" && (
        <div className={SPACING.space.sm}>
          <Label className={cn(TYPOGRAPHY.body.default, "font-medium mb-2 block")}>이유식 메뉴</Label>
          <div className={cn("flex flex-wrap mb-2", SPACING.gap.sm)}>
            {["쌀미음", "오트밀", "소고기", "닭고기", "야채", "과일", "간식"].map(
              (menu) => (
                <Button
                  key={menu}
                  type="button"
                  variant={babyFoodMenu === menu ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setBabyFoodMenu(menu)}
                  disabled={disabled}
                  className="rounded-full"
                >
                  {menu}
                </Button>
              )
            )}
          </div>
          <Input
            type="text"
            placeholder="메뉴 직접 입력"
            value={babyFoodMenu}
            onChange={(e) => setBabyFoodMenu(e.target.value)}
            className={errors.babyFoodMenu ? "border-destructive" : ""}
            disabled={disabled}
          />
          {errors.babyFoodMenu && (
            <p className={cn(TYPOGRAPHY.caption, "text-destructive mt-1")}>{errors.babyFoodMenu}</p>
          )}
        </div>
      )}
    </div>
  );
}
