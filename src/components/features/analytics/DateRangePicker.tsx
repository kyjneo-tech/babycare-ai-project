"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface DateRangePickerProps {
  babyId: string;
  currentStartDate: Date;
  currentEndDate: Date;
}

export function DateRangePicker({
  babyId,
  currentStartDate,
  currentEndDate,
}: DateRangePickerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customStart, setCustomStart] = useState(
    currentStartDate.toISOString().split("T")[0]
  );
  const [customEnd, setCustomEnd] = useState(
    currentEndDate.toISOString().split("T")[0]
  );

  const setDateRange = (days: number, isSingleDay: boolean = false) => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date();
    
    if (isSingleDay) {
      // Single day: start and end are the same day
      start.setDate(start.getDate() - (days - 1));
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() - (days - 1));
      end.setHours(23, 59, 59, 999);
    } else {
      // Range: last N days including today
      start.setDate(start.getDate() - (days - 1));
      start.setHours(0, 0, 0, 0);
    }

          router.push(
            `/analytics/${babyId}?start=${start.toISOString().split("T")[0]}&end=${end.toISOString().split("T")[0]}`
          );  };

  const applyCustomRange = () => {
    const start = new Date(customStart);
    const end = new Date(customEnd);

    // Validate: max 90 days
    const diffDays = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays > 90) {
      alert("최대 90일까지만 조회할 수 있습니다.");
      return;
    }
    if (diffDays < 0) {
      alert("시작 날짜가 종료 날짜보다 늦을 수 없습니다.");
      return;
    }

          router.push(
            `/analytics/${babyId}?start=${customStart}&end=${customEnd}`
          );    setShowCustomPicker(false);
  };

  const getDaysDiff = () => {
    return Math.ceil(
      (currentEndDate.getTime() - currentStartDate.getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Date Display */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">기간:</span>
          <span className="text-sm text-gray-600">
            {currentStartDate.toLocaleDateString("ko-KR")} ~{" "}
            {currentEndDate.toLocaleDateString("ko-KR")}
          </span>
          <span className="text-xs text-gray-500">({getDaysDiff()}일)</span>
        </div>

        {/* Quick Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setDateRange(1, true)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              getDaysDiff() === 1
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            1일전
          </button>
          <button
            onClick={() => setDateRange(3, false)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              getDaysDiff() === 3
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            지난 3일
          </button>
          <button
            onClick={() => setDateRange(7, false)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              getDaysDiff() === 7
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            지난 7일
          </button>
          <button
            onClick={() => setDateRange(30, false)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              getDaysDiff() === 30
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            지난 30일
          </button>
          <button
            onClick={() => setShowCustomPicker(!showCustomPicker)}
            className="px-3 py-1.5 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            기간 선택
          </button>
        </div>
      </div>

      {/* Custom Date Picker */}
      {showCustomPicker && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                시작 날짜
              </label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                종료 날짜
              </label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={applyCustomRange}
                className="px-4 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
              >
                적용
              </button>
              <button
                onClick={() => setShowCustomPicker(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            * 최대 90일까지 조회할 수 있습니다.
          </p>
        </div>
      )}
    </div>
  );
}
