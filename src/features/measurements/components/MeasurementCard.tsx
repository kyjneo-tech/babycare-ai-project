"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { LineChart, Scale } from "lucide-react";
import { BabyMeasurement } from "@prisma/client";
import { AddMeasurementForm } from "./AddMeasurementForm";
import { EditMeasurementForm } from "./EditMeasurementForm";
import { MeasurementHistoryList } from "./MeasurementHistoryList";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// GrowthChart를 동적 import로 변경 (차트 라이브러리가 클 수 있으므로)
const GrowthChart = dynamic(
  () => import("./GrowthChart").then(mod => ({ default: mod.GrowthChart })),
  {
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-slate-400">차트를 불러오는 중...</p>
        </div>
      </div>
    ),
  }
);

interface MeasurementCardProps {
  babyId: string;
}

export function MeasurementCard({ babyId }: MeasurementCardProps) {
  const [showInputDialog, setShowInputDialog] = useState(false);
  const [showChartDialog, setShowChartDialog] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingMeasurement, setEditingMeasurement] = useState<BabyMeasurement | null>(null);

  const handleMeasurementAdded = () => {
    setRefreshKey(prev => prev + 1); // 목록 새로고침 트리거
  };

  const handleEdit = (measurement: BabyMeasurement) => {
    setEditingMeasurement(measurement);
  };

  const handleEditSuccess = () => {
    setEditingMeasurement(null);
    setRefreshKey(prev => prev + 1);
  };

  const handleEditCancel = () => {
    setEditingMeasurement(null);
  };

  return (
    <>
      <div className="flex items-center justify-between gap-2 bg-white/5 backdrop-blur-md rounded-lg border border-white/10 px-4 py-3">
        {/* 타이틀 */}
        <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
          <Scale className="h-4 w-4" />
          성장 기록
        </h3>

        {/* 버튼들 */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowInputDialog(true)}
            className="h-8 px-3 text-sm"
          >
            📏 키 & 체중
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowChartDialog(true)}
            className="h-8 px-3 text-sm"
          >
            📊 성장 차트
          </Button>
        </div>
      </div>

      {/* 키&체중 입력 다이얼로그 */}
      <Dialog open={showInputDialog} onOpenChange={setShowInputDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMeasurement ? "키&체중 수정하기" : "키&체중 기록하기"}
            </DialogTitle>
          </DialogHeader>
          
          {editingMeasurement ? (
            <EditMeasurementForm
              measurement={editingMeasurement}
              onSuccess={handleEditSuccess}
              onCancel={handleEditCancel}
            />
          ) : (
            <>
              <AddMeasurementForm
                babyId={babyId}
                onSuccess={handleMeasurementAdded}
                onCloseDialog={() => setShowInputDialog(false)}
              />

              {/* 구분선 */}
              <div className="border-t border-white/10 my-4"></div>

              {/* 최근 활동 목록 */}
              <MeasurementHistoryList
                babyId={babyId}
                onEdit={handleEdit}
                refreshTrigger={refreshKey}
              />
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 차트 보기 다이얼로그 */}
      <Dialog open={showChartDialog} onOpenChange={setShowChartDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>성장 곡선 차트</DialogTitle>
          </DialogHeader>
          <GrowthChart babyId={babyId} />
        </DialogContent>
      </Dialog>
    </>
  );
}
