// src/features/ai-chat/services/getSampleChatHistoryService.ts
import { Message } from '@/shared/types/chat';

export const getSampleChatHistory = (): Message[] => {
  const now = new Date();
  return [
    {
      id: 'sample-msg-1',
      role: 'user',
      content: '안녕하세요! 우리 아기는 오늘 밤에 잘 잘 수 있을까요? 어제는 밤에 3번이나 깼어요.',
      createdAt: new Date(now.getTime() - 5 * 60 * 1000),
    },
    {
      id: 'sample-msg-2',
      role: 'assistant',
      content: `안녕하세요! 샘플 아기의 어제 활동 기록을 보니, 낮잠을 평소보다 적게 자고 오후 늦게 긴 낮잠을 잤네요. 이것이 밤잠에 영향을 주었을 수 있습니다. 

오늘은 일정한 낮잠 루틴을 유지하고, 잠들기 전에는 목욕이나 책 읽기 같은 차분한 활동을 해보시는 건 어떨까요?

**이것은 샘플 데이터에 기반한 답변입니다.** 실제 아기 데이터를 연동하시면 훨씬 더 정확하고 개인화된 조언을 받으실 수 있습니다.`,
      createdAt: new Date(now.getTime() - 4 * 60 * 1000),
    },
    {
        id: 'sample-msg-3',
        role: 'user',
        content: '좋은 정보 감사합니다!',
        createdAt: new Date(now.getTime() - 3 * 60 * 1000),
    }
  ];
};
