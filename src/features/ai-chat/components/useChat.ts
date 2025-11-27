// src/components/features/ai-chat/useChat.ts
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { sendChatMessage, getChatHistory } from "@/features/ai-chat/actions";

// Define the shape of a message
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export function useChat(babyId: string) {
  const { data: session } = useSession();
  const isGuestMode = babyId === "guest-baby-id";
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initial message loading
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
            content: `최근 활동 기록을 분석한 결과를 알려드리겠습니다.\n\n**수유 패턴 분석:**\n- 평균 수유량: 약 150ml/회\n- 하루 평균 수유 횟수: 6-7회\n- 총 일일 수유량: 약 900-1050ml\n\n**6개월 아기 권장 수유량:**\n- 일반적으로 6개월 아기는 하루 800-1000ml 정도가 적절합니다.\n- 현재 수유량은 권장 범위 내에 있어 적절한 수준입니다.\n\n**추가 조언:**\n✅ 수유 간격이 규칙적이고 아기가 잘 자라고 있다면 현재 수유량을 유지하세요.\n✅ 이유식을 시작했다면 점차 분유량을 줄이고 이유식 양을 늘려가세요.\n✅ 아기의 체중 증가와 활동량을 고려하여 조절하세요.\n\n궁금한 점이 더 있으시면 언제든 물어보세요! 😊`,
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
    const userMessage: ChatMessage = {
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
          role: "assistant" as const,
          content: result.data.reply,
          createdAt: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        const errorMessage: ChatMessage = {
          role: "assistant" as const,
          content: result.error || "죄송합니다. 응답을 생성하는 중에 문제가 발생했습니다.",
          createdAt: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("메시지 전송 실패:", error);
      const errorMessage: ChatMessage = {
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
