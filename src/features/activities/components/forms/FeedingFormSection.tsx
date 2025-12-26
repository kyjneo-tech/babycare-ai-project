"use client";

import { useEffect, useState } from "react";
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
  babyId: string; // ✨ Store 구독을 위해 babyId 필요
  latestWeight: number | null; // 폴백용으로 유지
  ageInMonths?: number;
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

  babyId,
  latestWeight: initialWeight,
  ageInMonths,
  errors,
  disabled = false,
}: FeedingFormSectionProps) {
  // ✨ Zustand Store에서 실시간 체중 가져오기
  const [latestWeight, setLatestWeight] = useState<number | null>(initialWeight);

  useEffect(() => {
    const { useMeasurementStore } = require('@/stores');
    
    // 초기 로드
    const latest = useMeasurementStore.getState().getLatestMeasurement(babyId);
    if (latest) {
      setLatestWeight(latest.weight);
    }

    // Store 구독 - 체중 변경 시 즉시 업데이트!
    const unsubscribe = useMeasurementStore.subscribe(() => {
      const updated = useMeasurementStore.getState().getLatestMeasurement(babyId);
      if (updated) {
        setLatestWeight(updated.weight);
      }
    });

    return unsubscribe;
  }, [babyId]);
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
          
          {/* 퀵 버튼 */}
          <div className={cn("flex flex-wrap mb-3", SPACING.gap.sm)}>
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

          {/* 증감 버튼 UI */}
          <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 backdrop-blur-sm rounded-lg p-3 border border-white/10">
            {/* 상단: ±10 버튼 */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const current = parseInt(feedingAmount) || 0;
                  setFeedingAmount(Math.max(0, current - 10).toString());
                }}
                disabled={disabled || parseInt(feedingAmount) <= 0}
                className="w-12 h-12 text-sm font-semibold"
              >
                -10
              </Button>
              
              <div className="flex-1 text-center">
                <div className="text-3xl font-bold text-primary">
                  {feedingAmount || "0"}
                  <span className="text-lg ml-1">ml</span>
                </div>
              </div>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const current = parseInt(feedingAmount) || 0;
                  setFeedingAmount(Math.min(500, current + 10).toString());
                }}
                disabled={disabled || parseInt(feedingAmount) >= 500}
                className="w-12 h-12 text-sm font-semibold"
              >
                +10
              </Button>
            </div>

            {/* 하단: ±1, ±5 버튼 */}
            <div className="flex items-center justify-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const current = parseInt(feedingAmount) || 0;
                  setFeedingAmount(Math.max(0, current - 5).toString());
                }}
                disabled={disabled || parseInt(feedingAmount) <= 0}
                className="w-10 h-10 text-xs"
              >
                -5
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const current = parseInt(feedingAmount) || 0;
                  setFeedingAmount(Math.max(0, current - 1).toString());
                }}
                disabled={disabled || parseInt(feedingAmount) <= 0}
                className="w-10 h-10 text-xs"
              >
                -1
              </Button>
              
              <div className="w-12"></div>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const current = parseInt(feedingAmount) || 0;
                  setFeedingAmount(Math.min(500, current + 1).toString());
                }}
                disabled={disabled || parseInt(feedingAmount) >= 500}
                className="w-10 h-10 text-xs"
              >
                +1
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const current = parseInt(feedingAmount) || 0;
                  setFeedingAmount(Math.min(500, current + 5).toString());
                }}
                disabled={disabled || parseInt(feedingAmount) >= 500}
                className="w-10 h-10 text-xs"
              >
                +5
              </Button>
            </div>
          </div>

          {latestWeight && (
            <GuidelinePanel
              type={feedingType === "baby_food" ? "baby_food" : "feeding"}
              value={parseFloat(feedingAmount) || 0}
              weight={latestWeight}
              ageInMonths={ageInMonths}
            />
          )}
          {errors.feedingAmount && (
            <p className={cn(TYPOGRAPHY.caption, "text-destructive mt-1")}>{errors.feedingAmount}</p>
          )}
        </div>
      )}


    </div>
  );
}
