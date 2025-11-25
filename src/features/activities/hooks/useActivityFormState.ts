import { useState } from "react";

export type ActivityType =
  | "FEEDING"
  | "SLEEP"
  | "DIAPER"
  | "MEDICINE"
  | "TEMPERATURE"
  | "BATH"
  | "PLAY";

export function useActivityFormState() {
  // Original states
  const [type, setType] = useState<ActivityType>("FEEDING");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [hours, setHours] = useState(9);
  const [minutes, setMinutes] = useState(30);
  const [recentValues, setRecentValues] = useState<Record<string, any>>({});

  // New states for visual feedback
  const [feedingType, setFeedingType] = useState("breast");
  const [feedingAmount, setFeedingAmount] = useState("");
  const [breastSide, setBreastSide] = useState("");
  const [sleepType, setSleepType] = useState("nap");
  const [diaperType, setDiaperType] = useState("urine");
  const [stoolColor, setStoolColor] = useState("");
  const [stoolCondition, setStoolCondition] = useState("");
  const [medicineName, setMedicineName] = useState("");
  const [medicineAmount, setMedicineAmount] = useState("");
  const [medicineUnit, setMedicineUnit] = useState("ml");
  const [syrupConc, setSyrupConc] = useState("");
  const [endTimeHours, setEndTimeHours] = useState("");
  const [endTimeMinutes, setEndTimeMinutes] = useState("");
  const [feedingDuration, setFeedingDuration] = useState("");
  const [babyFoodMenu, setBabyFoodMenu] = useState("");
  const [temperature, setTemperature] = useState("36.5");

  // States for Bath and Play
  const [bathType, setBathType] = useState("tub");
  const [bathTemp, setBathTemp] = useState("38");
  const [playLocation, setPlayLocation] = useState("indoor");
  const [playType, setPlayType] = useState<string[]>([]);
  const [reaction, setReaction] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // States for growth guidelines
  const [babyInfo, setBabyInfo] = useState<{ birthDate: Date; gender: 'male' | 'female' } | null>(null);
  const [latestWeight, setLatestWeight] = useState<number | null>(null);
  const [ageInMonths, setAgeInMonths] = useState<number>(0);

  const togglePlayType = (tag: string) => {
    setPlayType(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const setNow = () => {
    const now = new Date();
    setHours(now.getHours());
    setMinutes(Math.floor(now.getMinutes() / 5) * 5);
  };

  const adjustTime = (hoursOffset: number, minutesOffset: number = 0) => {
    let newHours = hours + hoursOffset;
    let newMinutes = minutes + minutesOffset;

    // Handle minute overflow/underflow
    while (newMinutes >= 60) {
      newMinutes -= 60;
      newHours += 1;
    }
    while (newMinutes < 0) {
      newMinutes += 60;
      newHours -= 1;
    }

    // Handle hour overflow/underflow
    while (newHours >= 24) {
      newHours -= 24;
    }
    while (newHours < 0) {
      newHours += 24;
    }

    setHours(newHours);
    setMinutes(newMinutes);
  };

  return {
    type, setType,
    loading, setLoading,
    error, setError,
    showDetail, setShowDetail,
    hours, setHours,
    minutes, setMinutes,
    recentValues, setRecentValues,
    feedingType, setFeedingType,
    feedingAmount, setFeedingAmount,
    breastSide, setBreastSide,
    sleepType, setSleepType,
    diaperType, setDiaperType,
    stoolColor, setStoolColor,
    stoolCondition, setStoolCondition,
    medicineName, setMedicineName,
    medicineAmount, setMedicineAmount,
    medicineUnit, setMedicineUnit,
    syrupConc, setSyrupConc,
    endTimeHours, setEndTimeHours,
    endTimeMinutes, setEndTimeMinutes,
    feedingDuration, setFeedingDuration,
    babyFoodMenu, setBabyFoodMenu,
    temperature, setTemperature,
    bathType, setBathType,
    bathTemp, setBathTemp,
    playLocation, setPlayLocation,
    playType, setPlayType,
    reaction, setReaction,
    errors, setErrors,
    babyInfo, setBabyInfo,
    latestWeight, setLatestWeight,
    ageInMonths, setAgeInMonths,
    togglePlayType,
    setNow,
    adjustTime
  };
}
