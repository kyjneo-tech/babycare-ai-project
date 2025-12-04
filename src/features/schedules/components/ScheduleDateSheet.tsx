"use client";

import { Note } from "@prisma/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { getNoteTypeDetails } from "@/shared/utils/note-helpers";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

interface ScheduleDateSheetProps {
  date: Date | null;
  schedules: Note[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onViewInTimeline: (date: Date) => void;
}

export function ScheduleDateSheet({
  date,
  schedules,
  isOpen,
  onOpenChange,
  onViewInTimeline,
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
              <ScheduleCard key={schedule.id} schedule={schedule} />
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

// Simple schedule card for the sheet
function ScheduleCard({ schedule }: { schedule: Note }) {
  const details = getNoteTypeDetails(schedule.type);
  const isCompleted = schedule.completed;

  return (
    <div className={`
      bg-white border rounded-lg p-3 
      ${isCompleted ? 'border-gray-200 bg-gray-50' : 'border-blue-200 bg-blue-50'}
      hover:shadow-md transition-shadow
    `}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`
          text-2xl shrink-0
          ${isCompleted ? 'opacity-50' : ''}
        `}>
          {details.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`
              font-semibold text-sm
              ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}
            `}>
              {schedule.title}
            </h4>
            {isCompleted && (
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
      </div>
    </div>
  );
}
