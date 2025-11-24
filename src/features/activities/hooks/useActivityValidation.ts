// src/features/activities/hooks/useActivityValidation.ts
import { useState, useCallback } from "react";
import type { ActivityType, ActivityFormErrors } from "@/shared/types/activity.types";

interface ValidationData {
  feedingType?: string;
  feedingAmount?: string | number;
  babyFoodMenu?: string;
  sleepType?: string;
  endTimeHours?: string;
  endTimeMinutes?: string;
  diaperType?: string;
  stoolCondition?: string;
  medicineName?: string;
  medicineAmount?: string | number;
  temperature?: string | number;
  [key: string]: any;
}

export function useActivityValidation() {
  const [errors, setErrors] = useState<ActivityFormErrors>({});

  const validateFeeding = useCallback((data: ValidationData): ActivityFormErrors => {
    const newErrors: ActivityFormErrors = {};

    if (!data.feedingType) {
      newErrors.feedingType = "수유 타입을 선택해주세요";
    }

    if (data.feedingType === "formula" && !data.feedingAmount) {
      newErrors.feedingAmount = "수유량을 입력해주세요";
    }

    if (data.feedingType === "baby_food" && !data.babyFoodMenu) {
      newErrors.babyFoodMenu = "이유식 메뉴를 입력해주세요";
    }

    return newErrors;
  }, []);

  const validateSleep = useCallback((data: ValidationData): ActivityFormErrors => {
    const newErrors: ActivityFormErrors = {};

    if (!data.sleepType) {
      newErrors.sleepType = "수면 타입을 선택해주세요";
    }

    if (!data.endTimeHours || !data.endTimeMinutes) {
      newErrors.endTime = "수면 종료 시간을 입력해주세요";
    }

    return newErrors;
  }, []);

  const validateDiaper = useCallback((data: ValidationData): ActivityFormErrors => {
    const newErrors: ActivityFormErrors = {};

    if (!data.diaperType) {
      newErrors.diaperType = "배변 타입을 선택해주세요";
    }

    if (data.diaperType === "stool" && !data.stoolCondition) {
      newErrors.stoolCondition = "대변 상태를 선택해주세요";
    }

    return newErrors;
  }, []);

  const validateMedicine = useCallback((data: ValidationData): ActivityFormErrors => {
    const newErrors: ActivityFormErrors = {};

    if (!data.medicineName) {
      newErrors.medicineName = "약 이름을 입력해주세요";
    }

    if (!data.medicineAmount) {
      newErrors.medicineAmount = "약 용량을 입력해주세요";
    }

    return newErrors;
  }, []);

  const validateTemperature = useCallback((data: ValidationData): ActivityFormErrors => {
    const newErrors: ActivityFormErrors = {};

    const temp = typeof data.temperature === 'string' ? parseFloat(data.temperature) : data.temperature;
    
    if (!data.temperature || (typeof temp === 'number' && (temp < 30 || temp > 45))) {
      newErrors.temperature = "올바른 체온을 입력해주세요 (30~45°C)";
    }

    return newErrors;
  }, []);

  const validate = useCallback(
    (type: ActivityType, data: ValidationData): boolean => {
      let newErrors: ActivityFormErrors = {};

      switch (type) {
        case "FEEDING":
          newErrors = validateFeeding(data);
          break;
        case "SLEEP":
          newErrors = validateSleep(data);
          break;
        case "DIAPER":
          newErrors = validateDiaper(data);
          break;
        case "MEDICINE":
          newErrors = validateMedicine(data);
          break;
        case "TEMPERATURE":
          newErrors = validateTemperature(data);
          break;
        default:
          break;
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [
      validateFeeding,
      validateSleep,
      validateDiaper,
      validateMedicine,
      validateTemperature,
    ]
  );

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validate,
    clearErrors,
  };
}
