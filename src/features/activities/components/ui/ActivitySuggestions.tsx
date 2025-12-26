// src/features/activities/components/ui/ActivitySuggestions.tsx
"use client";

import { activityRelations, activityDetails } from "@/features/activities/lib/activityRelations";

type ActivityType =
  | "FEEDING"
  | "SLEEP"
  | "DIAPER"
  | "MEDICINE"
  | "TEMPERATURE";

interface ActivitySuggestionsProps {
  type: ActivityType;
}

export function ActivitySuggestions({ type }: ActivitySuggestionsProps) {
  // activityRelations가 없거나 suggestions가 없으면 렌더링하지 않음
  if (!activityRelations[type] || activityRelations[type].suggestions.length === 0) {
    return null;
  }

  return (
    <div className="p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg border border-purple-500/30">
      <div className="mb-3">
        <h3 className="text-sm font-bold text-purple-200 flex items-center gap-2">
          <span>💡</span>
          <span>함께 기록하면 좋은 항목</span>
        </h3>
        <p className="text-xs text-purple-300 mt-1">AI 상담을 더 정확하게 활용할 수 있어요</p>
      </div>
      <div className="space-y-2">
        {activityRelations[type].suggestions
          .sort((a, b) => a.priority - b.priority)
          .map((suggestion) => {
            const detail = activityDetails[suggestion.key];
            if (!detail) return null;
            return (
              <div
                key={suggestion.key}
                className={`flex items-start gap-3 p-2 rounded-md ${
                  suggestion.priority === 1
                    ? 'bg-yellow-900/30 border border-yellow-500/50'
                    : 'bg-white/5 border border-purple-500/20'
                }`}
              >
                <span className="text-2xl">{detail.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-100">
                      {detail.label}
                    </span>
                    {suggestion.priority === 1 && (
                      <span className="text-xs bg-yellow-600 text-white px-2 py-0.5 rounded-full font-bold">
                        ⭐ 중요
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{suggestion.reason}</p>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
