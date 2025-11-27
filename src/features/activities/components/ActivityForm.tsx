"use client";

import { useEffect } from "react";
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

import { TimeSelector } from "../../../components/common/TimeSelector";
import { ActivitySuggestions } from "@/features/activities/components/ui/ActivitySuggestions";
import { FeedingFormSection } from "@/features/activities/components/forms/FeedingFormSection";
import { SleepFormSection } from "@/features/activities/components/forms/SleepFormSection";
import { DiaperFormSection } from "@/features/activities/components/forms/DiaperFormSection";
import { MedicineFormSection } from "@/features/activities/components/forms/MedicineFormSection";
import { TemperatureFormSection } from "@/features/activities/components/forms/TemperatureFormSection";
import { BathFormSection } from "@/features/activities/components/forms/BathFormSection";
import { PlayFormSection } from "@/features/activities/components/forms/PlayFormSection";

import { useActivityFormState } from "@/features/activities/hooks/useActivityFormState";
import { useActivitySubmit } from "@/features/activities/hooks/useActivitySubmit";

export function ActivityForm({
  babyId,
  onActivityCreated,
}: {
  babyId: string;
  onActivityCreated?: (activity: Activity) => void;
}) {
  const { data: session, status } = useSession();
  const isGuestMode = status === "unauthenticated";

  const state = useActivityFormState();
  const {
    type,
    setType,
    loading,
    error,
    showDetail,
    setShowDetail,
    hours,
    minutes,
    setBabyInfo,
    setLatestWeight,
    setAgeInMonths,
    ageInMonths,
    latestWeight,
    errors,
    setNow,
    adjustTime,
  } = state;

  const { handleSubmit } = useActivitySubmit({
    babyId,
    userId: session?.user?.id,
    isGuestMode,
    state,
    onActivityCreated,
  });

  // Load baby info and latest weight
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

        const measurementResult = await getLatestMeasurement(babyId);
        if (measurementResult.success && measurementResult.data) {
          setLatestWeight(measurementResult.data.weight);
        }
      } catch (error) {
        console.error("아기 정보 로드 실패:", error);
      }
    };

    loadBabyData();
  }, [babyId, setBabyInfo, setAgeInMonths, setLatestWeight]);

  return (
    <div className={SPACING.space.lg}>
      {/* Quick Record Panel */}
      <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
        <CardContent className={cn(SPACING.card.medium, SPACING.space.lg)}>
          <TimeSelector
            hours={hours}
            minutes={minutes}
            onTimeChange={(h, m) => {
              state.setHours(h);
              state.setMinutes(m);
            }}
            disabled={isGuestMode}
          />

          <div className={cn("grid grid-cols-4", SPACING.gap.xs)}>
            {[
              { type: "FEEDING", icon: "🍼", label: "수유" },
              { type: "SLEEP", icon: "😴", label: "수면" },
              { type: "DIAPER", icon: "💩", label: "배변" },
              { type: "MEDICINE", icon: "💊", label: "투약" },
              { type: "TEMPERATURE", icon: "🌡️", label: "체온" },
              { type: "BATH", icon: "🛁", label: "목욕" },
              { type: "PLAY", icon: "🧸", label: "놀이" },
            ].map((item) => (
              <Button
                key={item.type}
                type="button"
                variant={type === item.type ? "default" : "outline"}
                className={cn(
                  "h-auto py-2 sm:py-3 flex flex-col gap-1",
                  type === item.type && "ring-2 ring-offset-2 ring-primary"
                )}
                onClick={() => {
                  setType(item.type as any);
                  setShowDetail(true);
                }}
                disabled={isGuestMode}
              >
                <span className="text-xl sm:text-2xl">{item.icon}</span>
                <span className={cn(TYPOGRAPHY.body.small, "font-medium")}>{item.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detail Input Panel */}
      {showDetail && (
        <Card className="border-primary/20 shadow-md animate-in slide-in-from-bottom-4 duration-300">
          <CardHeader className={cn(SPACING.card.medium, "border-b bg-primary/5")}>
            <CardTitle className={cn(TYPOGRAPHY.h3, "flex items-center gap-2")}>
              <span>
                {type === "FEEDING" && "🍼 수유 기록"}
                {type === "SLEEP" && "😴 수면 기록"}
                {type === "DIAPER" && "💩 배변 기록"}
                {type === "MEDICINE" && "💊 투약 기록"}
                {type === "TEMPERATURE" && "🌡️ 체온 기록"}
                {type === "BATH" && "🛁 목욕 기록"}
                {type === "PLAY" && "🧸 놀이 기록"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className={SPACING.card.medium}>
            <form onSubmit={handleSubmit} className={SPACING.space.lg}>
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
                  babyFoodMenu={state.babyFoodMenu}
                  setBabyFoodMenu={state.setBabyFoodMenu}
                  latestWeight={latestWeight}
                  errors={errors}
                  disabled={isGuestMode}
                />
              )}

              {type === "SLEEP" && (
                <SleepFormSection
                  endTimeHours={state.endTimeHours}
                  setEndTimeHours={state.setEndTimeHours}
                  endTimeMinutes={state.endTimeMinutes}
                  setEndTimeMinutes={state.setEndTimeMinutes}
                  ageInMonths={ageInMonths}
                  errors={errors}
                  disabled={isGuestMode}
                />
              )}

              {type === "DIAPER" && (
                <DiaperFormSection
                  diaperType={state.diaperType}
                  setDiaperType={state.setDiaperType}
                  stoolCondition={state.stoolCondition}
                  setStoolCondition={state.setStoolCondition}
                  errors={errors}
                  disabled={isGuestMode}
                />
              )}

              {type === "MEDICINE" && (
                <MedicineFormSection
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

              {type === "BATH" && (
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

              {type === "PLAY" && (
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
                <Label className={cn(TYPOGRAPHY.body.default, "font-medium mb-2 block")}>
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
    </div>
  );
}
