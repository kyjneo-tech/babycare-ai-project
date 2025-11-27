"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getUpcomingSchedules } from "@/features/notes/actions";
import { Note, NoteType } from "@prisma/client";
import { getNoteTypeDetails } from "@/shared/utils/note-helpers";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface UpcomingScheduleCardProps {
  babyId: string;
  limit?: number;
}

type ScheduleNote = Note & { daysUntil: number };

function SchedulePreview({ schedule }: { schedule: ScheduleNote }) {
  const details = getNoteTypeDetails(schedule.type);
  const isAlert = schedule.daysUntil <= 14;

  const bgColor = isAlert ? "bg-red-50" : "bg-blue-50";
  const borderColor = isAlert ? "border-red-300" : "border-blue-200";
  const textColor = isAlert ? "text-red-600" : "text-blue-600";

  return (
    <div className={`flex items-start gap-3 p-3 ${bgColor} rounded-lg border-2 ${borderColor}`}>
      <div className="text-xl">{details.icon}</div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h4 className="font-bold text-sm text-gray-900">{schedule.title}</h4>
          <span className={`text-xs ${textColor} font-medium`}>
            D-{schedule.daysUntil}
          </span>
        </div>
        <p className="text-xs text-gray-700 mt-1">
          {details.label}
        </p>
      </div>
    </div>
  );
}

export function UpcomingScheduleCard({
  babyId,
  limit = 3,
}: UpcomingScheduleCardProps) {
  const [schedules, setSchedules] = useState<ScheduleNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSchedules = async () => {
      setIsLoading(true);
      const result = await getUpcomingSchedules(babyId, limit);
      if (result.success) {
        setSchedules(result.data);
      } else {
        console.error(result.error);
      }
      setIsLoading(false);
    };

    fetchSchedules();
  }, [babyId, limit]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📅</span>
            <span>다가오는 주요 일정</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (schedules.length === 0) {
    return (
       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📅</span>
            <span>다가오는 주요 일정</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-gray-500 py-8">
          <p>다가오는 주요 일정이 없습니다.</p>
          <p className="text-xs mt-2">
            '전체 일정'에서 예방접종, 건강검진 등<br/>자동 생성된 일정을 확인해보세요.
          </p>
          <Button variant="secondary" size="sm" className="mt-4" asChild>
            <Link href={`/schedules?babyId=${babyId}`}>
              전체 일정 보러가기
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const alerts = schedules.filter(s => s.daysUntil <= 14);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span>📅</span>
              <span>다가오는 주요 일정</span>
            </span>
            {alerts.length > 0 && (
              <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                {alerts.length}개 임박
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {schedules.map((schedule) => (
            <SchedulePreview
              key={schedule.id}
              schedule={schedule}
            />
          ))}
          
          <Button 
            variant="outline" 
            className="w-full"
            asChild
          >
            <Link href={`/schedules?babyId=${babyId}`}>
              모든 일정 보기
            </Link>
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
