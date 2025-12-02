"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { GuidelinePanel } from "../ui/GuidelinePanel";
import { SPACING, TYPOGRAPHY } from "@/design-system";

interface MedicineFormSectionProps {
  medicineName: string;
  setMedicineName: (value: string) => void;
  medicineAmount: string;
  setMedicineAmount: (value: string) => void;
  medicineUnit: string;
  setMedicineUnit: (value: string) => void;
  syrupConc: string;
  setSyrupConc: (value: string) => void;
  babyId: string; // ✨ Store 구독을 위해 babyId 필요
  latestWeight: number | null; // 폴백용으로 유지
  errors: Record<string, string>;
  disabled?: boolean;
}

export function MedicineFormSection({
  medicineName,
  setMedicineName,
  medicineAmount,
  setMedicineAmount,
  medicineUnit,
  setMedicineUnit,
  syrupConc,
  setSyrupConc,
  babyId,
  latestWeight: initialWeight,
  errors,
  disabled = false,
}: MedicineFormSectionProps) {
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

  // 이부프로펜 또는 아세트아미노펜인지 확인
  const needsSyrupConc =
    medicineName.includes('이부프로펜') ||
    medicineName.includes('부루펜') ||
    medicineName.includes('챔프 파랑') ||
    medicineName.includes('아세트아미노펜') ||
    medicineName.includes('타이레놀') ||
    medicineName.includes('챔프 빨강') ||
    medicineName.includes('세토펜');
  return (
    <div className={SPACING.space.md}>
      <div className={SPACING.space.sm}>
        <Label className={cn(TYPOGRAPHY.body.default, "font-medium mb-2 block")}>약 종류 (해열제 교차 복용)</Label>
        <div className={cn("grid grid-cols-1 mb-2", SPACING.gap.sm)}>
          <div className={cn("grid grid-cols-2", SPACING.gap.sm)}>
            <Button
              type="button"
              variant={medicineName.includes("아세트아미노펜") ? "default" : "outline"}
              onClick={() => setMedicineName("아세트아미노펜")}
              disabled={disabled}
              className="h-auto py-2 flex flex-col gap-1"
            >
              <span className="font-bold">🔴 아세트아미노펜</span>
              <span className={cn(TYPOGRAPHY.caption, "text-muted-foreground")}>(챔프 빨강, 세토펜)</span>
            </Button>
            <Button
              type="button"
              variant={medicineName.includes("이부프로펜") ? "default" : "outline"}
              onClick={() => setMedicineName("이부프로펜")}
              disabled={disabled}
              className="h-auto py-2 flex flex-col gap-1"
            >
              <span className="font-bold">🔵 이부프로펜</span>
              <span className={cn(TYPOGRAPHY.caption, "text-muted-foreground")}>(챔프 파랑, 부루펜)</span>
            </Button>
          </div>
          <Button
            type="button"
            variant={medicineName.includes("덱시부프로펜") ? "default" : "outline"}
            onClick={() => setMedicineName("덱시부프로펜")}
            disabled={disabled}
            className="h-auto py-2 flex flex-col gap-1"
          >
            <span className="font-bold">🟣 덱시부프로펜</span>
            <span className={cn(TYPOGRAPHY.caption, "text-muted-foreground")}>(맥시부펜, 애니펜)</span>
          </Button>
        </div>
        <Input
          type="text"
          placeholder="예: 챔프시럽, 부루펜"
          value={medicineName}
          onChange={(e) => setMedicineName(e.target.value)}
          className={errors.medicineName ? "border-destructive" : ""}
          disabled={disabled}
        />
        {errors.medicineName && (
          <p className={cn(TYPOGRAPHY.caption, "text-destructive mt-1")}>{errors.medicineName}</p>
        )}
        <p className={cn(TYPOGRAPHY.caption, "text-muted-foreground mt-1")}>
          💡 해열제는 보통 4~6시간 간격, 교차 복용(다른 계열) 시 2~3시간 간격으로
          복용합니다.
        </p>
      </div>

      <div className={cn("grid grid-cols-2", SPACING.gap.sm)}>
        <div className={SPACING.space.sm}>
          <Label className={cn(TYPOGRAPHY.body.default, "font-medium mb-2 block")}>용량</Label>
          <Input
            type="text"
            placeholder="5"
            value={medicineAmount}
            onChange={(e) => setMedicineAmount(e.target.value)}
            className={errors.medicineAmount ? "border-destructive" : ""}
            disabled={disabled}
          />
          {errors.medicineAmount && (
            <p className={cn(TYPOGRAPHY.caption, "text-destructive mt-1")}>{errors.medicineAmount}</p>
          )}
        </div>
        <div className={SPACING.space.sm}>
          <Label className={cn(TYPOGRAPHY.body.default, "font-medium mb-2 block")}>단위</Label>
          <Select
            value={medicineUnit}
            onValueChange={setMedicineUnit}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="단위" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ml">ml</SelectItem>
              <SelectItem value="cc">cc</SelectItem>
              <SelectItem value="mg">mg</SelectItem>
              <SelectItem value="tablet">정</SelectItem>
              <SelectItem value="drop">방울</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 시럽 농도 입력 (이부프로펜/아세트아미노펜만) */}
      {needsSyrupConc && (
        <div className={SPACING.space.sm}>
          <Label className={cn(TYPOGRAPHY.body.default, "font-medium mb-2 block")}>
            시럽 농도 (mg/mL)
          </Label>
          <Input
            type="text"
            placeholder="예: 20 (부루펜 100mg/5mL)"
            value={syrupConc}
            onChange={(e) => setSyrupConc(e.target.value)}
            disabled={disabled}
          />
          <p className={cn(TYPOGRAPHY.caption, "text-muted-foreground mt-1")}>
            💡 제품 라벨에서 확인: 예) 부루펜 100mg/5mL = 20mg/mL, 챔프 빨강 160mg/5mL = 32mg/mL
          </p>
        </div>
      )}

      {/* 권장 용량 안내 */}
      {medicineName && (
        <>
          {latestWeight ? (
            <GuidelinePanel
              type="medicine"
              value={parseFloat(medicineAmount) || 0}
              weight={latestWeight}
              medicineName={medicineName}
              syrupConc={syrupConc ? parseFloat(syrupConc) : undefined}
            />
          ) : !latestWeight ? (
            <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">권장 용량을 표시하려면 체중 기록이 필요합니다.</p>
                  <p className="text-xs mt-1">
                    상단의 &apos;성장 기록&apos; 카드에서 체중을 먼저 입력해주세요.
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
