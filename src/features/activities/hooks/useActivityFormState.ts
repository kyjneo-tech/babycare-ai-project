import { useState, Dispatch, SetStateAction } from "react"; // Dispatch, SetStateAction 임포트 추가

export type ActivityType =
  | "FEEDING"
  | "SLEEP"
  | "DIAPER"
  | "MEDICINE"
  | "TEMPERATURE"
  | "BATH"
  | "PLAY";

// --- UseActivityFormStateReturn 인터페이스 추가 시작 ---
interface UseActivityFormStateReturn {
  type: ActivityType;
  setType: Dispatch<SetStateAction<ActivityType>>;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  error: string;
  setError: Dispatch<SetStateAction<string>>;
  showDetail: boolean;
  setShowDetail: Dispatch<SetStateAction<boolean>>;
  hours: number;
  setHours: Dispatch<SetStateAction<number>>;
  minutes: number;
  setMinutes: Dispatch<SetStateAction<number>>;
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
  endTimeHours: string;
  setEndTimeHours: Dispatch<SetStateAction<string>>;
  endTimeMinutes: string;
  setEndTimeMinutes: Dispatch<SetStateAction<string>>;
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
  setNow: () => void;
  adjustTime: (hoursOffset: number, minutesOffset?: number) => void;
  setSleepDuration: (durationMinutes: number) => void;
}
// --- UseActivityFormStateReturn 인터페이스 추가 끝 ---

export function useActivityFormState(): UseActivityFormStateReturn { // 반환 타입 명시
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
  const [sleepDurationHours, setSleepDurationHours] = useState("");
  const [sleepDurationMinutes, setSleepDurationMinutes] = useState("");

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
    setNow,
    adjustTime,
    setSleepDuration: (durationMinutes: number) => {
      const now = new Date();
      const startTime = new Date(now.getTime() - durationMinutes * 60000);
      
      // Set end time to now
      setEndTimeHours(now.getHours().toString());
      setEndTimeMinutes(now.getMinutes().toString());
      
      // Set start time calculated from duration
      setHours(startTime.getHours());
      setMinutes(startTime.getMinutes());
    }
  };
}