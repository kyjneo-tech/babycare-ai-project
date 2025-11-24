// src/features/activities/components/forms/DiaperForm.tsx
"use client";

import { Label } from "@/components/ui/label";
import { ButtonGroup } from "../ui/ButtonGroup";

interface DiaperFormProps {
  diaperType: string;
  setDiaperType: (value: string) => void;
  stoolColor: string;
  setStoolColor: (value: string) => void;
  stoolCondition: string;
  setStoolCondition: (value: string) => void;
  errors: Record<string, string>;
  disabled?: boolean;
}

export function DiaperForm({
  diaperType,
  setDiaperType,
  stoolColor,
  setStoolColor,
  stoolCondition,
  setStoolCondition,
  errors,
  disabled = false,
}: DiaperFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label>배변 종류</Label>
        <ButtonGroup
          options={[
            { value: "urine", label: "소변" },
            { value: "stool", label: "대변" },
            { value: "both", label: "둘 다" },
          ]}
          value={diaperType}
          onChange={setDiaperType}
          disabled={disabled}
          columns={3}
        />
      </div>

      {(diaperType === "stool" || diaperType === "both") && (
        <>
          <div>
            <Label>대변 색상</Label>
            <ButtonGroup
              options={[
                { value: "yellow", label: "노란색" },
                { value: "green", label: "녹색" },
                { value: "brown", label: "갈색" },
                { value: "black", label: "검은색" },
              ]}
              value={stoolColor}
              onChange={setStoolColor}
              disabled={disabled}
              columns={4}
            />
          </div>

          <div>
            <Label>대변 상태</Label>
            <ButtonGroup
              options={[
                { value: "soft", label: "무른" },
                { value: "normal", label: "보통" },
                { value: "hard", label: "딱딱" },
                { value: "watery", label: "물같은" },
              ]}
              value={stoolCondition}
              onChange={setStoolCondition}
              disabled={disabled}
              columns={4}
            />
            {errors.stoolCondition && (
              <p className="text-xs text-red-500 mt-1">
                {errors.stoolCondition}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
