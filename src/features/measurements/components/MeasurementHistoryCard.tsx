"use client";

import { useState } from "react";
import { BabyMeasurement } from "@prisma/client";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Scale, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteMeasurement } from "../actions";

interface MeasurementHistoryCardProps {
  measurement: BabyMeasurement;
  onDelete: (id: string) => void;
  onEdit: (measurement: BabyMeasurement) => void;
}

export function MeasurementHistoryCard({
  measurement,
  onDelete,
  onEdit,
}: MeasurementHistoryCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteMeasurement(measurement.id);
      if (result.success) {
        // ✨ Zustand Store 업데이트 (즉시 반영!)
        const { useMeasurementStore } = await import('@/stores');
        useMeasurementStore.getState().deleteMeasurement(measurement.babyId, measurement.id);
        
        onDelete(measurement.id);
        setShowDeleteDialog(false);
      } else {
        alert(result.error || "삭제에 실패했습니다");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("삭제 중 오류가 발생했습니다");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-2">
          {/* 왼쪽: 날짜 + 측정값 */}
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-2">
              <Scale className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500">
                {format(new Date(measurement.measuredAt), "yyyy년 M월 d일 (E)", {
                  locale: ko,
                })}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-xs text-gray-400">체중</span>
                <span className="text-lg font-bold text-blue-600">
                  {measurement.weight}kg
                </span>
              </div>
              <div className="w-px h-10 bg-gray-200"></div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400">키</span>
                <span className="text-lg font-bold text-green-600">
                  {measurement.height}cm
                </span>
              </div>
            </div>
          </div>

          {/* 오른쪽: 수정/삭제 버튼 */}
          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={() => onEdit(measurement)}
            >
              <Pencil className="w-3 h-3 text-gray-500" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="w-3 h-3 text-red-500" />
            </Button>
          </div>
        </div>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>측정 기록 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 측정 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
