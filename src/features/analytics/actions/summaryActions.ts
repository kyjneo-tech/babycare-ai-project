"use server";

import { calculatePeriodSummary } from "../services/summaryCalculator";
import { PeriodSummary } from "../types/summary";

/**
 * 기간 요약 통계를 가져오는 Server Action
 */
export async function getPeriodSummary(
  babyId: string,
  days: number
): Promise<{ success: boolean; data?: PeriodSummary; error?: string }> {
  try {
    const summary = await calculatePeriodSummary(babyId, days);
    return {
      success: true,
      data: summary,
    };
  } catch (error) {
    console.error("[getPeriodSummary] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
