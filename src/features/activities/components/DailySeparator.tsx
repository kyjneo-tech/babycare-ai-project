import { format, isToday, isYesterday } from "date-fns";
import { ko } from "date-fns/locale";

interface DailySeparatorProps {
  date: Date;
}

export function DailySeparator({ date }: DailySeparatorProps) {
  const getDateLabel = () => {
    if (isToday(date)) return "오늘";
    if (isYesterday(date)) return "어제";
    return format(date, "M월 d일 (EEE)", { locale: ko });
  };

  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-gray-300" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-white px-4 text-sm font-semibold text-gray-700">
          {getDateLabel()}
        </span>
      </div>
    </div>
  );
}
