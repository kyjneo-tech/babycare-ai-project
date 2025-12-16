"use client";

import { Card, CardContent } from "@/components/ui/card";
import { PeriodSummary } from "../types/summary";
import { StatCard } from "./StatCard";
import { TYPOGRAPHY, SPACING } from "@/design-system";
import { cn } from "@/lib/utils";

interface PeriodSummaryCardProps {
  summary: PeriodSummary;
  days: number;
}

export function PeriodSummaryCard({ summary, days }: PeriodSummaryCardProps) {
  const { current, comparison } = summary;

  return (
    <Card>
      <CardContent className={cn(SPACING.card.small, "space-y-4")}>
        <h3 className={TYPOGRAPHY.h3}>📈 최근 {days}일 요약</h3>

        {/* 통계 카드 그리드 */}
        <div className="grid grid-cols-2 gap-3">
          {/* 수유 */}
          <StatCard
            icon="🍼"
            label="수유"
            count={current.feedingCount}
            avgValue={
              current.feedingAvgAmount > 0
                ? `평균 ${current.feedingAvgAmount}ml`
                : undefined
            }
            comparison={comparison.feeding}
          />

          {/* 수면 */}
          <StatCard
            icon="😴"
            label="수면"
            count={current.sleepCount}
            avgValue={
              current.sleepAvgHours > 0
                ? `평균 ${current.sleepAvgHours}시간`
                : undefined
            }
            comparison={comparison.sleep}
          />

          {/* 배변 */}
          <StatCard
            icon="💩"
            label="배변"
            count={current.diaperCount}
            avgValue={
              current.stoolCount > 0 || current.urineCount > 0
                ? `대변 ${current.stoolCount}회 · 소변 ${current.urineCount}회`
                : undefined
            }
            comparison={comparison.diaper}
          />

          {/* 투약 */}
          <StatCard
            icon="💊"
            label="투약"
            count={current.medicineCount}
            comparison={comparison.medicine}
          />
        </div>
      </CardContent>
    </Card>
  );
}
