import type { ActivityType } from "@prisma/client";

export const activityTypeLabels: Record<ActivityType, string> = {
  FEEDING: "수유",
  SLEEP: "수면",
  DIAPER: "기저귀",
  MEDICINE: "약",
  TEMPERATURE: "체온",
};

export const feedingTypeLabels = {
  breast: "모유",
  formula: "분유",
  baby_food: "이유식",
};

export const diaperTypeLabels = {
  urine: "소변",
  stool: "대변",
  both: "소변+대변",
};

export const sleepTypeLabels = {
  night: "밤잠",
  nap: "낮잠",
};

export const breastSideLabels = {
  left: "왼쪽",
  right: "오른쪽",
};

export const stoolConditionLabels = {
  watery: "묽은변",
  loose: "묽은변",
  normal: "정상변",
  hard: "된변",
};

// 활동 설명 생성 함수
export function getActivityDescription(activity: any): string {
  switch (activity.type) {
    case "FEEDING":
      if (activity.feedingType === "breast") {
        const side = activity.breastSide ? breastSideLabels[activity.breastSide as keyof typeof breastSideLabels] : "";
        return `${feedingTypeLabels[activity.feedingType as keyof typeof feedingTypeLabels]} ${side} ${activity.duration || 0}분`;
      }
      return `${feedingTypeLabels[activity.feedingType as keyof typeof feedingTypeLabels] || ""} ${activity.feedingAmount || 0}ml`;
    case "SLEEP":
      const hours = Math.floor((activity.duration || 0) / 60);
      const minutes = (activity.duration || 0) % 60;
      if (hours > 0) {
        return `${hours}시간${minutes > 0 ? ` ${minutes}분` : ""}`;
      }
      return `${minutes}분`;
    case "DIAPER":
      return diaperTypeLabels[activity.diaperType as keyof typeof diaperTypeLabels] || "";
    case "TEMPERATURE":
      return `${activity.temperature}°C`;
    case "MEDICINE":
      return `${activity.medicineName || "약"} ${activity.medicineAmount || ""}${activity.medicineUnit || ""}`;
    default:
      return "";
  }
}

// 활동 시간 포맷팅
export function formatActivityTime(date: Date | string): string {
  const d = new Date(date);
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const period = hours < 12 ? "오전" : "오후";
  const displayHours = hours % 12 || 12;
  return `${period} ${displayHours}:${minutes.toString().padStart(2, "0")}`;
}
