import { prisma } from "@/shared/lib/prisma";
import { CleanedData } from "../types";

/**
 * 아기의 최근 활동 데이터를 수집합니다.
 * @param babyId - 아기 ID
 * @param daysToCollect - 수집할 일수 (기본값: 7일)
 * @returns 정리된 활동 데이터
 */
export async function collectBabyActivityData(
  babyId: string,
  daysToCollect: number = 7
): Promise<CleanedData> {
  const today = new Date();
  const startDate = new Date();
  startDate.setDate(today.getDate() - (daysToCollect - 1));
  startDate.setHours(0, 0, 0, 0);

  const [feedings, sleeps, diapers, temperatures, medicines, weights] =
    await Promise.all([
      prisma.activity.findMany({
        where: {
          babyId,
          startTime: { gte: startDate },
          type: "FEEDING",
        },
        select: {
          startTime: true,
          memo: true,
          feedingType: true,
          feedingAmount: true,
          breastSide: true,
          duration: true,
        },
        orderBy: { startTime: "desc" },
      }),
      prisma.activity.findMany({
        where: {
          babyId,
          startTime: { gte: startDate },
          type: "SLEEP",
        },
        select: {
          startTime: true,
          endTime: true,
          memo: true,
          sleepType: true,
        },
        orderBy: { startTime: "desc" },
      }),
      prisma.activity.findMany({
        where: {
          babyId,
          startTime: { gte: startDate },
          type: "DIAPER",
        },
        select: {
          startTime: true,
          memo: true,
          diaperType: true,
          stoolCondition: true,
        },
        orderBy: { startTime: "desc" },
      }),
      prisma.activity.findMany({
        where: {
          babyId,
          startTime: { gte: startDate },
          type: "TEMPERATURE",
        },
        select: {
          startTime: true,
          memo: true,
          temperature: true,
        },
        orderBy: { startTime: "desc" },
      }),
      prisma.activity.findMany({
        where: {
          babyId,
          startTime: { gte: startDate },
          type: "MEDICINE",
        },
        select: {
          startTime: true,
          memo: true,
          medicineName: true,
          medicineAmount: true,
          medicineUnit: true,
        },
        orderBy: { startTime: "desc" },
      }),
      prisma.babyMeasurement.findMany({
        where: {
          babyId,
        },
        select: {
          measuredAt: true,
          weight: true,
          height: true,
        },
        orderBy: { measuredAt: "desc" },
        take: 10, // 날짜 상관없이 최근 10건만
      }),
    ]);

  // Convert Date objects to ISO strings for consistent processing
  return {
    feedings: feedings.map((f) => ({
      ...f,
      startTime: f.startTime.toISOString(),
    })),
    sleeps: sleeps.map((s) => ({
      ...s,
      startTime: s.startTime.toISOString(),
      endTime: s.endTime ? s.endTime.toISOString() : null,
    })),
    diapers: diapers.map((d) => ({
      ...d,
      startTime: d.startTime.toISOString(),
    })),
    temperatures: temperatures.map((t) => ({
      ...t,
      startTime: t.startTime.toISOString(),
    })),
    medicines: medicines.map((m) => ({
      ...m,
      startTime: m.startTime.toISOString(),
    })),
    weights: weights.map((w) => ({
      ...w,
      measuredAt: w.measuredAt.toISOString(),
    })),
  };
}
