// src/features/activities/components/forms/FeedingForm.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ButtonGroup } from "../ui/ButtonGroup";
import { QuickSelectButtons } from "../ui/QuickSelectButtons";

interface FeedingFormProps {
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
  errors: Record<string, string>;
  disabled?: boolean;
  latestWeight?: number | null;
}

export function FeedingForm({
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
  errors,
  disabled = false,
  latestWeight,
}: FeedingFormProps) {
  return (
    <div className="space-y-4">
      {/* 수유 종류 */}
      <div>
        <Label>수유 종류</Label>
        <ButtonGroup
          options={[
            { value: "breast", label: "모유" },
            { value: "formula", label: "분유" },
            { value: "pumped", label: "유축" },
            { value: "baby_food", label: "이유식" },
          ]}
          value={feedingType}
          onChange={setFeedingType}
          disabled={disabled}
          columns={4}
        />
      </div>

      {/* 모유 수유 */}
      {feedingType === "breast" && (
        <>
          <div>
            <Label>수유 시간 (분)</Label>
            <QuickSelectButtons
              options={[10, 15, 20, 30, 40]}
              value={feedingDuration}
              onChange={setFeedingDuration}
              disabled={disabled}
              unit="분"
            />
            <Input
              type="number"
              placeholder="분 단위 입력"
              value={feedingDuration}
              onChange={(e) => setFeedingDuration(e.target.value)}
              disabled={disabled}
            />
          </div>

          <div>
            <Label>수유 방향</Label>
            <ButtonGroup
              options={[
                { value: "left", label: "왼쪽" },
                { value: "right", label: "오른쪽" },
              ]}
              value={breastSide}
              onChange={setBreastSide}
              disabled={disabled}
            />
          </div>
        </>
      )}

      {/* 분유/유축 */}
      {(feedingType === "formula" ||
        feedingType === "pumped" ||
        feedingType === "baby_food") && (
        <div>
          <Label>
            {feedingType === "baby_food" ? "섭취량 (ml/g)" : "수유량 (ml)"}
          </Label>
          <QuickSelectButtons
            options={[60, 90, 120, 160, 200, 240]}
            value={feedingAmount}
            onChange={setFeedingAmount}
            disabled={disabled}
          />
          <Input
            type="number"
            placeholder="직접 입력"
            value={feedingAmount}
            onChange={(e) => setFeedingAmount(e.target.value)}
            disabled={disabled}
            className={errors.feedingAmount ? "border-red-500" : ""}
          />
          {errors.feedingAmount && (
            <p className="text-xs text-red-500 mt-1">{errors.feedingAmount}</p>
          )}
        </div>
      )}

      {/* 이유식 메뉴 */}
      {feedingType === "baby_food" && (
        <div>
          <Label>이유식 메뉴</Label>
          <QuickSelectButtons
            options={["쌀미음", "오트밀", "소고기", "닭고기", "야채", "과일", "간식"].map(
              (menu, idx) => idx
            )}
            value={babyFoodMenu}
            onChange={(val) => {
              const menus = ["쌀미음", "오트밀", "소고기", "닭고기", "야채", "과일", "간식"];
              setBabyFoodMenu(menus[parseInt(val)] || "");
            }}
            disabled={disabled}
          />
          <Input
            type="text"
            placeholder="메뉴 직접 입력"
            value={babyFoodMenu}
            onChange={(e) => setBabyFoodMenu(e.target.value)}
            disabled={disabled}
            className={errors.babyFoodMenu ? "border-red-500" : ""}
          />
          {errors.babyFoodMenu && (
            <p className="text-xs text-red-500 mt-1">{errors.babyFoodMenu}</p>
          )}
        </div>
      )}
    </div>
  );
}
