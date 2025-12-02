"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Calendar, Syringe, HeartPulse, Baby, Moon, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";
import { TYPOGRAPHY, SPACING } from "@/design-system";
import { Note, NoteType } from "@prisma/client";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface BabySchedulePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate?: () => void;
  schedules: Note[];
  babyName: string;
  totalCount?: number;
}

// 일정 타입별 아이콘
const typeIcons: Record<NoteType, React.ReactNode> = {
  VACCINATION: <Syringe className="w-4 h-4" />,
  HEALTH_CHECKUP: <HeartPulse className="w-4 h-4" />,
  WONDER_WEEK: <Baby className="w-4 h-4" />,
  SLEEP_REGRESSION: <Moon className="w-4 h-4" />,
  FEEDING_STAGE: <UtensilsCrossed className="w-4 h-4" />,
  MILESTONE: <Calendar className="w-4 h-4" />,
  APPOINTMENT: <Calendar className="w-4 h-4" />,
  TODO: <Calendar className="w-4 h-4" />,
  MEMO: <Calendar className="w-4 h-4" />,
};

// 일정 타입별 색상
const typeColors: Record<NoteType, string> = {
  VACCINATION: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  HEALTH_CHECKUP: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  WONDER_WEEK: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  SLEEP_REGRESSION: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
  FEEDING_STAGE: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  MILESTONE: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
  APPOINTMENT: "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300",
  TODO: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  MEMO: "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300",
};

// 일정 타입별 한글명
const typeLabels: Record<NoteType, string> = {
  VACCINATION: "예방접종",
  HEALTH_CHECKUP: "건강검진",
  WONDER_WEEK: "원더윅스",
  SLEEP_REGRESSION: "수면퇴행",
  FEEDING_STAGE: "이유식",
  MILESTONE: "발달",
  APPOINTMENT: "예약",
  TODO: "할일",
  MEMO: "메모",
};

export function BabySchedulePreviewDialog({
  open,
  onOpenChange,
  onNavigate,
  schedules,
  babyName,
  totalCount,
}: BabySchedulePreviewDialogProps) {
  // 타입별로 그룹화
  const groupedSchedules = schedules.reduce((acc, schedule) => {
    if (!acc[schedule.type]) {
      acc[schedule.type] = [];
    }
    acc[schedule.type].push(schedule);
    return acc;
  }, {} as Record<NoteType, Note[]>);

  // 표시할 타입 순서
  const displayOrder: NoteType[] = [
    "VACCINATION",
    "HEALTH_CHECKUP",
    "FEEDING_STAGE",
    "WONDER_WEEK",
    "SLEEP_REGRESSION",
  ];

  const displayCount = totalCount || schedules.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-xl p-0 gap-0 max-h-[85vh] flex flex-col">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Calendar className="w-5 h-5 flex-shrink-0" />
            <span className="break-words">{babyName}의 2년간 일정이 생성되었습니다!</span>
          </DialogTitle>
          <DialogDescription className="text-sm">
            예방접종, 건강검진, 이유식 단계 등 총 {displayCount}개의 일정이 자동으로 추가되었습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6">
          <div className="space-y-4 py-2">
            {displayOrder.map((type) => {
              const typeSchedules = groupedSchedules[type];
              if (!typeSchedules || typeSchedules.length === 0) return null;

              return (
                <div key={type} className="space-y-2">
                  {/* 타입 헤더 */}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn("px-2 py-0.5 text-xs whitespace-nowrap", typeColors[type])}>
                      <span className="mr-1">{typeIcons[type]}</span>
                      {typeLabels[type]} ({typeSchedules.length}개)
                    </Badge>
                  </div>

                  {/* 일정 목록 */}
                  <div className="space-y-1.5">
                    {typeSchedules
                      .sort((a, b) => {
                        if (!a.dueDate || !b.dueDate) return 0;
                        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                      })
                      .slice(0, 5) // 각 타입별 최대 5개만 표시
                      .map((schedule) => (
                        <div
                          key={schedule.id}
                          className="flex flex-col p-3 rounded-lg border bg-card text-sm"
                        >
                          <p className="font-medium break-words">
                            {schedule.title}
                          </p>
                          {schedule.dueDate && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {format(new Date(schedule.dueDate), "yyyy년 M월 d일 (eee)", {
                                locale: ko,
                              })}
                            </p>
                          )}
                        </div>
                      ))}
                    {typeSchedules.length > 5 && (
                      <p className="text-xs text-muted-foreground ml-2">
                        외 {typeSchedules.length - 5}개
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 px-4 sm:px-6 py-3 sm:py-4 border-t flex-shrink-0">
          <Button
            onClick={() => {
              if (onNavigate) {
                onNavigate();
              } else {
                onOpenChange(false);
              }
            }}
            variant="default"
            size="sm"
          >
            기록 화면으로 이동
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
