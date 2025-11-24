// src/features/activities/components/ui/ButtonGroup.tsx
"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ButtonGroupOption {
  value: string;
  label: string;
}

interface ButtonGroupProps {
  options: ButtonGroupOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  columns?: number;
}

export function ButtonGroup({
  options,
  value,
  onChange,
  disabled = false,
  columns = 2,
}: ButtonGroupProps) {
  return (
    <div
      className={cn(
        "grid gap-2",
        columns === 2 && "grid-cols-2",
        columns === 3 && "grid-cols-3",
        columns === 4 && "grid-cols-4"
      )}
    >
      {options.map((option) => (
        <Button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          variant={value === option.value ? "default" : "outline"}
          disabled={disabled}
          className={cn(
            "transition-all",
            value === option.value &&
              "bg-blue-500 text-white hover:bg-blue-600"
          )}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
