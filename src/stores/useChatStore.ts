import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Message as ChatMessage } from '@/shared/types/chat';

interface ChatState {
  // 상태
  messages: Record<string, ChatMessage[]>; // key: babyId
  isGenerating: boolean;
  streamingMessage: string; // 스트리밍 중인 메시지
  isLoading: boolean;
  error: string | null;

  // Actions
  setMessages: (babyId: string, messages: ChatMessage[]) => void;
  addMessage: (babyId: string, message: ChatMessage) => void;
  setGenerating: (isGenerating: boolean) => void;
  setStreamingMessage: (message: string) => void;
  clearStreamingMessage: () => void;
  clearHistory: (babyId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  // Computed Selectors
  getMessageHistory: (babyId: string) => ChatMessage[];
  getLastMessage: (babyId: string) => ChatMessage | null;
}

export const useChatStore = create<ChatState>()(
  devtools(
    (set, get) => ({
      messages: {},
      isGenerating: false,
      streamingMessage: '',
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
      setGenerating: (isGenerating) => set({ isGenerating }),
      setStreamingMessage: (message) => set({ streamingMessage: message }),
      clearStreamingMessage: () => set({ streamingMessage: '' }),
      clearHistory: (babyId) =>
        set((state) => ({
          messages: { ...state.messages, [babyId]: [] },
        })),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

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
