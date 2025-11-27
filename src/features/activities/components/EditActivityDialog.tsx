"use client";

import { useState, useEffect } from "react";
import { Activity } from "@prisma/client";
import { updateActivity } from "@/features/activities/actions";
import { getBabyById } from "@/features/babies/actions";
import { getLatestMeasurement } from "@/features/measurements/actions";
import { differenceInMonths } from "date-fns";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { activityTypeLabels } from "@/shared/utils/activityLabels";
import { TimeSelector } from "@/components/common/TimeSelector";
import { FeedingFormSection } from "@/features/activities/components/forms/FeedingFormSection";
import { SleepFormSection } from "@/features/activities/components/forms/SleepFormSection";
import { DiaperFormSection } from "@/features/activities/components/forms/DiaperFormSection";
import { MedicineFormSection } from "@/features/activities/components/forms/MedicineFormSection";
import { TemperatureFormSection } from "@/features/activities/components/forms/TemperatureFormSection";
import { BathFormSection } from "@/features/activities/components/forms/BathFormSection";
import { PlayFormSection } from "@/features/activities/components/forms/PlayFormSection";
import { SPACING, TYPOGRAPHY } from "@/design-system";
import { cn } from "@/lib/utils";

interface EditActivityDialogProps {
  activity: Activity;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updatedActivity: Activity) => void;
}

export function EditActivityDialog({
  activity,
  open,
  onOpenChange,
  onUpdate,
}: EditActivityDialogProps) {
  const { data: session } = useSession();
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 시간 관련 상태
  const startDate = new Date(activity.startTime);
  const [hours, setHours] = useState(startDate.getHours());
  const [minutes, setMinutes] = useState(startDate.getMinutes());

  // 공통 상태
  const [note, setNote] = useState(activity.note || "");

  // 수유 관련 상태
  const [feedingType, setFeedingType] = useState(activity.feedingType || "formula");
  const [feedingAmount, setFeedingAmount] = useState(activity.feedingAmount?.toString() || "");
  const [feedingDuration, setFeedingDuration] = useState(activity.duration?.toString() || "");
  const [breastSide, setBreastSide] = useState(activity.breastSide || "left");
  const [babyFoodMenu, setBabyFoodMenu] = useState(activity.note || "");

  // 수면 관련 상태
  const endDate = activity.endTime ? new Date(activity.endTime) : null;
  const [endTimeHours, setEndTimeHours] = useState((endDate?.getHours() || hours).toString());
  const [endTimeMinutes, setEndTimeMinutes] = useState((endDate?.getMinutes() || minutes).toString());

  // 배변 관련 상태
  const [diaperType, setDiaperType] = useState(activity.diaperType || "poo");
  const [stoolCondition, setStoolCondition] = useState(activity.stoolCondition || "");

  // 투약 관련 상태
  const [medicineName, setMedicineName] = useState(activity.medicineName || "");
  const [medicineAmount, setMedicineAmount] = useState(activity.medicineAmount?.toString() || "");
  const [medicineUnit, setMedicineUnit] = useState(activity.medicineUnit || "ml");
  const [syrupConc, setSyrupConc] = useState("");

  // 체온 관련 상태
  const [temperature, setTemperature] = useState(activity.temperature?.toString() || "");

  // 목욕 관련 상태
  const [bathType, setBathType] = useState(activity.bathType || "full");
  const [bathTemp, setBathTemp] = useState(activity.bathTemp?.toString() || "");
  const [bathReaction, setBathReaction] = useState(activity.reaction || "");

  // 놀이 관련 상태
  const [playLocation, setPlayLocation] = useState(activity.playLocation || "");
  const [playType, setPlayType] = useState<string[]>([]);
  const [playReaction, setPlayReaction] = useState(activity.reaction || "");

  // 아기 정보
  const [latestWeight, setLatestWeight] = useState<number | null>(null);
  const [ageInMonths, setAgeInMonths] = useState(0);

  // 아기 정보 로드
  useEffect(() => {
    const loadBabyData = async () => {
      try {
        const babyResult = await getBabyById(activity.babyId);
        if (babyResult.success && babyResult.data) {
          const months = differenceInMonths(new Date(), babyResult.data.birthDate);
          setAgeInMonths(months);
        }

        const measurementResult = await getLatestMeasurement(activity.babyId);
        if (measurementResult.success && measurementResult.data) {
          setLatestWeight(measurementResult.data.weight);
        }
      } catch (error) {
        console.error("아기 정보 로드 실패:", error);
      }
    };

    if (open) {
      loadBabyData();
    }
  }, [activity.babyId, open]);

  // 활동 변경 시 폼 리셋
  useEffect(() => {
    const startDate = new Date(activity.startTime);
    setHours(startDate.getHours());
    setMinutes(startDate.getMinutes());
    setNote(activity.note || "");

    // 타입별 필드 초기화
    if (activity.type === "FEEDING") {
      setFeedingType(activity.feedingType || "formula");
      setFeedingAmount(activity.feedingAmount?.toString() || "");
      setFeedingDuration(activity.duration?.toString() || "");
      setBreastSide(activity.breastSide || "left");
    } else if (activity.type === "SLEEP") {
      const endDate = activity.endTime ? new Date(activity.endTime) : null;
      setEndTimeHours((endDate?.getHours() || startDate.getHours()).toString());
      setEndTimeMinutes((endDate?.getMinutes() || startDate.getMinutes()).toString());
    } else if (activity.type === "DIAPER") {
      setDiaperType(activity.diaperType || "poo");
      setStoolCondition(activity.stoolCondition || "");
    } else if (activity.type === "MEDICINE") {
      setMedicineName(activity.medicineName || "");
      setMedicineAmount(activity.medicineAmount?.toString() || "");
      setMedicineUnit(activity.medicineUnit || "ml");
    } else if (activity.type === "TEMPERATURE") {
      setTemperature(activity.temperature?.toString() || "");
    } else if (activity.type === "BATH") {
      setBathType(activity.bathType || "full");
      setBathTemp(activity.bathTemp?.toString() || "");
      setBathReaction(activity.reaction || "");
    } else if (activity.type === "PLAY") {
      setPlayLocation(activity.playLocation || "");
      setPlayReaction(activity.reaction || "");
    }
  }, [activity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
        alert("로그인이 필요합니다.");
        return;
    }

    setIsSaving(true);
    setErrors({});

    try {
      // 시간 업데이트
      const newStartTime = new Date(activity.startTime);
      newStartTime.setHours(hours, minutes, 0, 0);

      const updateData: any = {
        startTime: newStartTime.toISOString(),
        note: note.trim() || null,
      };

      // 타입별 필드 추가
      if (activity.type === "FEEDING") {
        updateData.feedingType = feedingType;
        updateData.feedingAmount = feedingType !== "breast" && feedingAmount ? parseFloat(feedingAmount) : null;
        updateData.duration = feedingType === "breast" && feedingDuration ? parseInt(feedingDuration) : null;
        updateData.breastSide = feedingType === "breast" ? breastSide : null;
      } else if (activity.type === "SLEEP") {
        const newEndTime = new Date(activity.startTime);
        newEndTime.setHours(parseInt(endTimeHours), parseInt(endTimeMinutes), 0, 0);
        if (newEndTime < newStartTime) {
          newEndTime.setDate(newEndTime.getDate() + 1);
        }
        updateData.endTime = newEndTime.toISOString();
        const durationMinutes = Math.round((newEndTime.getTime() - newStartTime.getTime()) / (1000 * 60));
        updateData.duration = durationMinutes;
      } else if (activity.type === "DIAPER") {
        updateData.diaperType = diaperType;
        updateData.stoolCondition = stoolCondition || null;
      } else if (activity.type === "MEDICINE") {
        updateData.medicineName = medicineName.trim();
        updateData.medicineAmount = medicineAmount ? parseFloat(medicineAmount) : null;
        updateData.medicineUnit = medicineUnit;
      } else if (activity.type === "TEMPERATURE") {
        updateData.temperature = temperature ? parseFloat(temperature) : null;
      } else if (activity.type === "BATH") {
        updateData.bathType = bathType;
        updateData.bathTemp = bathTemp ? parseFloat(bathTemp) : null;
        updateData.reaction = bathReaction || null;
      } else if (activity.type === "PLAY") {
        updateData.playLocation = playLocation || null;
        updateData.playType = playType.length > 0 ? playType.join(",") : null;
        updateData.reaction = playReaction || null;
      }

      const result = await updateActivity(activity.id, session.user.id, updateData);

      if (result.success && result.data) {
        onUpdate(result.data);
        onOpenChange(false);
      } else {
        alert(result.error || "수정에 실패했습니다.");
      }
    } catch (error) {
      alert("수정 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const togglePlayType = (type: string) => {
    setPlayType(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className={cn(TYPOGRAPHY.h3, "flex items-center gap-2")}>
            <span>
              {activity.type === "FEEDING" && "🍼"}
              {activity.type === "SLEEP" && "😴"}
              {activity.type === "DIAPER" && "💩"}
              {activity.type === "MEDICINE" && "💊"}
              {activity.type === "TEMPERATURE" && "🌡️"}
              {activity.type === "BATH" && "🛁"}
              {activity.type === "PLAY" && "🧸"}
            </span>
            {activityTypeLabels[activity.type]} 수정
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className={SPACING.space.md}>
          {/* 시간 선택 */}
          <div className="mb-4">
            <Label className="mb-2 block">시작 시간</Label>
            <TimeSelector
              hours={hours}
              minutes={minutes}
              onTimeChange={(h, m) => {
                setHours(h);
                setMinutes(m);
              }}
              disabled={false}
            />
          </div>

          {/* 타입별 폼 섹션 */}
          {activity.type === "FEEDING" && (
            <FeedingFormSection
              feedingType={feedingType}
              setFeedingType={setFeedingType}
              feedingAmount={feedingAmount}
              setFeedingAmount={setFeedingAmount}
              feedingDuration={feedingDuration}
              setFeedingDuration={setFeedingDuration}
              breastSide={breastSide}
              setBreastSide={setBreastSide}
              babyFoodMenu={babyFoodMenu}
              setBabyFoodMenu={setBabyFoodMenu}
              latestWeight={latestWeight}
              errors={errors}
              disabled={false}
            />
          )}

          {activity.type === "SLEEP" && (
            <SleepFormSection
              endTimeHours={endTimeHours}
              setEndTimeHours={setEndTimeHours}
              endTimeMinutes={endTimeMinutes}
              setEndTimeMinutes={setEndTimeMinutes}
              ageInMonths={ageInMonths}
              errors={errors}
              disabled={false}
            />
          )}

          {activity.type === "DIAPER" && (
            <DiaperFormSection
              diaperType={diaperType}
              setDiaperType={setDiaperType}
              stoolCondition={stoolCondition}
              setStoolCondition={setStoolCondition}
              errors={errors}
              disabled={false}
            />
          )}

          {activity.type === "MEDICINE" && (
            <MedicineFormSection
              medicineName={medicineName}
              setMedicineName={setMedicineName}
              medicineAmount={medicineAmount}
              setMedicineAmount={setMedicineAmount}
              medicineUnit={medicineUnit}
              setMedicineUnit={setMedicineUnit}
              syrupConc={syrupConc}
              setSyrupConc={setSyrupConc}
              latestWeight={latestWeight}
              errors={errors}
              disabled={false}
            />
          )}

          {activity.type === "TEMPERATURE" && (
            <TemperatureFormSection
              temperature={temperature}
              setTemperature={setTemperature}
              errors={errors}
              disabled={false}
            />
          )}

          {activity.type === "BATH" && (
            <BathFormSection
              bathType={bathType}
              setBathType={setBathType}
              bathTemp={bathTemp}
              setBathTemp={setBathTemp}
              reaction={bathReaction}
              setReaction={setBathReaction}
              disabled={false}
            />
          )}

          {activity.type === "PLAY" && (
            <PlayFormSection
              playLocation={playLocation}
              setPlayLocation={setPlayLocation}
              playType={playType}
              togglePlayType={togglePlayType}
              reaction={playReaction}
              setReaction={setPlayReaction}
              disabled={false}
            />
          )}

          {/* 메모 - AI 상담에 활용 */}
          <div className={cn("p-3 bg-muted rounded-lg", SPACING.space.sm)}>
            <Label className={cn(TYPOGRAPHY.body.default, "font-medium mb-2 block")}>
              💬 메모 (선택)
            </Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="💡 메모는 AI 상담에 반영되어 더 정확한 답변을 받을 수 있어요"
              rows={2}
              className={TYPOGRAPHY.body.small}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              취소
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
