import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { GuidelinePanel } from "../ui/GuidelinePanel";

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
    <div className="space-y-4">
      <div>
        <Label className="mb-2 block">수유 종류</Label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { key: "breast", label: "모유" },
            { key: "formula", label: "분유" },
            { key: "pumped", label: "유축" },
            { key: "baby_food", label: "이유식" },
          ].map((ft) => (
            <Button
              key={ft.key}
              type="button"
              variant="outline"
              onClick={() => setFeedingType(ft.key)}
              disabled={disabled}
              className={cn(
                feedingType === ft.key
                  ? "bg-blue-500 text-white hover:bg-blue-600 border-blue-600"
                  : "hover:bg-blue-50"
              )}
            >
              {ft.label}
            </Button>
          ))}
        </div>
      </div>

      {feedingType === "breast" && (
        <>
          <div>
            <Label className="mb-2 block">수유 시간 (분)</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {[10, 15, 20, 30, 40].map((min) => (
                <Button
                  key={min}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFeedingDuration(min.toString())}
                  disabled={disabled}
                  className={cn(
                    "rounded-full",
                    feedingDuration === min.toString()
                      ? "bg-blue-500 text-white hover:bg-blue-600 border-blue-600"
                      : "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                  )}
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
              className={errors.feedingDuration ? "border-red-500" : ""}
              disabled={disabled}
            />
          </div>
          <div>
            <Label className="mb-2 block">수유 방향</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setBreastSide("left")}
                disabled={disabled}
                className={cn(
                  breastSide === "left"
                    ? "bg-blue-500 text-white hover:bg-blue-600 border-blue-600"
                    : "hover:bg-blue-50"
                )}
              >
                왼쪽
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setBreastSide("right")}
                disabled={disabled}
                className={cn(
                  breastSide === "right"
                    ? "bg-blue-500 text-white hover:bg-blue-600 border-blue-600"
                    : "hover:bg-blue-50"
                )}
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
        <div>
          <Label className="mb-2 block">
            {feedingType === "baby_food" ? "섭취량 (ml/g)" : "수유량 (ml)"}
          </Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {[60, 90, 120, 160, 200, 240].map((amount) => (
              <Button
                key={amount}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFeedingAmount(amount.toString())}
                disabled={disabled}
                className={cn(
                  "rounded-full",
                  feedingAmount === amount.toString()
                    ? "bg-blue-500 text-white hover:bg-blue-600 border-blue-600"
                    : "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                )}
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
            className={errors.feedingAmount ? "border-red-500" : ""}
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
            <p className="text-xs text-red-500 mt-1">{errors.feedingAmount}</p>
          )}
        </div>
      )}

      {feedingType === "baby_food" && (
        <div>
          <Label className="mb-2 block">이유식 메뉴</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {["쌀미음", "오트밀", "소고기", "닭고기", "야채", "과일", "간식"].map(
              (menu) => (
                <Button
                  key={menu}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setBabyFoodMenu(menu)}
                  disabled={disabled}
                  className={cn(
                    "rounded-full",
                    babyFoodMenu === menu
                      ? "bg-green-500 text-white hover:bg-green-600 border-green-600"
                      : "bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                  )}
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
            className={errors.babyFoodMenu ? "border-red-500" : ""}
            disabled={disabled}
          />
          {errors.babyFoodMenu && (
            <p className="text-xs text-red-500 mt-1">{errors.babyFoodMenu}</p>
          )}
        </div>
      )}
    </div>
  );
}
