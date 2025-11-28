"use client";

import { Button } from "@/components/ui/button";
import { ScrollablePicker } from "./ScrollablePicker";
import { MeasurementAnalysis } from "./MeasurementAnalysis";
import {
  useMeasurementForm,
  weightOptions,
  heightOptions,
} from "../hooks/useMeasurementForm";

interface AddMeasurementFormProps {
  babyId: string;
  onSuccess: () => void;
}

export function AddMeasurementForm({
  babyId,
  onSuccess,
}: AddMeasurementFormProps) {
  const formState = useMeasurementForm(babyId, onSuccess);

  const handleWeightScroll = () => {
    if (!formState.weightRef.current) return;
    const scrollTop = formState.weightRef.current.scrollTop;
    const index = Math.round(scrollTop / 50);
    const value = parseFloat(weightOptions[index] || weightOptions[0]);
    formState.setSelectedWeight(value);
  };

  const handleHeightScroll = () => {
    if (!formState.heightRef.current) return;
    const scrollTop = formState.heightRef.current.scrollTop;
    const index = Math.round(scrollTop / 50);
    const value = parseFloat(heightOptions[index] || heightOptions[0]);
    formState.setSelectedHeight(value);
  };

  return (
    <div className="space-y-4">
      {formState.showResult && formState.analysisResult ? (
        <MeasurementAnalysis
          analysis={formState.analysisResult}
          onClose={() => {
            formState.setShowResult(false);
            onSuccess();
          }}
        />
      ) : (
        <>
          {/* 최근 측정값 표시 */}
          {formState.latestMeasurement && (
            <div className="bg-blue-50 rounded-lg p-3 mb-4 text-center border border-blue-100">
              <p className="text-xs text-gray-500 mb-1">
                최근 기록 (
                {formState.latestMeasurement.date.toLocaleDateString()})
              </p>
              <div className="flex justify-center items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] sm:text-xs text-gray-400">
                    체중
                  </span>
                  <span className="text-base sm:text-lg font-bold text-blue-600">
                    {formState.latestMeasurement.weight}kg
                  </span>
                </div>
                <div className="w-px h-8 bg-gray-200"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] sm:text-xs text-gray-400">
                    키
                  </span>
                  <span className="text-base sm:text-lg font-bold text-green-600">
                    {formState.latestMeasurement.height}cm
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 체중/키 선택 그리드 */}
          <div className="grid grid-cols-2 gap-4">
            <ScrollablePicker
              options={weightOptions}
              value={formState.selectedWeight}
              onChange={formState.setSelectedWeight}
              label="스크롤로 선택"
              unit="kg"
              color="blue"
              isEditing={formState.isEditingWeight}
              onEditingChange={formState.setIsEditingWeight}
              scrollRef={formState.weightRef}
              onScroll={handleWeightScroll}
              onSyncScroll={formState.syncWeightScroll}
              onSave={formState.handleSave}
            />

            <ScrollablePicker
              options={heightOptions}
              value={formState.selectedHeight}
              onChange={formState.setSelectedHeight}
              label="스크롤로 선택"
              unit="cm"
              color="green"
              isEditing={formState.isEditingHeight}
              onEditingChange={formState.setIsEditingHeight}
              scrollRef={formState.heightRef}
              onScroll={handleHeightScroll}
              onSyncScroll={formState.syncHeightScroll}
              onSave={formState.handleSave}
            />
          </div>

          {/* 안내 패널 */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border-2 border-blue-200">
            <div className="flex items-start gap-3">
              <div className="text-3xl">💡</div>
              <div className="flex-1">
                <h3 className="font-bold text-blue-800 text-sm mb-2">
                  키와 체중을 입력하면
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-lg">📊</span>
                    <span className="text-gray-700">성장 백분위</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-lg">🍼</span>
                    <span className="text-gray-700">권장 수유량</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-lg">😴</span>
                    <span className="text-gray-700">권장 수면</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-lg">💊</span>
                    <span className="text-gray-700">약 적정 용량</span>
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  을 즉시 알려드려요!
                </p>
              </div>
            </div>
          </div>

          {/* 저장 버튼 */}
          <Button
            onClick={formState.handleSave}
            disabled={formState.isSaving}
            className="w-full"
            size="lg"
          >
            {formState.isSaving ? "저장 중..." : "기록하기"}
          </Button>
        </>
      )}
    </div>
  );
}
