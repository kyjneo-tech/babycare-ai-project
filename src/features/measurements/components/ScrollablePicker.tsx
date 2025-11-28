"use client";

import { useRef, RefObject } from "react";

interface ScrollablePickerProps {
  options: string[];
  value: number;
  onChange: (value: number) => void;
  label: string;
  unit: string;
  color: "blue" | "green";
  isEditing: boolean;
  onEditingChange: (editing: boolean) => void;
  scrollRef: RefObject<HTMLDivElement | null>;
  onScroll: () => void;
  onSyncScroll: (value: number) => void;
  onSave?: () => void;
}

export function ScrollablePicker({
  options,
  value,
  onChange,
  label,
  unit,
  color,
  isEditing,
  onEditingChange,
  scrollRef,
  onScroll,
  onSyncScroll,
  onSave,
}: ScrollablePickerProps) {
  const colorStyles = {
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-400",
      text: "text-blue-600",
      textLight: "text-blue-500",
    },
    green: {
      bg: "bg-green-50",
      border: "border-green-400",
      text: "text-green-600",
      textLight: "text-green-500",
    },
  };

  const styles = colorStyles[color];

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1 text-center">
        {label}
      </label>
      <div className="relative h-[150px] overflow-hidden rounded-lg border border-gray-200 bg-white">
        {/* 선택 표시 영역 (배경) */}
        <div
          className={`absolute inset-x-0 top-1/2 -mt-[25px] h-[50px] ${styles.bg} border-y-2 ${styles.border} pointer-events-none z-0`}
        />

        {/* 스크롤 목록 (앞쪽) */}
        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="relative z-10 h-full overflow-y-scroll scrollbar-hide snap-y snap-mandatory"
          style={{ paddingTop: "50px", paddingBottom: "50px" }}
        >
          {options.map((option, index) => {
            const isSelected = parseFloat(option) === value;
            return (
              <div
                key={index}
                className="h-[50px] flex items-center justify-center font-semibold snap-center transition-all duration-200"
                style={{
                  color: isSelected ? "transparent" : "#9ca3af",
                  fontSize: isSelected ? "1.5rem" : "1rem",
                  opacity: isSelected ? 0 : 0.5,
                }}
              >
                {option}
              </div>
            );
          })}
        </div>

        {/* 단위 및 입력 필드 (오버레이) */}
        <div className="absolute inset-x-0 top-1/2 -mt-[25px] h-[50px] flex items-center justify-center z-20 pointer-events-none">
          <div
            className="pointer-events-auto flex items-center justify-center gap-1 cursor-text"
            onClick={() => onEditingChange(true)}
          >
            {isEditing ? (
              <input
                type="number"
                step={unit === "kg" ? "0.1" : "0.5"}
                value={value}
                autoFocus
                onBlur={() => onEditingChange(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onEditingChange(false);
                    onSave?.();
                  }
                }}
                onChange={(e) => {
                  const newValue = parseFloat(e.target.value);
                  if (!isNaN(newValue)) {
                    onChange(newValue);
                    onSyncScroll(newValue);
                  }
                }}
                className={`w-24 text-center text-2xl font-bold ${styles.text} bg-transparent border-none focus:ring-0 p-0`}
              />
            ) : (
              <span className={`text-2xl font-bold ${styles.text}`}>
                {value.toFixed(1)}
              </span>
            )}
            <span className={`${styles.textLight} font-bold text-sm mt-1`}>
              {unit}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
