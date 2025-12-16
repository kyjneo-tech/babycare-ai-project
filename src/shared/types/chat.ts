// src/shared/types/chat.ts

/**
 * AI 채팅 메시지 타입
 */
export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt?: Date;
  messageId?: string;      // 실제 DB 메시지 ID (공유 API 호출 시 필요)
  userId?: string;         // 메시지 작성자 ID
  isShared?: boolean;      // 가족과 공유 여부
  sharedBy?: string | null;  // 공유한 사람 ID
  sharedAt?: Date | null;    // 공유한 시각
}
