import { activityTypeLabels } from "@/shared/utils/activityLabels";
import type { ActivityType } from "@prisma/client";

interface DailySummaryData {
  [key: string]: {
    count: number;
    totalAmount?: number;
    totalDuration?: number;
  };
}

interface DailySummaryProps {
  summary: DailySummaryData;
}

export function DailySummary({ summary }: DailySummaryProps) {
  const summaryItems = Object.entries(summary).map(([type, data]) => {
    const label = activityTypeLabels[type as ActivityType];
    let detail = `${data.count}회`;

    if (data.totalAmount && data.totalAmount > 0) {
      detail += ` ${data.totalAmount}ml`;
    } else if (data.totalDuration && data.totalDuration > 0) {
      const hours = Math.floor(data.totalDuration / 60);
      const minutes = data.totalDuration % 60;
      if (hours > 0) {
        detail += ` ${hours}시간`;
        if (minutes > 0) detail += ` ${minutes}분`;
      } else {
        detail += ` ${minutes}분`;
      }
    }

    return { label, detail };
  });

  if (summaryItems.length === 0) return null;

  return (
    <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-100">
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-700">
        {summaryItems.map((item, index) => (
          <span key={index}>
            <span className="font-medium">{item.label}</span> {item.detail}
          </span>
        ))}
      </div>
    </div>
  );
}
