import { createActivity } from "@/features/activities/actions";
import { ActivityType } from "./useActivityFormState";

interface UseActivitySubmitProps {
  babyId: string;
  userId?: string;
  isGuestMode: boolean;
  state: any; // In a real app, we would define a proper interface for the state object
  onActivityCreated?: (activity: any) => void;
}

export function useActivitySubmit({
  babyId,
  userId,
  isGuestMode,
  state,
  onActivityCreated,
}: UseActivitySubmitProps) {
  const {
    type,
    hours,
    minutes,
    feedingType,
    feedingAmount,
    babyFoodMenu,
    sleepType,
    endTimeHours,
    endTimeMinutes,
    diaperType,
    stoolCondition,
    medicineName,
    medicineAmount,
    medicineUnit,
    temperature,
    feedingDuration,
    breastSide,
    stoolColor,
    bathType,
    bathTemp,
    playLocation,
    playType,
    reaction,
    setLoading,
    setError,
    setErrors,
    setShowDetail,
    setNow,
    recentValues,
    setRecentValues,
  } = state;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isGuestMode) {
      alert("로그인 후 활동을 기록할 수 있습니다.");
      return;
    }

    setLoading(true);
    setError("");
    setErrors({});

    try {
      const formData = new FormData(e.currentTarget);
      const now = new Date();
      const startTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hours,
        minutes
      );

      // ===== 필수 입력 검증 =====
      const newErrors: Record<string, string> = {};

      // 수유 검증
      if (type === "FEEDING") {
        if (!feedingType) newErrors.feedingType = "수유 타입을 선택해주세요";
        if (feedingType === "formula" && !feedingAmount)
          newErrors.feedingAmount = "수유량을 입력해주세요";
        if (feedingType === "baby_food" && !babyFoodMenu)
          newErrors.babyFoodMenu = "이유식 메뉴를 입력해주세요";
      }

      // 수면 검증
      if (type === "SLEEP") {
        if (!sleepType) newErrors.sleepType = "수면 타입을 선택해주세요";
        if (!endTimeHours || !endTimeMinutes)
          newErrors.endTime = "수면 종료 시간을 입력해주세요";
      }

      // 배변 검증
      if (type === "DIAPER") {
        if (!diaperType) newErrors.diaperType = "배변 타입을 선택해주세요";
        if (diaperType === "stool" && !stoolCondition)
          newErrors.stoolCondition = "대변 상태를 선택해주세요";
      }

      // 투약 검증
      if (type === "MEDICINE") {
        if (!medicineName) newErrors.medicineName = "약 이름을 입력해주세요";
        if (!medicineAmount) newErrors.medicineAmount = "약 용량을 입력해주세요";
      }

      // 체온 검증
      if (type === "TEMPERATURE") {
        if (
          !temperature ||
          parseFloat(temperature) < 30 ||
          parseFloat(temperature) > 45
        ) {
          newErrors.temperature = "올바른 체온을 입력해주세요 (30~45°C)";
        }
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setLoading(false);
        return;
      }

      const input: any = {
        babyId,
        type,
        startTime,
        note: formData.get("note") as string,
      };

      if (type === "FEEDING") {
        input.feedingType = feedingType;
        if (feedingType === "breast") {
          if (feedingDuration) input.duration = Number(feedingDuration);
          input.breastSide = breastSide;
        } else {
          if (feedingAmount) input.feedingAmount = Number(feedingAmount);
          if (feedingType === "baby_food" && babyFoodMenu) {
            const currentNote = formData.get("note") as string;
            input.note = babyFoodMenu + (currentNote ? ` ${currentNote}` : "");
          }
        }
      } else if (type === "SLEEP") {
        input.sleepType = sleepType;
        if (endTimeHours && endTimeMinutes) {
          const endTime = new Date(startTime);
          endTime.setHours(Number(endTimeHours), Number(endTimeMinutes));
          input.endTime = endTime;
        }
      } else if (type === "DIAPER") {
        input.diaperType = diaperType;
        input.stoolColor = stoolColor;
        input.stoolCondition = stoolCondition;
      } else if (type === "MEDICINE") {
        input.medicineName = medicineName;
        input.medicineAmount = medicineAmount;
        input.medicineUnit = medicineUnit;
      } else if (type === "TEMPERATURE") {
        input.temperature = Number(temperature);
      } else if (type === "BATH") {
        input.bathType = bathType;
        input.bathTemp = Number(bathTemp);
        input.reaction = reaction;
      } else if (type === "PLAY") {
        input.playLocation = playLocation;
        input.playType = playType;
        input.reaction = reaction;
      }

      if (!userId) {
        setError("사용자 ID를 찾을 수 없습니다. 다시 로그인해 주세요.");
        setLoading(false);
        return;
      }

      const result = await createActivity(input, userId);

      if (result.success) {
        const updated = { ...recentValues };
        updated[type] = { feedingType: input.feedingType };
        setRecentValues(updated);
        setShowDetail(false);
        setNow();
        if (onActivityCreated && result.data) {
          onActivityCreated(result.data);
        }
      } else {
        setError(result.error || "기록에 실패했습니다.");
      }
    } catch (err) {
      setError("오류가 발생했습니다.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    handleSubmit,
  };
}
