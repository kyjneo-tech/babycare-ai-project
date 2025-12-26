// src/features/activities/components/ui/GuidelinePanel.tsx
"use client";

import {
  getFeedingGuideline,
  getBabyFoodGuideline,
  getSleepGuideline,
  getDexibuprofenGuideline,
  getIbuprofenGuideline,
  getAcetaminophenGuideline
} from "@/shared/lib/growthGuidelines";

interface GuidelinePanelProps {
  type: 'feeding' | 'baby_food' | 'sleep' | 'medicine';
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
      <div className="mt-3 p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">💡</span>
          <span className="text-xs font-medium text-blue-200">
            권장 1회 수유량 (체중 {weight}kg 기준)
          </span>
        </div>
        <div className="text-sm text-blue-300 mb-2">
          {guide.perFeeding.min}~{guide.perFeeding.max}ml
        </div>

        {/* 프로그레스 바 */}
        {amount > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-400">
              <span>최소: {guide.perFeeding.min}ml</span>
              <span>최대: {guide.perFeeding.max}ml</span>
            </div>
            <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  isInRange ? 'bg-green-500' : 'bg-yellow-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="text-xs text-center mt-1 text-slate-300">
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

  if (type === 'baby_food' && weight && typeof ageInMonths === 'number') {
    const guide = getBabyFoodGuideline(weight, ageInMonths);
    const amount = value;
    const isInRange = amount >= guide.min && amount <= guide.max;
    const percentage = Math.min((amount / guide.max) * 100, 100);

    return (
      <div className="mt-3 p-3 bg-orange-900/20 rounded-lg border border-orange-500/30">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🍚</span>
          <span className="text-xs font-medium text-orange-200">
            권장 1회 이유식량 ({guide.stage}, 체중 {weight}kg, 생후 {ageInMonths}개월)
          </span>
        </div>
        <div className="text-sm text-orange-300 mb-2">
          {guide.min}~{guide.max}g
        </div>

        {/* 프로그레스 바 */}
        {amount > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-400">
              <span>최소: {guide.min}g</span>
              <span>최대: {guide.max}g</span>
            </div>
            <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  isInRange ? 'bg-green-500' : 'bg-yellow-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="text-xs text-center mt-1 text-slate-300">
              {isInRange
                ? '✅ 적정 범위입니다'
                : amount < guide.min
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
      <div className="mt-3 p-3 bg-purple-900/20 rounded-lg border border-purple-500/30">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">😴</span>
          <span className="text-xs font-medium text-purple-200">
            권장 수면 시간 (생후 {ageInMonths}개월 기준)
          </span>
        </div>
        <div className="text-sm text-purple-300">
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
          <div className="mt-3 p-3 bg-orange-900/20 rounded-lg border border-orange-500/30">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <div className="text-sm text-orange-200">
                <p className="font-medium">약통 농도 정보를 입력해주세요</p>
                <p className="text-xs mt-1 text-orange-300">권장 용량을 계산하려면 약통 라벨에 적힌 총 mg과 총 mL을 입력해야 합니다.</p>
              </div>
            </div>
          </div>
        );
      }

      const guide = getIbuprofenGuideline(weight, syrupConc);
      const amount = value;
      const isInRange = !isNaN(amount) && amount > 0 && amount <= guide.maxSingleMl;
      const isTooMuch = !isNaN(amount) && amount > guide.maxSingleMl;
      const howMuchOver = isTooMuch ? ((amount / guide.singleDoseMl) * 100).toFixed(0) : 0;

      return (
        <div className="mt-3 p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
          <div className="space-y-3">
            {/* 권장 용량 */}
            <div>
              <p className="text-sm font-semibold text-blue-200 mb-1">✅ 권장 용량</p>
              <p className="text-sm text-blue-300">
                체중 <strong>{weight}kg</strong> 아기에게 <strong className="text-lg">{guide.singleDoseMl}mL</strong> 정도 먹이면 좋아요
              </p>
              <p className="text-xs text-blue-400 mt-1">
                (최대 {guide.maxSingleMl}mL까지 안전해요)
              </p>
            </div>

            {/* 입력값 평가 */}
            {!isNaN(amount) && amount > 0 && (
              <div className={`p-2 rounded ${isTooMuch ? 'bg-red-900/30 border border-red-500/50' : 'bg-green-900/30 border border-green-500/50'}`}>
                {isInRange ? (
                  <p className="text-sm text-green-300 font-medium">
                    ✅ 지금 <strong>{amount}mL</strong>는 안전한 용량이에요!
                  </p>
                ) : (
                  <div>
                    <p className="text-sm text-red-300 font-bold">
                      ⚠️ 지금 <strong>{amount}mL</strong>는 너무 많아요!
                    </p>
                    <p className="text-xs text-red-400 mt-1">
                      권장량의 약 {howMuchOver}%예요. 줄여주세요.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 간단한 안내 */}
            <p className="text-xs text-blue-400">
              💡 의사 처방량이 다르다면 처방대로 따라주세요.
            </p>
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
          <div className="mt-3 p-3 bg-orange-900/20 rounded-lg border border-orange-500/30">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <div className="text-sm text-orange-200">
                <p className="font-medium">약통 농도 정보를 입력해주세요</p>
                <p className="text-xs mt-1 text-orange-300">권장 용량을 계산하려면 약통 라벨에 적힌 총 mg과 총 mL을 입력해야 합니다.</p>
              </div>
            </div>
          </div>
        );
      }

      const guide = getAcetaminophenGuideline(weight, syrupConc);
      const amount = value;
      const isInRange = !isNaN(amount) && amount > 0 && amount <= guide.maxSingleMl;
      const isTooMuch = !isNaN(amount) && amount > guide.maxSingleMl;
      const howMuchOver = isTooMuch ? ((amount / guide.singleDoseMl) * 100).toFixed(0) : 0;

      return (
        <div className="mt-3 p-3 bg-red-900/20 rounded-lg border border-red-500/30">
          <div className="space-y-3">
            {/* 권장 용량 */}
            <div>
              <p className="text-sm font-semibold text-red-200 mb-1">✅ 권장 용량</p>
              <p className="text-sm text-red-300">
                체중 <strong>{weight}kg</strong> 아기에게 <strong className="text-lg">{guide.singleDoseMl}mL</strong> 정도 먹이면 좋아요
              </p>
              <p className="text-xs text-red-400 mt-1">
                (최대 {guide.maxSingleMl}mL까지 안전해요)
              </p>
            </div>

            {/* 입력값 평가 */}
            {!isNaN(amount) && amount > 0 && (
              <div className={`p-2 rounded ${isTooMuch ? 'bg-red-900/30 border border-red-500/50' : 'bg-green-900/30 border border-green-500/50'}`}>
                {isInRange ? (
                  <p className="text-sm text-green-300 font-medium">
                    ✅ 지금 <strong>{amount}mL</strong>는 안전한 용량이에요!
                  </p>
                ) : (
                  <div>
                    <p className="text-sm text-red-300 font-bold">
                      ⚠️ 지금 <strong>{amount}mL</strong>는 너무 많아요!
                    </p>
                    <p className="text-xs text-red-400 mt-1">
                      권장량의 약 {howMuchOver}%예요. 줄여주세요.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 간단한 안내 */}
            <p className="text-xs text-red-400">
              💡 의사 처방량이 다르다면 처방대로 따라주세요.
            </p>
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
      const isTooLittle = !isNaN(amount) && amount > 0 && amount < minDose;
      const isTooMuch = !isNaN(amount) && amount > maxDose;

      return (
        <div className="mt-3 p-3 bg-purple-900/20 rounded-lg border border-purple-500/30">
          <div className="space-y-3">
            {/* 권장 용량 */}
            <div>
              <p className="text-sm font-semibold text-purple-200 mb-1">✅ 권장 용량</p>
              <p className="text-sm text-purple-300">
                체중 <strong>{weight}kg</strong> 아기에게 <strong className="text-lg">{minDose}~{maxDose}mL</strong> 정도 먹이면 좋아요
              </p>
            </div>

            {/* 입력값 평가 */}
            {!isNaN(amount) && amount > 0 && (
              <div className={`p-2 rounded ${
                isInRange ? 'bg-green-900/30 border border-green-500/50' :
                isTooLittle ? 'bg-yellow-900/30 border border-yellow-500/50' :
                'bg-red-900/30 border border-red-500/50'
              }`}>
                {isInRange ? (
                  <p className="text-sm text-green-300 font-medium">
                    ✅ 지금 <strong>{amount}mL</strong>는 적정 용량이에요!
                  </p>
                ) : isTooLittle ? (
                  <p className="text-sm text-yellow-300 font-medium">
                    ⚠️ 지금 <strong>{amount}mL</strong>는 조금 적어요. {minDose}mL 이상 권장해요.
                  </p>
                ) : (
                  <p className="text-sm text-red-300 font-bold">
                    ⚠️ 지금 <strong>{amount}mL</strong>는 너무 많아요! {maxDose}mL 이하로 줄여주세요.
                  </p>
                )}
              </div>
            )}

            {/* 간단한 안내 */}
            <p className="text-xs text-purple-400">
              💡 의사 처방량이 다르다면 처방대로 따라주세요.
            </p>
          </div>
        </div>
      );
    }
  }

  return null;
}
