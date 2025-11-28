"use client";

import { Button } from "@/components/ui/button";
import { SPACING } from "@/design-system";
import { cn } from "@/lib/utils";

interface MeasurementAnalysisProps {
  analysis: {
    percentile: { label: string; value: number };
    heightPercentile: { label: string; value: number };
    feeding: {
      daily: { min: number; max: number };
      perFeeding: { min: number; max: number };
    };
    sleep: { total: string; naps: string };
    medicine: { dose: string; disclaimer: string };
    ageInMonths: number;
    weight: number;
  } | null;
  onClose: () => void;
}

export function MeasurementAnalysis({
  analysis,
  onClose,
}: MeasurementAnalysisProps) {
  if (!analysis) return null;

  return (
    <div className="bg-white rounded-xl border-2 border-blue-100 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 헤더 */}
      <div className="bg-blue-50 p-4 border-b border-blue-100">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">✨</span>
          <h3 className="font-bold text-lg text-blue-900">성장 분석 결과</h3>
        </div>
        <p className="text-sm text-blue-700">
          생후 {analysis.ageInMonths}개월, {analysis.weight}kg
        </p>
      </div>

      {/* 내용 */}
      <div className="p-4 space-y-4">
        {/* 체중 백분위 */}
        <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              체중 백분위
            </span>
            <span className="text-lg font-bold text-blue-600">
              {analysis.percentile.label}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-500 h-2.5 rounded-full transition-all duration-1000"
              style={{ width: `${analysis.percentile.value}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-right">
            {analysis.percentile.value}번째 백분위 (100명 중{" "}
            {100 - analysis.percentile.value}등)
          </p>
        </div>

        {/* 키 백분위 */}
        <div className="bg-green-50/50 rounded-lg p-4 border border-green-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">키 백분위</span>
            <span className="text-lg font-bold text-green-600">
              {analysis.heightPercentile.label}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-green-500 h-2.5 rounded-full transition-all duration-1000"
              style={{ width: `${analysis.heightPercentile.value}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-right">
            {analysis.heightPercentile.value}번째 백분위 (100명 중{" "}
            {100 - analysis.heightPercentile.value}등)
          </p>
        </div>

        {/* 가이드 그리드 */}
        <div className="grid grid-cols-1 gap-3">
          {/* 수유 */}
          <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
            <span className="text-xl mt-0.5">🍼</span>
            <div>
              <h4 className="font-bold text-sm text-orange-900 mb-1">
                권장 수유량
              </h4>
              <p className="text-sm text-orange-800">
                하루: {analysis.feeding.daily.min}~{analysis.feeding.daily.max}
                ml
              </p>
              <p className="text-xs text-orange-700 mt-0.5">
                1회: {analysis.feeding.perFeeding.min}~
                {analysis.feeding.perFeeding.max}ml
              </p>
            </div>
          </div>

          {/* 해열제 */}
          <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
            <span className="text-xl mt-0.5">💊</span>
            <div>
              <h4 className="font-bold text-sm text-red-900 mb-1">
                해열제 용량
              </h4>
              <p className="text-sm text-red-800 font-medium">
                {analysis.medicine.dose}
              </p>
              <p className="text-[10px] text-red-600 mt-1 leading-tight">
                {analysis.medicine.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 버튼 */}
      <div className={cn("p-4 bg-muted border-t", SPACING.card.small)}>
        <Button onClick={onClose} className="w-full" size="lg">
          확인
        </Button>
      </div>
    </div>
  );
}
