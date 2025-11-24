"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Activity, BarChart3, MessageSquare } from "lucide-react";

type TabType = "activities" | "analytics" | "ai-chat";

interface BabyDetailTabsProps {
  babyId: string;
}

export function BabyDetailTabs({ babyId }: BabyDetailTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 유효한 탭 값 검증
  const validTabs: TabType[] = ["activities", "analytics", "ai-chat"];
  const tabParam = searchParams.get("tab");
  const currentTab: TabType = 
    tabParam && validTabs.includes(tabParam as TabType)
      ? (tabParam as TabType)
      : "activities";

  const tabs = [
    { id: "activities" as const, label: "기록", icon: Activity },
    { id: "analytics" as const, label: "통계", icon: BarChart3 },
    { id: "ai-chat" as const, label: "AI 상담", icon: MessageSquare },
  ];

  const handleTabChange = (tabId: TabType) => {
    router.push(`/dashboard/babies/${babyId}?tab=${tabId}`);
  };

  return (
    <div className="border-b border-gray-200 bg-white">
      <nav className="flex -mb-px" aria-label="Tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm
                transition-colors duration-200
                ${
                  isActive
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="w-5 h-5 mx-auto mb-1" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
