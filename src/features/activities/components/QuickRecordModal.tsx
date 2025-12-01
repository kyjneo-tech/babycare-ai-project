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
import { GuestModeDialog } from "@/components/common/GuestModeDialog";

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
];

export function QuickRecordModal({
  isOpen,
  onClose,
  babyId,
  onActivityCreated,
}: QuickRecordModalProps) {
  const { data: session, status } = useSession();
  const isGuestMode = status === "unauthenticated";
  const [showGuestDialog, setShowGuestDialog] = React.useState(false);

  // 기존 훅 재사용
  const state = useActivityFormState();
  const {
    type,
    setType,
    loading,
    error,
    errors,
  } = state;

  const handleActivityCreated = (activity: Activity) => {
    onActivityCreated?.(activity);
    onClose();
  };

  const { handleSubmit } = useActivitySubmit({
    babyId: babyId || "",
    userId: session?.user?.id,
    isGuestMode,
    state,
    onActivityCreated: handleActivityCreated,
    onGuestModeAttempt: () => setShowGuestDialog(true),
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

  // Smart Defaults: Load last feeding data
  useEffect(() => {
    const loadLastFeeding = async () => {
      if (type !== "FEEDING" || !babyId) return;

      try {
        const { getLastActivity } = await import("@/features/activities/actions");
        const result = await getLastActivity(babyId, "FEEDING");
        
        if (result.success && result.data) {
          const lastActivity = result.data;
          
          if (lastActivity.feedingType) {
            state.setFeedingType(lastActivity.feedingType);
          }
          
          if (lastActivity.feedingAmount) {
            state.setFeedingAmount(lastActivity.feedingAmount.toString());
          }
          
          if (lastActivity.breastSide) {
            state.setBreastSide(lastActivity.breastSide);
          }
          
          if (lastActivity.duration) {
            state.setFeedingDuration(lastActivity.duration.toString());
          }
        }
      } catch (error) {
        console.error("Failed to load last feeding:", error);
      }
    };

    if (selectedType === "FEEDING") {
      loadLastFeeding();
    }
  }, [selectedType, babyId, state.setFeedingType, state.setFeedingAmount, state.setBreastSide, state.setFeedingDuration]);

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
      <BottomSheetContent className="max-h-[90vh]" showCloseButton={!selectedType}>
        {!selectedType ? (
          // 활동 선택 화면
          <>
            <BottomSheetHeader>
              <BottomSheetTitle>무엇을 기록할까요?</BottomSheetTitle>
            </BottomSheetHeader>
            <BottomSheetBody>
              {/* 가로 스크롤 컨테이너 */}
              <div className="relative -mx-4 px-4">
                <div 
                  ref={(el) => {
                    if (el) {
                      const checkScroll = () => {
                        const leftArrow = el.parentElement?.querySelector('.scroll-arrow-left');
                        const rightArrow = el.parentElement?.querySelector('.scroll-arrow-right');
                        
                        if (leftArrow) {
                          const isAtStart = el.scrollLeft <= 10;
                          (leftArrow as HTMLElement).style.display = isAtStart ? 'none' : 'flex';
                        }
                        
                        if (rightArrow) {
                          const isAtEnd = el.scrollLeft >= (el.scrollWidth - el.clientWidth - 10);
                          (rightArrow as HTMLElement).style.display = isAtEnd ? 'none' : 'flex';
                        }
                      };
                      el.addEventListener('scroll', checkScroll);
                      checkScroll(); // 초기 체크
                    }
                  }}
                  className="overflow-x-auto snap-x snap-mandatory pb-2"
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                  }}
                >
                  <div className="flex gap-3 px-1 min-w-max [&::-webkit-scrollbar]:hidden">
                    {ACTIVITY_BUTTONS.map((item) => (
                      <Button
                        key={item.type}
                        type="button"
                        variant="outline"
                        className={cn(
                          "flex-shrink-0 w-20 h-24 flex flex-col gap-2 snap-start",
                          "hover:bg-gradient-to-br hover:from-pink-50 hover:to-purple-50",
                          "hover:border-primary/50 transition-all"
                        )}
                        onClick={() => handleTypeSelect(item.type)}
                      >
                        <span className="text-3xl">{item.icon}</span>
                        <span className="text-[10px] font-medium leading-tight">
                          {item.label}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
                
                {/* 왼쪽 스크롤 화살표 버튼 */}
                <button
                  className="scroll-arrow-left absolute left-2 top-1/2 -translate-y-1/2 z-10
                             bg-white/95 backdrop-blur-sm rounded-full p-2 shadow-lg
                             hover:bg-white transition-all
                             hidden"
                  onClick={(e) => {
                    const container = e.currentTarget.parentElement?.querySelector('.overflow-x-auto');
                    if (container) {
                      container.scrollBy({ left: -200, behavior: 'smooth' });
                    }
                  }}
                  aria-label="이전"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                {/* 오른쪽 스크롤 화살표 버튼 */}
                <button
                  className="scroll-arrow-right absolute right-2 top-1/2 -translate-y-1/2 z-10
                             bg-white/95 backdrop-blur-sm rounded-full p-2 shadow-lg
                             hover:bg-white transition-all
                             animate-pulse hover:animate-none"
                  onClick={(e) => {
                    const container = e.currentTarget.parentElement?.querySelector('.overflow-x-auto');
                    if (container) {
                      container.scrollBy({ left: 200, behavior: 'smooth' });
                    }
                  }}
                  aria-label="다음"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
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
            <BottomSheetHeader className="flex flex-row items-center justify-between border-b pb-4">
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
              <Button
                type="submit"
                size="sm"
                onClick={(e) => {
                  const form = document.querySelector('form');
                  if (form) form.requestSubmit();
                }}
                disabled={loading || isGuestMode}
              >
                {loading ? "저장 중..." : "✅ 저장"}
              </Button>
            </BottomSheetHeader>

            <BottomSheetBody className="space-y-4">
              <form onSubmit={handleSubmit} className={SPACING.space.md}>
                {/* 시간 선택 */}
                <TimeSelector
                  value={state.startTime}
                  onChange={state.setStartTime}
                  label="시작 시간"
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

                    latestWeight={state.latestWeight}
                    ageInMonths={state.ageInMonths}
                    errors={errors}
                    disabled={isGuestMode}
                  />
                )}

                {selectedType === "SLEEP" && (
                  <SleepFormSection
                    startTime={state.startTime}
                    setStartTime={state.setStartTime}
                    endTime={state.endTime}
                    setEndTime={state.setEndTime}
                    sleepDurationHours={state.sleepDurationHours}
                    setSleepDurationHours={state.setSleepDurationHours}
                    sleepDurationMinutes={state.sleepDurationMinutes}
                    setSleepDurationMinutes={state.setSleepDurationMinutes}
                    ageInMonths={state.ageInMonths}
                    errors={errors}
                    disabled={loading}
                  />
                )}

                {selectedType === "DIAPER" && (
                  <DiaperFormSection
                    diaperType={state.diaperType}
                    setDiaperType={state.setDiaperType}
                    stoolCondition={state.stoolCondition}
                    setStoolCondition={state.setStoolCondition}
                    errors={errors}
                    babyId={babyId}
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

      <GuestModeDialog open={showGuestDialog} onOpenChange={setShowGuestDialog} />
    </BottomSheet>
  );
}
