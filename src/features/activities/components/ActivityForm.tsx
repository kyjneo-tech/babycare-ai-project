"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Activity } from "@prisma/client";
import { differenceInMonths } from "date-fns";

import { getBabyById } from "@/features/babies/actions";
import { getLatestMeasurement } from "@/features/measurements/actions";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SPACING, TYPOGRAPHY } from "@/design-system";
import { cn } from "@/lib/utils";

import { TimeSelector } from "@/components/common/TimeSelector";
import { ActivitySuggestions } from "@/features/activities/components/ui/ActivitySuggestions";
import { FeedingFormSection } from "@/features/activities/components/forms/FeedingFormSection";
import { SleepFormSection } from "@/features/activities/components/forms/SleepFormSection";
import { DiaperFormSection } from "@/features/activities/components/forms/DiaperFormSection";
import { MedicineFormSection } from "@/features/activities/components/forms/MedicineFormSection";
import { TemperatureFormSection } from "@/features/activities/components/forms/TemperatureFormSection";

import { useActivityFormState } from "@/features/activities/hooks/useActivityFormState";
import { useActivitySubmit } from "@/features/activities/hooks/useActivitySubmit";
import { GuestModeDialog } from "@/components/common/GuestModeDialog";

const MAX_NOTE_LENGTH = 1000;

export function ActivityForm({
  babyId,
  onActivityCreated,
}: {
  babyId: string;
  onActivityCreated?: (activity: Activity) => void;
}) {
  const { data: session, status } = useSession();
  const isGuestMode = status === "unauthenticated";
  const [showGuestDialog, setShowGuestDialog] = useState(false);
  const [note, setNote] = useState("");

  const formRef = useRef<HTMLFormElement>(null);
  const state = useActivityFormState();
  const {
    type,
    setType,
    loading,
    error,
    showDetail,
    setShowDetail,
    startTime,
    setStartTime,
    setBabyInfo,
    setLatestWeight,
    setAgeInMonths,
    ageInMonths,
    latestWeight,
    errors,
  } = state;

  const { handleSubmit } = useActivitySubmit({
    babyId,
    userId: session?.user?.id,
    isGuestMode,
    state,
    onActivityCreated,
    onGuestModeAttempt: () => setShowGuestDialog(true),
  });

  // Load baby info and subscribe to latest weight from Store
  useEffect(() => {
    const loadBabyData = async () => {
      try {
        const babyResult = await getBabyById(babyId);
        if (babyResult.success && babyResult.data) {
          setBabyInfo({
            birthDate: babyResult.data.birthDate,
            gender: babyResult.data.gender as "male" | "female",
          });
          const months = differenceInMonths(
            new Date(),
            babyResult.data.birthDate
          );
          setAgeInMonths(months);
        }
      } catch (error) {
        console.error("아기 정보 로드 실패:", error);
      }
    };

    loadBabyData();
  }, [babyId, setBabyInfo, setAgeInMonths]);

  // ✨ Zustand Store 구독 - 체중 실시간 업데이트!
  useEffect(() => {
    const { useMeasurementStore } = require('@/stores');
    const latestMeasurement = useMeasurementStore.getState().getLatestMeasurement(babyId);
    
    if (latestMeasurement) {
      setLatestWeight(latestMeasurement.weight);
    } else {
      // Store에 없으면 서버에서 로드
      const loadMeasurement = async () => {
        const measurementResult = await getLatestMeasurement(babyId);
        if (measurementResult.success && measurementResult.data) {
          setLatestWeight(measurementResult.data.weight);
          // Store에도 추가
          useMeasurementStore.getState().addMeasurement(babyId, measurementResult.data);
        }
      };
      loadMeasurement();
    }

    // Store 구독
    const unsubscribe = useMeasurementStore.subscribe(() => {
      const latest = useMeasurementStore.getState().getLatestMeasurement(babyId);
      if (latest) {
        setLatestWeight(latest.weight);
      }
    });

    return unsubscribe;
  }, [babyId, setLatestWeight]);

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

    if (showDetail && type === "FEEDING") {
      loadLastFeeding();
    }
  }, [type, showDetail, babyId, state.setFeedingType, state.setFeedingAmount, state.setBreastSide, state.setFeedingDuration]);

  // 수면 타이머 상태 관리
  const [isSleeping, setIsSleeping] = useState(false);
  const [ongoingSleepId, setOngoingSleepId] = useState<string | null>(null);
  const [timerLoading, setTimerLoading] = useState(false);

  // 초기 로드 시 진행 중인 수면 확인
  useEffect(() => {
    const checkOngoingSleep = async () => {
      if (babyId) {
        try {
          const { getOngoingSleep } = await import("@/features/activities/actions");
          const result = await getOngoingSleep(babyId);
          if (result.success && result.data) {
            setIsSleeping(true);
            setOngoingSleepId(result.data.id);
            setStartTime(new Date(result.data.startTime));
          }
        } catch (error) {
          console.error("진행 중인 수면 확인 실패:", error);
        }
      }
    };
    checkOngoingSleep();
  }, [babyId, setStartTime]);

  const handleStartSleep = async () => {
    if (isGuestMode) {
      setShowGuestDialog(true);
      return;
    }
    if (!babyId || !session?.user?.id) return;
    setTimerLoading(true);
    try {
      const { createActivity } = await import("@/features/activities/actions");
      const now = new Date();
      const result = await createActivity({
        babyId,
        type: "SLEEP",
        startTime: now,
        sleepType: "nap", // 기본값
        // endTime 없음 (진행 중)
      }, session.user.id);

      if (result.success && result.data) {
        setIsSleeping(true);
        setOngoingSleepId(result.data.id);
        setStartTime(now);
        onActivityCreated?.(result.data);
      } else {
        alert(result.error || "수면 시작 기록 실패");
      }
    } catch (error) {
      console.error("수면 시작 오류:", error);
      alert("오류가 발생했습니다.");
    } finally {
      setTimerLoading(false);
    }
  };

  const handleEndSleep = async () => {
    if (isGuestMode) {
      setShowGuestDialog(true);
      return;
    }
    if (!ongoingSleepId) return;
    setTimerLoading(true);
    try {
      const { endSleepActivity } = await import("@/features/activities/actions");
      const now = new Date();
      const result = await endSleepActivity(ongoingSleepId, now);

      if (result.success && result.data) {
        setIsSleeping(false);
        setOngoingSleepId(null);
        state.setEndTime(now);
        onActivityCreated?.(result.data);
        // 폼 초기화 또는 알림 표시
      } else {
        alert(result.error || "수면 종료 기록 실패");
      }
    } catch (error) {
      console.error("수면 종료 오류:", error);
      alert("오류가 발생했습니다.");
    } finally {
      setTimerLoading(false);
    }
  };

  return (
    <div className={SPACING.space.lg}>
      {/* Quick Record Panel */}
      <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
        <CardContent className={cn(SPACING.card.medium, SPACING.space.lg)}>
          <TimeSelector
            value={startTime}
            onChange={setStartTime}
            label="언제 시작했나요?"
            disabled={isGuestMode}
          />

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
                {[
                  { type: "FEEDING", icon: "🍼", label: "수유" },
                  { type: "SLEEP", icon: "😴", label: "수면" },
                  { type: "DIAPER", icon: "💩", label: "배변" },
                  { type: "MEDICINE", icon: "💊", label: "투약" },
                  { type: "TEMPERATURE", icon: "🌡️", label: "체온" },
                ].map((item) => (
                  <Button
                    key={item.type}
                    type="button"
                    variant={type === item.type ? "default" : "outline"}
                    className={cn(
                      "flex-shrink-0 w-20 h-24 flex flex-col gap-2 snap-start",
                      type === item.type && "ring-2 ring-offset-2 ring-primary"
                    )}
                    onClick={() => {
                      setType(item.type as any);
                      setShowDetail(true);
                    }}
                  >
                    <span className="text-3xl">{item.icon}</span>
                    <span className="text-[10px] font-medium leading-tight">{item.label}</span>
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
        </CardContent>
      </Card>

      {/* Detail Input Panel */}
      {showDetail && (
        <Card className="border-primary/20 shadow-md animate-in slide-in-from-bottom-4 duration-300">
          <CardHeader className={cn(SPACING.card.medium, "border-b bg-primary/5")}>
            <div className="flex flex-row items-center justify-between w-full">
              <CardTitle className={cn(TYPOGRAPHY.h3, "flex items-center gap-2")}>
                <span>
                  {type === "FEEDING" && "🍼 수유 기록"}
                  {type === "SLEEP" && "😴 수면 기록"}
                  {type === "DIAPER" && "💩 배변 기록"}
                  {type === "MEDICINE" && "💊 투약 기록"}
                  {type === "TEMPERATURE" && "🌡️ 체온 기록"}
                </span>
              </CardTitle>
              <Button
                type="button"
                size="sm"
                onClick={() => formRef.current?.requestSubmit()}
                disabled={loading || isGuestMode}
              >
                {loading ? "저장 중..." : "✅ 저장"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className={SPACING.card.medium}>
            <form ref={formRef} onSubmit={handleSubmit} className={SPACING.space.lg}>
              {type === "FEEDING" && (
                <FeedingFormSection
                  feedingType={state.feedingType}
                  setFeedingType={state.setFeedingType}
                  feedingAmount={state.feedingAmount}
                  setFeedingAmount={state.setFeedingAmount}
                  feedingDuration={state.feedingDuration}
                  setFeedingDuration={state.setFeedingDuration}
                  breastSide={state.breastSide}
                  setBreastSide={state.setBreastSide}

                  babyId={babyId}
                  latestWeight={latestWeight}
                  ageInMonths={ageInMonths}
                  errors={errors}
                  disabled={isGuestMode}
                />
              )}

              {type === "SLEEP" && (
                <SleepFormSection
                  startTime={state.startTime}
                  setStartTime={state.setStartTime}
                  endTime={state.endTime}
                  setEndTime={state.setEndTime}
                  sleepDurationHours={state.sleepDurationHours}
                  setSleepDurationHours={state.setSleepDurationHours}
                  sleepDurationMinutes={state.sleepDurationMinutes}
                  setSleepDurationMinutes={state.setSleepDurationMinutes}
                  ageInMonths={ageInMonths}
                  errors={errors}
                  disabled={isGuestMode}
                  isSleeping={isSleeping}
                  onStartSleep={handleStartSleep}
                  onEndSleep={handleEndSleep}
                  timerLoading={timerLoading}
                />
              )}

              {type === "DIAPER" && (
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

              {type === "MEDICINE" && (
                <MedicineFormSection
                  babyId={babyId}
                  medicineName={state.medicineName}
                  setMedicineName={state.setMedicineName}
                  medicineAmount={state.medicineAmount}
                  setMedicineAmount={state.setMedicineAmount}

                  medicineUnit={state.medicineUnit}
                  setMedicineUnit={state.setMedicineUnit}
                  syrupConc={state.syrupConc}
                  setSyrupConc={state.setSyrupConc}
                  latestWeight={latestWeight}
                  errors={errors}
                  disabled={isGuestMode}
                />
              )}

              {type === "TEMPERATURE" && (
                <TemperatureFormSection
                  temperature={state.temperature}
                  setTemperature={state.setTemperature}
                  errors={errors}
                  disabled={isGuestMode}
                />
              )}



              {/* 메모 입력 - AI 상담에 활용 */}
              <div className={cn("p-3 bg-muted rounded-lg", SPACING.space.sm)}>
                <Label className={cn(TYPOGRAPHY.body.default, "font-medium mb-2 block")}>
                  💬 메모 (선택)
                </Label>
                <Textarea
                  name="note"
                  value={note}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    if (newValue.length <= MAX_NOTE_LENGTH) {
                      setNote(newValue);
                    }
                  }}
                  placeholder="💡 메모도 AI 상담에 반영되어 더 정확한 답변을 받을 수 있어요"
                  rows={2}
                  className={cn(
                    TYPOGRAPHY.body.small,
                    note.length > MAX_NOTE_LENGTH * 0.9 ? 'border-orange-500' : '',
                    note.length >= MAX_NOTE_LENGTH ? 'border-red-500' : ''
                  )}
                  disabled={isGuestMode}
                />
                {note.length > 0 && (
                  <div className={cn(
                    "text-xs mt-1",
                    note.length >= MAX_NOTE_LENGTH ? 'text-red-500' :
                    note.length > MAX_NOTE_LENGTH * 0.9 ? 'text-orange-500' :
                    'text-gray-500'
                  )}>
                    {note.length} / {MAX_NOTE_LENGTH}자
                    {note.length > MAX_NOTE_LENGTH * 0.9 && note.length < MAX_NOTE_LENGTH && (
                      <span className="ml-1">({MAX_NOTE_LENGTH - note.length}자 남음)</span>
                    )}
                    {note.length >= MAX_NOTE_LENGTH && (
                      <span className="ml-1 font-medium">최대 글자수 도달</span>
                    )}
                  </div>
                )}
              </div>

              {/* SuggestionsPanel */}
              <ActivitySuggestions type={type} />

              {error && (
                <div className={cn("p-3 bg-destructive/10 text-destructive rounded-md", TYPOGRAPHY.body.small)}>
                  {error}
                </div>
              )}

              <div className={cn("flex", SPACING.gap.sm)}>
                <Button
                  type="submit"
                  disabled={loading || isGuestMode}
                  className="flex-1"
                  size="lg"
                >
                  {loading ? "저장 중..." : "✅ 저장"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowDetail(false)}
                  size="lg"
                  disabled={isGuestMode}
                >
                  취소
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <GuestModeDialog open={showGuestDialog} onOpenChange={setShowGuestDialog} />
    </div>
  );
}
