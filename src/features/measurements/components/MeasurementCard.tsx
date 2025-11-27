"use client";

import { useState } from "react";
import { LineChart, Scale } from "lucide-react";
import { AddMeasurementForm } from "./AddMeasurementForm";
import { GrowthChart } from "./GrowthChart";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface MeasurementCardProps {
  babyId: string;
}

export function MeasurementCard({ babyId }: MeasurementCardProps) {
  const [showInputDialog, setShowInputDialog] = useState(false);
  const [showChartDialog, setShowChartDialog] = useState(false);

  const handleMeasurementAdded = () => {
    setShowInputDialog(false);
  };

  return (
    <>
      <div className="flex items-center justify-between gap-2 bg-white rounded-lg border border-gray-200 px-3 py-2">
        {/* 타이틀 */}
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          <Scale className="h-4 w-4" />
          성장 기록
        </h3>

        {/* 버튼들 */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInputDialog(true)}
            className="h-7 px-2 text-xs"
          >
            📏 키 & 체중
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowChartDialog(true)}
            className="h-7 px-2 text-xs"
          >
            📊 차트
          </Button>
        </div>
      </div>

      {/* 키&체중 입력 다이얼로그 */}
      <Dialog open={showInputDialog} onOpenChange={setShowInputDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>키&체중 기록하기</DialogTitle>
          </DialogHeader>
          <AddMeasurementForm
            babyId={babyId}
            onSuccess={handleMeasurementAdded}
          />
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
