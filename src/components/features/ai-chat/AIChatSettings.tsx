"use client";

import { useState, useEffect } from "react";
import { updateBabyAISettings, getBabyAISettings } from "@/features/ai-chat/actions";

interface AISettings {
  feeding: boolean;
  sleep: boolean;
  diaper: boolean;
  growth: boolean;
  medication: boolean;
  temperature: boolean;
  bath: boolean;
  play: boolean;
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
};

export function AIChatSettings({ babyId }: { babyId: string }) {
  const [isOpen, setIsOpen] = useState(false);
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

  const handleToggle = async (key: keyof AISettings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    
    if (babyId === "guest-baby-id") return;

    setLoading(true);
    try {
      await updateBabyAISettings(babyId, newSettings);
    } catch (error) {
      console.error("설정 저장 실패:", error);
      setSettings(settings);
    } finally {
      setLoading(false);
    }
  };

  const SETTING_ITEMS = [
    { key: "feeding", label: "수유", icon: "🍼" },
    { key: "sleep", label: "수면", icon: "😴" },
    { key: "diaper", label: "배변", icon: "💩" },
    { key: "growth", label: "키/체중", icon: "📏" },
    { key: "medication", label: "투약", icon: "💊" },
    { key: "temperature", label: "체온", icon: "🌡️" },
    { key: "bath", label: "목욕", icon: "🛁" },
    { key: "play", label: "놀이", icon: "🧸" },
  ] as const;

  return (
    <div className="w-full px-4 py-3 bg-white border-b">
      <p className="text-xs text-gray-500 mb-2 text-center">
        AI가 상담 시 참고할 기록을 선택해주세요. (선택된 항목만 분석에 활용됩니다)
      </p>
      <div className="flex flex-wrap gap-2 items-center justify-center">
        {SETTING_ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={() => handleToggle(item.key)}
            disabled={loading}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border
              ${
                settings[item.key]
                  ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm ring-1 ring-blue-100"
                  : "bg-white text-gray-400 border-gray-200 hover:bg-gray-50"
              }
            `}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
            {settings[item.key] && <span className="text-blue-500 ml-0.5 font-bold">✓</span>}
          </button>
        ))}
      </div>
      {loading && <div className="h-0.5 w-full bg-blue-50 mt-2 overflow-hidden rounded-full">
        <div className="h-full bg-blue-400 animate-progress w-1/3"></div>
      </div>}
    </div>
  );
}
