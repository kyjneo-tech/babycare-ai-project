"use client";

import { useState, useEffect } from "react";
import { updateBabyAISettings, getBabyAISettings } from "@/features/ai-chat/actions";
import { CheckboxListDialog, CheckboxItem } from "@/components/ui/checkbox-list-dialog";
import { Button } from "@/components/ui/button";

interface AISettings {
  feeding: boolean;
  sleep: boolean;
  diaper: boolean;
  growth: boolean;
  medication: boolean;
  temperature: boolean;
  bath: boolean;
  play: boolean;
  other: boolean;
}

const DEFAULT_SETTINGS: AISettings = {
  feeding: true,
  sleep: true,
  diaper: true,
  growth: true,
  medication: true,
  temperature: true,
  bath: true,
  play: true,
  other: false,
};

export function AIChatSettings({ babyId }: { babyId: string }) {
  const [settings, setSettings] = useState<AISettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);

  // 초기 설정 로드
  useEffect(() => {
    if (babyId === "guest-baby-id") return;
    
    const loadSettings = async () => {
      const result = await getBabyAISettings(babyId);
      if (result.success && result.data) {
        setSettings(result.data as AISettings);
      }
    };
    loadSettings();
  }, [babyId]);

  const SETTING_ITEMS = [
    { key: "feeding", label: "수유", icon: "🍼" },
    { key: "sleep", label: "수면", icon: "😴" },
    { key: "diaper", label: "배변", icon: "💩" },
    { key: "growth", label: "키/체중", icon: "📏" },
    { key: "medication", label: "투약", icon: "💊" },
    { key: "temperature", label: "체온", icon: "🌡️" },
    { key: "bath", label: "목욕", icon: "🛁" },
    { key: "play", label: "놀이", icon: "🧸" },
    { key: "other", label: "이름 & 개월수", icon: "💬" },
  ] as const;

  const checkboxItems: CheckboxItem[] = SETTING_ITEMS.map((item) => ({
    key: item.key,
    label: item.label,
    icon: item.icon,
    checked: settings[item.key],
  }));

  const handleSave = async (selectedKeys: string[]) => {
    const newSettings = { ...DEFAULT_SETTINGS };
    selectedKeys.forEach((key) => {
      newSettings[key as keyof AISettings] = true;
    });

    setSettings(newSettings);
    
    if (babyId === "guest-baby-id") return;

    setLoading(true);
    try {
      await updateBabyAISettings(babyId, newSettings);
    } catch (error) {
      console.error("설정 저장 실패:", error);
      setSettings(settings); // 롤백
    } finally {
      setLoading(false);
    }
  };

  const selectedCount = Object.values(settings).filter(Boolean).length;

  return (
    <div className="w-full px-4 py-2 bg-white border-b">
      <div className="flex items-center justify-center gap-2">
        <p className="text-xs text-gray-500">
          상담에 쓰일 기록 선택
        </p>
        <CheckboxListDialog
          title="상담에 쓰일 기록 선택"
          description="AI가 참고할 기록을 선택하세요"
          items={checkboxItems}
          onSave={handleSave}
          trigger={
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={loading}
            >
              <span className="text-xs">
                {selectedCount}개 선택됨
              </span>
            </Button>
          }
        />
      </div>
      {loading && (
        <div className="h-0.5 w-full bg-blue-50 mt-1 overflow-hidden rounded-full">
          <div className="h-full bg-blue-400 animate-progress w-1/3"></div>
        </div>
      )}
    </div>
  );
}
