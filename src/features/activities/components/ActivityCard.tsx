"use client";

import { useState } from "react";
import { Activity } from "@prisma/client";
import { deleteActivity } from "@/features/activities/actions";
import {
  activityTypeLabels,
  formatActivityTime,
  feedingTypeLabels,
  diaperTypeLabels,
  breastSideLabels,
} from "@/shared/utils/activityLabels";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SPACING, TYPOGRAPHY } from "@/design-system";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Pencil } from "lucide-react";
import { EditActivityDialog } from "./EditActivityDialog";

interface ActivityCardProps {
  activity: Activity;
  onDelete?: (id: string) => void;
  onUpdate?: (updatedActivity: Activity) => void;
}

export function ActivityCard({ activity, onDelete, onUpdate }: ActivityCardProps) {
  const [deleting, setDeleting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleDelete = async () => {
    if (!confirm("이 활동을 정말 삭제하시겠습니까?")) return;

    setDeleting(true);
    try {
      const result = await deleteActivity(activity.id, activity.userId);
      if (result.success) {
        onDelete?.(activity.id);
      } else {
        alert(result.error || "삭제에 실패했습니다.");
      }
    } catch (error) {
      alert("삭제 중 오류가 발생했습니다.");
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdate = (updatedActivity: Activity) => {
    onUpdate?.(updatedActivity);
    setIsEditDialogOpen(false);
  };

  const renderActivityDetails = () => {
    const textClass = cn(TYPOGRAPHY.body.small, "text-muted-foreground");

    switch (activity.type) {
      case "FEEDING":
        return (
          <p className={textClass}>
            {activity.feedingType &&
              feedingTypeLabels[
                activity.feedingType as keyof typeof feedingTypeLabels
              ]}
            {activity.feedingType === "breast" &&
              activity.breastSide &&
              ` (${breastSideLabels[activity.breastSide as keyof typeof breastSideLabels]})`}
            {activity.feedingAmount && ` ${activity.feedingAmount}ml`}
            {activity.feedingType === "breast" &&
              activity.duration &&
              ` ${activity.duration}분`}
          </p>
        );
      case "SLEEP":
        return (
          <p className={textClass}>
            {formatActivityTime(activity.startTime)}
            {activity.endTime ? ` - ${formatActivityTime(activity.endTime)}` : " ~"}
            {activity.duration && (
              <span className="ml-1">
                (
                {Math.floor(activity.duration / 60) > 0 &&
                  `${Math.floor(activity.duration / 60)}시간 `}
                {activity.duration % 60 > 0 && `${activity.duration % 60}분`}
                )
              </span>
            )}
          </p>
        );
      case "DIAPER":
        return (
          <>
            <p className={textClass}>
              {activity.diaperType &&
                diaperTypeLabels[
                  activity.diaperType as keyof typeof diaperTypeLabels
                ]}
            </p>
            {activity.stoolColor && (
              <p className={cn(TYPOGRAPHY.caption, "mt-1")}>
                색상: {activity.stoolColor}
              </p>
            )}
          </>
        );
      case "BATH":
        return (
          <>
            {activity.bathTemp && (
              <p className={textClass}>
                온도: {activity.bathTemp}°C
              </p>
            )}
          </>
        );
      case "PLAY":
        return (
          <>
            {activity.playDuration && (
              <p className={textClass}>{activity.playDuration}분</p>
            )}
          </>
        );
      case "MEDICINE":
        return (
          <>
            <p className={textClass}>{activity.medicineName}</p>
            {activity.medicineAmount && (
              <p className={cn(TYPOGRAPHY.caption, "mt-1")}>
                {activity.medicineAmount} {activity.medicineUnit}
              </p>
            )}
          </>
        );
      case "TEMPERATURE":
        return (
          <>
            {activity.temperature && (
              <p className={textClass}>{activity.temperature}°C</p>
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className={cn("flex justify-between items-start", SPACING.card.small)}>
          <div className="flex-1 min-w-0">
            <div className={cn("flex items-center flex-wrap", SPACING.gap.xs, "mb-2")}>
              <span className={cn(TYPOGRAPHY.h3, "text-card-foreground")}>
                {activityTypeLabels[activity.type]}
              </span>
              <span className={TYPOGRAPHY.caption}>
                {formatActivityTime(activity.startTime)}
              </span>
              <Badge variant="outline" className="text-[10px] font-normal">
                {formatDistanceToNow(new Date(activity.startTime), { addSuffix: true, locale: ko })}
              </Badge>
            </div>
            {renderActivityDetails()}
            {activity.note && (
              <p className={cn(TYPOGRAPHY.body.small, "mt-2 text-muted-foreground italic")}>
                {activity.note}
              </p>
            )}
          </div>
          <div className="flex gap-2 flex-shrink-0 ml-3">
            {onUpdate && (
              <Button
                onClick={() => setIsEditDialogOpen(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                title="수정"
              >
                <Pencil className="h-3 w-3" />
                수정
              </Button>
            )}
            {onDelete && (
              <Button
                onClick={handleDelete}
                disabled={deleting}
                variant="destructive"
                size="sm"
                title="삭제"
              >
                {deleting ? "..." : "삭제"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <EditActivityDialog
        activity={activity}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onUpdate={handleUpdate}
      />
    </>
  );
}
