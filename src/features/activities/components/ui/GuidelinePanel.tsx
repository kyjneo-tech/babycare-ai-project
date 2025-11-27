// src/features/activities/components/ui/GuidelinePanel.tsx
"use client";

import {
  getFeedingGuideline,
  getSleepGuideline,
  getDexibuprofenGuideline,
  getIbuprofenGuideline,
  getAcetaminophenGuideline
} from "@/shared/lib/growthGuidelines";

interface GuidelinePanelProps {
  type: 'feeding' | 'sleep' | 'medicine';
  value: number;
  weight?: number | null;
  ageInMonths?: number;
  medicineName?: string;
  syrupConc?: number; // 시럽 농도 (mg/mL)
}

export function GuidelinePanel({ type, value, weight, ageInMonths, medicineName, syrupConc }: GuidelinePanelProps) {
  if (type === 'feeding' && weight) {
    const guide = getFeedingGuideline(weight);
    const amount = value;
    const isInRange = amount >= guide.perFeeding.min && amount <= guide.perFeeding.max;
    const percentage = Math.min((amount / guide.perFeeding.max) * 100, 100);

    return (
      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">💡</span>
          <span className="text-xs font-medium text-blue-800">
            권장 1회 수유량 (체중 {weight}kg 기준)
          </span>
        </div>
        <div className="text-sm text-blue-700 mb-2">
          {guide.perFeeding.min}~{guide.perFeeding.max}ml
        </div>

        {/* 프로그레스 바 */}
        {amount > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-600">
              <span>최소: {guide.perFeeding.min}ml</span>
              <span>최대: {guide.perFeeding.max}ml</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  isInRange ? 'bg-green-500' : 'bg-yellow-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="text-xs text-center mt-1">
              {isInRange
                ? '✅ 적정 범위입니다'
                : amount < guide.perFeeding.min
                ? '⚠️ 권장량보다 적습니다'
                : '⚠️ 권장량보다 많습니다'
              }
            </p>
          </div>
        )}
      </div>
    );
  }

  if (type === 'sleep' && typeof ageInMonths === 'number' &&ageInMonths >= 0) {
    const guide = getSleepGuideline(ageInMonths);

    return (
      <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">😴</span>
          <span className="text-xs font-medium text-purple-800">
            권장 수면 시간 (생후 {ageInMonths}개월 기준)
          </span>
        </div>
        <div className="text-sm text-purple-700">
          <p>하루 총 수면: {guide.total}</p>
          <p className="text-xs mt-1">낮잠: {guide.naps}</p>
        </div>
      </div>
    );
  }

  if (type === 'medicine' && weight && medicineName) {
    // 이부프로펜 계열
    if (
      medicineName.includes('이부프로펜') ||
      medicineName.includes('부루펜') ||
      medicineName.includes('챔프 파랑')
    ) {
      if (!syrupConc || syrupConc <= 0) {
        return (
          <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <div className="text-sm text-orange-800">
                <p className="font-medium">시럽 농도를 입력해주세요</p>
                <p className="text-xs mt-1">정확한 용량 계산을 위해 제품의 mg/mL 농도가 필요합니다.</p>
              </div>
            </div>
          </div>
        );
      }

      const guide = getIbuprofenGuideline(weight, syrupConc);
      const amount = value;
      const isInRange = !isNaN(amount) && amount > 0 && amount <= guide.maxSingleMl;

      return (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">💊</span>
            <span className="text-xs font-medium text-blue-800">
              권장 이부프로펜 용량 (체중 {weight}kg, {syrupConc}mg/mL 기준)
            </span>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-blue-700">
              <p className="font-medium">1회 권장: {guide.singleDoseMl}mL (10mg/kg)</p>
              <p className="text-xs mt-1">1회 최대: {guide.maxSingleMl}mL</p>
              <p className="text-xs">1일 최대: {guide.maxDailyMg}mg (4회 분할)</p>
              <p className="text-xs mt-2 text-blue-600">{guide.disclaimer}</p>
            </div>

            {!isNaN(amount) && amount > 0 && (
              <p className="text-xs text-center mt-2 font-medium">
                {isInRange
                  ? '✅ 안전한 용량입니다'
                  : '⚠️ 1회 최대량을 초과합니다'
                }
              </p>
            )}
          </div>
        </div>
      );
    }

    // 아세트아미노펜 계열
    if (
      medicineName.includes('아세트아미노펜') ||
      medicineName.includes('타이레놀') ||
      medicineName.includes('챔프 빨강') ||
      medicineName.includes('세토펜')
    ) {
      if (!syrupConc || syrupConc <= 0) {
        return (
          <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <div className="text-sm text-orange-800">
                <p className="font-medium">시럽 농도를 입력해주세요</p>
                <p className="text-xs mt-1">정확한 용량 계산을 위해 제품의 mg/mL 농도가 필요합니다.</p>
              </div>
            </div>
          </div>
        );
      }

      const guide = getAcetaminophenGuideline(weight, syrupConc);
      const amount = value;
      const isInRange = !isNaN(amount) && amount > 0 && amount <= guide.maxSingleMl;

      return (
        <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">💊</span>
            <span className="text-xs font-medium text-red-800">
              권장 아세트아미노펜 용량 (체중 {weight}kg, {syrupConc}mg/mL 기준)
            </span>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-red-700">
              <p className="font-medium">1회 권장: {guide.singleDoseMl}mL (12.5mg/kg)</p>
              <p className="text-xs mt-1">1회 최대: {guide.maxSingleMl}mL</p>
              <p className="text-xs">1일 최대: {guide.maxDailyMg}mg (4회 분할)</p>
              <p className="text-xs mt-2 text-red-600">{guide.disclaimer}</p>
            </div>

            {!isNaN(amount) && amount > 0 && (
              <p className="text-xs text-center mt-2 font-medium">
                {isInRange
                  ? '✅ 안전한 용량입니다'
                  : '⚠️ 1회 최대량을 초과합니다'
                }
              </p>
            )}
          </div>
        </div>
      );
    }

    // 덱시부프로펜 계열
    if (
      medicineName.includes('덱시') ||
      medicineName.includes('맥시') ||
      medicineName.includes('애니펜')
    ) {
      const guide = getDexibuprofenGuideline(weight);
      const amount = value;
      const [minDose, maxDose] = guide.dose.split('~').map(d => parseFloat(d));
      const isInRange = !isNaN(amount) && amount >= minDose && amount <= maxDose;

      return (
        <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">💊</span>
            <span className="text-xs font-medium text-purple-800">
              권장 덱시부프로펜 용량 (체중 {weight}kg 기준)
            </span>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-purple-700">
              <p className="font-medium">{guide.dose}</p>
              <p className="text-xs mt-1 text-purple-600">{guide.disclaimer}</p>
            </div>

            {!isNaN(amount) && amount > 0 && (
              <p className="text-xs text-center mt-2 font-medium">
                {isInRange
                  ? '✅ 적정 용량입니다'
                  : amount < minDose
                  ? '⚠️ 권장량보다 적습니다'
                  : '⚠️ 권장량보다 많습니다'
                }
              </p>
            )}
          </div>
        </div>
      );
    }
  }

  return null;
}
