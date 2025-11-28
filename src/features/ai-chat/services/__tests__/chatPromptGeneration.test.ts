// src/features/ai-chat/services/__tests__/chatPromptGeneration.test.ts

import { sendChatMessage, getBabyAISettings } from "../../actions";
import { prismaMock } from "../../../../../jest.setup";
import { genAI } from "@/shared/lib/gemini";
import { redis } from "@/shared/lib/redis";
import { Activity, ActivityType, Baby, BabyMeasurement } from "@prisma/client";

// Mock the NextAuth route
jest.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: {},
  handler: {
    GET: jest.fn(),
    POST: jest.fn(),
  },
}));

// next-auth 모킹
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

// redis 모킹
jest.mock("@/shared/lib/redis", () => ({
  redis: {
    get: jest.fn(),
    setex: jest.fn(),
  },
}));

// gemini 모킹
jest.mock("@/shared/lib/gemini", () => ({
  genAI: {
    getGenerativeModel: jest.fn(() => ({
      generateContent: jest.fn(),
    })),
  },
}));

// rate limit 모킹
jest.mock("@/shared/lib/ratelimit", () => ({
  aiChatRateLimit: {
    limit: jest.fn().mockResolvedValue({ success: true }),
  },
}));

// logger 모킹
jest.mock("@/shared/lib/logger", () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe("AI 채팅 프롬프트 생성 (Chat Prompt Generation)", () => {
  const mockUserId = "test-user-id";
  const mockBabyId = "test-baby-id";
  const mockFamilyId = "test-family-id";

  const mockBaby: Baby = {
    id: mockBabyId,
    name: "서연",
    gender: "female",
    birthDate: new Date("2024-06-01T00:00:00Z"),
    birthTime: "14:30",
    familyId: mockFamilyId,
    photoUrl: null,
    aiSettings: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let mockGenerativeModel: any;
  let capturedPrompt: string = "";

  // 헬퍼 함수: 기본 mock 설정
  const setupBasicMocks = () => {
    prismaMock.baby.findUnique.mockResolvedValue(mockBaby);
    prismaMock.activity.findMany.mockResolvedValue([]);
    prismaMock.familyMember.findFirst.mockResolvedValue({
      id: "member-1",
      familyId: mockFamilyId,
      userId: mockUserId,
      relation: "mother",
      role: "ADMIN",
      joinedAt: new Date(),
    });
    prismaMock.chatMessage.findMany.mockResolvedValue([]);
    prismaMock.chatMessage.count.mockResolvedValue(0);
    prismaMock.chatMessage.findFirst.mockResolvedValue(null);
    prismaMock.chatMessage.create.mockResolvedValue({
      id: "chat-1",
      babyId: mockBabyId,
      userId: mockUserId,
      message: "테스트 질문",
      reply: "AI 응답입니다.",
      summary: "{}",
      createdAt: new Date(),
    });
    prismaMock.chatMessage.delete.mockResolvedValue({
      id: "chat-1",
      babyId: mockBabyId,
      userId: mockUserId,
      message: "테스트 질문",
      reply: "AI 응답입니다.",
      summary: "{}",
      createdAt: new Date(),
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    capturedPrompt = "";

    // Gemini API 응답 모킹 및 프롬프트 캡처
    mockGenerativeModel = {
      generateContent: jest.fn().mockImplementation((args: any[]) => {
        capturedPrompt = args[0];
        return Promise.resolve({
          response: {
            text: jest.fn(() => "AI 응답입니다."),
          },
        });
      }),
    };
    (genAI.getGenerativeModel as jest.Mock).mockImplementation(() => mockGenerativeModel);

    // Redis mock
    (redis.get as jest.Mock).mockResolvedValue(null);
    (redis.setex as jest.Mock).mockResolvedValue("OK");

    // Prisma transaction mock
    prismaMock.$transaction.mockImplementation(async (callback: any) => {
      return await callback(prismaMock);
    });
  });

  describe("아기 기본 정보 포함", () => {
    it("아기 이름이 프롬프트에 포함된다", async () => {
      setupBasicMocks();

      const result = await sendChatMessage(mockBabyId, mockUserId, "우리 아기 건강한가요?");

      if (!result.success) {
        console.error("Error:", result.error);
      }
      expect(result.success).toBe(true);
      expect(capturedPrompt).toContain("서연");
    });

    it("아기 성별이 프롬프트에 포함된다", async () => {
      setupBasicMocks();

      await sendChatMessage(mockBabyId, mockUserId, "우리 아기 건강한가요?");

      expect(capturedPrompt).toContain("여아");
    });

    it("아기 개월수가 프롬프트에 포함된다", async () => {
      setupBasicMocks();

      await sendChatMessage(mockBabyId, mockUserId, "우리 아기 건강한가요?");

      expect(capturedPrompt).toMatch(/\d+개월/);
    });
  });

  describe("활동 데이터 포함", () => {
    it("수유 활동이 프롬프트에 포함된다", async () => {
      const feedingActivity: Activity = {
        id: "activity-1",
        userId: mockUserId,
        babyId: mockBabyId,
        type: ActivityType.FEEDING,
        startTime: new Date(),
        feedingType: "breast",
        feedingAmount: 120,
        breastSide: "left",
        endTime: null,
        note: null,
        sleepType: null,
        duration: null,
        diaperType: null,
        stoolColor: null,
        bathType: null,
        bathTemp: null,
        playType: null,
        playDuration: null,
        medicineName: null,
        medicineAmount: null,
        medicineUnit: null,
        reaction: null,
        stoolCondition: null,
        playLocation: null,
        temperature: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setupBasicMocks();
      prismaMock.activity.findMany.mockResolvedValue([feedingActivity]);

      await sendChatMessage(mockBabyId, mockUserId, "수유 패턴이 괜찮나요?");

      expect(capturedPrompt).toContain("FEEDING");
      expect(capturedPrompt).toContain("120ml");
    });

    it("수면 활동이 프롬프트에 포함된다", async () => {
      const sleepActivity: Activity = {
        id: "activity-2",
        userId: mockUserId,
        babyId: mockBabyId,
        type: ActivityType.SLEEP,
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        sleepType: "night",
        duration: 120,
        endTime: new Date(),
        feedingType: null,
        feedingAmount: null,
        breastSide: null,
        note: null,
        diaperType: null,
        stoolColor: null,
        bathType: null,
        bathTemp: null,
        playType: null,
        playDuration: null,
        medicineName: null,
        medicineAmount: null,
        medicineUnit: null,
        reaction: null,
        stoolCondition: null,
        playLocation: null,
        temperature: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setupBasicMocks();
      prismaMock.activity.findMany.mockResolvedValue([sleepActivity]);

      await sendChatMessage(mockBabyId, mockUserId, "수면 패턴이 괜찮나요?");

      expect(capturedPrompt).toContain("SLEEP");
      expect(capturedPrompt).toContain("밤잠");
    });

    it("배변 활동이 프롬프트에 포함된다", async () => {
      const diaperActivity: Activity = {
        id: "activity-3",
        userId: mockUserId,
        babyId: mockBabyId,
        type: ActivityType.DIAPER,
        startTime: new Date(),
        diaperType: "stool",
        stoolColor: "yellow",
        stoolCondition: "normal",
        feedingType: null,
        feedingAmount: null,
        breastSide: null,
        endTime: null,
        note: null,
        sleepType: null,
        duration: null,
        bathType: null,
        bathTemp: null,
        playType: null,
        playDuration: null,
        medicineName: null,
        medicineAmount: null,
        medicineUnit: null,
        reaction: null,
        playLocation: null,
        temperature: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setupBasicMocks();
      prismaMock.activity.findMany.mockResolvedValue([diaperActivity]);

      await sendChatMessage(mockBabyId, mockUserId, "배변 상태가 괜찮나요?");

      expect(capturedPrompt).toContain("DIAPER");
      expect(capturedPrompt).toContain("대변");
      expect(capturedPrompt).toContain("yellow");
    });
  });

  describe("성장 기록 포함", () => {
    it("성장 측정값이 프롬프트에 포함된다", async () => {
      const measurement: BabyMeasurement = {
        id: "measurement-1",
        babyId: mockBabyId,
        weight: 7.2,
        height: 65.5,
        headCircumference: null,
        measuredAt: new Date(),
        note: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setupBasicMocks();
      prismaMock.babyMeasurement.findMany.mockResolvedValue([measurement]);
      prismaMock.babyMeasurement.findFirst.mockResolvedValue(null);

      await sendChatMessage(mockBabyId, mockUserId, "성장 발달이 정상인가요?");

      expect(capturedPrompt).toContain("7.2");
      expect(capturedPrompt).toContain("65.5");
    });

    it("성장 기록이 없을 때는 '기록 없음'이 표시된다", async () => {
      setupBasicMocks();
      prismaMock.babyMeasurement.findMany.mockResolvedValue([]);
      prismaMock.babyMeasurement.findFirst.mockResolvedValue(null);

      await sendChatMessage(mockBabyId, mockUserId, "성장 발달이 정상인가요?");

      expect(capturedPrompt).toContain("기록 없음");
    });
  });

  describe("프롬프트 템플릿 구조", () => {
    beforeEach(() => {
      setupBasicMocks();
    });

    it("BabyCare AI 역할이 명시된다", async () => {
      await sendChatMessage(mockBabyId, mockUserId, "질문입니다");

      expect(capturedPrompt).toContain("BabyCare AI");
    });

    it("의료 면책 조항이 포함된다", async () => {
      await sendChatMessage(mockBabyId, mockUserId, "질문입니다");

      expect(capturedPrompt).toContain("의료 전문가");
      expect(capturedPrompt).toContain("진단");
    });

    it("사용자 관계(호칭)가 포함된다", async () => {
      await sendChatMessage(mockBabyId, mockUserId, "질문입니다");

      expect(capturedPrompt).toContain("엄마");
    });

    it("답변 가이드라인이 포함된다", async () => {
      await sendChatMessage(mockBabyId, mockUserId, "질문입니다");

      expect(capturedPrompt).toContain("답변 가이드라인");
    });

    it("볼드 표시 사용 금지 지침이 포함된다", async () => {
      await sendChatMessage(mockBabyId, mockUserId, "질문입니다");

      expect(capturedPrompt).toContain("마크다운 볼드");
      expect(capturedPrompt).toContain("절대 사용하지 마세요");
    });
  });

  describe("AI 설정 반영", () => {
    it("수유 데이터 제외 설정이 반영된다", async () => {
      const feedingActivity: Activity = {
        id: "activity-1",
        userId: mockUserId,
        babyId: mockBabyId,
        type: ActivityType.FEEDING,
        startTime: new Date(),
        feedingType: "breast",
        feedingAmount: 120,
        breastSide: "left",
        endTime: null,
        note: null,
        sleepType: null,
        duration: null,
        diaperType: null,
        stoolColor: null,
        bathType: null,
        bathTemp: null,
        playType: null,
        playDuration: null,
        medicineName: null,
        medicineAmount: null,
        medicineUnit: null,
        reaction: null,
        stoolCondition: null,
        playLocation: null,
        temperature: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setupBasicMocks();
      prismaMock.baby.findUnique.mockResolvedValue({
        ...mockBaby,
        aiSettings: {
          feeding: false,
          sleep: true,
          diaper: true,
          growth: true,
          medication: true,
          temperature: true,
          bath: true,
          play: true,
        } as any,
      });
      prismaMock.activity.findMany.mockResolvedValue([feedingActivity]);

      await sendChatMessage(mockBabyId, mockUserId, "질문입니다");

      expect(capturedPrompt).toContain("수유");
      expect(capturedPrompt).toContain("제외");
      // 수유 활동이 필터링되어 프롬프트에 포함되지 않음
      expect(capturedPrompt).not.toContain("120ml");
    });

    it("성장 기록 제외 설정이 반영된다", async () => {
      setupBasicMocks();
      prismaMock.baby.findUnique.mockResolvedValue({
        ...mockBaby,
        aiSettings: {
          feeding: true,
          sleep: true,
          diaper: true,
          growth: false,
          medication: true,
          temperature: true,
          bath: true,
          play: true,
        } as any,
      });

      await sendChatMessage(mockBabyId, mockUserId, "질문입니다");

      expect(capturedPrompt).toContain("성장 기록 분석을 제외");
      // babyMeasurement.findMany가 호출되지 않아야 함
      expect(prismaMock.babyMeasurement.findMany).not.toHaveBeenCalled();
    });
  });

  describe("이전 대화 기록", () => {
    it("이전 대화가 컨텍스트에 포함된다", async () => {
      const previousChat = {
        id: "chat-prev",
        babyId: mockBabyId,
        userId: mockUserId,
        message: "이전 질문",
        reply: "이전 답변",
        summary: "{}",
        createdAt: new Date(Date.now() - 10 * 60 * 1000),
      };

      setupBasicMocks();
      prismaMock.chatMessage.findMany.mockResolvedValue([previousChat]);
      prismaMock.chatMessage.count.mockResolvedValue(1);

      await sendChatMessage(mockBabyId, mockUserId, "새 질문");

      expect(capturedPrompt).toContain("이전 대화 기록");
      expect(capturedPrompt).toContain("이전 질문");
      expect(capturedPrompt).toContain("이전 답변");
    });

    it("이전 대화가 없을 때 '없음'이 표시된다", async () => {
      setupBasicMocks();

      await sendChatMessage(mockBabyId, mockUserId, "첫 질문");

      expect(capturedPrompt).toContain("없음");
    });
  });

  describe("현재 질문 포함", () => {
    it("사용자의 현재 질문이 프롬프트에 포함된다", async () => {
      setupBasicMocks();

      await sendChatMessage(mockBabyId, mockUserId, "우리 아기 수면 패턴이 정상인가요?");

      expect(capturedPrompt).toContain("현재 질문");
      expect(capturedPrompt).toContain("우리 아기 수면 패턴이 정상인가요?");
    });
  });

  describe("데이터 없을 때 기본 프롬프트", () => {
    it("활동 기록이 없어도 프롬프트가 생성된다", async () => {
      setupBasicMocks();

      const result = await sendChatMessage(mockBabyId, mockUserId, "질문");

      expect(result.success).toBe(true);
      expect(capturedPrompt).toBeTruthy();
      expect(capturedPrompt.length).toBeGreaterThan(100);
      expect(capturedPrompt).toContain("기간 내 기록 없음");
    });
  });

  describe("게스트 모드", () => {
    it("게스트 모드에서는 샘플 응답을 반환한다", async () => {
      const result = await sendChatMessage("guest-baby-id", undefined, "질문");

      expect(result.success).toBe(true);
      expect(result.data?.reply).toContain("게스트 모드");
      // Gemini API가 호출되지 않아야 함
      expect(mockGenerativeModel.generateContent).not.toHaveBeenCalled();
    });
  });

  describe("AI 설정 조회", () => {
    it("저장된 설정을 반환한다", async () => {
      const savedSettings = {
        feeding: false,
        sleep: true,
        diaper: true,
        growth: true,
        medication: true,
        temperature: true,
        bath: true,
        play: true,
      };

      prismaMock.baby.findUnique.mockResolvedValue({
        ...mockBaby,
        aiSettings: savedSettings as any,
      });

      const result = await getBabyAISettings(mockBabyId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(savedSettings);
    });

    it("설정이 없으면 기본값을 반환한다", async () => {
      prismaMock.baby.findUnique.mockResolvedValue({
        ...mockBaby,
        aiSettings: null,
      });

      const result = await getBabyAISettings(mockBabyId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        feeding: true,
        sleep: true,
        diaper: true,
        growth: true,
        medication: true,
        temperature: true,
        bath: true,
        play: true,
      });
    });

    it("게스트 모드에서는 기본값을 반환한다", async () => {
      const result = await getBabyAISettings("guest-baby-id");

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        feeding: true,
        sleep: true,
        diaper: true,
        growth: true,
        medication: true,
        temperature: true,
        bath: true,
        play: true,
      });
      // DB 조회가 발생하지 않아야 함
      expect(prismaMock.baby.findUnique).not.toHaveBeenCalled();
    });
  });
});
