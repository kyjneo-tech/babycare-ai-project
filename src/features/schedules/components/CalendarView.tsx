"use client";

import { useMemo, useState } from "react";
import { Note, NoteType } from "@prisma/client";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { format, isSameDay } from "date-fns";
import { ko } from "date-fns/locale";
import { noteTypeColors, noteTypeLabels } from "@/shared/utils/note-helpers";
import { ScheduleDateSheet } from "./ScheduleDateSheet";

interface CalendarViewProps {
  schedules: Note[];
  onDateClick?: (date: Date) => void;
  babyId: string;
  onUpdate: () => void;
}

export function CalendarView({ schedules, onDateClick, babyId, onUpdate }: CalendarViewProps) {
  // Sheet 상태 관리
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // 날짜별 일정 그룹화
  const schedulesByDate = useMemo(() => {
    const grouped = new Map<string, Note[]>();

    schedules.forEach(schedule => {
      if (!schedule.dueDate) return;

      const dateKey = format(new Date(schedule.dueDate), 'yyyy-MM-dd');
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(schedule);
    });

    return grouped;
  }, [schedules]);

  // 타입별 색상 가져오기
  const getTypeColor = (type: NoteType): string => {
    const colorMap: Record<string, string> = {
      VACCINATION: 'bg-blue-500',
      HEALTH_CHECKUP: 'bg-green-500',
      MILESTONE: 'bg-amber-500',
      WONDER_WEEK: 'bg-cyan-500',
      SLEEP_REGRESSION: 'bg-indigo-500',
      FEEDING_STAGE: 'bg-orange-500',
      APPOINTMENT: 'bg-gray-500',
      TODO: 'bg-purple-500',
      MEMO: 'bg-pink-500',
    };
    return colorMap[type] || 'bg-gray-500';
  };

  // 날짜별 일정 가져오기
  const getDaySchedules = (date: Date): Note[] => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return schedulesByDate.get(dateKey) || [];
  };

  // 날짜 클릭 핸들러 - Sheet 열기
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsSheetOpen(true);
  };

  // 타임라인에서 보기
  const handleViewInTimeline = (date: Date) => {
    onDateClick?.(date);
  };

  return (
    <div className="space-y-4">
      {/* 데스크탑: 큰 달력 */}
      <div className="hidden md:block">
        <Calendar
          mode="single"
          locale={ko}
          className="rounded-md border"
          modifiers={{
            hasSchedule: (date) => getDaySchedules(date).length > 0,
          }}
          modifiersClassNames={{
            hasSchedule: "font-bold",
          }}
          components={{
            DayButton: ({ day, ...props }) => {
              const daySchedules = getDaySchedules(day.date);

              return (
                <button
                  {...props}
                  onClick={() => handleDateClick(day.date)}
                  className="relative w-full min-h-[80px] p-2 hover:bg-accent rounded-md text-left"
                >
                  <div className="font-medium text-sm mb-1">
                    {format(day.date, 'd')}
                  </div>

                  {daySchedules.length > 0 && (
                    <div className="space-y-0.5">
                      {daySchedules.slice(0, 2).map((schedule) => (
                        <Badge
                          key={schedule.id}
                          variant="outline"
                          className={`text-[10px] px-1 py-0 truncate block ${getTypeColor(schedule.type)} text-white border-none`}
                        >
                          {schedule.title.slice(0, 8)}...
                        </Badge>
                      ))}
                      {daySchedules.length > 2 && (
                        <div className="text-[10px] text-gray-500">
                          +{daySchedules.length - 2}
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            },
          }}
        />
      </div>

      {/* 모바일: 작은 달력 (점 표시) */}
      <div className="md:hidden">
        <Calendar
          mode="single"
          locale={ko}
          className="rounded-md border w-full"
          components={{
            DayButton: ({ day, ...props }) => {
              const daySchedules = getDaySchedules(day.date);

              return (
                <button
                  {...props}
                  onClick={() => handleDateClick(day.date)}
                  className="relative w-full aspect-square p-2 hover:bg-accent rounded-md flex flex-col items-center justify-center"
                >
                  <div className="font-medium text-sm">
                    {format(day.date, 'd')}
                  </div>

                  {daySchedules.length > 0 && (
                    <div className="flex gap-0.5 mt-1 justify-center">
                      {daySchedules.slice(0, 3).map((schedule) => (
                        <div
                          key={schedule.id}
                          className={`w-1.5 h-1.5 rounded-full ${getTypeColor(schedule.type)}`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            },
          }}
        />
      </div>

      {/* 범례 */}
      <div className="flex flex-wrap gap-2 justify-center pt-4 border-t">
        <div className="text-xs text-gray-500 font-medium mr-2">범례:</div>
        {[
          { type: 'VACCINATION' as NoteType, label: '예방접종' },
          { type: 'HEALTH_CHECKUP' as NoteType, label: '건강검진' },
          { type: 'MILESTONE' as NoteType, label: '발달' },
          { type: 'WONDER_WEEK' as NoteType, label: '도약기' },
          { type: 'APPOINTMENT' as NoteType, label: '사용자 일정' },
        ].map(({ type, label }) => (
          <div key={type} className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded-full ${getTypeColor(type)}`}></div>
            <span className="text-xs text-gray-600">{label}</span>
          </div>
        ))}
      </div>

      {/* Bottom Sheet */}
      <ScheduleDateSheet
        date={selectedDate}
        schedules={selectedDate ? getDaySchedules(selectedDate) : []}
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onViewInTimeline={handleViewInTimeline}
        babyId={babyId}
        onUpdate={onUpdate}
      />
    </div>
  );
}
