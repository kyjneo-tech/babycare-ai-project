// src/features/ai-chat/services/getSampleChatHistoryService.ts
import { Message } from '@/shared/types/chat';

export const getSampleChatHistory = (): Message[] => {
  const now = new Date();
  return [
    // 1. 수면 관련 샘플
    {
      id: 'sample-msg-1',
      role: 'user',
      content: '안녕하세요! 우리 아기는 오늘 밤에 잘 잘 수 있을까요? 어제는 밤에 3번이나 깼어요.',
      createdAt: new Date(now.getTime() - 30 * 60 * 1000),
    },
    {
      id: 'sample-msg-2',
      role: 'assistant',
      content: `안녕하세요! 샘플 아기의 어제 활동 기록을 보니, 낮잠을 평소보다 적게 자고 오후 늦게 긴 낮잠을 잤네요. 이것이 밤잠에 영향을 주었을 수 있습니다. 

오늘은 일정한 낮잠 루틴을 유지하고, 잠들기 전에는 목욕이나 책 읽기 같은 차분한 활동을 해보시는 건 어떨까요?

**이것은 샘플 데이터에 기반한 답변입니다.** 실제 아기 데이터를 연동하시면 훨씬 더 정확하고 개인화된 조언을 받으실 수 있습니다.`,
      createdAt: new Date(now.getTime() - 29 * 60 * 1000),
    },
    
    // 2. 수유 관련 샘플
    {
        id: 'sample-msg-3',
        role: 'user',
        content: '아기가 6개월인데, 요즘 분유를 잘 안 먹으려고 해요. 이유식은 하루에 한 번 80ml 정도 먹고 있는데, 분유량이 이대로 괜찮을까요?',
        createdAt: new Date(now.getTime() - 20 * 60 * 1000),
    },
    {
        id: 'sample-msg-4',
        role: 'assistant',
        content: `6개월 아기의 경우 이유식을 시작하면서 일시적으로 분유 섭취량이 줄어들 수 있습니다. 자연스러운 현상이니 너무 걱정하지 않으셔도 괜찮아요.

**샘플 아기의 기록을 분석해볼게요:**
- **총 수유량:** 하루 평균 700ml (권장: 700-900ml)
- **이유식:** 1회 80ml (초기 단계에 적절)

현재 총 수유량은 권장 범위 내에 있습니다. 아기가 이유식에 잘 적응하고 있다면, 점차 이유식 횟수와 양을 늘리면서 분유량을 조절해나가는 것이 좋습니다. 억지로 먹이시기보다는 아기의 배고픔 신호에 맞춰 수유해보세요.`,
        createdAt: new Date(now.getTime() - 19 * 60 * 1000),
    },

    // 3. 발달 관련 샘플
    {
        id: 'sample-msg-5',
        role: 'user',
        content: '9개월인데 아직 혼자 앉아있지를 못해요. 다른 아기들은 벌써 잡고 서기도 한다는데, 우리 아기 발달이 느린 걸까요?',
        createdAt: new Date(now.getTime() - 10 * 60 * 1000),
    },
    {
        id: 'sample-msg-6',
        role: 'assistant',
        content: `아기들의 발달 속도는 저마다 달라서 비교하기보다는 아기 자신만의 속도를 존중해주는 것이 중요합니다. 

9개월 아기의 평균적인 발달 과정은 다음과 같아요:
- **대근육:** 배밀이를 하거나, 붙잡고 일어설 수 있습니다. 혼자 앉는 것은 보통 7-9개월 사이에 가능해집니다.
- **소근육:** 작은 물건을 엄지와 검지로 잡을 수 있습니다.

아기가 다른 영역(예: 뒤집기, 배밀이, 소근육 사용 등)에서 꾸준히 발달하고 있다면 조금 더 지켜보셔도 좋습니다. 하지만 걱정이 계속되신다면 소아청소년과 의사 또는 발달 전문가와 상담해보시는 것을 권장합니다.`,
        createdAt: new Date(now.getTime() - 9 * 60 * 1000),
    }
  ];
};
