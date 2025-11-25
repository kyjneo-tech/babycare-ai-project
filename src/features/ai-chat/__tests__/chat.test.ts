import { sendChatMessage } from "../actions";
import { prismaMock } from "../../../../jest.setup";
import { genAI } from "@/shared/lib/gemini";
import { redis } from "@/shared/lib/redis";
import { Activity, ActivityType, Baby, ChatMessage } from "@prisma/client";

// Mock the NextAuth route
jest.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: {}, // Provide a minimal authOptions object
  handler: {
    // Mock the handler with GET and POST methods
    GET: jest.fn(),
    POST: jest.fn(),
  },
}));

// next-auth 모킹
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));
import { getServerSession } from "next-auth";
const mockGetServerSession = getServerSession as jest.Mock;

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

describe("AI 채팅 (AI Chat)", () => {
  const mockUserId = "test-user-id";
  const mockBabyId = "test-baby-id";
  const mockBaby: Baby = {
    id: mockBabyId,
    name: "테스트아기",
    gender: "male",
    birthDate: new Date("2024-01-01T00:00:00Z"),
    birthTime: "00:00",
    familyId: "test-family-id",
    photoUrl: null,
    aiSettings: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  type ActivityWithBaby = Activity & { baby: Baby };
  let mockGenerativeModel: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServerSession.mockResolvedValue({
      user: { id: mockUserId, email: "test@example.com" },
    });

    // Directly mock the generateContent behavior
    mockGenerativeModel = {
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: jest.fn(() => "AI 응답입니다."),
        },
      }),
    };
    (genAI.getGenerativeModel as jest.Mock).mockImplementation(
      (modelParams: any) => mockGenerativeModel
    );
  });

  it("[성공] 최근 2일 기록을 컨텍스트로 AI 응답 생성 (캐시 없음)", async () => {
    const mockActivities: ActivityWithBaby[] = [
      { ...mockActivity, baby: mockBaby, type: "FEEDING" as ActivityType },
      {
        ...mockActivity,
        baby: mockBaby,
        type: "SLEEP" as ActivityType,
        id: "activity-2",
      },
    ];
    (redis.get as jest.Mock).mockResolvedValue(null);
    prismaMock.activity.findMany.mockResolvedValue(mockActivities);

    prismaMock.chatMessage.create.mockResolvedValue(mockChatMessage);

    const result = await sendChatMessage(
      mockBabyId,
      "우리 아기 수면 패턴이 괜찮나요?"
    );

    expect(result.success).toBe(true);
    expect(result.data?.reply).toBe("AI 응답입니다.");
    expect(redis.get).toHaveBeenCalledWith(`baby:${mockBabyId}:recent`);
    expect(prismaMock.activity.findMany).toHaveBeenCalled();
    expect(redis.setex).toHaveBeenCalledWith(
      `baby:${mockBabyId}:recent`,
      600,
      expect.any(String)
    );
    expect(mockGenerativeModel.generateContent).toHaveBeenCalled();
    expect(prismaMock.chatMessage.create).toHaveBeenCalled();
  });

  it("[성공] Redis 캐시 활용 (두 번째 요청은 캐시에서 조회)", async () => {
    const mockActivities: ActivityWithBaby[] = [
      { ...mockActivity, baby: mockBaby },
    ];
    (redis.get as jest.Mock).mockResolvedValue(JSON.stringify(mockActivities));

    prismaMock.chatMessage.create.mockResolvedValue(mockChatMessage);

    const result = await sendChatMessage(mockBabyId, "캐시 질문");

    expect(result.success).toBe(true);
    expect(result.data?.reply).toBe("AI 응답입니다.");
    expect(redis.get).toHaveBeenCalledWith(`baby:${mockBabyId}:recent`);
    expect(prismaMock.activity.findMany).not.toHaveBeenCalled();
    expect(mockGenerativeModel.generateContent).toHaveBeenCalled();
    expect(prismaMock.chatMessage.create).toHaveBeenCalled();
  });

  it("[실패] 최근 2일 내 기록이 없을 경우 에러 반환", async () => {
    (redis.get as jest.Mock).mockResolvedValue(null);
    prismaMock.activity.findMany.mockResolvedValue([]);

    const result = await sendChatMessage(mockBabyId, "질문");

    expect(result.success).toBe(false);
    expect(mockGenerativeModel.generateContent).not.toHaveBeenCalled();
    expect(prismaMock.chatMessage.create).not.toHaveBeenCalled();
  });

  it("[실패] 로그인하지 않은 경우 에러 반환", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const result = await sendChatMessage(mockBabyId, "질문");

    expect(result.success).toBe(false);
    expect(result.error).toBe("로그인이 필요합니다");
    expect(mockGenerativeModel.generateContent).not.toHaveBeenCalled();
    expect(prismaMock.chatMessage.create).not.toHaveBeenCalled();
  });
});

const mockActivity: Activity & { baby?: Baby } = {
  id: "activity-id-1",
  userId: "test-user-id",
  babyId: "test-baby-id",
  type: ActivityType.FEEDING,
  startTime: new Date(),
  feedingType: "breast",
  feedingAmount: 100,
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

const mockChatMessage: ChatMessage = {
  id: "chat-id-1",
  babyId: "test-baby-id",
  userId: "test-user-id",
  message: "질문",
  reply: "AI 응답입니다.",
  summary: {},
  createdAt: new Date(),
};
