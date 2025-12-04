import { prisma } from "@/shared/lib/prisma";
import { CHAT_HISTORY_LIMIT } from "../constants/aiSettings";

/**
 * 채팅 메시지를 저장합니다 (최신 N개 유지)
 */
export async function saveChatMessage(
  babyId: string,
  userId: string,
  message: string,
  reply: string,
  summary: any
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const count = await tx.chatMessage.count({
      where: { babyId },
    });

    // 한도 초과 시 가장 오래된 메시지 삭제
    if (count >= CHAT_HISTORY_LIMIT) {
      const oldestMessage = await tx.chatMessage.findFirst({
        where: { babyId },
        orderBy: { createdAt: "asc" },
        select: { id: true },
      });

      if (oldestMessage) {
        await tx.chatMessage.delete({
          where: { id: oldestMessage.id },
        });
      }
    }

    // 새 메시지 생성
    await tx.chatMessage.create({
      data: {
        babyId,
        userId,
        message,
        reply: reply || "",
        summary: JSON.stringify(summary),
      },
    });
  });
}
