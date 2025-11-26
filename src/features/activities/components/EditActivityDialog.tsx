"use client";

import { useState, useEffect } from "react";
import { Activity } from "@prisma/client";
import { updateActivity } from "@/features/activities/actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { activityTypeLabels } from "@/shared/utils/activityLabels";

interface EditActivityDialogProps {
  activity: Activity;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updatedActivity: Activity) => void;
}

export function EditActivityDialog({
  activity,
  open,
  onOpenChange,
  onUpdate,
}: EditActivityDialogProps) {
  const [note, setNote] = useState(activity.note || "");
  const [feedingAmount, setFeedingAmount] = useState(activity.feedingAmount?.toString() || "");
  const [temperature, setTemperature] = useState(activity.temperature?.toString() || "");
  const [medicineName, setMedicineName] = useState(activity.medicineName || "");
  const [medicineAmount, setMedicineAmount] = useState(activity.medicineAmount?.toString() || "");
  const [isSaving, setIsSaving] = useState(false);

  // 활동 변경 시 폼 리셋
  useEffect(() => {
    setNote(activity.note || "");
    setFeedingAmount(activity.feedingAmount?.toString() || "");
    setTemperature(activity.temperature?.toString() || "");
    setMedicineName(activity.medicineName || "");
    setMedicineAmount(activity.medicineAmount?.toString() || "");
  }, [activity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const updateData: any = {
        note: note.trim() || null,
      };

      // 활동 타입별로 필요한 필드 추가
      if (activity.type === "FEEDING" && feedingAmount) {
        updateData.feedingAmount = parseFloat(feedingAmount);
      }
      if (activity.type === "TEMPERATURE" && temperature) {
        updateData.temperature = parseFloat(temperature);
      }
      if (activity.type === "MEDICINE") {
        if (medicineName) updateData.medicineName = medicineName.trim();
        if (medicineAmount) updateData.medicineAmount = parseFloat(medicineAmount);
      }

      const result = await updateActivity(activity.id, activity.userId, updateData);

      if (result.success && result.data) {
        onUpdate(result.data);
      } else {
        alert(result.error || "수정에 실패했습니다.");
      }
    } catch (error) {
      alert("수정 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {activityTypeLabels[activity.type]} 수정
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* 수유 - 수유량 */}
            {activity.type === "FEEDING" && activity.feedingType !== "breast" && (
              <div className="space-y-2">
                <Label htmlFor="feedingAmount">수유량 (ml)</Label>
                <Input
                  id="feedingAmount"
                  type="number"
                  step="10"
                  value={feedingAmount}
                  onChange={(e) => setFeedingAmount(e.target.value)}
                  placeholder="예: 150"
                />
              </div>
            )}

            {/* 체온 측정 */}
            {activity.type === "TEMPERATURE" && (
              <div className="space-y-2">
                <Label htmlFor="temperature">체온 (°C)</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  placeholder="예: 36.5"
                />
              </div>
            )}

            {/* 약 */}
            {activity.type === "MEDICINE" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="medicineName">약 이름</Label>
                  <Input
                    id="medicineName"
                    value={medicineName}
                    onChange={(e) => setMedicineName(e.target.value)}
                    placeholder="예: 타이레놀"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medicineAmount">용량</Label>
                  <Input
                    id="medicineAmount"
                    type="number"
                    step="0.1"
                    value={medicineAmount}
                    onChange={(e) => setMedicineAmount(e.target.value)}
                    placeholder="예: 5"
                  />
                </div>
              </>
            )}

            {/* 메모 (모든 활동 타입) */}
            <div className="space-y-2">
              <Label htmlFor="note">메모</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="메모를 입력하세요..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              취소
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
