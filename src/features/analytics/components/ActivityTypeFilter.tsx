"use client";

import { ActivityType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ActivityTypeFilterProps {
  activeFilters: ActivityType[];
  onFilterChange: (filters: ActivityType[]) => void;
}

const ALL_FILTERS: { type: ActivityType; label: string; icon: string }[] = [
  { type: ActivityType.SLEEP, label: "수면", icon: "😴" },
  { type: ActivityType.FEEDING, label: "수유", icon: "🍼" },
  { type: ActivityType.DIAPER, label: "기저귀", icon: "💩" },
  { type: ActivityType.MEDICINE, label: "약", icon: "💊" },
  { type: ActivityType.TEMPERATURE, label: "체온", icon: "🌡️" },
];

export function ActivityTypeFilter({ activeFilters, onFilterChange }: ActivityTypeFilterProps) {
  const handleFilterClick = (type: ActivityType) => {
    const newFilters = activeFilters.includes(type)
      ? activeFilters.filter((f) => f !== type)
      : [...activeFilters, type];
    onFilterChange(newFilters);
  };

  const isAllActive = activeFilters.length === 0;

  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isAllActive ? "default" : "outline"}
              size="sm"
              onClick={() => onFilterChange([])}
              className="transition-all"
            >
              <span className="text-base sm:text-lg mr-1">✨</span>
              <span className="text-sm font-medium">전체</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>모든 활동 보기</p>
          </TooltipContent>
        </Tooltip>
        
        {ALL_FILTERS.map(({ type, label, icon }) => (
          <Tooltip key={type}>
            <TooltipTrigger asChild>
              <Button
                variant={activeFilters.includes(type) ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterClick(type)}
                className="transition-all"
              >
                <span className="text-lg">{icon}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
