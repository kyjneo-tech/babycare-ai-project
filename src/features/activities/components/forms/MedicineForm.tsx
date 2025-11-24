// src/features/activities/components/forms/MedicineForm.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MedicineFormProps {
  medicineName: string;
  setMedicineName: (value: string) => void;
  medicineAmount: string;
  setMedicineAmount: (value: string) => void;
  medicineUnit: string;
  setMedicineUnit: (value: string) => void;
  errors: Record<string, string>;
  disabled?: boolean;
}

export function MedicineForm({
  medicineName,
  setMedicineName,
  medicineAmount,
  setMedicineAmount,
  medicineUnit,
  setMedicineUnit,
  errors,
  disabled = false,
}: MedicineFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="medicineName">약 이름</Label>
        <Input
          id="medicineName"
          type="text"
          placeholder="타이레놀, 부루펜 등"
          value={medicineName}
          onChange={(e) => setMedicineName(e.target.value)}
          disabled={disabled}
          className={errors.medicineName ? "border-red-500" : ""}
        />
        {errors.medicineName && (
          <p className="text-xs text-red-500 mt-1">{errors.medicineName}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="medicineAmount">용량</Label>
          <Input
            id="medicineAmount"
            type="text"
            placeholder="5"
            value={medicineAmount}
            onChange={(e) => setMedicineAmount(e.target.value)}
            disabled={disabled}
            className={errors.medicineAmount ? "border-red-500" : ""}
          />
          {errors.medicineAmount && (
            <p className="text-xs text-red-500 mt-1">{errors.medicineAmount}</p>
          )}
        </div>

        <div>
          <Label htmlFor="medicineUnit">단위</Label>
          <Select value={medicineUnit} onValueChange={setMedicineUnit} disabled={disabled}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ml">ml</SelectItem>
              <SelectItem value="mg">mg</SelectItem>
              <SelectItem value="정">정</SelectItem>
              <SelectItem value="포">포</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
