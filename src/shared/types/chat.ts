// src/shared/types/chat.ts

/**
 * AI 채팅 메시지 타입
 */
export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt?: Date;
}
