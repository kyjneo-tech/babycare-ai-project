// src/features/activities/components/ui/QuickSelectButtons.tsx
"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuickSelectButtonsProps {
  options: number[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  unit?: string;
}

export function QuickSelectButtons({
  options,
  value,
  onChange,
  disabled = false,
  unit = "",
}: QuickSelectButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {options.map((option) => (
        <Button
          key={option}
          type="button"
          onClick={() => onChange(option.toString())}
          variant="outline"
          size="sm"
          disabled={disabled}
          className={cn(
            "px-3 py-1 text-xs rounded-full border transition-all",
            value === option.toString()
              ? "bg-blue-500 text-white border-blue-600 hover:bg-blue-600"
              : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
          )}
        >
          {option}
          {unit}
        </Button>
      ))}
    </div>
  );
}
