"use client";

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
import Link from "next/link";

interface GuestModeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GuestModeDialog({ open, onOpenChange }: GuestModeDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>👀 게스트 모드입니다</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>게스트 모드에서는 활동을 저장할 수 없습니다.</p>
            <p className="font-medium">로그인하고 내 아기의 성장을 기록해보세요! ✨</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Link href="/login">로그인 하기 🚀</Link>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
