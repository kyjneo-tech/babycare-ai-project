import { collectChatMetrics, ChatMetricsInput } from '../metricsCollector';
import { prisma } from '@/shared/lib/prisma';

// Prisma Mock
jest.mock('@/shared/lib/prisma', () => ({
  prisma: {
    chatMetrics: {
      create: jest.fn(),
    },
  },
}));

describe('collectChatMetrics', () => {
  const mockInput: ChatMetricsInput = {
    babyId: 'baby-123',
    userId: 'user-123',
    question: '오늘 아기 상태 어때?',
    answer: '아기 상태가 좋아 보입니다.',
    complexity: 'simple',
    historyTier: 1,
    historyCount: 0,
    historyReason: 'No history needed',
    mode: 'single-ai',
    startTime: 1000,
    endTime: 2000,
    inputTokens: 100,
    outputTokens: 50,
    aiCallCount: 1,
    toolsCalled: [],
    toolsSuccess: true,
    success: true,
    dataAvailable: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('올바른 데이터로 prisma.chatMetrics.create를 호출해야 한다', async () => {
    await collectChatMetrics(mockInput);

    expect(prisma.chatMetrics.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        babyId: 'baby-123',
        userId: 'user-123',
        totalTime: 1000, // 2000 - 1000
        inputTokens: 100,
        outputTokens: 50,
        totalTokens: 150,
      }),
    });
  });

  it('비용 계산이 정확해야 한다 (Gemini 2.5 Flash 기준 추정)', async () => {
    // Input: 10,000 토큰 -> $0.001
    // Output: 10,000 토큰 -> $0.004
    const costInput = {
      ...mockInput,
      inputTokens: 10000,
      outputTokens: 10000,
    };

    await collectChatMetrics(costInput);

    expect(prisma.chatMetrics.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        estimatedCost: expect.closeTo(0.001 + 0.004, 5),
      }),
    });
  });

  it('DB 저장 중 에러가 발생해도 예외를 던지지 않아야 한다 (Silent Fail)', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (prisma.chatMetrics.create as jest.Mock).mockRejectedValue(new Error('DB Error'));

    await expect(collectChatMetrics(mockInput)).resolves.not.toThrow();

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
