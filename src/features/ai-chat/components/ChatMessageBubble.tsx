"use client";

import { format } from "date-fns";
import { Bot, User, Share2, Lock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { TYPOGRAPHY } from "@/design-system";
import type { ReactNode } from "react";
import { useState } from "react";
import { useSession } from "next-auth/react";

interface ChatMessageBubbleProps {
  message: {
    role: "user" | "assistant" | "system" | "tool";
    content: ReactNode;
    createdAt?: Date;
    messageId?: string;
    userId?: string;
    isShared?: boolean;
    sharedBy?: string | null;
    sharedAt?: Date | null;
    authorName?: string;
    authorRelation?: string;
  };
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isUser = message.role === "user";
  const { data: session } = useSession();
  const [isSharing, setIsSharing] = useState(false);
  const [currentSharedState, setCurrentSharedState] = useState(message.isShared || false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  // 본인의 메시지인지 확인
  const isOwnMessage = message.userId === session?.user?.id;

  // 작성자 표시 (가족 관계 우선, 없으면 이름)
  const authorLabel = message.authorRelation || message.authorName || "가족";
  const displayName = isOwnMessage ? `${authorLabel} (나)` : authorLabel;

  // 메시지 미리보기 (처음 50자)
  const messagePreview = typeof message.content === 'string'
    ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
    : '';

  // 공유하기 버튼 클릭 (다이얼로그 열기)
  const handleShareClick = () => {
    if (!currentSharedState) {
      // 현재 "나만 보기" 상태 → 공유하려면 확인 다이얼로그 표시
      setShowShareDialog(true);
    } else {
      // 현재 "공유됨" 상태 → 즉시 공유 해제 (위험 낮음)
      handleShareToggle(false);
    }
  };

  // 실제 공유 API 호출
  const handleShareToggle = async (newSharedState: boolean) => {
    if (!message.messageId || !isOwnMessage) return;

    setIsSharing(true);
    setShowShareDialog(false); // 다이얼로그 닫기

    try {
      const response = await fetch("/api/chat/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId: message.messageId,
          isShared: newSharedState,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update sharing status");
      }

      const data = await response.json();
      setCurrentSharedState(data.data.isShared);

      console.log(data.message);
    } catch (error) {
      console.error("Failed to toggle sharing:", error);
      alert("공유 상태를 변경할 수 없습니다.");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div
      className={cn(
        "flex items-end gap-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <Avatar className={cn(isUser ? "bg-primary" : "bg-muted")}>
        <AvatarFallback>
          {isUser ? (
            <User className="w-5 h-5 text-primary-foreground" />
          ) : (
            <Bot className="w-5 h-5 text-muted-foreground" />
          )}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div className={cn("flex-1 max-w-[75%]", isUser && "items-end")}>
        {/* AI 답변에만 작성자 헤더 표시 */}
        {!isUser && message.role === "assistant" && (
          <div className={cn("flex items-center gap-1.5 mb-1 px-2", isOwnMessage ? "justify-start" : "justify-start")}>
            <User className="w-3.5 h-3.5 text-muted-foreground" />
            <span className={cn(
              TYPOGRAPHY.caption,
              "font-medium",
              isOwnMessage ? "text-primary" : "text-muted-foreground"
            )}>
              {displayName}
            </span>
          </div>
        )}

        <div
          className={cn(
            "rounded-2xl px-4 py-3",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : cn(
                  "rounded-tl-sm",
                  // 본인 메시지: 일반 배경, 다른 사람 공유 메시지: 연한 배경
                  isOwnMessage
                    ? "bg-muted text-muted-foreground"
                    : "bg-muted/60 text-muted-foreground border border-muted-foreground/20"
                )
          )}
        >
          <p className={cn(TYPOGRAPHY.body.default, "whitespace-pre-wrap break-words")}>
            {message.content}
          </p>
        </div>

        {/* 타임스탬프 및 공유 버튼 */}
        <div className={cn("flex items-center gap-2 mt-1 px-2", isUser ? "justify-end" : "justify-start")}>
          <span className={cn(TYPOGRAPHY.caption)}>
            {format(message.createdAt || new Date(), "HH:mm")}
          </span>

          {/* AI 답변(assistant)이고 본인 메시지일 때만 공유 버튼 표시 */}
          {!isUser && message.role === "assistant" && isOwnMessage && message.messageId && (
            <>
              <span className="text-muted-foreground">·</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShareClick}
                disabled={isSharing}
                className="h-auto p-0 hover:bg-transparent"
              >
                <div className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                  {currentSharedState ? (
                    <>
                      <Share2 className="w-3 h-3" />
                      <span>공유됨</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3" />
                      <span>나만 보기</span>
                    </>
                  )}
                </div>
              </Button>
            </>
          )}

          {/* 공유된 메시지이지만 본인이 작성하지 않은 경우 (다른 가족의 공유 메시지) */}
          {!isUser && message.role === "assistant" && !isOwnMessage && currentSharedState && (
            <>
              <span className="text-muted-foreground">·</span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Share2 className="w-3 h-3" />
                <span>{authorLabel}님이 공유</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 공유 확인 다이얼로그 */}
      <AlertDialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              가족과 공유
            </AlertDialogTitle>
            <AlertDialogDescription>
              이 대화를 모든 가족 구성원과 공유하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3 px-6">
            {/* 메시지 미리보기 */}
            <div className="bg-muted rounded-lg p-3 border border-muted-foreground/20">
              <p className="text-xs text-muted-foreground mb-1">💬 미리보기:</p>
              <p className="text-sm text-foreground font-medium break-words">
                "{messagePreview}"
              </p>
            </div>

            {/* 경고 메시지 */}
            <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3 border border-amber-200 dark:border-amber-900">
              <div className="text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  공유 후에는 모든 가족 구성원이 이 대화를 볼 수 있습니다.
                  개인적이거나 민감한 내용은 공유하지 않는 것을 권장합니다.
                </span>
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSharing}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleShareToggle(true)}
              disabled={isSharing}
              className="bg-primary hover:bg-primary/90"
            >
              {isSharing ? "공유 중..." : "공유하기"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
