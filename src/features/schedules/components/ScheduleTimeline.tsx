// src/features/schedules/components/ScheduleTimeline.tsx
"use client";

import { useState, useEffect } from "react";
import { Note } from "@prisma/client";
import { getAllSchedulesForBaby } from "@/features/notes/actions";
import { Loader2, CheckCircle, Circle } from "lucide-react";
import { Timeline, TimelineItem, TimelineConnector, TimelineHeader, TimelineIcon, TimelineTitle, TimelineContent } from "@/components/ui/timeline";
import { getNoteIcon } from "@/shared/utils/note-helpers";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface ScheduleTimelineProps {
  babyId: string;
}

export function ScheduleTimeline({ babyId }: ScheduleTimelineProps) {
  const [schedules, setSchedules] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const result = await getAllSchedulesForBaby(babyId);
      if (result.success) {
        setSchedules(result.data.schedules);
      } else {
        console.error(result.error);
      }
      setIsLoading(false);
    }
    fetchData();
  }, [babyId]);

  if (isLoading) {
    return <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (schedules.length === 0) {
    return <div className="text-center py-10 text-gray-500">생성된 일정이 없습니다.</div>;
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="mt-6">
      <Timeline>
        {schedules.map((schedule, index) => {
          const isPast = new Date(schedule.dueDate!) < today;
          const isToday = new Date(schedule.dueDate!).toDateString() === today.toDateString();

          return (
            <TimelineItem key={schedule.id}>
              {index < schedules.length - 1 && <TimelineConnector />}
              <TimelineHeader>
                <TimelineIcon className={schedule.completed || isPast ? "bg-gray-300" : "bg-primary"}>
                  {schedule.completed ? <CheckCircle className="h-5 w-5" /> : <span className="text-lg">{getNoteIcon(schedule.type)}</span>}
                </TimelineIcon>
                <div className="flex-grow">
                  <TimelineTitle className={schedule.completed ? "text-gray-500 line-through" : ""}>{schedule.title}</TimelineTitle>
                  <p className="text-sm text-gray-500">
                    {format(new Date(schedule.dueDate!), "M월 d일 (EEE)", { locale: ko })}
                  </p>
                </div>
              </TimelineHeader>
              <TimelineContent>
                {schedule.content && (
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                    {schedule.content}
                  </p>
                )}
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>
    </div>
  );
}
