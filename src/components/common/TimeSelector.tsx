"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format, set, startOfToday, startOfYesterday } from "date-fns";
import { cn } from '@/lib/utils';

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
  // Prevent rendering if value is not yet available, preventing crash
  if (!value) {
    return null;
  }

  const [calendarOpen, setCalendarOpen] = useState(false);

  const hours = value.getHours();
  const minutes = value.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  const handleDatePartChange = (newDatePart: Date) => {
    const newDate = set(value, {
      year: newDatePart.getFullYear(),
      month: newDatePart.getMonth(),
      date: newDatePart.getDate(),
    });
    onChange(newDate);
  };
  
  const handleSliderChange = (v: number[]) => {
    const newTotalMinutes = v[0];
    const newHours = Math.floor(newTotalMinutes / 60);
    const newMinutes = newTotalMinutes % 60;
    const newDate = set(value, { hours: newHours, minutes: newMinutes });
    onChange(newDate);
  };

  const setNow = () => {
    const now = new Date();
    // 5분 단위로 내림
    const roundedMinutes = Math.floor(now.getMinutes() / 5) * 5;
    onChange(set(now, { minutes: roundedMinutes, seconds: 0, milliseconds: 0 }));
  };

  const adjustTime = (minutesOffset: number) => {
    const newDate = new Date(value.getTime() + minutesOffset * 60 * 1000);
    onChange(newDate);
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold text-gray-800">
        {label}
      </Label>
      
      <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide p-1">
          <Button
            type="button"
            onClick={() => handleDatePartChange(startOfToday())}
            variant={format(value, 'yyyy-MM-dd') === format(startOfToday(), 'yyyy-MM-dd') ? 'default' : 'outline'}
            size="sm"
            disabled={disabled}
            className="flex-shrink-0"
          >
            오늘
          </Button>
          <Button
            type="button"
            onClick={() => handleDatePartChange(startOfYesterday())}
            variant={format(value, 'yyyy-MM-dd') === format(startOfYesterday(), 'yyyy-MM-dd') ? 'default' : 'outline'}
            size="sm"
            disabled={disabled}
            className="flex-shrink-0"
          >
            어제
          </Button>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant={"outline"}
                size="sm"
                className={cn(
                  "w-[150px] justify-start text-left font-normal flex-shrink-0",
                  !value && "text-muted-foreground"
                )}
                disabled={disabled}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(value, "yyyy-MM-dd")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value}
                onSelect={(day) => {
                  if (day) {
                    handleDatePartChange(day);
                  }
                  setCalendarOpen(false);
                }}
                initialFocus
                disabled={disabled}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <span className="text-3xl font-bold text-blue-600 min-w-24 text-center tracking-tight">
            {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}
          </span>
          <Slider
            value={[totalMinutes]}
            onValueChange={handleSliderChange}
            max={24 * 60 - 1} // 00:00 to 23:59
            step={5}
            disabled={disabled}
            className="flex-1"
          />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          type="button"
          onClick={setNow}
          variant="default"
          size="sm"
          disabled={disabled}
          className="flex-1 min-w-16 bg-green-500 hover:bg-green-600"
        >
          방금
        </Button>
        <Button
          type="button"
          onClick={() => adjustTime(-15)}
          variant="outline"
          size="sm"
          disabled={disabled}
          className="flex-1 min-w-16"
        >
          -15분
        </Button>
        <Button
          type="button"
          onClick={() => adjustTime(-30)}
          variant="outline"
          size="sm"
          disabled={disabled}
          className="flex-1 min-w-16"
        >
          -30분
        </Button>
        <Button
          type="button"
          onClick={() => adjustTime(-60)}
          variant="outline"
          size="sm"
          disabled={disabled}
          className="flex-1 min-w-16"
        >
          -1시간
        </Button>
      </div>
    </div>
  );
}
