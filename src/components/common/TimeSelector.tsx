"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, ChevronUp, ChevronDown, Clock } from "lucide-react";
import { format, set, startOfToday, startOfYesterday } from "date-fns";
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TimeSelectorProps {
  value: Date;
  onChange: (date: Date) => void;
  label: string;
  disabled?: boolean;
}

export function TimeSelector({
  value,
  onChange,
  label,
  disabled = false,
}: TimeSelectorProps) {
  const [mounted, setMounted] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [hourOpen, setHourOpen] = useState(false);
  const [minuteOpen, setMinuteOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!value || !mounted) {
    return (
      <div className="flex flex-col gap-3 w-full">
        <div className="h-5 w-32 bg-gray-100 animate-pulse rounded" />
        <div className="h-48 w-full bg-gray-50 animate-pulse rounded-2xl border-2 border-primary/5" />
      </div>
    );
  }

  const hours = value.getHours();
  const minutes = value.getMinutes();
  const isAM = hours < 12;
  const displayHours = hours % 12 || 12;

  const handleDatePartChange = (newDatePart: Date) => {
    const newDate = set(value, {
      year: newDatePart.getFullYear(),
      month: newDatePart.getMonth(),
      date: newDatePart.getDate(),
    });
    onChange(newDate);
  };

  const updateTime = (newHours: number, newMinutes: number) => {
    const newDate = set(value, { hours: newHours, minutes: newMinutes });
    onChange(newDate);
  };

  const adjustTime = (minutesOffset: number) => {
    const newDate = new Date(value.getTime() + minutesOffset * 60 * 1000);
    onChange(newDate);
  };

  const setNow = () => {
    const now = new Date();
    const roundedMinutes = Math.floor(now.getMinutes() / 5) * 5;
    onChange(set(now, { minutes: roundedMinutes, seconds: 0, milliseconds: 0 }));
  };

  const toggleAMPM = () => {
    const newHours = isAM ? hours + 12 : hours - 12;
    updateTime(newHours, minutes);
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center justify-between px-1">
        <Label className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-primary" />
          {label}
        </Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={setNow}
          disabled={disabled}
          className="text-xs h-7 text-primary font-bold hover:bg-primary/5 px-2"
        >
          방금
        </Button>
      </div>
      
      <div className="bg-white border-2 border-primary/5 rounded-2xl p-4 shadow-sm space-y-4">
        {/* 날짜 선택 Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <Button
            type="button"
            onClick={() => handleDatePartChange(startOfToday())}
            variant={format(value, 'yyyy-MM-dd') === format(startOfToday(), 'yyyy-MM-dd') ? 'default' : 'secondary'}
            size="sm"
            disabled={disabled}
            className="rounded-full px-4 h-8 text-xs flex-shrink-0"
          >
            오늘
          </Button>
          <Button
            type="button"
            onClick={() => handleDatePartChange(startOfYesterday())}
            variant={format(value, 'yyyy-MM-dd') === format(startOfYesterday(), 'yyyy-MM-dd') ? 'default' : 'secondary'}
            size="sm"
            disabled={disabled}
            className="rounded-full px-4 h-8 text-xs flex-shrink-0"
          >
            어제
          </Button>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  "justify-start text-left font-normal rounded-full h-8 text-xs flex-shrink-0 border-dashed",
                  !value && "text-muted-foreground"
                )}
                disabled={disabled}
              >
                <CalendarIcon className="mr-1 h-3 w-3" />
                {format(value, "M월 d일")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value}
                onSelect={(day) => {
                  if (day) handleDatePartChange(day);
                  setCalendarOpen(false);
                }}
                initialFocus
                disabled={disabled}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* 메인 시간 조절 섹션 - 가로 배치 고정 */}
        <div className="flex items-center justify-between gap-2 max-w-[280px] mx-auto py-1">
          {/* 오전/오후 선택 */}
          <Button
            type="button"
            variant="outline"
            onClick={toggleAMPM}
            disabled={disabled}
            className={cn(
              "h-14 w-14 rounded-xl text-sm font-black transition-all border-2 flex-shrink-0",
              isAM 
                ? "bg-amber-50 text-amber-600 border-amber-100" 
                : "bg-indigo-50 text-indigo-600 border-indigo-100"
            )}
          >
            {isAM ? "오전" : "오후"}
          </Button>

          {/* 시/분 조절 영역 */}
          <div className="flex items-center gap-2 flex-1 justify-center">
            {/* 시 조절 */}
            <div className="flex flex-col items-center">
              <Button variant="ghost" size="icon" onClick={() => adjustTime(60)} disabled={disabled} className="h-6 w-6 text-gray-400">
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Popover open={hourOpen} onOpenChange={setHourOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-14 w-14 text-2xl font-black rounded-xl p-0 shadow-sm border-2">
                    {displayHours}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-20 p-1" align="center">
                  <ScrollArea className="h-48">
                    <div className="flex flex-col p-1">
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                        <Button
                          key={h}
                          variant="ghost"
                          className={cn("w-full h-9 text-sm font-bold", displayHours === h && "bg-primary/10 text-primary")}
                          onClick={() => {
                            const newHours = isAM ? (h === 12 ? 0 : h) : (h === 12 ? 12 : h + 12);
                            updateTime(newHours, minutes);
                            setHourOpen(false);
                          }}
                        >
                          {h}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
              <Button variant="ghost" size="icon" onClick={() => adjustTime(-60)} disabled={disabled} className="h-6 w-6 text-gray-400">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>

            <span className="text-xl font-bold text-gray-300 mb-1">:</span>

            {/* 분 조절 */}
            <div className="flex flex-col items-center">
              <Button variant="ghost" size="icon" onClick={() => adjustTime(5)} disabled={disabled} className="h-6 w-6 text-gray-400">
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Popover open={minuteOpen} onOpenChange={setMinuteOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-14 w-14 text-2xl font-black rounded-xl p-0 shadow-sm border-2">
                    {String(minutes).padStart(2, "0")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-20 p-1" align="center">
                  <ScrollArea className="h-48">
                    <div className="flex flex-col p-1">
                      {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => (
                        <Button
                          key={m}
                          variant="ghost"
                          className={cn("w-full h-9 text-sm font-bold", minutes === m && "bg-primary/10 text-primary")}
                          onClick={() => {
                            updateTime(hours, m);
                            setMinuteOpen(false);
                          }}
                        >
                          {String(m).padStart(2, "0")}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
              <Button variant="ghost" size="icon" onClick={() => adjustTime(-5)} disabled={disabled} className="h-6 w-6 text-gray-400">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* 퀵 프리셋 버튼 - 가로 배치 최적화 */}
        <div className="flex gap-2 pt-1 border-t border-dashed">
          {[-10, -30, -60].map((offset) => (
            <Button
              key={offset}
              type="button"
              onClick={() => adjustTime(offset)}
              variant="secondary"
              size="sm"
              disabled={disabled}
              className="flex-1 text-[10px] font-bold bg-gray-50 text-gray-500 hover:bg-gray-100 rounded-lg h-8"
            >
              {Math.abs(offset) >= 60 ? `1시간 전` : `${Math.abs(offset)}분 전`}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}