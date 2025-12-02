"use client";

import { useState, useEffect } from "react";
import { BabyMeasurement } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { MeasurementAnalysis } from "./MeasurementAnalysis";
import { updateMeasurement } from "../actions";
import { AnalysisResult } from "../hooks/useMeasurementForm";
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
  const [selectedWeight, setSelectedWeight] = useState(measurement.weight);
  const [selectedHeight, setSelectedHeight] = useState(measurement.height);
  const [isSaving, setIsSaving] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [babyInfo, setBabyInfo] = useState<{
    birthDate: Date;
    gender: "male" | "female";
  } | null>(null);

  // 아기 정보 로드
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
  }, [measurement.babyId]);

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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateMeasurement(measurement.id, {
        weight: selectedWeight,
        height: selectedHeight,
      });

      if (result.success) {
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            체중 (kg)
          </label>
          <input
            type="number"
            step="0.1"
            value={selectedWeight}
            onChange={(e) => setSelectedWeight(parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            키 (cm)
          </label>
          <input
            type="number"
            step="0.1"
            value={selectedHeight}
            onChange={(e) => setSelectedHeight(parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
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
