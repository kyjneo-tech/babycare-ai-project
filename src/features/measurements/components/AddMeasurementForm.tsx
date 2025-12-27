"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { ScrollablePicker } from "./ScrollablePicker";
import { MeasurementAnalysis } from "./MeasurementAnalysis";
import { GuestModeDialog } from '@/components/common/GuestModeDialog';
import { toast } from '@/hooks/use-toast';
import {
  useMeasurementForm,
  weightOptions,
  heightOptions,
} from "../hooks/useMeasurementForm";

interface AddMeasurementFormProps {
  babyId: string;
  onSuccess: () => void;
  onCloseDialog?: () => void; // Dialog 닫기 함수 추가
}

export function AddMeasurementForm({
  babyId,
  onSuccess,
  onCloseDialog,
}: AddMeasurementFormProps) {
  const { status } = useSession();
  const isGuestMode = status === 'unauthenticated';
  const [showGuestDialog, setShowGuestDialog] = useState(false);
  
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

  const handleSaveClick = () => {
    if (isGuestMode) {
      setShowGuestDialog(true);
      return;
    }
    formState.handleSave();
  }

  const isDisabled = formState.isSaving || isGuestMode;

  return (
    <div className="space-y-4">
      {formState.showResult && formState.analysisResult ? (
        <MeasurementAnalysis
          analysis={formState.analysisResult}
          onClose={() => {
            // 토스트로 성장 정보 표시
            toast({
              title: "✅ 키 & 체중이 기록되었어요!",
              description: `체중 백분위: ${formState.analysisResult.percentile.label} · 키 백분위: ${formState.analysisResult.heightPercentile.label}`,
              variant: "success",
              duration: 4000,
            });

            // 상태 초기화
            formState.setShowResult(false);

            // Dialog 닫기
            onCloseDialog?.();

            // 데이터 새로고침
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
          <div className="grid grid-cols-1 gap-4">
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
              onSave={handleSaveClick}
              disabled={isDisabled}
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
              onSave={handleSaveClick}
              disabled={isDisabled}
            />
          </div>

          {/* 안내 패널 */}
          <div className="p-3 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-xl border border-blue-100/50 shadow-sm">
            <div className="space-y-1.5">
              <div className="text-xs text-gray-700">
                <span className="flex items-center gap-1.5 mb-1">
                  <span>✨</span>
                  <span className="font-medium">키&체중을 입력하시면</span>
                </span>
                <div className="ml-5 flex items-center gap-1">
                  <span>📊</span>
                  <span className="font-semibold text-blue-700">성장 백분위</span>
                  <span className="text-gray-500">즉시 확인해 드리고요</span>
                </div>
              </div>
              <div className="text-xs text-gray-700">
                <span className="flex items-center gap-1.5 mb-1">
                  <span>📝</span>
                  <span className="font-medium">활동 기록 시</span>
                </span>
                <div className="ml-5 space-y-0.5">
                  <div className="flex items-center gap-1">
                    <span>🍼</span>
                    <span className="font-semibold text-purple-700">권장 수유량</span>
                    <span className="text-gray-500">과</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>💊</span>
                    <span className="font-semibold text-pink-700">약 적정 용량</span>
                    <span className="text-gray-500">자동 계산해 드려요</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 저장 버튼 */}
          <Button
            onClick={handleSaveClick}
            disabled={isDisabled}
            className="w-full"
            size="lg"
          >
            {formState.isSaving ? "저장 중..." : "기록하기"}
          </Button>
        </>
      )}
      <GuestModeDialog open={showGuestDialog} onOpenChange={setShowGuestDialog} />
    </div>
  );
}
