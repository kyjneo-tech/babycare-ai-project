"use client";

import { useState } from "react";
import { Baby } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { TYPOGRAPHY } from "@/design-system";
import { cn } from "@/lib/utils";

const MAX_NAME_LENGTH = 50;

interface EditBabyDialogProps {
  baby: Baby;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function EditBabyDialog({
  baby,
  open,
  onOpenChange,
  onUpdate,
}: EditBabyDialogProps) {
  const [name, setName] = useState(baby.name);
  const [birthDate, setBirthDate] = useState(
    new Date(baby.birthDate).toISOString().split("T")[0]
  );
  const [gender, setGender] = useState(baby.gender);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // TODO: 서버 액션 호출 (updateBabyAndRecalculateSchedules)
      const { updateBabyAndRecalculateSchedules } = await import("@/features/babies/actions");
      
      const result = await updateBabyAndRecalculateSchedules(baby.id, {
        name,
        birthDate: new Date(birthDate),
        gender,
      });

      if (result.success) {
        onUpdate();
        onOpenChange(false);
      } else {
        alert(result.error || "아기 정보 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("아기 정보 수정 실패:", error);
      alert("아기 정보 수정 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className={cn(TYPOGRAPHY.h3)}>아기 정보 수정</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">이름</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                const newValue = e.target.value;
                if (newValue.length <= MAX_NAME_LENGTH) {
                  setName(newValue);
                }
              }}
              placeholder="아기 이름"
              required
              className={cn(
                name.length > MAX_NAME_LENGTH * 0.9 ? 'border-orange-500' : '',
                name.length >= MAX_NAME_LENGTH ? 'border-red-500' : ''
              )}
            />
            {name.length > 0 && (
              <div className={cn(
                "text-xs",
                name.length >= MAX_NAME_LENGTH ? 'text-red-500' :
                name.length > MAX_NAME_LENGTH * 0.9 ? 'text-orange-500' :
                'text-gray-500'
              )}>
                {name.length} / {MAX_NAME_LENGTH}자
                {name.length > MAX_NAME_LENGTH * 0.9 && name.length < MAX_NAME_LENGTH && (
                  <span className="ml-1">({MAX_NAME_LENGTH - name.length}자 남음)</span>
                )}
                {name.length >= MAX_NAME_LENGTH && (
                  <span className="ml-1 font-medium">최대 글자수 도달</span>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate">생년월일</Label>
            <Input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              ⚠️ 생년월일 변경 시 자동 생성된 일정(예방접종, 건강검진)이 재계산됩니다.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">성별</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger>
                <SelectValue placeholder="성별 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">남아</SelectItem>
                <SelectItem value="female">여아</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              취소
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
