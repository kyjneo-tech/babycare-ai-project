"use client";

import { ChatMessageBubble } from "@/components/features/ai-chat/ChatMessageBubble";
import { ChatInput } from "@/components/features/ai-chat/ChatInput";
import { AIChatSettings } from "./AIChatSettings";
import { useChat } from "./useChat";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TYPOGRAPHY, SPACING, COLORS } from "@/design-system";
import { cn } from "@/lib/utils";
import { Bot } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function AIChatView({ babyId }: { babyId: string }) {
  const { messages, isLoading, handleSend, isGuestMode } = useChat(babyId);

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-w-3xl mx-auto">
      {/* Header with Settings */}
      <div className="border-b bg-muted sticky top-0 z-10 rounded-t-lg overflow-hidden">
        <AIChatSettings babyId={babyId} />
      </div>

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
      </div>

      {/* Input Area */}
      <div className={cn("border-t", SPACING.card.small)}>
        {isGuestMode ? (
          <Alert>
            <AlertDescription className="text-center">
              <p className={TYPOGRAPHY.body.default}>
                💡 게스트 모드에서는 AI 상담 입력이 제한됩니다.
              </p>
              <p className={cn(TYPOGRAPHY.caption, "mt-1")}>
                전체 기능을 사용하려면 로그인해주세요.
              </p>
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
