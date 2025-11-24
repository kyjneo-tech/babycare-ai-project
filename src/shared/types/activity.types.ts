// src/shared/types/activity.types.ts
export type ActivityType =
  | "FEEDING"
  | "SLEEP"
  | "DIAPER"
  | "MEDICINE"
  | "TEMPERATURE"
  | "BATH"
  | "PLAY";

export interface BaseActivityFormData {
  babyId: string;
  type: ActivityType;
  startTime: Date;
  note?: string;
}

export interface FeedingFormData extends BaseActivityFormData {
  type: "FEEDING";
  feedingType: "breast" | "formula" | "pumped" | "baby_food";
  amount?: number;
  duration?: number;
  breastSide?: "left" | "right";
  babyFoodMenu?: string;
}

export interface SleepFormData extends BaseActivityFormData {
  type: "SLEEP";
  sleepType: "nap" | "night";
  endTime?: Date;
}

export interface DiaperFormData extends BaseActivityFormData {
  type: "DIAPER";
  diaperType: "urine" | "stool" | "both";
  stoolColor?: string;
  stoolCondition?: string;
}

export interface MedicineFormData extends BaseActivityFormData {
  type: "MEDICINE";
  medicineName: string;
  medicineAmount: string;
  medicineUnit: string;
}

export interface TemperatureFormData extends BaseActivityFormData {
  type: "TEMPERATURE";
  temperature: number;
}

export interface BathFormData extends BaseActivityFormData {
  type: "BATH";
  bathType: string;
  bathTemp: number;
  reaction?: string;
}

export interface PlayFormData extends BaseActivityFormData {
  type: "PLAY";
  playLocation: string;
  playType: string[];
  reaction?: string;
}

export type ActivityFormData =
  | FeedingFormData
  | SleepFormData
  | DiaperFormData
  | MedicineFormData
  | TemperatureFormData
  | BathFormData
  | PlayFormData;

export interface ActivityFormErrors {
  [key: string]: string;
}

export interface ActivityFormProps {
  babyId: string;
  onActivityCreated?: (activity: any) => void;
}
