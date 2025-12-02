"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createMeasurement } from "@/features/measurements/actions";
import { CreateMeasurementSchema } from "@/shared/types/schemas";
import {
  getWeightPercentile,
  getHeightPercentile,
  getFeedingGuideline,
  getSleepGuideline,
  getDexibuprofenGuideline,
} from "@/shared/lib/growthGuidelines";
import { differenceInMonths } from "date-fns";

// 체중: 1.0kg ~ 20.0kg (0.1kg 단위)
export const weightOptions = Array.from({ length: 191 }, (_, i) =>
  (1.0 + i * 0.1).toFixed(1)
);
// 키: 30cm ~ 120cm (0.5cm 단위)
export const heightOptions = Array.from({ length: 181 }, (_, i) =>
  (30 + i * 0.5).toFixed(1)
);

export interface AnalysisResult {
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
}

export interface LatestMeasurement {
  weight: number;
  height: number;
  date: Date;
}

export function useMeasurementForm(babyId: string, onSuccess: () => void) {
  const router = useRouter();

  // 상태 관리
  const [selectedWeight, setSelectedWeight] = useState(3.3);
  const [selectedHeight, setSelectedHeight] = useState(50);
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [isEditingHeight, setIsEditingHeight] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [latestMeasurement, setLatestMeasurement] =
    useState<LatestMeasurement | null>(null);
  const [babyInfo, setBabyInfo] = useState<{
    birthDate: Date;
    gender: "male" | "female";
  } | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );

  const weightRef = useRef<HTMLDivElement>(null);
  const heightRef = useRef<HTMLDivElement>(null);

  // 초기 데이터 로드
  useEffect(() => {
    const initializeForm = async () => {
      try {
        // 아기 정보 가져오기
        const { getBabyById } = await import("@/features/babies/actions");
        const babyResult = await getBabyById(babyId);

        if (babyResult.success && babyResult.data) {
          setBabyInfo({
            birthDate: new Date(babyResult.data.birthDate),
            gender: babyResult.data.gender as "male" | "female",
          });
        }

        // 최신 측정값 가져오기
        const { getLatestMeasurement } = await import(
          "@/features/measurements/actions"
        );
        const result = await getLatestMeasurement(babyId);

        let initialWeight = 3.3;
        let initialHeight = 50;

        if (result.success && result.data) {
          const data = result.data;
          setLatestMeasurement({
            weight: data.weight,
            height: data.height,
            date: new Date(data.measuredAt),
          });
          initialWeight = data.weight;
          initialHeight = data.height;

          setSelectedWeight(initialWeight);
          setSelectedHeight(initialHeight);
        }

        // 스크롤 위치 조정
        setTimeout(() => {
          if (weightRef.current) {
            const weightIndex = weightOptions.findIndex(
              (w) => Math.abs(parseFloat(w) - initialWeight) < 0.05
            );
            if (weightIndex !== -1) {
              weightRef.current.scrollTop = weightIndex * 50;
            }
          }
          if (heightRef.current) {
            const heightIndex = heightOptions.findIndex(
              (h) => Math.abs(parseFloat(h) - initialHeight) < 0.25
            );
            if (heightIndex !== -1) {
              heightRef.current.scrollTop = heightIndex * 50;
            }
          }
        }, 100);
      } catch (error) {
        console.error("Form initialization error:", error);
      }
    };

    initializeForm();
  }, [babyId]);

  // 백분위 분석
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

  // 저장 함수
  const handleSave = async () => {
    if (isSaving) return;

    console.log("저장 시작: ", { babyId, selectedWeight, selectedHeight });

    try {
      setIsSaving(true);

      const validated = CreateMeasurementSchema.parse({
        babyId,
        weight: selectedWeight,
        height: selectedHeight,
      });

      console.log("데이터 유효성 검사 통과:", validated);

      const result = await createMeasurement(validated);
      console.log("서버 응답:", result);

      if (result.success && result.data) {
        // ✨ Zustand Store 업데이트 (즉시 반영!)
        const { useMeasurementStore } = await import('@/stores');
        useMeasurementStore.getState().addMeasurement(babyId, result.data);

        // 백분위 및 가이드 계산
        if (babyInfo) {
          handleAnalyze();
        } else {
          onSuccess();
        }
      } else {
        console.error("저장 실패 (서버):", result.error);
        let errorMessage = `저장에 실패했습니다: ${result.error}`;
        if (
          result.error?.includes("create") ||
          result.error?.includes("undefined")
        ) {
          errorMessage +=
            "\n\n(서버가 최신 DB 변경사항을 반영하지 못했을 수 있습니다. 터미널에서 npm run dev를 재시작해주세요.)";
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error("저장 실패 (클라이언트):", error);
      alert("저장 중 오류가 발생했습니다. 콘솔을 확인해주세요.");
    } finally {
      setIsSaving(false);
    }
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

  return {
    // 상태
    selectedWeight,
    selectedHeight,
    isEditingWeight,
    isEditingHeight,
    isSaving,
    showResult,
    analysisResult,
    latestMeasurement,
    weightRef,
    heightRef,

    // 메서드
    setSelectedWeight,
    setSelectedHeight,
    setIsEditingWeight,
    setIsEditingHeight,
    setShowResult,
    handleSave,
    handleAnalyze,
    syncWeightScroll,
    syncHeightScroll,
  };
}
