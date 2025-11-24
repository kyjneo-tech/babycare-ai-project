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

import { TimeSelector } from "@/features/activities/components/ui/TimeSelector";
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
    <div className="space-y-6">
      {/* Quick Record Panel */}
      <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
        <CardContent className="p-4 space-y-6">
          <TimeSelector
            hours={hours}
            minutes={minutes}
            onTimeChange={(h, m) => {
              state.setHours(h);
              state.setMinutes(m);
            }}
            disabled={isGuestMode}
          />

          <div className="grid grid-cols-4 gap-2">
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
                className={`h-auto py-3 flex flex-col gap-1 ${
                  type === item.type ? "ring-2 ring-offset-2 ring-blue-500" : ""
                }`}
                onClick={() => {
                  setType(item.type as any);
                  setShowDetail(true);
                }}
                disabled={isGuestMode}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detail Input Panel */}
      {showDetail && (
        <Card className="border-blue-100 shadow-md animate-in slide-in-from-bottom-4 duration-300">
          <CardHeader className="pb-4 border-b bg-blue-50/50">
            <CardTitle className="text-lg flex items-center gap-2">
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
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="space-y-6">
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

              {/* SuggestionsPanel */}
              <ActivitySuggestions type={type} />

              <div className="p-3 bg-gray-50 rounded-lg">
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  💬 메모 (선택)
                </Label>
                <Textarea
                  name="note"
                  placeholder="특별한 사항..."
                  rows={2}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  disabled={isGuestMode}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={loading || isGuestMode}
                  className="flex-1 py-6 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? "저장 중..." : "✅ 저장"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowDetail(false)}
                  className="px-6 py-6 text-lg font-semibold"
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
