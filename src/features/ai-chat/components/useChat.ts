// src/components/features/ai-chat/useChat.ts
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { sendChatMessage, getChatHistory } from "@/features/ai-chat/actions";
import { getSampleChatHistory } from "@/features/ai-chat/services/getSampleChatHistoryService";
import { type Message as ChatMessage } from "@/shared/types/chat";

export function useChat(babyId: string) {
  const { data: session } = useSession();
  const isGuestMode = babyId === "guest-baby-id";
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initial message loading
  useEffect(() => {
    async function loadHistory() {
      if (isGuestMode) {
        const sampleHistory = getSampleChatHistory();
        setMessages(sampleHistory);
        return;
      }

      const result = await getChatHistory(babyId);
      if (result.success && result.data) {
        const history = result.data.map((msg: any) => ({
          id: msg.id,
          role: msg.role as "user" | "assistant",
          content: msg.content,
          createdAt: new Date(msg.createdAt),
        }));
        
        if (history.length === 0) {
          setMessages([
            {
              id: 'initial-msg',
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
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user" as const,
      content: message,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const result = await sendChatMessage(babyId, session?.user?.id, message);
      
      if (result.success && result.data?.reply) {
        const aiMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant" as const,
          content: result.data.reply,
          createdAt: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          role: "assistant" as const,
          content: result.error || "죄송합니다. 응답을 생성하는 중에 문제가 발생했습니다.",
          createdAt: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("메시지 전송 실패:", error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant" as const,
        content: "죄송합니다. 시스템 오류가 발생했습니다.",
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, isLoading, handleSend, isGuestMode };
}
