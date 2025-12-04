"use client";

import { useState, useEffect } from "react";
import { Activity } from "@prisma/client";
import { updateActivity } from "@/features/activities/actions";
import { getBabyById } from "@/features/babies/actions";
import { getLatestMeasurement } from "@/features/measurements/actions";
import { differenceInMinutes, differenceInMonths } from "date-fns";
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
import { GuestModeDialog } from "@/components/common/GuestModeDialog";
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
  const { data: session, status } = useSession();
  const isGuestMode = status === "unauthenticated";
  const [showGuestDialog, setShowGuestDialog] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // --- Refactored State Management ---
  const [startTime, setStartTime] = useState(new Date(activity.startTime));
  const [endTime, setEndTime] = useState(activity.endTime ? new Date(activity.endTime) : new Date(activity.startTime));
  const [note, setNote] = useState(activity.memo || "");

  // Type-specific states
  const [feedingType, setFeedingType] = useState(activity.feedingType || "formula");
  const [feedingAmount, setFeedingAmount] = useState(activity.feedingAmount?.toString() || "");
  const [feedingDuration, setFeedingDuration] = useState(activity.duration?.toString() || "");
  const [breastSide, setBreastSide] = useState(activity.breastSide || "left");
  
  const calculateDuration = () => {
    if (!activity.startTime || !activity.endTime) return { hours: "", mins: "" };
    const diffMins = differenceInMinutes(new Date(activity.endTime), new Date(activity.startTime));
    return {
      hours: Math.floor(diffMins / 60).toString(),
      mins: (diffMins % 60).toString()
    };
  };
  const initialDuration = calculateDuration();
  const [sleepDurationHours, setSleepDurationHours] = useState(initialDuration.hours);
  const [sleepDurationMinutes, setSleepDurationMinutes] = useState(initialDuration.mins);

  const [diaperType, setDiaperType] = useState(activity.diaperType || "poo");
  const [stoolCondition, setStoolCondition] = useState(activity.stoolCondition || "");
  const [medicineName, setMedicineName] = useState(activity.medicineName || "");
  const [medicineAmount, setMedicineAmount] = useState(activity.medicineAmount?.toString() || "");
  const [medicineUnit, setMedicineUnit] = useState(activity.medicineUnit || "ml");
  const [syrupConc, setSyrupConc] = useState("");
  const [temperature, setTemperature] = useState(activity.temperature?.toString() || "");
  const [bathType, setBathType] = useState(activity.bathType || "full");
  const [bathTemp, setBathTemp] = useState(activity.bathTemp?.toString() || "");
  const [reaction, setReaction] = useState(activity.reaction || "");
  const [playLocation, setPlayLocation] = useState(activity.playLocation || "");
  const [playType, setPlayType] = useState<string[]>(activity.playType?.split(',') || []);

  const [latestWeight, setLatestWeight] = useState<number | null>(null);
  const [ageInMonths, setAgeInMonths] = useState(0);

  // Reset form when activity prop changes
  useEffect(() => {
    setStartTime(new Date(activity.startTime));
    setEndTime(activity.endTime ? new Date(activity.endTime) : new Date(activity.startTime));
    setNote(activity.memo || "");
    setFeedingType(activity.feedingType || "formula");
    setFeedingAmount(activity.feedingAmount?.toString() || "");
    setFeedingDuration(activity.duration?.toString() || "");
    setBreastSide(activity.breastSide || "left");
    const duration = calculateDuration();
    setSleepDurationHours(duration.hours);
    setSleepDurationMinutes(duration.mins);
    setDiaperType(activity.diaperType || "poo");
    setStoolCondition(activity.stoolCondition || "");
    setMedicineName(activity.medicineName || "");
    setMedicineAmount(activity.medicineAmount?.toString() || "");
    setMedicineUnit(activity.medicineUnit || "ml");
    setTemperature(activity.temperature?.toString() || "");
    setBathType(activity.bathType || "full");
    setBathTemp(activity.bathTemp?.toString() || "");
    setReaction(activity.reaction || "");
    setPlayLocation(activity.playLocation || "");
    setPlayType(activity.playType?.split(',') || []);
  }, [activity]);

  useEffect(() => {
    const loadBabyData = async () => {
      try {
        const babyResult = await getBabyById(activity.babyId);
        if (babyResult.success && babyResult.data) {
          setAgeInMonths(differenceInMonths(new Date(), babyResult.data.birthDate));
        }
        const measurementResult = await getLatestMeasurement(activity.babyId);
        if (measurementResult.success && measurementResult.data) {
          setLatestWeight(measurementResult.data.weight);
        }
      } catch (error) { console.error("아기 정보 로드 실패:", error); }
    };
    if (open) loadBabyData();
  }, [activity.babyId, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuestMode) {
      setShowGuestDialog(true);
      return;
    }
    if (!session?.user?.id) {
      alert("로그인이 필요합니다.");
      return;
    }
    setIsSaving(true);
    setErrors({});

    try {
      const updateData: any = {
        startTime: startTime.toISOString(),
        note: note.trim() || null,
      };

      if (activity.type === "FEEDING") {
        updateData.feedingType = feedingType;
        updateData.feedingAmount = feedingType !== "breast" && feedingAmount ? parseFloat(feedingAmount) : null;
        updateData.duration = feedingType === "breast" && feedingDuration ? parseInt(feedingDuration) : null;
        updateData.breastSide = feedingType === "breast" ? breastSide : null;
      } else if (activity.type === "SLEEP") {
        const durH = parseInt(sleepDurationHours) || 0;
        const durM = parseInt(sleepDurationMinutes) || 0;
        const durationMs = (durH * 60 + durM) * 60 * 1000;
        
        updateData.endTime = endTime.toISOString();
        updateData.startTime = new Date(endTime.getTime() - durationMs).toISOString();
        updateData.duration = durH * 60 + durM;
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
        updateData.reaction = reaction || null;
      } else if (activity.type === "PLAY") {
        updateData.playLocation = playLocation || null;
        updateData.playType = playType.length > 0 ? playType.join(",") : null;
        updateData.reaction = reaction || null;
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
    setPlayType(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const formDisabled = isSaving || isGuestMode;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className={cn(TYPOGRAPHY.h3, "flex items-center gap-2")}>
              {activityTypeLabels[activity.type]} 수정
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className={SPACING.space.md}>
            {activity.type !== "SLEEP" && (
              <div className="mb-4">
                <TimeSelector
                  value={startTime}
                  onChange={setStartTime}
                  label="시작 시간"
                  disabled={formDisabled}
                />
              </div>
            )}

            {activity.type === "FEEDING" && (
              <FeedingFormSection {...{ feedingType, setFeedingType, feedingAmount, setFeedingAmount, feedingDuration, setFeedingDuration, breastSide, setBreastSide, babyId: activity.babyId, latestWeight, ageInMonths, errors, disabled: formDisabled }} />
            )}
            {activity.type === "SLEEP" && (
              <SleepFormSection {...{ startTime, setStartTime, endTime, setEndTime, sleepDurationHours, setSleepDurationHours, sleepDurationMinutes, setSleepDurationMinutes, ageInMonths, errors, disabled: formDisabled }} />
            )}
            {activity.type === "DIAPER" && (
              <DiaperFormSection {...{ diaperType, setDiaperType, stoolCondition, setStoolCondition, errors, disabled: formDisabled, babyId: activity.babyId }} />
            )}
            {activity.type === "MEDICINE" && (
              <MedicineFormSection {...{ medicineName, setMedicineName, medicineAmount, setMedicineAmount, medicineUnit, setMedicineUnit, syrupConc, setSyrupConc, latestWeight, errors, disabled: formDisabled, babyId: activity.babyId }} />
            )}
            {activity.type === "TEMPERATURE" && (
              <TemperatureFormSection {...{ temperature, setTemperature, errors, disabled: formDisabled }} />
            )}
             {activity.type === "BATH" && (
              <BathFormSection bathType={bathType} setBathType={setBathType} bathTemp={bathTemp} setBathTemp={setBathTemp} reaction={reaction} setReaction={setReaction} disabled={formDisabled} />
            )}
            {activity.type === "PLAY" && (
              <PlayFormSection playLocation={playLocation} setPlayLocation={setPlayLocation} playType={playType} togglePlayType={togglePlayType} reaction={reaction} setReaction={setReaction} disabled={formDisabled} />
            )}

            <div className={cn("p-3 bg-muted rounded-lg", SPACING.space.sm)}>
              <Label className={cn(TYPOGRAPHY.body.default, "font-medium mb-2 block")}>
                💬 메모 (선택)
              </Label>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="💡 메모는 AI 상담에 반영되어 더 정확한 답변을 받을 수 있어요" rows={2} className={TYPOGRAPHY.body.small} disabled={formDisabled} />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 mt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>취소</Button>
              <Button type="submit" disabled={formDisabled}>{isSaving ? "저장 중..." : "저장"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <GuestModeDialog open={showGuestDialog} onOpenChange={setShowGuestDialog} />
    </>
  );
}
