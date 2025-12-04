/**
 * AI가 사용할 수 있는 대화 기록 도구
 */

import { prisma } from "@/shared/lib/prisma";

export interface GetChatHistoryParams {
  babyId: string;
  count?: number;        // 가져올 개수 (기본 3, 최대 10)
  searchKeyword?: string; // 검색 키워드 (선택)
}

export interface ChatHistoryResult {
  conversations: Array<{
    timeAgo: string;
    userMessage: string;
    aiReply: string;
  }>;
  totalFound: number;
  message: string;
}

/**
 * 대화 기록 조회 도구 (AI가 호출)
 */
export async function getChatHistoryTool(
  params: GetChatHistoryParams
): Promise<ChatHistoryResult> {
  const { babyId, count = 3, searchKeyword } = params;

  // 최대 10개로 제한
  const limitedCount = Math.min(Math.max(1, count), 10);

  try {
    let messages;

    if (searchKeyword) {
      // 키워드 검색
      messages = await prisma.chatMessage.findMany({
        where: {
          babyId,
          OR: [
            { message: { contains: searchKeyword } },
            { reply: { contains: searchKeyword } },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: limitedCount,
      });
    } else {
      // 최신 N개
      messages = await prisma.chatMessage.findMany({
        where: { babyId },
        orderBy: { createdAt: "desc" },
        take: limitedCount,
      });
    }

    if (messages.length === 0) {
      return {
        conversations: [],
        totalFound: 0,
        message: searchKeyword
          ? `"${searchKeyword}"와 관련된 대화를 찾을 수 없습니다.`
          : "이전 대화 기록이 없습니다.",
      };
    }

    // 시간 역순 정렬 (과거 -> 현재)
    const sortedMessages = messages.reverse();

    // 포맷팅
    const conversations = sortedMessages.map((msg) => {
      const timeAgo = getTimeAgo(msg.createdAt);
      return {
        timeAgo,
        userMessage: msg.message,
        aiReply: msg.reply,
      };
    });

    return {
      conversations,
      totalFound: messages.length,
      message: searchKeyword
        ? `"${searchKeyword}"와 관련된 대화 ${messages.length}개를 찾았습니다.`
        : `최근 대화 ${messages.length}개입니다.`,
    };
  } catch (error) {
    console.error("대화 기록 조회 실패:", error);
    return {
      conversations: [],
      totalFound: 0,
      message: "대화 기록을 불러오는 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 시간 경과 표시 (예: "3분 전", "2시간 전")
 */
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 7) return `${diffDay}일 전`;

  // 7일 이상은 날짜 표시
  return new Date(date).toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
  });
}

/**
 * 대화 기록을 텍스트로 포맷팅 (기존 방식과 호환)
 */
export function formatChatHistoryForPrompt(result: ChatHistoryResult): string {
  if (result.conversations.length === 0) {
    return "없음";
  }

  return result.conversations
    .map((conv) => {
      return `[${conv.timeAgo}]
User: ${conv.userMessage}
AI: ${conv.aiReply}`;
    })
    .join("\n\n");
}
