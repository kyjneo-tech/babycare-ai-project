/**
 * QuickRecordModal Component
 * BottomSheet 기반 빠른 활동 기록 모달
 * 기존 ActivityForm 로직 재사용
 */

"use client";

import * as React from "react";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { Activity } from "@prisma/client";
import { differenceInMonths } from "date-fns";
import { getBabyById } from "@/features/babies/actions";
import { getLatestMeasurement } from "@/features/measurements/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetBody,
} from "@/components/ui/bottom-sheet";
import { cn } from "@/lib/utils";
import { SPACING, TYPOGRAPHY } from "@/design-system";

// 기존 ActivityForm 컴포넌트 재사용
import { TimeSelector } from "@/components/common/TimeSelector";
import { ActivitySuggestions } from "@/features/activities/components/ui/ActivitySuggestions";
import { FeedingFormSection } from "@/features/activities/components/forms/FeedingFormSection";
import { SleepFormSection } from "@/features/activities/components/forms/SleepFormSection";
import { DiaperFormSection } from "@/features/activities/components/forms/DiaperFormSection";
import { MedicineFormSection } from "@/features/activities/components/forms/MedicineFormSection";
import { TemperatureFormSection } from "@/features/activities/components/forms/TemperatureFormSection";
import { BathFormSection } from "@/features/activities/components/forms/BathFormSection";
import { PlayFormSection } from "@/features/activities/components/forms/PlayFormSection";

// 기존 훅 재사용
import { useActivityFormState, type ActivityType } from "@/features/activities/hooks/useActivityFormState";
import { useActivitySubmit } from "@/features/activities/hooks/useActivitySubmit";

interface QuickRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  babyId?: string;
  onActivityCreated?: (activity: Activity) => void;
}

const ACTIVITY_BUTTONS = [
  { type: "FEEDING" as const, icon: "🍼", label: "수유" },
  { type: "SLEEP" as const, icon: "😴", label: "수면" },
  { type: "DIAPER" as const, icon: "💩", label: "배변" },
  { type: "MEDICINE" as const, icon: "💊", label: "투약" },
  { type: "TEMPERATURE" as const, icon: "🌡️", label: "체온" },
  { type: "BATH" as const, icon: "🛁", label: "목욕" },
  { type: "PLAY" as const, icon: "🧸", label: "놀이" },
];

export function QuickRecordModal({
  isOpen,
  onClose,
  babyId,
  onActivityCreated,
}: QuickRecordModalProps) {
  const { data: session, status } = useSession();
  const isGuestMode = status === "unauthenticated";

  // 기존 훅 재사용
  const state = useActivityFormState();
  const {
    type,
    setType,
    loading,
    error,
    hours,
    minutes,
    errors,
  } = state;

  const { handleSubmit } = useActivitySubmit({
    babyId: babyId || "",
    userId: session?.user?.id,
    isGuestMode,
    state,
    onActivityCreated: (activity) => {
      onActivityCreated?.(activity);
      onClose();
    },
  });

  // 활동 타입 선택되지 않은 상태 (초기 화면)
  const [selectedType, setSelectedType] = React.useState<ActivityType | null>(null);

  // 아기 정보 및 최신 체중 로드 (ActivityForm과 동일)
  useEffect(() => {
    const loadBabyData = async () => {
      if (!babyId) return;
      
      try {
        const babyResult = await getBabyById(babyId);
        if (babyResult.success && babyResult.data) {
          state.setBabyInfo({
            birthDate: babyResult.data.birthDate,
            gender: babyResult.data.gender as "male" | "female",
          });
          const months = differenceInMonths(
            new Date(),
            babyResult.data.birthDate
          );
          state.setAgeInMonths(months);
        }

        const measurementResult = await getLatestMeasurement(babyId);
        if (measurementResult.success && measurementResult.data) {
          state.setLatestWeight(measurementResult.data.weight);
        }
      } catch (error) {
        console.error("아기 정보 로드 실패:", error);
      }
    };

    loadBabyData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [babyId]); // ✅ babyId만 의존성으로

  React.useEffect(() => {
    if (isOpen) {
      setSelectedType(null); // 모달 열 때마다 초기화
    }
  }, [isOpen]);

  const handleTypeSelect = (activityType: ActivityType) => {
    setType(activityType);
    setSelectedType(activityType);
  };

  const handleBack = () => {
    setSelectedType(null);
  };

  return (
    <BottomSheet open={isOpen} onOpenChange={onClose}>
      <BottomSheetContent className="max-h-[90vh]">
        {!selectedType ? (
          // 활동 선택 화면
          <>
            <BottomSheetHeader>
              <BottomSheetTitle>무엇을 기록할까요?</BottomSheetTitle>
            </BottomSheetHeader>
            <BottomSheetBody>
              <div className={cn("grid grid-cols-4", SPACING.gap.sm)}>
                {ACTIVITY_BUTTONS.map((item) => (
                  <Button
                    key={item.type}
                    type="button"
                    variant="outline"
                    className={cn(
                      "h-auto py-4 flex flex-col gap-2",
                      "hover:bg-gradient-to-br hover:from-pink-50 hover:to-purple-50",
                      "hover:border-primary/50 transition-all"
                    )}
                    onClick={() => handleTypeSelect(item.type)}
                    disabled={isGuestMode || !babyId}
                  >
                    <span className="text-3xl">{item.icon}</span>
                    <span className={cn(TYPOGRAPHY.caption, "font-medium")}>
                      {item.label}
                    </span>
                  </Button>
                ))}
              </div>

              {isGuestMode ? (
                <div className="mt-4 p-3 bg-muted/50 rounded-lg text-center">
                  <p className={cn(TYPOGRAPHY.body.small, "text-muted-foreground")}>
                    로그인하면 기록할 수 있어요
                  </p>
                </div>
              ) : !babyId ? (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-center">
                  <p className={cn(TYPOGRAPHY.body.small, "text-amber-800")}>
                    대시보드에서 아기를 선택해주세요
                  </p>
                </div>
              ) : null}
            </BottomSheetBody>
          </>
        ) : (
          // 상세 입력 화면
          <>
            <BottomSheetHeader className="border-b pb-4">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="px-2"
                >
                  ←
                </Button>
                <BottomSheetTitle className="flex items-center gap-2">
                  <span>
                    {ACTIVITY_BUTTONS.find((b) => b.type === selectedType)?.icon}{" "}
                    {ACTIVITY_BUTTONS.find((b) => b.type === selectedType)?.label} 기록
                  </span>
                </BottomSheetTitle>
              </div>
            </BottomSheetHeader>

            <BottomSheetBody className="space-y-4">
              <form onSubmit={handleSubmit} className={SPACING.space.md}>
                {/* 시간 선택 */}
                <TimeSelector
                  hours={hours}
                  minutes={minutes}
                  onTimeChange={(h, m) => {
                    state.setHours(h);
                    state.setMinutes(m);
                  }}
                  disabled={isGuestMode}
                />

                {/* 활동별 상세 폼 */}
                {selectedType === "FEEDING" && (
                  <FeedingFormSection
                    feedingType={state.feedingType}
                    setFeedingType={state.setFeedingType}
                    feedingAmount={state.feedingAmount}
                    setFeedingAmount={state.setFeedingAmount}
                    feedingDuration={state.feedingDuration}
                    setFeedingDuration={state.setFeedingDuration}
                    breastSide={state.breastSide}
                    setBreastSide={state.setBreastSide}
                    babyFoodMenu={state.babyFoodMenu}
                    setBabyFoodMenu={state.setBabyFoodMenu}
                    latestWeight={state.latestWeight}
                    errors={errors}
                    disabled={isGuestMode}
                  />
                )}

                {selectedType === "SLEEP" && (
                  <SleepFormSection
                    endTimeHours={state.endTimeHours}
                    setEndTimeHours={state.setEndTimeHours}
                    endTimeMinutes={state.endTimeMinutes}
                    setEndTimeMinutes={state.setEndTimeMinutes}
                    ageInMonths={state.ageInMonths}
                    errors={errors}
                    disabled={isGuestMode}
                  />
                )}

                {selectedType === "DIAPER" && (
                  <DiaperFormSection
                    diaperType={state.diaperType}
                    setDiaperType={state.setDiaperType}
                    stoolCondition={state.stoolCondition}
                    setStoolCondition={state.setStoolCondition}
                    errors={errors}
                    disabled={isGuestMode}
                  />
                )}

                {selectedType === "MEDICINE" && (
                  <MedicineFormSection
                    medicineName={state.medicineName}
                    setMedicineName={state.setMedicineName}
                    medicineAmount={state.medicineAmount}
                    setMedicineAmount={state.setMedicineAmount}
                    medicineUnit={state.medicineUnit}
                    setMedicineUnit={state.setMedicineUnit}
                    syrupConc={state.syrupConc}
                    setSyrupConc={state.setSyrupConc}
                    latestWeight={state.latestWeight}
                    errors={errors}
                    disabled={isGuestMode}
                  />
                )}

                {selectedType === "TEMPERATURE" && (
                  <TemperatureFormSection
                    temperature={state.temperature}
                    setTemperature={state.setTemperature}
                    errors={errors}
                    disabled={isGuestMode}
                  />
                )}

                {selectedType === "BATH" && (
                  <BathFormSection
                    bathType={state.bathType}
                    setBathType={state.setBathType}
                    bathTemp={state.bathTemp}
                    setBathTemp={state.setBathTemp}
                    reaction={state.reaction}
                    setReaction={state.setReaction}
                    disabled={isGuestMode}
                  />
                )}

                {selectedType === "PLAY" && (
                  <PlayFormSection
                    playLocation={state.playLocation}
                    setPlayLocation={state.setPlayLocation}
                    playType={state.playType}
                    togglePlayType={state.togglePlayType}
                    reaction={state.reaction}
                    setReaction={state.setReaction}
                    disabled={isGuestMode}
                  />
                )}

                {/* 메모 입력 - AI 상담에 활용 */}
                <div className={cn("p-3 bg-muted rounded-lg", SPACING.space.sm)}>
                  <Label className={cn(TYPOGRAPHY.body.small, "font-medium mb-2 block")}>
                    💬 메모 (선택)
                  </Label>
                  <Textarea
                    name="note"
                    placeholder="💡 메모는 AI 상담에 반영되어 더 정확한 답변을 받을 수 있어요"
                    rows={2}
                    className={TYPOGRAPHY.body.small}
                    disabled={isGuestMode}
                  />
                </div>

                {/* SuggestionsPanel - 적정량 표시 */}
                {type && <ActivitySuggestions type={type} />}

                {/* 에러 메시지 */}
                {error && (
                  <div className={cn("p-3 bg-destructive/10 text-destructive rounded-md", TYPOGRAPHY.body.small)}>
                    {error}
                  </div>
                )}

                {/* 저장 버튼 */}
                <Button
                  type="submit"
                  disabled={loading || isGuestMode}
                  className={cn(
                    "w-full",
                    "bg-gradient-to-r from-pink-500 to-purple-600",
                    "hover:from-pink-600 hover:to-purple-700"
                  )}
                  size="lg"
                >
                  {loading ? "저장 중..." : "✅ 저장"}
                </Button>
              </form>
            </BottomSheetBody>
          </>
        )}
      </BottomSheetContent>
    </BottomSheet>
  );
}
