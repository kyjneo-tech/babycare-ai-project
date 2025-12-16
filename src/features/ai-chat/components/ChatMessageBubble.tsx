"use client";

import { format } from "date-fns";
import { Bot, User, Share2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
  };
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isUser = message.role === "user";
  const { data: session } = useSession();
  const [isSharing, setIsSharing] = useState(false);
  const [currentSharedState, setCurrentSharedState] = useState(message.isShared || false);

  // 본인의 메시지인지 확인
  const isOwnMessage = message.userId === session?.user?.id;

  // 공유 토글 핸들러
  const handleShareToggle = async () => {
    if (!message.messageId || !isOwnMessage) return;

    setIsSharing(true);
    try {
      const response = await fetch("/api/chat/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId: message.messageId,
          isShared: !currentSharedState,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update sharing status");
      }

      const data = await response.json();
      setCurrentSharedState(data.data.isShared);

      // 간단한 알림 (추후 Toast 컴포넌트로 대체 가능)
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
        <div
          className={cn(
            "rounded-2xl px-4 py-3",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-muted text-muted-foreground rounded-tl-sm"
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
                onClick={handleShareToggle}
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
                <span>가족 공유</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
