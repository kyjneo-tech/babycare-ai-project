/**
 * BottomSheet Component
 * Radix UI Dialog를 재사용하여 하단에서 슬라이드되는 모달 구현
 * 모바일 친화적 제스처 지원
 */

"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const BottomSheet = DialogPrimitive.Root;
const BottomSheetTrigger = DialogPrimitive.Trigger;
const BottomSheetPortal = DialogPrimitive.Portal;
const BottomSheetClose = DialogPrimitive.Close;

const BottomSheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/50",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
BottomSheetOverlay.displayName = "BottomSheetOverlay";

interface BottomSheetContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  showCloseButton?: boolean;
}

const BottomSheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  BottomSheetContentProps
>(({ className, children, showCloseButton = true, ...props }, ref) => (
  <BottomSheetPortal>
    <BottomSheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        // 위치 및 크기
        "fixed bottom-0 left-0 right-0 z-50",
        "max-h-[85vh]",
        // 배경 및 테두리
        "bg-background rounded-t-3xl",
        "border-t border-border",
        // 그림자
        "shadow-2xl",
        // 애니메이션 (하단에서 슬라이드)
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        "duration-300",
        // 스크롤
        "overflow-y-auto",
        // Safe Area (iOS)
        "pb-safe",
        className
      )}
      {...props}
    >
      {/* 드래그 인디케이터 */}
      <div className="mx-auto mt-3 mb-4 h-1.5 w-12 rounded-full bg-muted" />

      {/* 닫기 버튼 */}
      {showCloseButton && (
        <DialogPrimitive.Close className="absolute top-4 right-4 rounded-full p-2 opacity-70 hover:opacity-100 hover:bg-accent transition-all">
          <XIcon className="h-4 w-4" />
          <span className="sr-only">닫기</span>
        </DialogPrimitive.Close>
      )}

      {children}
    </DialogPrimitive.Content>
  </BottomSheetPortal>
));
BottomSheetContent.displayName = "BottomSheetContent";

const BottomSheetHeader = ({ className, ...props }: React.ComponentPropsWithoutRef<"div">) => (
  <div
    className={cn("flex flex-col gap-2 px-6 pb-4", className)}
    {...props}
  />
);
BottomSheetHeader.displayName = "BottomSheetHeader";

const BottomSheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-xl font-bold", className)}
    {...props}
  />
));
BottomSheetTitle.displayName = "BottomSheetTitle";

const BottomSheetDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
BottomSheetDescription.displayName = "BottomSheetDescription";

const BottomSheetBody = ({ className, ...props }: React.ComponentPropsWithoutRef<"div">) => (
  <div className={cn("px-6 pb-6", className)} {...props} />
);
BottomSheetBody.displayName = "BottomSheetBody";

export {
  BottomSheet,
  BottomSheetTrigger,
  BottomSheetClose,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetDescription,
  BottomSheetBody,
};
