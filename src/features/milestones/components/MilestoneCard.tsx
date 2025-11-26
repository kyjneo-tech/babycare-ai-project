"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMilestones } from "../hooks/useMilestones";
import { useMilestoneAlerts } from "../hooks/useMilestoneAlerts";
import { MilestoneListDialog } from "./MilestoneListDialog";
import { Milestone } from "@/shared/templates/milestone-templates";

interface MilestoneCardProps {
  babyId: string;
  birthDate: Date;
  limit?: number;
}

interface MilestonePreviewProps {
  milestone: Milestone;
  daysUntil: number;
  isAlert?: boolean;
}

function MilestonePreview({ milestone, daysUntil, isAlert = false }: MilestonePreviewProps) {
  const bgColor = isAlert ? "bg-red-50" : "bg-blue-50";
  const borderColor = isAlert ? "border-red-300" : "border-blue-200";
  const textColor = isAlert ? "text-red-600" : "text-blue-600";
  const labelColor = isAlert ? "text-red-900" : "text-gray-700";

  return (
    <div className={`flex items-start gap-3 p-3 ${bgColor} rounded-lg border-2 ${borderColor}`}>
      <div className="text-xl">{isAlert ? "🔔" : "⏰"}</div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h4 className={`font-bold text-sm ${isAlert ? "text-red-900" : ""}`}>
            {milestone.title}
          </h4>
          <span className={`text-xs ${textColor} font-medium`}>
            {milestone.ageMonths}개월 (D-{daysUntil})
          </span>
        </div>
        <p className={`text-xs ${labelColor} mt-1`}>
          {milestone.category}
        </p>
        {milestone.isWarningSign && (
          <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
            ⚠️ 중요 체크 항목
          </p>
        )}
      </div>
    </div>
  );
}

export function MilestoneCard({ 
  babyId, 
  birthDate, 
  limit = 2 
}: MilestoneCardProps) {
  const { upcomingMilestones } = useMilestones(birthDate);
  const alerts = useMilestoneAlerts(birthDate);
  const [showAllDialog, setShowAllDialog] = useState(false);
  const { getDaysUntil } = useMilestones(birthDate);

  // 알림이 있으면 알림 우선 표시, 없으면 다가오는 일정 표시
  const displayMilestones = alerts.length > 0 
    ? alerts.slice(0, limit) 
    : upcomingMilestones.slice(0, limit).map(m => ({ milestone: m, daysUntil: getDaysUntil(m) }));

  if (upcomingMilestones.length === 0) {
    return null; // 24개월 이후에는 표시하지 않음
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span>📅</span>
              <span>다가올 발달 일정</span>
            </span>
            {alerts.length > 0 && (
              <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                {alerts.length}개 임박
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {displayMilestones.map(({ milestone, daysUntil }) => (
            <MilestonePreview
              key={milestone.id}
              milestone={milestone}
              daysUntil={daysUntil}
              isAlert={daysUntil <= 14}
            />
          ))}
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setShowAllDialog(true)}
          >
            모든 일정 보기
          </Button>
        </CardContent>
      </Card>

      <MilestoneListDialog
        birthDate={birthDate}
        open={showAllDialog}
        onClose={() => setShowAllDialog(false)}
      />
    </>
  );
}
