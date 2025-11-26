"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface CheckboxItem {
  key: string;
  label: string;
  icon?: string;
  checked: boolean;
}

interface CheckboxListDialogProps {
  title: string;
  description?: string;
  items: CheckboxItem[];
  onSave: (selectedKeys: string[]) => void;
  trigger: React.ReactNode;
  saveButtonText?: string;
}

export function CheckboxListDialog({
  title,
  description,
  items,
  onSave,
  trigger,
  saveButtonText = "선택 완료",
}: CheckboxListDialogProps) {
  const [open, setOpen] = useState(false);
  const [localItems, setLocalItems] = useState<CheckboxItem[]>(items);

  // Dialog가 열릴 때마다 초기 상태 동기화
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setLocalItems(items);
    }
    setOpen(isOpen);
  };

  const handleToggle = (key: string) => {
    setLocalItems((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleSave = () => {
    const selectedKeys = localItems
      .filter((item) => item.checked)
      .map((item) => item.key);
    onSave(selectedKeys);
    setOpen(false);
  };

  const selectedCount = localItems.filter((item) => item.checked).length;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {localItems.map((item) => (
            <div key={item.key} className="flex items-center space-x-3">
              <Checkbox
                id={item.key}
                checked={item.checked}
                onCheckedChange={() => handleToggle(item.key)}
              />
              <Label
                htmlFor={item.key}
                className={cn(
                  "flex items-center gap-2 cursor-pointer flex-1",
                  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                )}
              >
                {item.icon && <span className="text-lg">{item.icon}</span>}
                <span>{item.label}</span>
              </Label>
            </div>
          ))}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {selectedCount}개 선택됨
          </p>
          <Button onClick={handleSave}>{saveButtonText}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
