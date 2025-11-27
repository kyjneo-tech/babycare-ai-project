"use client";

import { Activity, ActivityType } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getActivityColors, getActivityIcon, getActivityLabel, getActivityDetails } from "@/features/activities/lib/activityUtils";

interface ActivityDetailDialogProps {
  selectedCell: {
    activity: Activity;
    label: string;
    details: string[];
  } | null;
  onClose: () => void;
}

export function ActivityDetailDialog({ selectedCell, onClose }: ActivityDetailDialogProps) {
  if (!selectedCell) return null;

  return (
    <Dialog open={!!selectedCell} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span
              className={`${
                getActivityColors(
                  selectedCell?.activity?.type || ActivityType.PLAY,
                  selectedCell?.activity?.type === ActivityType.SLEEP &&
                    (new Date(selectedCell?.activity?.startTime || "").getHours() >= 18 ||
                      new Date(selectedCell?.activity?.startTime || "").getHours() < 6)
                ).bg
              } rounded-full w-8 h-8 flex items-center justify-center`}
            >
              <span className="text-xl">{getActivityIcon(selectedCell?.activity!)}</span>
            </span>
            <span>{selectedCell?.label}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2 text-sm">
          <p className="text-xs text-gray-500">
            {new Date(selectedCell.activity.startTime).toLocaleDateString("ko-KR", {
              month: "long",
              day: "numeric",
              weekday: "short",
            })}
          </p>
          {selectedCell.details.map((detail, idx) => (
            <p key={idx} className="text-sm text-gray-700">
              {detail}
            </p>
          ))}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
