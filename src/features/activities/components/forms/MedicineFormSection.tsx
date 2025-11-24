import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { GuidelinePanel } from "../ui/GuidelinePanel";

interface MedicineFormSectionProps {
  medicineName: string;
  setMedicineName: (value: string) => void;
  medicineAmount: string;
  setMedicineAmount: (value: string) => void;
  medicineUnit: string;
  setMedicineUnit: (value: string) => void;
  latestWeight: number | null;
  errors: Record<string, string>;
  disabled?: boolean;
}

export function MedicineFormSection({
  medicineName,
  setMedicineName,
  medicineAmount,
  setMedicineAmount,
  medicineUnit,
  setMedicineUnit,
  latestWeight,
  errors,
  disabled = false,
}: MedicineFormSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="mb-2 block">약 종류 (해열제 교차 복용)</Label>
        <div className="grid grid-cols-1 gap-2 mb-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setMedicineName("아세트아미노펜")}
              disabled={disabled}
              className={cn(
                "h-auto py-2 flex flex-col gap-1",
                medicineName.includes("아세트아미노펜")
                  ? "bg-red-100 border-red-400 text-red-700 ring-1 ring-red-400 hover:bg-red-200"
                  : "hover:bg-red-50"
              )}
            >
              <span className="font-bold">🔴 아세트아미노펜</span>
              <span className="text-xs text-gray-500">(챔프 빨강, 세토펜)</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setMedicineName("이부프로펜")}
              disabled={disabled}
              className={cn(
                "h-auto py-2 flex flex-col gap-1",
                medicineName.includes("이부프로펜")
                  ? "bg-blue-100 border-blue-400 text-blue-700 ring-1 ring-blue-400 hover:bg-blue-200"
                  : "hover:bg-blue-50"
              )}
            >
              <span className="font-bold">🔵 이부프로펜</span>
              <span className="text-xs text-gray-500">(챔프 파랑, 부루펜)</span>
            </Button>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setMedicineName("덱시부프로펜")}
            disabled={disabled}
            className={cn(
              "h-auto py-2 flex flex-col gap-1",
              medicineName.includes("덱시부프로펜")
                ? "bg-purple-100 border-purple-400 text-purple-700 ring-1 ring-purple-400 hover:bg-purple-200"
                : "hover:bg-purple-50"
            )}
          >
            <span className="font-bold">🟣 덱시부프로펜</span>
            <span className="text-xs text-gray-500">(맥시부펜, 애니펜)</span>
          </Button>
        </div>
        <Input
          type="text"
          placeholder="예: 챔프시럽, 부루펜"
          value={medicineName}
          onChange={(e) => setMedicineName(e.target.value)}
          className={errors.medicineName ? "border-red-500" : ""}
          disabled={disabled}
        />
        {errors.medicineName && (
          <p className="text-xs text-red-500 mt-1">{errors.medicineName}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          💡 해열제는 보통 4~6시간 간격, 교차 복용(다른 계열) 시 2~3시간 간격으로
          복용합니다.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="mb-2 block">용량</Label>
          <Input
            type="text"
            placeholder="5"
            value={medicineAmount}
            onChange={(e) => setMedicineAmount(e.target.value)}
            className={errors.medicineAmount ? "border-red-500" : ""}
            disabled={disabled}
          />
          {errors.medicineAmount && (
            <p className="text-xs text-red-500 mt-1">{errors.medicineAmount}</p>
          )}
        </div>
        <div>
          <Label className="mb-2 block">단위</Label>
          <Select
            value={medicineUnit}
            onValueChange={setMedicineUnit}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="단위" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ml">ml</SelectItem>
              <SelectItem value="cc">cc</SelectItem>
              <SelectItem value="mg">mg</SelectItem>
              <SelectItem value="tablet">정</SelectItem>
              <SelectItem value="drop">방울</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {latestWeight && medicineName && medicineAmount && (
        <GuidelinePanel
          type="medicine"
          value={parseFloat(medicineAmount)}
          weight={latestWeight}
          medicineName={medicineName}
        />
      )}
    </div>
  );
}
