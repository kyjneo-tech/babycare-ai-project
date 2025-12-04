"use client";

import { useState, useEffect } from "react";
import { Note, MilestoneProgress } from "@prisma/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Sparkles } from "lucide-react";
import { toggleMilestoneItemAction, addMilestoneItemMemoAction, getMilestoneProgressAction } from "@/features/milestones/actions";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import ConfettiExplosion from "react-confetti-explosion";
import { useRouter } from "next/navigation";

interface MilestoneChecklistViewProps {
  note: Note;
}

type CategoryData = {
  name: string;
  icon: string;
  label: string;
  items: string[];
};

const CATEGORIES: CategoryData[] = [
  { name: "grossMotor", icon: "🏃", label: "대근육 발달", items: [] },
  { name: "fineMotor", icon: "✋", label: "소근육 발달", items: [] },
  { name: "language", icon: "💬", label: "언어 발달", items: [] },
  { name: "social", icon: "👶", label: "사회성 발달", items: [] },
];

export function MilestoneChecklistView({ note }: MilestoneChecklistViewProps) {
  const router = useRouter();
  const [progress, setProgress] = useState<MilestoneProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [celebrateIndex, setCelebrateIndex] = useState<string | null>(null);
  const [memoDialogOpen, setMemoDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ category: string; index: number; progressId?: string } | null>(null);
  const [memoText, setMemoText] = useState("");

  // Parse content to extract categories
  const categories = parseMilestoneContent(note.content || "");

  useEffect(() => {
    loadProgress();
  }, [note.id]);

  const loadProgress = async () => {
    setIsLoading(true);
    const result = await getMilestoneProgressAction(note.id);
    if (result.success) {
      setProgress(result.data);
    }
    setIsLoading(false);
  };

  const handleToggle = async (category: string, itemIndex: number) => {
    const existing = progress.find(
      (p) => p.category === category && p.itemIndex === itemIndex
    );

    const result = await toggleMilestoneItemAction(note.id, category, itemIndex);
    
    if (result.success) {
      // Show celebration if newly achieved
      if (result.data.achieved && !existing?.achieved) {
        setCelebrateIndex(`${category}-${itemIndex}`);
        setTimeout(() => setCelebrateIndex(null), 3000);
      }

      await loadProgress();
      // router.refresh();
    }
  };

  const handleAddMemo = async () => {
    if (!selectedItem || !memoText.trim()) return;

    const existing = progress.find(
      (p) => p.category === selectedItem.category && p.itemIndex === selectedItem.index
    );

    if (existing) {
      const result = await addMilestoneItemMemoAction(existing.id, memoText);
      if (result.success) {
        await loadProgress();
        setMemoDialogOpen(false);
        setMemoText("");
        setSelectedItem(null);
      }
    }
  };

  const getItemProgress = (category: string, index: number) => {
    return progress.find((p) => p.category === category && p.itemIndex === index);
  };

  const getCategoryStats = (category: string) => {
    const categoryItems = categories.find((c) => c.name === category)?.items || [];
    const categoryProgress = progress.filter((p) => p.category === category);
    const achieved = categoryProgress.filter((p) => p.achieved).length;
    return { total: categoryItems.length, achieved };
  };

  const getTotalStats = () => {
    const total = categories.reduce((sum, cat) => sum + cat.items.length, 0);
    const achieved = progress.filter((p) => p.achieved).length;
    return { total, achieved, percentage: total > 0 ? Math.round((achieved / total) * 100) : 0 };
  };

  const totalStats = getTotalStats();

  if (isLoading) {
    return <div className="text-center py-4 text-gray-500">로딩 중...</div>;
  }

  return (
    <div className="space-y-4">
      {/* 전체 진행률 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">전체 달성률</h3>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {totalStats.achieved}/{totalStats.total} 항목
          </Badge>
        </div>
        <Progress value={totalStats.percentage} className="h-3 mb-2" />
        <p className="text-sm text-gray-600">
          {totalStats.percentage}% 완료 {totalStats.achieved > 0 && "🎉"}
        </p>
      </div>

      {/* 카테고리별 Accordion */}
      <Accordion type="multiple" className="space-y-2">
        {categories.map((category) => {
          const stats = getCategoryStats(category.name);
          const percentage = stats.total > 0 ? Math.round((stats.achieved / stats.total) * 100) : 0;

          return (
            <AccordionItem key={category.name} value={category.name} className="border rounded-lg">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{category.icon}</span>
                    <span className="font-medium">{category.label}</span>
                  </div>
                  <Badge variant="outline" className={stats.achieved === stats.total && stats.total > 0 ? "bg-green-50 text-green-700 border-green-200" : ""}>
                    {stats.achieved}/{stats.total}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-3">
                  {category.items.map((item, index) => {
                    const itemProgress = getItemProgress(category.name, index);
                    const isAchieved = itemProgress?.achieved || false;
                    const isCelebrating = celebrateIndex === `${category.name}-${index}`;

                    return (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-md hover:bg-gray-50 transition-colors relative">
                        {isCelebrating && (
                          <div className="absolute top-0 left-1/2 -translate-x-1/2">
                            <ConfettiExplosion
                              force={0.4}
                              duration={2500}
                              particleCount={30}
                              width={400}
                            />
                          </div>
                        )}
                        
                        <Checkbox
                          checked={isAchieved}
                          onCheckedChange={() => handleToggle(category.name, index)}
                          className="mt-0.5"
                        />
                        
                        <div className="flex-1">
                          <p className={`text-sm ${isAchieved ? "line-through text-gray-500" : "text-gray-900"}`}>
                            {item}
                          </p>
                          
                          {itemProgress?.achievedAt && (
                            <p className="text-xs text-gray-500 mt-1">
                              달성: {format(new Date(itemProgress.achievedAt), "yyyy년 M월 d일", { locale: ko })}
                            </p>
                          )}
                          
                          {itemProgress?.memo && (
                            <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-gray-700">
                              💭 {itemProgress.memo}
                            </div>
                          )}
                        </div>

                        {isAchieved && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedItem({ category: category.name, index, progressId: itemProgress?.id });
                              setMemoText(itemProgress?.memo || "");
                              setMemoDialogOpen(true);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <MessageSquare className="h-4 w-4 text-gray-500" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* 메모 추가 Dialog */}
      <Dialog open={memoDialogOpen} onOpenChange={setMemoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>달성 메모 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="예: 오늘 처음 뒤집었어요! 🎉"
              value={memoText}
              onChange={(e) => setMemoText(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setMemoDialogOpen(false)}>
                취소
              </Button>
              <Button onClick={handleAddMemo}>
                저장
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper function to parse milestone content
function parseMilestoneContent(content: string): CategoryData[] {
  const categories: CategoryData[] = [];
  const lines = content.split("\n");
  
  let currentCategory: CategoryData | null = null;
  
  for (const line of lines) {
    if (line.includes("🏃 대근육 발달")) {
      currentCategory = { name: "grossMotor", icon: "🏃", label: "대근육 발달", items: [] };
      categories.push(currentCategory);
    } else if (line.includes("✋ 소근육 발달")) {
      currentCategory = { name: "fineMotor", icon: "✋", label: "소근육 발달", items: [] };
      categories.push(currentCategory);
    } else if (line.includes("💬 언어 발달")) {
      currentCategory = { name: "language", icon: "💬", label: "언어 발달", items: [] };
      categories.push(currentCategory);
    } else if (line.includes("👶 사회성 발달")) {
      currentCategory = { name: "social", icon: "👶", label: "사회성 발달", items: [] };
      categories.push(currentCategory);
    } else if (line.startsWith("☐ ") && currentCategory) {
      currentCategory.items.push(line.replace("☐ ", "").trim());
    }
  }
  
  return categories;
}
