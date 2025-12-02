import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { sendChatMessage, getChatHistory } from "@/features/ai-chat/actions";
import { getSampleChatHistory } from "@/features/ai-chat/services/getSampleChatHistoryService";
import { type Message as ChatMessage } from "@/shared/types/chat";
import { useChatStore } from "@/stores";

export function useChat(babyId: string) {
  const { data: session } = useSession();
  const isGuestMode = babyId === "guest-baby-id";
  
  const {
    messages: allMessages,
    isGenerating,
    setMessages,
    addMessage,
    setGenerating,
    getMessageHistory
  } = useChatStore();

  const messages = getMessageHistory(babyId);

  // Initial message loading
  useEffect(() => {
    async function loadHistory() {
      // 이미 로드된 메시지가 있으면 다시 로드하지 않음 (옵션)
      // 하지만 실시간성을 위해 로드할 수도 있음. 여기서는 간단히 체크.
      if (messages.length > 0) return;

      if (isGuestMode) {
        const sampleHistory = getSampleChatHistory();
        // Type conversion if needed, assuming sampleHistory matches ChatMessage
        setMessages(babyId, sampleHistory as any[]);
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
          setMessages(babyId, [
            {
              id: 'initial-msg',
              role: "assistant",
              content: "안녕하세요! 육아에 관해 궁금한 점이 있으시면 물어보세요.",
              createdAt: new Date(),
            },
          ] as any[]);
        } else {
          setMessages(babyId, history as any[]);
        }
      }
    }
    loadHistory();
  }, [babyId, isGuestMode, setMessages]); // messages dependency removed to avoid loop if not careful, but logic above handles length check

  const handleSend = async (message: string) => {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user" as const,
      content: message,
      createdAt: new Date(),
    };
    
    // Optimistic update
    addMessage(babyId, userMessage as any);
    setGenerating(true);

    try {
      const result = await sendChatMessage(babyId, session?.user?.id, message);
      
      if (result.success && result.data?.reply) {
        const aiMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant" as const,
          content: result.data.reply,
          createdAt: new Date(),
        };
        addMessage(babyId, aiMessage as any);
      } else {
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          role: "assistant" as const,
          content: result.error || "죄송합니다. 응답을 생성하는 중에 문제가 발생했습니다.",
          createdAt: new Date(),
        };
        addMessage(babyId, errorMessage as any);
      }
    } catch (error) {
      console.error("메시지 전송 실패:", error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant" as const,
        content: "죄송합니다. 시스템 오류가 발생했습니다.",
        createdAt: new Date(),
      };
      addMessage(babyId, errorMessage as any);
    } finally {
      setGenerating(false);
    }
  };

  return { messages, isLoading: isGenerating, handleSend, isGuestMode };
}
