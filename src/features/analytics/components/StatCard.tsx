"use client";

import { ComparisonResult } from "../types/summary";
import { ArrowUp, ArrowDown, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: string;
  label: string;
  count: number;
  avgValue?: string;
  comparison: ComparisonResult;
  onClick?: () => void;
}

export function StatCard({
  icon,
  label,
  count,
  avgValue,
  comparison,
  onClick,
}: StatCardProps) {
  // 트렌드 아이콘
  const trendIcon = {
    up: <ArrowUp className="w-3 h-3" />,
    down: <ArrowDown className="w-3 h-3" />,
    same: <ArrowRight className="w-3 h-3" />,
    new: <Sparkles className="w-3 h-3" />,
  }[comparison.trend];

  // 트렌드 색상
  const trendColorClass = {
    up: "text-green-600 dark:text-green-500",
    down: "text-orange-600 dark:text-orange-500",
    same: "text-gray-500 dark:text-gray-400",
    new: "text-blue-600 dark:text-blue-500",
  }[comparison.trend];

  return (
    <div
      className={cn(
        "bg-muted rounded-lg p-3 space-y-2",
        "hover:bg-muted/80 transition-colors",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      {/* 헤더: 아이콘 + 라벨 */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        <span className="font-medium text-sm">{label}</span>
      </div>

      {/* 주요 숫자 */}
      <div>
        <p className="text-2xl font-bold">{count}회</p>
        {avgValue && (
          <p className="text-xs text-muted-foreground mt-0.5">{avgValue}</p>
        )}
      </div>

      {/* 구분선 */}
      <div className="border-t border-border" />

      {/* 비교 정보 */}
      <div className={cn("flex items-center gap-1 text-xs", trendColorClass)}>
        {trendIcon}
        <span className="line-clamp-1">{comparison.message}</span>
      </div>
    </div>
  );
}
