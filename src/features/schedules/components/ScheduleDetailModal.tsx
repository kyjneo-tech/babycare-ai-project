// src/features/schedules/components/ScheduleDetailModal.tsx
"use client";

import { useState } from "react";
import { Note, NoteType } from "@prisma/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createNoteAction, updateNoteAction } from "@/features/notes/actions";
import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";

type ScheduleDetailModalProps = {
  schedule?: Note | null; // Optional for creating a new schedule
  babyId: string;
  onClose: () => void;
  onSuccess: () => void; // To trigger a data refresh
};

export function ScheduleDetailModal({ schedule, babyId, onClose, onSuccess }: ScheduleDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!schedule;

  const [title, setTitle] = useState(schedule?.title || "");
  const [content, setContent] = useState(schedule?.content || "");
  const [dueDate, setDueDate] = useState(
    schedule?.dueDate ? new Date(schedule.dueDate).toISOString().split("T")[0] : ""
  );

  const handleSave = async () => {
    setLoading(true);
    try {
      let result;
      if (isEditing && schedule) {
        result = await updateNoteAction(schedule.id, {
          title: title.trim() || schedule.title,
          content: content.trim() || undefined,
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        });
      } else {
        result = await createNoteAction({
          babyId: babyId,
          type: 'APPOINTMENT', // Default type for user-created schedules
          title: title.trim(),
          content: content.trim() || undefined,
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        });
      }

      if (result.success) {
        onSuccess(); // Refresh data on the parent component
        onClose();
      } else {
        alert(`저장 실패: ${result.error}`);
      }
    } catch (error) {
      console.error("Failed to save schedule:", error);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "일정 편집" : "새 일정 추가"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">일정 제목 *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 병원 방문"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">예정일</Label>
            <div className="relative">
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="pl-10"
              />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">상세 내용</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="상세 내용을 입력하세요 (선택사항)"
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            취소
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || !title.trim()}
          >
            {loading ? "저장 중..." : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
