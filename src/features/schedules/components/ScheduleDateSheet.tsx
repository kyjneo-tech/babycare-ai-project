"use client";

import { useState } from "react";
import { Note } from "@prisma/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { getNoteTypeDetails } from "@/shared/utils/note-helpers";
import { Badge } from "@/components/ui/badge";
import { Calendar, Pencil, Trash2 } from "lucide-react";
import { toggleNoteCompletionAction, deleteNoteAction } from "@/features/notes/actions";
import { ScheduleDetailModal } from "./ScheduleDetailModal";
import { useRouter } from "next/navigation";

interface ScheduleDateSheetProps {
  date: Date | null;
  schedules: Note[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onViewInTimeline: (date: Date) => void;
  babyId: string;
  onUpdate: () => void;
}

export function ScheduleDateSheet({
  date,
  schedules,
  isOpen,
  onOpenChange,
  onViewInTimeline,
  babyId,
  onUpdate,
}: ScheduleDateSheetProps) {
  if (!date) return null;

  const handleViewInTimeline = () => {
    onViewInTimeline(date);
    onOpenChange(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh] rounded-t-xl">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            {format(date, "yyyy년 M월 d일 (EEE)", { locale: ko })}
          </SheetTitle>
          <p className="text-sm text-gray-500">
            {schedules.length}개의 일정
          </p>
        </SheetHeader>

        <div className="overflow-y-auto py-4 space-y-3" style={{ maxHeight: "calc(70vh - 180px)" }}>
          {schedules.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">
                <Calendar className="h-12 w-12 mx-auto" />
              </div>
              <p className="text-gray-500 font-medium">이 날짜에 등록된 일정이 없습니다.</p>
              <p className="text-sm text-gray-400 mt-1">새로운 일정을 추가해 보세요.</p>
            </div>
          ) : (
            schedules.map((schedule) => (
              <ScheduleCard
                key={schedule.id}
                schedule={schedule}
                babyId={babyId}
                onUpdate={onUpdate}
              />
            ))
          )}
        </div>

        <SheetFooter className="border-t pt-4">
          <Button
            onClick={handleViewInTimeline}
            className="w-full"
            variant="default"
          >
            타임라인에서 보기 →
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// Enhanced schedule card with checkbox, edit, and delete actions
function ScheduleCard({
  schedule,
  babyId,
  onUpdate
}: {
  schedule: Note;
  babyId: string;
  onUpdate: () => void;
}) {
  const router = useRouter();
  const [optimisticCompleted, setOptimisticCompleted] = useState(schedule.completed);
  const [optimisticDeleted, setOptimisticDeleted] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const details = getNoteTypeDetails(schedule.type);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const newCompleted = !optimisticCompleted;
    setOptimisticCompleted(newCompleted);

    try {
      await toggleNoteCompletionAction(schedule.id);
      onUpdate();
      router.refresh();
    } catch (error) {
      setOptimisticCompleted(!newCompleted);
      console.error('Failed to toggle schedule:', error);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEditModal(true);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm('이 일정을 삭제하시겠습니까?')) return;

    setOptimisticDeleted(true);
    setIsDeleting(true);

    try {
      await deleteNoteAction(schedule.id);
      onUpdate();
      router.refresh();
    } catch (error) {
      setOptimisticDeleted(false);
      console.error('Failed to delete schedule:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    onUpdate();
  };

  if (optimisticDeleted) {
    return null;
  }

  return (
    <>
      <div className={`
        bg-white border rounded-lg p-3
        ${optimisticCompleted ? 'border-gray-200 bg-gray-50' : 'border-blue-200 bg-blue-50'}
        hover:shadow-md transition-all
        ${isDeleting ? 'opacity-50' : ''}
      `}>
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <div onClick={handleToggle} className="cursor-pointer pt-0.5">
            <Checkbox
              checked={optimisticCompleted}
              className="h-5 w-5"
            />
          </div>

          {/* Icon */}
          <div className={`
            text-2xl shrink-0
            ${optimisticCompleted ? 'opacity-50' : ''}
          `}>
            {details.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={`
                font-semibold text-sm
                ${optimisticCompleted ? 'line-through text-gray-500' : 'text-gray-900'}
              `}>
                {schedule.title}
              </h4>
              {optimisticCompleted && (
                <Badge variant="secondary" className="text-xs">
                  완료
                </Badge>
              )}
            </div>

            {schedule.content && (
              <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                {schedule.content}
              </p>
            )}

            {/* Priority badge */}
            {schedule.priority && schedule.priority !== 'MEDIUM' && (
              <Badge
                variant={schedule.priority === 'HIGH' || schedule.priority === 'URGENT' ? 'destructive' : 'secondary'}
                className="text-xs mt-2"
              >
                {schedule.priority === 'HIGH' ? '높음' : schedule.priority === 'URGENT' ? '긴급' : '낮음'}
              </Badge>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="h-8 w-8 p-0 hover:bg-blue-100"
              title="수정"
            >
              <Pencil className="h-4 w-4 text-blue-600" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-8 w-8 p-0 hover:bg-red-100"
              title="삭제"
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <ScheduleDetailModal
          schedule={schedule}
          babyId={babyId}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
}
