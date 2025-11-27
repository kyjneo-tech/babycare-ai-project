"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMilestones } from "../hooks/useMilestones";
import { MilestoneItem } from "./MilestoneItem";
import { MILESTONES, MilestoneCategory } from "@/shared/templates/milestone-templates";

interface MilestoneListDialogProps {
  birthDate: Date;
  open: boolean;
  onClose: () => void;
}

const CATEGORIES: MilestoneCategory[] = [
  '대근육발달',
  '소근육발달',
  '언어발달',
  '인지사회성발달'
];

export function MilestoneListDialog({
  birthDate,
  open,
  onClose
}: MilestoneListDialogProps) {
  const { currentAgeMonths, getMilestoneStatus } = useMilestones(birthDate);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  // 로컬 스토리지에서 완료 체크 불러오기
  useEffect(() => {
    const storageKey = `milestones-${birthDate.toISOString()}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setCompletedIds(new Set(JSON.parse(saved)));
      } catch (error) {
        console.error('Failed to load milestone completions:', error);
      }
    }
  }, [birthDate]);

  const toggleCompleted = (milestoneId: string) => {
    const newSet = new Set(completedIds);
    if (newSet.has(milestoneId)) {
      newSet.delete(milestoneId);
    } else {
      newSet.add(milestoneId);
    }
    setCompletedIds(newSet);
    
    // 로컬 스토리지에 저장
    const storageKey = `milestones-${birthDate.toISOString()}`;
    localStorage.setItem(storageKey, JSON.stringify(Array.from(newSet)));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>성장 발달 일정표</DialogTitle>
          <DialogDescription>
            현재 아기 개월수: <span className="font-bold text-blue-600">{currentAgeMonths}개월</span>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="대근육발달" className="w-full flex-1 min-h-0 flex flex-col">
          <TabsList className="grid grid-cols-4 w-full flex-shrink-0">
            <TabsTrigger value="대근육발달">대근육</TabsTrigger>
            <TabsTrigger value="소근육발달">소근육</TabsTrigger>
            <TabsTrigger value="언어발달">언어</TabsTrigger>
            <TabsTrigger value="인지사회성발달">인지·사회성</TabsTrigger>
          </TabsList>

          {CATEGORIES.map(category => (
            <TabsContent 
              key={category} 
              value={category}
              className="space-y-2 overflow-y-auto flex-1 pr-2"
            >
              {MILESTONES
                .filter(m => m.category === category)
                .map(milestone => (
                  <MilestoneItem
                    key={milestone.id}
                    milestone={milestone}
                    status={getMilestoneStatus(milestone)}
                    isCompleted={completedIds.has(milestone.id)}
                    onToggleComplete={() => toggleCompleted(milestone.id)}
                  />
                ))
              }
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
