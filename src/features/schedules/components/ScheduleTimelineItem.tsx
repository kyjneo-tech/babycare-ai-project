"use client";

import { useState } from "react";
import { Note } from "@prisma/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toggleNoteCompletionAction, deleteNoteAction } from "@/features/notes/actions";
import { getNoteIcon, getNoteTypeDetails } from "@/shared/utils/note-helpers";
import { format, differenceInDays } from "date-fns";
import { ko } from "date-fns/locale";
import { Trash2, Pencil } from "lucide-react";
import { ScheduleDetailModal } from "./ScheduleDetailModal";
import { useRouter } from "next/navigation";

interface ScheduleTimelineItemProps {
  schedule: Note;
  babyId: string;
  onUpdate: (silent?: boolean) => void;
  onUpdateLocally: (scheduleId: string, updates: Partial<Note>) => void;
  isLast: boolean;
}

export function ScheduleTimelineItem({ schedule, babyId, onUpdate, onUpdateLocally, isLast }: ScheduleTimelineItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [optimisticCompleted, setOptimisticCompleted] = useState(schedule.completed);
  const [optimisticDeleted, setOptimisticDeleted] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const router = useRouter();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const scheduleDate = schedule.dueDate ? new Date(schedule.dueDate) : null;
  const isPast = scheduleDate ? scheduleDate < today : false;
  const isToday = scheduleDate ? scheduleDate.toDateString() === today.toDateString() : false;

  // D-Day 계산
  const daysUntil = scheduleDate ? differenceInDays(scheduleDate, today) : null;
  let dDayText = "";
  let dDayColor = "text-blue-600";

  if (daysUntil !== null) {
    if (daysUntil === 0) {
      dDayText = "D-Day";
      dDayColor = "text-purple-600 font-bold";
    } else if (daysUntil > 0) {
      dDayText = `D-${daysUntil}`;
      dDayColor = daysUntil <= 14 ? "text-red-600 font-bold" : "text-blue-600";
    } else {
      dDayText = `D+${Math.abs(daysUntil)}`;
      dDayColor = "text-gray-400";
    }
  }

  const details = getNoteTypeDetails(schedule.type);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const newCompleted = !optimisticCompleted;
    setOptimisticCompleted(newCompleted);

    try {
      await toggleNoteCompletionAction(schedule.id);
      // Update local state instead of refetching to preserve order
      onUpdateLocally(schedule.id, { 
        completed: newCompleted,
        completedAt: newCompleted ? new Date() : null
      });
      router.refresh();
    } catch (error) {
      setOptimisticCompleted(!newCompleted);
      console.error('Failed to toggle schedule:', error);
    }
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

  const handleEdit = () => {
    setShowEditModal(true);
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
      <div className="relative flex gap-4 pb-6">
        {/* 타임라인 라인 */}
        {!isLast && (
          <div className="absolute left-[18px] top-10 w-px h-full bg-gray-200"></div>
        )}

        {/* 아이콘 & 체크박스 */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          {/* 체크박스 */}
          <div onClick={handleToggle} className="cursor-pointer">
            <Checkbox
              checked={optimisticCompleted}
              className="h-5 w-5"
            />
          </div>

          {/* 아이콘 */}
          <div className={`
            w-9 h-9 rounded-full flex items-center justify-center text-lg
            ${optimisticCompleted || isPast ? 'bg-gray-200' : 'bg-blue-100'}
          `}>
            {details.icon}
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* 제목 & D-Day */}
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-semibold text-base ${optimisticCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                  {schedule.title}
                </h3>
                {dDayText && (
                  <span className={`text-xs ${dDayColor} px-2 py-0.5 rounded-full ${daysUntil !== null && daysUntil <= 14 && !optimisticCompleted ? 'bg-red-50' : 'bg-gray-50'}`}>
                    {dDayText}
                  </span>
                )}
              </div>

              {/* 날짜 */}
              {scheduleDate && (
                <p className="text-sm text-gray-500 mb-2">
                  {format(scheduleDate, "yyyy년 M월 d일 (EEE)", { locale: ko })}
                </p>
              )}

              {/* 내용 */}
              {schedule.content && (
                <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-3 rounded-md">
                  {schedule.content}
                </p>
              )}
            </div>

            {/* 액션 버튼들 */}
            {/* 액션 버튼들 */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="h-8 w-8 p-0"
              >
                <Pencil className="h-4 w-4 text-gray-500 hover:text-blue-600" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-600" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 수정 모달 */}
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
