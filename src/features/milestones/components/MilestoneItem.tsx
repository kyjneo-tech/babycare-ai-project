"use client";

import { cn } from "@/lib/utils";
import { Milestone } from "@/shared/templates/milestone-templates";

type MilestoneStatus = 'completed' | 'current' | 'upcoming';

interface MilestoneItemProps {
  milestone: Milestone;
  status: MilestoneStatus;
  isCompleted: boolean;
  onToggleComplete: () => void;
}

export function MilestoneItem({
  milestone,
  status,
  isCompleted,
  onToggleComplete
}: MilestoneItemProps) {
  const effectiveStatus = isCompleted ? 'completed' : status;

  return (
    <div className={cn(
      "flex gap-3 p-3 rounded-lg border-2 transition-all",
      effectiveStatus === 'completed' && "bg-green-50 border-green-300",
      effectiveStatus === 'current' && "bg-blue-50 border-blue-400 shadow-md",
      effectiveStatus === 'upcoming' && "bg-gray-50 border-gray-200"
    )}>
      <button
        onClick={onToggleComplete}
        className="text-2xl hover:scale-110 transition-transform flex-shrink-0"
        aria-label={isCompleted ? "완료 취소" : "완료 표시"}
      >
        {effectiveStatus === 'completed' ? '✅' : 
         effectiveStatus === 'current' ? '🔵' : '⭕'}
      </button>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <h4 className={cn(
            "font-bold text-sm",
            isCompleted && "line-through text-gray-500"
          )}>
            {milestone.title}
          </h4>
          <span className="text-xs text-gray-500 flex-shrink-0">
            {milestone.ageMonths}개월
          </span>
        </div>
        <p className="text-xs text-gray-600 mt-1">
          {milestone.description}
        </p>
        {milestone.isWarningSign && !isCompleted && (
          <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
            ⚠️ 이 시기까지 못하면 전문가 상담 권장
          </p>
        )}
      </div>
    </div>
  );
}
