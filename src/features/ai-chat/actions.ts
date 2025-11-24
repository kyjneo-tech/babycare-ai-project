// src/features/ai-chat/actions.ts
"use server";

import { prisma } from "@/shared/lib/prisma";
import { redis } from "@/shared/lib/redis";
import { genAI } from "@/shared/lib/gemini";
import { ChatMessage } from "@prisma/client";
import { getSampleChatHistory } from "./services/getSampleChatHistoryService";
import { Message } from "@/shared/types/chat";

interface ActivitySummary {
  feeding: {
    count: number;
    totalAmount: number;
    avgAmount: number;
  };
  sleep: {
    count: number;
    totalHours: number;
    napCount: number;
  };
  diaper: {
    urineCount: number;
    stoolCount: number;
  };
  temperature: number | null;
}

// 활동 로그 포맷팅 (Raw Data)
function formatActivityLogs(activities: any[]): string {
  return activities
    .map((a) => {
      const time = new Date(a.startTime).toLocaleString("ko-KR", {
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      let details = "";
      switch (a.type) {
        case "FEEDING":
          details = `${a.feedingAmount || 0}ml (${a.feedingType || "모유/분유"})`;
          break;
        case "SLEEP":
          const duration = a.duration ? `${Math.round(a.duration / 60 * 10) / 10}시간` : "진행 중";
          details = `${a.sleepType === "nap" ? "낮잠" : "밤잠"} (${duration})`;
          break;
        case "DIAPER":
          const stoolCond = a.stoolCondition
            ? {
                watery: "물설사",
                loose: "묽은변",
                normal: "정상변",
                hard: "된변(토끼똥)",
              }[a.stoolCondition as string] || a.stoolCondition
            : "";
          details = `${a.diaperType === "urine" ? "소변" : "대변"}${
            a.stoolColor ? `, ${a.stoolColor}` : ""
          }${stoolCond ? `, ${stoolCond}` : ""}`;
          break;
        case "TEMPERATURE":
          details = `${a.temperature}°C`;
          break;
        case "MEDICINE":
          details = `${a.medicineName} ${a.medicineAmount || ""}`;
          break;
        case "NOTE":
          details = a.note || "";
          break;
        default:
          details = a.note || "";
      }

      return `- [${time}] ${a.type}: ${details}`;
    })
    .reverse() // 최신순 -> 시간순 (과거 -> 현재)
    .join("\n");
}

function getMonthAge(birthDate: Date): number {
  const now = new Date();
  const months =
    (now.getFullYear() - birthDate.getFullYear()) * 12 +
    (now.getMonth() - birthDate.getMonth());
  return months;
}

// 스마트 성장 기록 조회 (최근 1개월 + 직전 기록)
async function getSmartGrowthHistory(babyId: string) {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  // 1. 최근 1개월 기록
  const recentMeasurements = await prisma.babyMeasurement.findMany({
    where: {
      babyId,
      measuredAt: { gte: oneMonthAgo },
    },
    orderBy: { measuredAt: "asc" },
  });

  // 2. 1개월 이전의 가장 최근 기록 1개 (추세 비교용)
  const lastMeasurementBeforeMonth = await prisma.babyMeasurement.findFirst({
    where: {
      babyId,
      measuredAt: { lt: oneMonthAgo },
    },
    orderBy: { measuredAt: "desc" },
  });

  const history = lastMeasurementBeforeMonth
    ? [lastMeasurementBeforeMonth, ...recentMeasurements]
    : recentMeasurements;

  return history.map((m: { measuredAt: Date; weight: number; height: number }) => ({
    date: new Date(m.measuredAt).toLocaleDateString("ko-KR"),
    weight: m.weight,
    height: m.height,
  }));
}

// AI 설정 타입 정의
interface AISettings {
  feeding: boolean;
  sleep: boolean;
  diaper: boolean;
  growth: boolean;
  medication: boolean;
  temperature: boolean;
  bath: boolean;
  play: boolean;
}

const DEFAULT_SETTINGS: AISettings = {
  feeding: true,
  sleep: true,
  diaper: true,
  growth: true,
  medication: true,
  temperature: true,
  bath: true,
  play: true,
};

export async function getBabyAISettings(babyId: string) {
  if (babyId === "guest-baby-id") {
    return { success: true, data: DEFAULT_SETTINGS };
  }

  try {
    const baby = await prisma.baby.findUnique({
      where: { id: babyId },
      select: { aiSettings: true },
    });

    // DB에 저장된 설정이 새로운 구조를 따르지 않을 수 있으므로,
    // 기본값과 병합하여 누락된 키를 보완합니다.
    const savedSettings = baby?.aiSettings as unknown as Partial<AISettings>;
    const fullSettings = { ...DEFAULT_SETTINGS, ...savedSettings };

    return {
      success: true,
      data: fullSettings,
    };
  } catch (error) {
    console.error("설정 조회 실패:", error);
    return { success: false, error: "설정 조회 실패" };
  }
}

export async function updateBabyAISettings(babyId: string, settings: AISettings) {
  try {
    await prisma.baby.update({
      where: { id: babyId },
      data: { aiSettings: settings as any },
    });
    return { success: true };
  } catch (error) {
    console.error("설정 저장 실패:", error);
    return { success: false, error: "설정 저장 실패" };
  }
}

export async function sendChatMessage(
  babyId: string,
  userId: string | undefined,
  message: string
): Promise<{
  success: boolean;
  data?: { reply: string | null; summary?: any };
  error?: string;
}> {
  if (babyId === "guest-baby-id") {
    return {
      success: true,
      data: {
        reply:
          "저는 게스트 모드 AI입니다. 실제 아기 데이터에 기반한 답변은 회원가입 후 이용 가능합니다. 예를 들어, '우리 아기 수면 패턴은 어떤가요?'와 같이 질문하실 수 있습니다.",
      },
    };
  }

  if (!userId) {
    return { success: false, error: "로그인이 필요합니다" };
  }

  try {
    // 0. AI 설정 조회
    const settingsResult = await getBabyAISettings(babyId);
    const settings = settingsResult.data || DEFAULT_SETTINGS;

    // 1. 최근 7일 활동 기록 조회
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activities = await prisma.activity.findMany({
      where: {
        babyId,
        createdAt: { gte: sevenDaysAgo },
      },
      orderBy: { createdAt: "desc" }, // 최신순 조회 (나중에 뒤집음)
      include: {
        Baby: {
          select: { name: true, birthDate: true, gender: true },
        },
      },
    });

    // 설정에 따라 활동 필터링
    const filteredActivities = activities.filter(a => {
      if (a.type === 'FEEDING' && !settings.feeding) return false;
      if (a.type === 'SLEEP' && !settings.sleep) return false;
      if (a.type === 'DIAPER' && !settings.diaper) return false;
      if (a.type === 'MEDICINE' && !settings.medication) return false;
      if (a.type === 'TEMPERATURE' && !settings.temperature) return false;
      if (a.type === 'BATH' && !settings.bath) return false;
      if (a.type === 'PLAY' && !settings.play) return false;
      return true;
    });

    // 2. 데이터 준비
    // 활동 기록이 없더라도 아기 정보는 필요하므로 activities[0] 대신 DB에서 직접 조회하거나 해야 함.
    // 하지만 여기서는 activities가 있을 때만 Baby 정보를 가져오는 구조였음.
    // 안전하게 Baby 정보 별도 조회
    const baby = await prisma.baby.findUnique({
      where: { id: babyId },
    });

    if (!baby) return { success: false, error: "아기 정보를 찾을 수 없습니다." };

    const monthAge = getMonthAge(new Date(baby.birthDate));
    const activityLogs = formatActivityLogs(filteredActivities);
    
    let growthHistory: any[] = [];
    if (settings.growth) {
      growthHistory = await getSmartGrowthHistory(babyId);
    }

    // 3. 시스템 프롬프트 구성
    // 제외된 항목에 대한 안내 메시지 생성
    const excludedCategories = [];
    if (!settings.feeding) excludedCategories.push("수유");
    if (!settings.sleep) excludedCategories.push("수면");
    if (!settings.diaper) excludedCategories.push("배변");
    if (!settings.growth) excludedCategories.push("성장");
    if (!settings.medication) excludedCategories.push("투약");
    if (!settings.temperature) excludedCategories.push("체온");
    if (!settings.bath) excludedCategories.push("목욕");
    if (!settings.play) excludedCategories.push("놀이");

    const exclusionNote = excludedCategories.length > 0
      ? `\n[주의: 사용자 설정에 의해 다음 데이터는 분석에서 제외되었습니다: ${excludedCategories.join(", ")}. 해당 항목에 대한 데이터가 없다고 해서 문제가 있는 것으로 간주하지 마세요. 질문이 해당 항목에 관한 것이라면, 기록이 없음을 언급하고 일반적인 조언을 해주세요.]`
      : "";

    const systemPrompt = `
당신은 소아청소년과 전문의이자 아동 심리 전문가인 'BabyCare AI'입니다.
부모의 질문에 대해 제공된 데이터를 바탕으로 의학적 근거가 있는 따뜻하고 구체적인 조언을 해주세요.

[아기 정보]
- 이름: ${baby.name}
- 성별: ${baby.gender === "male" ? "남아" : "여아"}
- 생년월일: ${new Date(baby.birthDate).toLocaleDateString("ko-KR")} (${monthAge}개월)

[성장 기록 (최근 추세)]
${settings.growth 
  ? (growthHistory.length > 0 
      ? growthHistory.map((g: { date: string; weight: number; height: number }) => `- ${g.date}: ${g.weight}kg, ${g.height}cm`).join("\n") 
      : "기록 없음")
  : "사용자가 성장 기록 분석을 제외했습니다."}

[최근 7일 활동 로그 (시간순)]
${filteredActivities.length > 0 ? activityLogs : "기간 내 기록 없음"}
${exclusionNote}

[답변 가이드라인]
1. **데이터 기반**: 막연한 조언 대신, 위 로그의 구체적인 시간과 수치를 인용하여 분석하세요.
2. **설정 존중**: 사용자가 제외한 데이터(위 주의사항 참고)에 대해서는 "기록이 부족합니다"라고 지적하지 마세요.
3. **대변 분석**: 배변 데이터가 포함된 경우, '물설사', '묽은변', '된변' 등의 상태를 주의 깊게 보세요.
4. **말투**: 전문적이지만 부모를 안심시키는 따뜻한 말투를 사용하세요.
5. **주의**: 마크다운 볼드(**)를 절대 사용하지 마세요. 의학적 진단은 피하세요.
`;

    // 4. Gemini API 호출
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent([systemPrompt, message]);
    const response = await result.response;
    let reply = response.text();

    // 5. 볼드 표시 제거
    reply = reply.replace(/\*\*(.+?)\*\*/g, "$1");

    // 6. 대화 기록 저장
    // summary 필드에는 간단한 메타데이터만 저장 (나중에 통계용으로 쓸 수 있게)
    const simpleSummary = {
      logCount: filteredActivities.length,
      excluded: excludedCategories,
      growthDataCount: growthHistory.length
    };

    await prisma.chatMessage.create({
      data: {
        babyId,
        userId: userId,
        message,
        reply: reply || "",
        summary: JSON.stringify(simpleSummary),
      },
    });

    return {
      success: true,
      data: {
        reply,
        summary: simpleSummary as any, // 타입 호환성 위해 any 캐스팅
      },
    };
  } catch (error) {
    console.error("AI 채팅 실패:", error);
    return { success: false, error: "AI 응답 생성에 실패했습니다" };
  }
}

export async function getChatHistory(
  babyId: string
): Promise<{
  success: boolean;
  data?: (ChatMessage | Message)[];
  error?: string;
}> {
  if (babyId === "guest-baby-id") {
    return { success: true, data: getSampleChatHistory() };
  }

  try {
    const messages = await prisma.chatMessage.findMany({
      where: { babyId },
      orderBy: { createdAt: "asc" },
    });

    // We need to format the prisma messages into the 'Message' type from 'ai'
    const formattedMessages: Message[] = messages.flatMap((msg) => [
      {
        id: `${msg.id}-user`,
        role: "user",
        content: msg.message,
        createdAt: msg.createdAt,
      },
      {
        id: msg.id,
        role: "assistant",
        content: msg.reply,
        createdAt: msg.createdAt,
      },
    ]);

    return { success: true, data: formattedMessages };
  } catch (error) {
    console.error("대화 기록 조회 실패:", error);
    return { success: false, error: "대화 기록 조회에 실패했습니다" };
  }
}
