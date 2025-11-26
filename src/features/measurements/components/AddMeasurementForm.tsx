"use client";

import { useState, useRef, useEffect } from "react";
import { createMeasurement } from "@/features/measurements/actions";
import { CreateMeasurementSchema } from "@/shared/types/schemas";
import { getWeightPercentile, getFeedingGuideline, getSleepGuideline, getDexibuprofenGuideline } from "@/shared/lib/growthGuidelines";
import { differenceInMonths } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SPACING, TYPOGRAPHY } from "@/design-system";
import { cn } from "@/lib/utils";

interface AddMeasurementFormProps {
  babyId: string;
  onSuccess: () => void;
}

// 체중: 1.0kg ~ 20.0kg (0.1kg 단위)
const weightOptions = Array.from({ length: 191 }, (_, i) => (1.0 + i * 0.1).toFixed(1));
// 키: 30cm ~ 120cm (0.5cm 단위)
const heightOptions = Array.from({ length: 181 }, (_, i) => (30 + i * 0.5).toFixed(1));

export function AddMeasurementForm({
  babyId,
  onSuccess,
}: AddMeasurementFormProps) {
  // 신생아 평균값: 체중 3.3kg, 키 50cm
  const [selectedWeight, setSelectedWeight] = useState(3.3);
  const [selectedHeight, setSelectedHeight] = useState(50);
  const [isSaving, setIsSaving] = useState(false);
  const [latestMeasurement, setLatestMeasurement] = useState<{
    weight: number;
    height: number;
    date: Date;
  } | null>(null);
  
  // 아기 정보 (백분위 계산에 필요)
  const [babyInfo, setBabyInfo] = useState<{ birthDate: Date; gender: 'male' | 'female' } | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    percentile: { label: string; value: number };
    feeding: { daily: { min: number; max: number }; perFeeding: { min: number; max: number } };
    sleep: { total: string; naps: string };
    medicine: { dose: string; disclaimer: string };
    ageInMonths: number;
    weight: number;
  } | null>(null);

  const weightRef = useRef<HTMLDivElement>(null);
  const heightRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 초기 데이터 로드 및 스크롤 위치 설정
  useEffect(() => {
    const initializeForm = async () => {
      try {
        // 아기 정보 가져오기 (생년월일, 성별)
        const { getBabyById } = await import("@/features/babies/actions");
        const babyResult = await getBabyById(babyId);
        
        if (babyResult.success && babyResult.data) {
          setBabyInfo({
            birthDate: new Date(babyResult.data.birthDate),
            gender: babyResult.data.gender as 'male' | 'female'
          });
        }
        
        // 최신 측정값 가져오기
        // 동적 import를 사용하여 서버 액션 호출 (클라이언트 컴포넌트에서 직접 import 시 에러 방지)
        const { getLatestMeasurement } = await import("@/features/measurements/actions");
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
          
          // 상태 업데이트
          setSelectedWeight(initialWeight);
          setSelectedHeight(initialHeight);
        }

        // 스크롤 위치 조정
        // 약간의 지연을 주어 렌더링이 완료된 후 스크롤되도록 함
        setTimeout(() => {
          if (weightRef.current) {
            // 가장 가까운 값 찾기
            const weightIndex = weightOptions.findIndex(w => Math.abs(parseFloat(w) - initialWeight) < 0.05);
            if (weightIndex !== -1) {
              weightRef.current.scrollTop = weightIndex * 50;
            }
          }
          if (heightRef.current) {
            const heightIndex = heightOptions.findIndex(h => Math.abs(parseFloat(h) - initialHeight) < 0.25);
            if (heightIndex !== -1) {
              heightRef.current.scrollTop = heightIndex * 50;
            }
          }
        }, 100);

      } catch (error) {
      }
    };

    initializeForm();
  }, [babyId]);

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

      if (result.success) {
        // 백분위 및 가이드 계산
        if (babyInfo) {
          const ageInMonths = differenceInMonths(new Date(), babyInfo.birthDate);
          const percentile = getWeightPercentile(selectedWeight, ageInMonths, babyInfo.gender);
          const feedingGuide = getFeedingGuideline(selectedWeight);
          const sleepGuide = getSleepGuideline(ageInMonths);
          const medicineGuide = getDexibuprofenGuideline(selectedWeight);
          
          setAnalysisResult({
            percentile: { label: percentile.label, value: percentile.percentile },
            feeding: feedingGuide,
            sleep: sleepGuide,
            medicine: medicineGuide,
            ageInMonths,
            weight: selectedWeight
          });
          setShowResult(true);
        } else {
          onSuccess();
        }
        // onSuccess(); // Removed duplicate call
      } else {
        console.error("저장 실패 (서버):", result.error);
        let errorMessage = `저장에 실패했습니다: ${result.error}`;
        if (result.error?.includes("create") || result.error?.includes("undefined")) {
          errorMessage += "\n\n(서버가 최신 DB 변경사항을 반영하지 못했을 수 있습니다. 터미널에서 npm run dev를 재시작해주세요.)";
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

  return (
    <div className="space-y-4">
      {showResult && analysisResult ? (
        <div className="bg-white rounded-xl border-2 border-blue-100 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* 헤더 */}
          <div className="bg-blue-50 p-4 border-b border-blue-100">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">✨</span>
              <h3 className="font-bold text-lg text-blue-900">성장 분석 결과</h3>
            </div>
            <p className="text-sm text-blue-700">
              생후 {analysisResult.ageInMonths}개월, {analysisResult.weight}kg
            </p>
          </div>

          {/* 내용 */}
          <div className="p-4 space-y-4">
            {/* 백분위 */}
            <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">체중 백분위</span>
                <span className="text-lg font-bold text-blue-600">{analysisResult.percentile.label}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-500 h-2.5 rounded-full transition-all duration-1000" 
                  style={{ width: `${analysisResult.percentile.value}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-right">
                {analysisResult.percentile.value}번째 백분위 (100명 중 {100 - analysisResult.percentile.value}등)
              </p>
            </div>

            {/* 가이드 그리드 */}
            <div className="grid grid-cols-1 gap-3">
              {/* 수유 */}
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                <span className="text-xl mt-0.5">🍼</span>
                <div>
                  <h4 className="font-bold text-sm text-orange-900 mb-1">권장 수유량</h4>
                  <p className="text-sm text-orange-800">
                    하루: {analysisResult.feeding.daily.min}~{analysisResult.feeding.daily.max}ml
                  </p>
                  <p className="text-xs text-orange-700 mt-0.5">
                    1회: {analysisResult.feeding.perFeeding.min}~{analysisResult.feeding.perFeeding.max}ml
                  </p>
                </div>
              </div>

              {/* 수면 */}
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                <span className="text-xl mt-0.5">😴</span>
                <div>
                  <h4 className="font-bold text-sm text-purple-900 mb-1">권장 수면</h4>
                  <p className="text-sm text-purple-800">
                    총 {analysisResult.sleep.total}
                  </p>
                  <p className="text-xs text-purple-700 mt-0.5">
                    낮잠: {analysisResult.sleep.naps}
                  </p>
                </div>
              </div>

              {/* 해열제 */}
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                <span className="text-xl mt-0.5">💊</span>
                <div>
                  <h4 className="font-bold text-sm text-red-900 mb-1">해열제 용량</h4>
                  <p className="text-sm text-red-800 font-medium">
                    {analysisResult.medicine.dose}
                  </p>
                  <p className="text-[10px] text-red-600 mt-1 leading-tight">
                    {analysisResult.medicine.disclaimer}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className={cn("p-4 bg-muted border-t", SPACING.card.small)}>
            <Button
              onClick={() => {
                setShowResult(false);
                onSuccess();
              }}
              className="w-full"
              size="lg"
            >
              확인
            </Button>
          </div>
        </div>
      ) : (
        <>
      {latestMeasurement && (
        <div className="bg-blue-50 rounded-lg p-3 mb-4 text-center border border-blue-100">
          <p className="text-xs text-gray-500 mb-1">
            최근 기록 ({latestMeasurement.date.toLocaleDateString()})
          </p>
          <div className="flex justify-center items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] sm:text-xs text-gray-400">체중</span>
              <span className="text-base sm:text-lg font-bold text-blue-600">{latestMeasurement.weight}kg</span>
            </div>
            <div className="w-px h-8 bg-gray-200"></div>
            <div className="flex flex-col">
              <span className="text-[10px] sm:text-xs text-gray-400">키</span>
              <span className="text-base sm:text-lg font-bold text-green-600">{latestMeasurement.height}cm</span>
            </div>
          </div>
        </div>
      )}
      {/* 직접 입력 칸 */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            체중 (kg)
          </label>
          <input
            type="number"
            step="0.1"
            min="1"
            max="20"
            value={selectedWeight}
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              if (!isNaN(value) && value >= 1 && value <= 20) {
                setSelectedWeight(value);
                // 스크롤 위치도 동기화
                if (weightRef.current) {
                  const index = weightOptions.findIndex(w => Math.abs(parseFloat(w) - value) < 0.05);
                  if (index !== -1) {
                    weightRef.current.scrollTop = index * 50;
                  }
                }
              }
            }}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="3.3"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            키 (cm)
          </label>
          <input
            type="number"
            step="0.5"
            min="30"
            max="120"
            value={selectedHeight}
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              if (!isNaN(value) && value >= 30 && value <= 120) {
                setSelectedHeight(value);
                // 스크롤 위치도 동기화
                if (heightRef.current) {
                  const index = heightOptions.findIndex(h => Math.abs(parseFloat(h) - value) < 0.25);
                  if (index !== -1) {
                    heightRef.current.scrollTop = index * 50;
                  }
                }
              }
            }}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="50"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* 체중 스크롤 */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1 text-center">
            스크롤로 선택
          </label>
          <div className="relative h-[150px] overflow-hidden rounded-lg border border-gray-200 bg-white">
            {/* 선택 표시 영역 (배경) */}
            <div className="absolute inset-x-0 top-1/2 -mt-[25px] h-[50px] bg-blue-50 border-y-2 border-blue-400 pointer-events-none z-0" />

            {/* 스크롤 목록 (앞쪽) */}
            <div
              ref={weightRef}
              onScroll={handleWeightScroll}
              className="relative z-10 h-full overflow-y-scroll scrollbar-hide snap-y snap-mandatory"
              style={{ paddingTop: '50px', paddingBottom: '50px' }}
            >
              {weightOptions.map((weight, index) => (
                <div
                  key={index}
                  className="h-[50px] flex items-center justify-center font-semibold snap-center transition-all duration-200"
                  style={{
                    color: parseFloat(weight) === selectedWeight ? '#2563eb' : '#9ca3af',
                    fontSize: parseFloat(weight) === selectedWeight ? '1.5rem' : '1rem',
                    opacity: parseFloat(weight) === selectedWeight ? 1 : 0.5,
                  }}
                >
                  {weight}
                </div>
              ))}
            </div>

            {/* 단위 */}
            <div className="absolute inset-x-0 top-1/2 -mt-[25px] h-[50px] flex items-center justify-end pr-3 pointer-events-none z-20">
              <span className="text-blue-500 font-bold text-sm">kg</span>
            </div>
          </div>
        </div>

        {/* 키 스크롤 */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1 text-center">
            스크롤로 선택
          </label>
          <div className="relative h-[150px] overflow-hidden rounded-lg border border-gray-200 bg-white">
            {/* 선택 표시 영역 (배경) */}
            <div className="absolute inset-x-0 top-1/2 -mt-[25px] h-[50px] bg-green-50 border-y-2 border-green-400 pointer-events-none z-0" />

            {/* 스크롤 목록 (앞쪽) */}
            <div
              ref={heightRef}
              onScroll={handleHeightScroll}
              className="relative z-10 h-full overflow-y-scroll scrollbar-hide snap-y snap-mandatory"
              style={{ paddingTop: '50px', paddingBottom: '50px' }}
            >
              {heightOptions.map((height, index) => (
                <div
                  key={index}
                  className="h-[50px] flex items-center justify-center font-semibold snap-center transition-all duration-200"
                  style={{
                    color: parseFloat(height) === selectedHeight ? '#16a34a' : '#9ca3af',
                    fontSize: parseFloat(height) === selectedHeight ? '1.5rem' : '1rem',
                    opacity: parseFloat(height) === selectedHeight ? 1 : 0.5,
                  }}
                >
                  {height}
                </div>
              ))}
            </div>

            {/* 단위 */}
            <div className="absolute inset-x-0 top-1/2 -mt-[25px] h-[50px] flex items-center justify-end pr-3 pointer-events-none z-20">
              <span className="text-green-500 font-bold text-sm">cm</span>
            </div>
          </div>
        </div>
      </div>

      {/* 함께 기록하면 좋은 항목 패널 */}
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

      <Button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full"
        size="lg"
      >
        {isSaving ? "저장 중..." : "기록하기"}
      </Button>
      </>
      )}
    </div>
  );
}
