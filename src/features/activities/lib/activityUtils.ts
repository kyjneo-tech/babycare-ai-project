import { Activity, ActivityType } from "@prisma/client";

// 활동 타입별 색상
export const getActivityColors = (type: ActivityType, isNight: boolean = false) => {
  switch (type) {
    case ActivityType.SLEEP:
      // 밤잠: 진한 보라, 낮잠: 연한 보라
      return isNight
        ? { bg: "bg-indigo-600", text: "text-white", hex: "#4f46e5" }
        : { bg: "bg-indigo-300", text: "text-indigo-900", hex: "#a5b4fc" };
    case ActivityType.FEEDING:
      return { bg: "bg-blue-500", text: "text-white", hex: "#3b82f6" };
    case ActivityType.DIAPER:
      return { bg: "bg-yellow-400", text: "text-yellow-900", hex: "#fbbf24" };
    case ActivityType.MEDICINE:
      return { bg: "bg-purple-500", text: "text-white", hex: "#a855f7" };
    case ActivityType.TEMPERATURE:
      return { bg: "bg-red-500", text: "text-white", hex: "#ef4444" };
    default:
      return { bg: "bg-gray-400", text: "text-white", hex: "#9ca3af" };
  }
};

// 활동 아이콘
export const getActivityIcon = (activity: Activity): string => {
  switch (activity.type) {
    case ActivityType.FEEDING:
      if (activity.feedingType === "breast") return "🤱";
      if (activity.feedingType === "formula") return "🍼";
      if (activity.feedingType === "baby_food") return "🥄";
      return "🍼";
    case ActivityType.SLEEP:
      return "😴";
    case ActivityType.DIAPER:
      return "💩";
    case ActivityType.MEDICINE:
      return "💊";
    case ActivityType.TEMPERATURE:
      return "🌡️";
    default:
      return "📝";
  }
};

// 활동 레이블
export const getActivityLabel = (activity: Activity): string => {
  switch (activity.type) {
    case ActivityType.FEEDING:
      if (activity.feedingType === "breast") return "모유 수유";
      if (activity.feedingType === "formula") return "분유 수유";
      if (activity.feedingType === "baby_food") return "이유식";
      return "수유";
    case ActivityType.SLEEP:
      const startHour = new Date(activity.startTime).getHours();
      const isNightSleep = startHour >= 18 || startHour < 6;
      return isNightSleep ? "밤잠" : "낮잠";
    case ActivityType.DIAPER:
      return "기저귀";
    case ActivityType.MEDICINE:
      return "약";
    case ActivityType.TEMPERATURE:
      return "체온 측정";
    default:
      return "활동";
  }
};

// 활동 상세 정보
export const getActivityDetails = (activity: Activity): string[] => {
  const details: string[] = [];

  const startTime = new Date(activity.startTime).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (activity.endTime) {
    const endTime = new Date(activity.endTime).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    details.push(`${startTime} ~ ${endTime}`);

    const duration = Math.floor(
      (new Date(activity.endTime).getTime() - new Date(activity.startTime).getTime()) / 60000
    );
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    if (hours > 0) {
      details.push(`${hours}시간 ${minutes}분`);
    } else {
      details.push(`${minutes}분`);
    }
  } else {
    details.push(`시작: ${startTime}`);
  }

  switch (activity.type) {
    case ActivityType.FEEDING:
      if (activity.feedingType === "breast") {
        details.push(`${activity.breastSide === "left" ? "왼쪽" : "오른쪽"}`);
      } else {
        details.push(`${activity.feedingAmount}ml`);
      }
      break;
    case ActivityType.DIAPER:
      const type =
        activity.diaperType === "urine"
          ? "소변"
          : activity.diaperType === "stool"
          ? "대변"
          : "소변+대변";
      details.push(type);
      break;
    case ActivityType.MEDICINE:
      details.push(`${activity.medicineName} ${activity.medicineAmount}${activity.medicineUnit}`);
      break;
    case ActivityType.TEMPERATURE:
      details.push(`${activity.temperature}°C`);
      break;
  }

  if (activity.memo) {
    details.push(`메모: ${activity.memo}`);
  }

  return details;
};
