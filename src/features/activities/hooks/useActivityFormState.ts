import { useState, Dispatch, SetStateAction } from "react";
import { set } from "date-fns";

export type ActivityType =
  | "FEEDING"
  | "SLEEP"
  | "DIAPER"
  | "MEDICINE"
  | "TEMPERATURE"
  | "BATH"
  | "PLAY";

// --- UseActivityFormStateReturn 인터페이스 수정 ---
export interface UseActivityFormStateReturn {
  type: ActivityType;
  setType: Dispatch<SetStateAction<ActivityType>>;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  error: string;
  setError: Dispatch<SetStateAction<string>>;
  showDetail: boolean;
  setShowDetail: Dispatch<SetStateAction<boolean>>;
  startTime: Date;
  setStartTime: Dispatch<SetStateAction<Date>>;
  endTime: Date;
  setEndTime: Dispatch<SetStateAction<Date>>;
  recentValues: Record<string, any>;
  setRecentValues: Dispatch<SetStateAction<Record<string, any>>>;
  feedingType: string;
  setFeedingType: Dispatch<SetStateAction<string>>;
  feedingAmount: string;
  setFeedingAmount: Dispatch<SetStateAction<string>>;
  breastSide: string;
  setBreastSide: Dispatch<SetStateAction<string>>;
  sleepType: string;
  setSleepType: Dispatch<SetStateAction<string>>;
  diaperType: string;
  setDiaperType: Dispatch<SetStateAction<string>>;
  stoolColor: string;
  setStoolColor: Dispatch<SetStateAction<string>>;
  stoolCondition: string;
  setStoolCondition: Dispatch<SetStateAction<string>>;
  medicineName: string;
  setMedicineName: Dispatch<SetStateAction<string>>;
  medicineAmount: string;
  setMedicineAmount: Dispatch<SetStateAction<string>>;
  medicineUnit: string;
  setMedicineUnit: Dispatch<SetStateAction<string>>;
  syrupConc: string;
  setSyrupConc: Dispatch<SetStateAction<string>>;
  feedingDuration: string;
  setFeedingDuration: Dispatch<SetStateAction<string>>;
  sleepDurationHours: string;
  setSleepDurationHours: Dispatch<SetStateAction<string>>;
  sleepDurationMinutes: string;
  setSleepDurationMinutes: Dispatch<SetStateAction<string>>;

  temperature: string;
  setTemperature: Dispatch<SetStateAction<string>>;
  bathType: string;
  setBathType: Dispatch<SetStateAction<string>>;
  bathTemp: string;
  setBathTemp: Dispatch<SetStateAction<string>>;
  playLocation: string;
  setPlayLocation: Dispatch<SetStateAction<string>>;
  playType: string[];
  setPlayType: Dispatch<SetStateAction<string[]>>;
  reaction: string;
  setReaction: Dispatch<SetStateAction<string>>;
  errors: Record<string, string>;
  setErrors: Dispatch<SetStateAction<Record<string, string>>>;
  babyInfo: { birthDate: Date; gender: 'male' | 'female' } | null;
  setBabyInfo: Dispatch<SetStateAction<{ birthDate: Date; gender: 'male' | 'female' } | null>>;
  latestWeight: number | null;
  setLatestWeight: Dispatch<SetStateAction<number | null>>;
  ageInMonths: number;
  setAgeInMonths: Dispatch<SetStateAction<number>>;
  togglePlayType: (tag: string) => void;
  setSleepDuration: (durationMinutes: number) => void;
}

const getInitialTime = () => {
    const now = new Date();
    const roundedMinutes = Math.floor(now.getMinutes() / 5) * 5;
    return set(now, { minutes: roundedMinutes, seconds: 0, milliseconds: 0 });
}

export function useActivityFormState(): UseActivityFormStateReturn {
  const [type, setType] = useState<ActivityType>("FEEDING");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [startTime, setStartTime] = useState(getInitialTime());
  const [endTime, setEndTime] = useState(getInitialTime());
  const [recentValues, setRecentValues] = useState<Record<string, any>>({});

  const [feedingType, setFeedingType] = useState("breast");
  const [feedingAmount, setFeedingAmount] = useState("");
  const [breastSide, setBreastSide] = useState("");
  const [sleepType, setSleepType] = useState("nap");
  const [diaperType, setDiaperType] = useState("urine");
  const [stoolColor, setStoolColor] = useState("");
  const [stoolCondition, setStoolCondition] = useState("normal"); // 정상 대변이 기본값
  const [medicineName, setMedicineName] = useState("");
  const [medicineAmount, setMedicineAmount] = useState("");
  const [medicineUnit, setMedicineUnit] = useState("ml");
  const [syrupConc, setSyrupConc] = useState("");
  const [feedingDuration, setFeedingDuration] = useState("");
  const [sleepDurationHours, setSleepDurationHours] = useState("");
  const [sleepDurationMinutes, setSleepDurationMinutes] = useState("");
  const [temperature, setTemperature] = useState("36.5");
  const [bathType, setBathType] = useState("tub");
  const [bathTemp, setBathTemp] = useState("38");
  const [playLocation, setPlayLocation] = useState("indoor");
  const [playType, setPlayType] = useState<string[]>([]);
  const [reaction, setReaction] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [babyInfo, setBabyInfo] = useState<{ birthDate: Date; gender: 'male' | 'female' } | null>(null);
  const [latestWeight, setLatestWeight] = useState<number | null>(null);
  const [ageInMonths, setAgeInMonths] = useState<number>(0);

  const togglePlayType = (tag: string) => {
    setPlayType(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };
  
  const setSleepDuration = (durationMinutes: number) => {
    const now = getInitialTime();
    setEndTime(now);
    const newStartTime = new Date(now.getTime() - durationMinutes * 60000);
    setStartTime(newStartTime);
  }

  return {
    type, setType,
    loading, setLoading,
    error, setError,
    showDetail, setShowDetail,
    startTime, setStartTime,
    endTime, setEndTime,
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
    feedingDuration, setFeedingDuration,
    sleepDurationHours, setSleepDurationHours,
    sleepDurationMinutes, setSleepDurationMinutes,
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
    setSleepDuration,
  };
}