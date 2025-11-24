"use client";

import { useState, useEffect } from "react";
import { ChatMessageBubble } from "@/components/features/ai-chat/ChatMessageBubble";
import { ChatInput } from "@/components/features/ai-chat/ChatInput";
import { sendChatMessage, getChatHistory } from "@/features/ai-chat/actions";
import { useSession } from "next-auth/react";
import { AIChatSettings } from "./AIChatSettings";

interface AIChatViewProps {
  babyId: string;
}

export function AIChatView({ babyId }: { babyId: string }) {
  const { data: session } = useSession();
  const isGuestMode = babyId === "guest-baby-id";
  
  const [messages, setMessages] = useState<
    Array<{
      role: "user" | "assistant";
      content: string;
      createdAt: Date;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  // 초기 메시지 로드
  useEffect(() => {
    async function loadHistory() {
      if (isGuestMode) {
        setMessages([
          {
            role: "assistant",
            content: "안녕하세요! 육아에 관해 궁금한 점이 있으시면 물어보세요.",
            createdAt: new Date(Date.now() - 5 * 60 * 1000),
          },
          {
            role: "user",
            content: "우리 아기 수유량은 적절한가요?",
            createdAt: new Date(Date.now() - 4 * 60 * 1000),
          },
          {
            role: "assistant",
            content: `최근 활동 기록을 분석한 결과를 알려드리겠습니다.

**수유 패턴 분석:**
- 평균 수유량: 약 150ml/회
- 하루 평균 수유 횟수: 6-7회
- 총 일일 수유량: 약 900-1050ml

**6개월 아기 권장 수유량:**
- 일반적으로 6개월 아기는 하루 800-1000ml 정도가 적절합니다.
- 현재 수유량은 권장 범위 내에 있어 적절한 수준입니다.

**추가 조언:**
✅ 수유 간격이 규칙적이고 아기가 잘 자라고 있다면 현재 수유량을 유지하세요.
✅ 이유식을 시작했다면 점차 분유량을 줄이고 이유식 양을 늘려가세요.
✅ 아기의 체중 증가와 활동량을 고려하여 조절하세요.

궁금한 점이 더 있으시면 언제든 물어보세요! 😊`,
            createdAt: new Date(Date.now() - 3 * 60 * 1000),
          },
        ]);
        return;
      }

      const result = await getChatHistory(babyId);
      if (result.success && result.data) {
        const history = result.data.map((msg: any) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
          createdAt: new Date(msg.createdAt),
        }));
        
        if (history.length === 0) {
          setMessages([
            {
              role: "assistant",
              content: "안녕하세요! 육아에 관해 궁금한 점이 있으시면 물어보세요.",
              createdAt: new Date(),
            },
          ]);
        } else {
          setMessages(history);
        }
      }
    }
    loadHistory();
  }, [babyId, isGuestMode]);

  const handleSend = async (message: string) => {
    // 사용자 메시지 즉시 추가
    const userMessage = {
      role: "user" as const,
      content: message,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const result = await sendChatMessage(babyId, session?.user?.id, message);
      
      if (result.success && result.data?.reply) {
        const aiMessage = {
          role: "assistant" as const,
          content: result.data.reply,
          createdAt: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        // 에러 처리
        const errorMessage = {
          role: "assistant" as const,
          content: result.error || "죄송합니다. 응답을 생성하는 중에 문제가 발생했습니다.",
          createdAt: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("메시지 전송 실패:", error);
      const errorMessage = {
        role: "assistant" as const,
        content: "죄송합니다. 시스템 오류가 발생했습니다.",
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-300px)] max-w-3xl mx-auto">
      {/* Header with Settings */}
      <div className="border-b bg-gray-50 sticky top-0 z-10">
        <AIChatSettings babyId={babyId} />
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((message, index) => (
          <ChatMessageBubble key={index} message={message} />
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="flex-1 max-w-[75%]">
              <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t bg-white px-4 py-4">
        {isGuestMode ? (
          <div className="text-center py-3 px-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">
              💡 게스트 모드에서는 AI 상담 입력이 제한됩니다.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              전체 기능을 사용하려면 로그인해주세요.
            </p>
          </div>
        ) : (
          <ChatInput onSend={handleSend} disabled={isLoading} />
        )}
      </div>
    </div>
  );
}
