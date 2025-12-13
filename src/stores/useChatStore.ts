import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Message as ChatMessage } from '@/shared/types/chat';

interface ChatState {
  // 상태
  messages: Record<string, ChatMessage[]>; // key: babyId
  isLoading: boolean;
  error: string | null;

  // Actions
  setMessages: (babyId: string, messages: ChatMessage[]) => void;
  addMessage: (babyId: string, message: ChatMessage) => void;
  appendContentToLastMessage: (babyId: string, chunk: string) => void;
  setLastErrorContent: (babyId: string, errorContent: string) => void;
  clearHistory: (babyId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void; // 전체 초기화 (로그아웃 시 사용)

  // Computed Selectors
  getMessageHistory: (babyId: string) => ChatMessage[];
  getLastMessage: (babyId: string) => ChatMessage | null;
}

export const useChatStore = create<ChatState>()(
  devtools(
    (set, get) => ({
      messages: {},
      isLoading: false,
      error: null,

      setMessages: (babyId, messages) =>
        set((state) => ({
          messages: { ...state.messages, [babyId]: messages },
        })),
      addMessage: (babyId, message) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [babyId]: [...(state.messages[babyId] || []), message],
          },
        })),
      appendContentToLastMessage: (babyId, chunk) =>
        set((state) => {
          const babyMessages = state.messages[babyId] || [];
          if (babyMessages.length === 0) return {};

          const lastMessage = babyMessages[babyMessages.length - 1];
          // Only append to assistant messages
          if (lastMessage.role !== 'assistant') return {};

          const updatedLastMessage = {
            ...lastMessage,
            content: lastMessage.content + chunk,
          };

          return {
            messages: {
              ...state.messages,
              [babyId]: [...babyMessages.slice(0, -1), updatedLastMessage],
            },
          };
        }),
      setLastErrorContent: (babyId, errorContent) =>
        set(state => {
          const babyMessages = state.messages[babyId] || [];
          if (babyMessages.length === 0) return {};
          
          const lastMessage = babyMessages[babyMessages.length - 1];
          const updatedLastMessage = { ...lastMessage, content: errorContent };

          return {
            messages: {
              ...state.messages,
              [babyId]: [...babyMessages.slice(0, -1), updatedLastMessage],
            },
          };
        }),
      clearHistory: (babyId) =>
        set((state) => ({
          messages: { ...state.messages, [babyId]: [] },
        })),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      clearMessages: () => set({
        messages: {},
        isLoading: false,
        error: null,
      }),

      // Computed Selectors
      getMessageHistory: (babyId) => {
        return get().messages[babyId] || [];
      },
      getLastMessage: (babyId) => {
        const messages = get().messages[babyId] || [];
        return messages.length > 0 ? messages[messages.length - 1] : null;
      },
    }),
    { name: 'ChatStore' }
  )
);
