"use client";

import { ChatMessageBubble } from "@/features/ai-chat/components/ChatMessageBubble";
import { ChatInput } from "@/features/ai-chat/components/ChatInput";
import { useChat } from "./useChat";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TYPOGRAPHY, SPACING, COLORS } from "@/design-system";
import { cn } from "@/lib/utils";
import { Bot } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import Link from "next/link";

export function AIChatView({ babyId }: { babyId: string }) {
  const { messages, isLoading, handleSend, isGuestMode } = useChat(babyId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 메시지가 추가되거나 로딩 상태가 변경될 때마다 스크롤을 맨 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-w-3xl mx-auto">
      {/* Messages Area */}
      <div className={cn("flex-1 overflow-y-auto space-y-4", SPACING.card.medium)}>
        {messages.map((message, index) => (
          <ChatMessageBubble key={index} message={message} />
        ))}
        {isLoading && (
          <div className="flex items-end gap-3">
            <Avatar className="bg-muted">
              <AvatarFallback>
                <Bot className="w-5 h-5 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 max-w-[75%]">
              <div className={cn("rounded-2xl px-4 py-3 bg-muted")}>
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          </div>
        )}
        {/* 스크롤 타겟 */}
        <div ref={messagesEndRef} />
      </div>

      <div className={cn("border-t", SPACING.card.small)}>
        {isGuestMode ? (
          <Alert>
            <AlertDescription className="text-center space-y-3">
              <p className={TYPOGRAPHY.body.default}>
                💡 이것은 샘플 대화입니다.
              </p>
              <p className={cn(TYPOGRAPHY.caption, "text-muted-foreground")}>
                실제 아기 데이터 기반 AI 상담을 이용하려면 로그인해주세요.
              </p>
              <Button asChild className="w-full sm:w-auto">
                <Link href="/login">로그인하고 AI 상담 시작하기 🚀</Link>
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <p className={cn(TYPOGRAPHY.caption, "text-center mb-2 text-muted-foreground")}>
              대화는 최근 20개까지만 저장됩니다. 필요하신 대화는 따로 저장하세요.
            </p>
            <ChatInput onSend={handleSend} disabled={isLoading} />
          </>
        )}
      </div>
    </div>
  );
}
