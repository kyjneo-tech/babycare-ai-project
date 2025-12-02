"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { BabyMeasurement } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { MeasurementAnalysis } from "./MeasurementAnalysis";
import { ScrollablePicker } from "./ScrollablePicker";
import { updateMeasurement } from "../actions";
import {
  AnalysisResult,
  weightOptions,
  heightOptions,
} from "../hooks/useMeasurementForm";
import {
  getWeightPercentile,
  getHeightPercentile,
  getFeedingGuideline,
  getSleepGuideline,
  getDexibuprofenGuideline,
} from "@/shared/lib/growthGuidelines";
import { differenceInMonths } from "date-fns";

interface EditMeasurementFormProps {
  measurement: BabyMeasurement;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditMeasurementForm({
  measurement,
  onSuccess,
  onCancel,
}: EditMeasurementFormProps) {
  const router = useRouter();
  const [selectedWeight, setSelectedWeight] = useState(measurement.weight);
  const [selectedHeight, setSelectedHeight] = useState(measurement.height);
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [isEditingHeight, setIsEditingHeight] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [babyInfo, setBabyInfo] = useState<{
    birthDate: Date;
    gender: "male" | "female";
  } | null>(null);

  const weightRef = useRef<HTMLDivElement>(null);
  const heightRef = useRef<HTMLDivElement>(null);

  // 아기 정보 로드 및 스크롤 위치 초기화
  useEffect(() => {
    const loadBabyInfo = async () => {
      try {
        const { getBabyById } = await import("@/features/babies/actions");
        const babyResult = await getBabyById(measurement.babyId);

        if (babyResult.success && babyResult.data) {
          setBabyInfo({
            birthDate: new Date(babyResult.data.birthDate),
            gender: babyResult.data.gender as "male" | "female",
          });
        }
      } catch (error) {
        console.error("Failed to load baby info:", error);
      }
    };

    loadBabyInfo();

    // 스크롤 위치 조정
    setTimeout(() => {
      if (weightRef.current) {
        const weightIndex = weightOptions.findIndex(
          (w) => Math.abs(parseFloat(w) - measurement.weight) < 0.05
        );
        if (weightIndex !== -1) {
          weightRef.current.scrollTop = weightIndex * 50;
        }
      }
      if (heightRef.current) {
        const heightIndex = heightOptions.findIndex(
          (h) => Math.abs(parseFloat(h) - measurement.height) < 0.25
        );
        if (heightIndex !== -1) {
          heightRef.current.scrollTop = heightIndex * 50;
        }
      }
    }, 100);
  }, [measurement.babyId, measurement.weight, measurement.height]);

  const handleAnalyze = () => {
    if (!babyInfo) return;

    const ageInMonths = differenceInMonths(new Date(), babyInfo.birthDate);
    const percentile = getWeightPercentile(
      selectedWeight,
      ageInMonths,
      babyInfo.gender
    );
    const heightPercentile = getHeightPercentile(
      selectedHeight,
      ageInMonths,
      babyInfo.gender
    );
    const feedingGuide = getFeedingGuideline(selectedWeight);
    const sleepGuide = getSleepGuideline(ageInMonths);
    const medicineGuide = getDexibuprofenGuideline(selectedWeight);

    setAnalysisResult({
      percentile: { label: percentile.label, value: percentile.percentile },
      heightPercentile: {
        label: heightPercentile.label,
        value: heightPercentile.percentile,
      },
      feeding: feedingGuide,
      sleep: sleepGuide,
      medicine: medicineGuide,
      ageInMonths,
      weight: selectedWeight,
    });
    setShowResult(true);
  };

  // 스크롤 핸들러
  const handleWeightScroll = () => {
    if (!weightRef.current) return;
    const scrollTop = weightRef.current.scrollTop;
    const index = Math.round(scrollTop / 50);
    const value = parseFloat(weightOptions[index] || weightOptions[0]);
    setSelectedWeight(value);
  };

  const handleHeightScroll = () => {
    if (!heightRef.current) return;
    const scrollTop = heightRef.current.scrollTop;
    const index = Math.round(scrollTop / 50);
    const value = parseFloat(heightOptions[index] || heightOptions[0]);
    setSelectedHeight(value);
  };

  // 스크롤 위치 동기화
  const syncWeightScroll = (value: number) => {
    if (weightRef.current) {
      const index = weightOptions.findIndex(
        (w) => Math.abs(parseFloat(w) - value) < 0.05
      );
      if (index !== -1) {
        weightRef.current.scrollTop = index * 50;
      }
    }
  };

  const syncHeightScroll = (value: number) => {
    if (heightRef.current) {
      const index = heightOptions.findIndex(
        (h) => Math.abs(parseFloat(h) - value) < 0.25
      );
      if (index !== -1) {
        heightRef.current.scrollTop = index * 50;
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateMeasurement(measurement.id, {
        weight: selectedWeight,
        height: selectedHeight,
      });

      if (result.success && result.data) {
        // ✨ Zustand Store 업데이트 (즉시 반영!)
        const { useMeasurementStore } = await import('@/stores');
        useMeasurementStore.getState().updateMeasurement(measurement.id, result.data);

        // 성장 분석 결과 표시
        if (babyInfo) {
          handleAnalyze();
        } else {
          onSuccess();
        }
      } else {
        alert(result.error || "수정에 실패했습니다");
        setIsSaving(false);
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("수정 중 오류가 발생했습니다");
      setIsSaving(false);
    }
  };

  // 분석 결과 표시 중이면 분석 컴포넌트 렌더링
  if (showResult && analysisResult) {
    return (
      <MeasurementAnalysis
        analysis={analysisResult}
        onClose={() => {
          setShowResult(false);
          onSuccess();
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
        <p className="text-xs text-gray-500 mb-1">
          기존 기록 ({new Date(measurement.measuredAt).toLocaleDateString()})
        </p>
        <div className="flex justify-center items-center gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">체중</span>
            <span className="text-lg font-bold text-blue-600">
              {measurement.weight}kg
            </span>
          </div>
          <div className="w-px h-8 bg-gray-200"></div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">키</span>
            <span className="text-lg font-bold text-green-600">
              {measurement.height}cm
            </span>
          </div>
        </div>
      </div>

      {/* 체중/키 선택 그리드 */}
      <div className="grid grid-cols-1 gap-4">
        <ScrollablePicker
          options={weightOptions}
          value={selectedWeight}
          onChange={setSelectedWeight}
          label="스크롤로 선택"
          unit="kg"
          color="blue"
          isEditing={isEditingWeight}
          onEditingChange={setIsEditingWeight}
          scrollRef={weightRef}
          onScroll={handleWeightScroll}
          onSyncScroll={syncWeightScroll}
          onSave={handleSave}
          disabled={isSaving}
        />

        <ScrollablePicker
          options={heightOptions}
          value={selectedHeight}
          onChange={setSelectedHeight}
          label="스크롤로 선택"
          unit="cm"
          color="green"
          isEditing={isEditingHeight}
          onEditingChange={setIsEditingHeight}
          scrollRef={heightRef}
          onScroll={handleHeightScroll}
          onSyncScroll={syncHeightScroll}
          onSave={handleSave}
          disabled={isSaving}
        />
      </div>

      <div className="flex gap-2">
        <Button
          onClick={onCancel}
          variant="outline"
          className="flex-1"
          disabled={isSaving}
        >
          취소
        </Button>
        <Button
          onClick={handleSave}
          className="flex-1"
          disabled={isSaving}
        >
          {isSaving ? "저장 중..." : "수정 완료"}
        </Button>
      </div>
    </div>
  );
}
