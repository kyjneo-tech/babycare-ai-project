"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useChatStore } from "@/stores/useChatStore";
import { ChatMessageBubble } from "@/features/ai-chat/components/ChatMessageBubble";
import { ChatInput } from "@/features/ai-chat/components/ChatInput";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TYPOGRAPHY, SPACING } from "@/design-system";
import { cn } from "@/lib/utils";
import { Bot } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Message as ChatMessage } from '@/shared/types/chat';

export function AIChatView({ babyId }: { babyId: string }) {
  const isGuestMode = babyId === "guest-baby-id";
  const initialLoaded = true; // For simplicity, assuming history is loaded.

  // 1. Zustand Store Integration
  // The selector `state.messages[babyId]` is stable. It will return undefined
  // or the array from the store. This prevents re-renders.
  const messages = useChatStore((state) => state.messages[babyId]);
  const { 
    isLoading, 
    addMessage, 
    setLoading, 
    appendContentToLastMessage, 
    setLastErrorContent,
    loadHistory,
    clearHistory
  } = useChatStore();

  const messagesToRender = messages ?? [];

  // Load history on mount
  useEffect(() => {
    if (babyId && !isGuestMode) {
      loadHistory(babyId);
    }
  }, [babyId, loadHistory, isGuestMode]);

  // Clear history on unmount
  useEffect(() => {
    return () => {
      if (babyId) {
        // Optionally clear history when user navigates away
        // clearHistory(babyId); 
      }
    };
  }, [babyId, clearHistory]);
  
  // 2. Send Handler refactored for Zustand
  const handleSend = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message,
      createdAt: new Date(),
    };
    addMessage(babyId, userMsg);

    if (isGuestMode) {
      setLoading(true);
      setTimeout(() => {
        const aiMsg: ChatMessage = {
          id: `guest-ai-${Date.now()}`,
          role: "assistant",
          content: "게스트 모드에서는 실제 AI 상담이 제공되지 않습니다. 로그인 후 이용해주세요! 👶",
          createdAt: new Date(),
        };
        addMessage(babyId, aiMsg);
        setLoading(false);
      }, 1000);
      return;
    }

    // Real Mode: Manual streaming implementation with Zustand
    const assistantMsg: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: "",
      createdAt: new Date(),
    };
    addMessage(babyId, assistantMsg);
    setLoading(true);

    const currentMessages = useChatStore.getState().getMessageHistory(babyId);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Baby-Id": babyId,
        },
        body: JSON.stringify({
          // Send all but the last empty assistant message
          messages: currentMessages.slice(0, -1).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          babyId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No response body");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        appendContentToLastMessage(babyId, chunk);
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setLastErrorContent(babyId, "죄송해요, 응답 중 오류가 발생했어요. 다시 시도해주세요. 😢");
    } finally {
      setLoading(false);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isAnalyzing = isLoading && messagesToRender.length > 0 && messagesToRender[messagesToRender.length - 1].role === "assistant" && messagesToRender[messagesToRender.length-1].content === "";

  // Auto-scroll logic
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messagesToRender, isLoading, isAnalyzing]);

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-w-3xl mx-auto">
      {/* Messages Area */}
      <div className={cn("flex-1 overflow-y-auto space-y-4", SPACING.card.medium)}>
        {messagesToRender.map((msg) => (
            <ChatMessageBubble
              key={msg.id}
              message={msg}
            />
        ))}
        {isAnalyzing && (
          <div className="flex items-end gap-3">
            <Avatar className="bg-muted">
              <AvatarFallback>
                <Bot className="w-5 h-5 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 max-w-[75%]">
                <div className={cn("rounded-2xl px-4 py-3 bg-muted")}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground animate-pulse">아기 기록 분석중...</span>
                    <div className="flex gap-1">
                      <Skeleton className="h-2 w-2 rounded-full" />
                      <Skeleton className="h-2 w-2 rounded-full" />
                      <Skeleton className="h-2 w-2 rounded-full" />
                    </div>
                  </div>
                </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
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
              대화는 30일이 지나면 자동으로 삭제됩니다. 필요한 대화는 따로 저장해주세요.
            </p>
            <ChatInput onSend={handleSend} disabled={isLoading || !initialLoaded} />
          </>
        )}
      </div>
    </div>
  );
}
