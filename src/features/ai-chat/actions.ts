// src/features/ai-chat/actions.ts
"use server";

import { prisma } from "@/shared/lib/prisma";
import { redis } from "@/shared/lib/redis";
import { genAI } from "@/shared/lib/gemini";
import { ChatMessage } from "@prisma/client";
import { getSampleChatHistory } from "./services/getSampleChatHistoryService";
import { Message } from "@/shared/types/chat";
import {
  calculateGrowthPercentiles,
  getRecommendedFeedingAmount,
  getRecommendedSleepDuration,
  getMedicationDosageGuideline,
} from "./services/babyRecommendationService"; // 새로 추가된 임포트

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
  other: boolean;
}

const DEFAULT_SETTINGS: AISettings = {
  feeding: true,
  sleep: true,
  diaper: true,
  growth: true,
  medication: true,
  temperature: true,
  other: false,
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

  // Rate limiting
  const { aiChatRateLimit } = await import('@/shared/lib/ratelimit');
  if (aiChatRateLimit) {
    const { success } = await aiChatRateLimit.limit(userId);
    if (!success) {
      const { logger } = await import('@/shared/lib/logger');
      logger.warn('AI 채팅 rate limit 초과', { userId });
      return { 
        success: false, 
        error: "너무 많은 요청입니다. 잠시 후 다시 시도해주세요."
      };
    }
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
      return true;
    });

    // 2. 데이터 준비
    // 활동 기록이 없더라도 아기 정보는 필요하므로 activities[0] 대신 DB에서 직접 조회하거나 해야 함.
    // 하지만 여기서는 activities가 있을 때만 Baby 정보를 가져오는 구조였음.
    // 안전하게 Baby 정보 별도 조회 (필요한 필드만 select)
    const baby = await prisma.baby.findUnique({
      where: { id: babyId },
      select: {
        id: true,
        name: true,
        birthDate: true,
        gender: true,
        familyId: true,
      },
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

    const exclusionNote = excludedCategories.length > 0
      ? `\n[주의: 사용자 설정에 의해 다음 데이터는 분석에서 제외되었습니다: ${excludedCategories.join(", ")}. 해당 항목에 대한 데이터가 없다고 해서 문제가 있는 것으로 간주하지 마세요. 질문이 해당 항목에 관한 것이라면, 기록이 없음을 언급하고 일반적인 조언을 해주세요.]`
      : "";

    // --- 추가될 로직 시작 ---
    let latestMeasurement: { weight: number; height: number } | null = null;
    if (settings.growth || settings.medication) { // 성장 백분위, 약 적정 용량 계산에 필요
      latestMeasurement = await prisma.babyMeasurement.findFirst({
        where: { babyId },
        orderBy: { measuredAt: "desc" },
        select: { weight: true, height: true },
      });
    }

    let growthPercentileInfo = "";
    if (settings.growth && latestMeasurement) {
      const { weightPercentile, heightPercentile } = calculateGrowthPercentiles({
        birthDate: baby.birthDate,
        gender: baby.gender === "male" ? "MALE" : "FEMALE",
        weightKg: latestMeasurement.weight,
        heightCm: latestMeasurement.height,
      });
      if (weightPercentile || heightPercentile) {
        growthPercentileInfo = `\n[성장 백분위 (최신 기록 기준)]`;
        if (weightPercentile) growthPercentileInfo += `\n- 체중 백분위: ${weightPercentile}`;
        if (heightPercentile) growthPercentileInfo += `\n- 키 백분위: ${heightPercentile}`;
      }
    }

    let recommendedFeedingInfo = "";
    if (settings.feeding) {
      recommendedFeedingInfo = `\n[권장 수유량 가이드라인]\n- ${getRecommendedFeedingAmount({
        birthDate: baby.birthDate,
        gender: baby.gender === "male" ? "MALE" : "FEMALE",
      })}`;
    }

    let recommendedSleepInfo = "";
    if (settings.sleep) {
      recommendedSleepInfo = `\n[권장 수면 시간 가이드라인]\n- ${getRecommendedSleepDuration({
        birthDate: baby.birthDate,
        gender: baby.gender === "male" ? "MALE" : "FEMALE",
      })}`;
    }

    let medicationDosageInfo = "";
    if (settings.medication && latestMeasurement?.weight) {
      // 최근 투약 활동에서 약 이름을 가져와서 가이드라인을 제공할 수 있도록 개선
      const recentMedicineActivity = filteredActivities.find(a => a.type === 'MEDICINE');
      if (recentMedicineActivity && recentMedicineActivity.medicineName) {
        medicationDosageInfo = `\n[약 적정 용량 가이드라인 (최신 체중 기준)]\n- ${getMedicationDosageGuideline(
          {
            birthDate: baby.birthDate,
            gender: baby.gender === "male" ? "MALE" : "FEMALE",
            weightKg: latestMeasurement.weight,
          },
          recentMedicineActivity.medicineName
        )}`;
      } else {
        medicationDosageInfo = `\n[약 적정 용량 가이드라인]\n- 체중 정보는 있으나 최근 투약 기록이 없어 특정 약에 대한 가이드라인 제공이 어렵습니다.`;
      }
    } else if (settings.medication && !latestMeasurement?.weight) {
      medicationDosageInfo = `\n[약 적정 용량 가이드라인]\n- 체중 정보가 없어 약 적정 용량 가이드라인 제공이 어렵습니다.`;
    }
    // --- 추가될 로직 끝 ---

    // 2.5 사용자 정보(관계) 조회
    const familyMember = await prisma.familyMember.findFirst({
      where: {
        familyId: baby.familyId,
        userId: userId,
      },
      select: { relation: true },
    });
    
    const userRelation = familyMember?.relation || "보호자";
    const { getRelationLabel } = await import('../families/constants/relationOptions');
    const userRoleLabel = getRelationLabel(userRelation);

    const systemPrompt = `
당신은 아기의 소아청소년과 및 아동 심리 관련 방대한 최신 지식을 학습하고, 부모님이 기록한 육아 데이터를 통합 분석하여, 아기의 건강과 발달에 대한 가장 정확하고 신뢰할 수 있는 정보와 통찰을 제공하는 'BabyCare AI'입니다. 당신은 부모의 가장 신뢰할 수 있는 데이터 기반 육아 동반자로서, 궁금증이나 우려되는 상황 발생 시, 특히 야간이나 병원 방문이 어려운 상황에서도 부모님의 현명한 판단을 돕는 명확하고 구체적인 가이드를 제공해야 합니다. 항상 가장 최신 기록 데이터를 우선적으로 분석하며, 답변에 필요한 데이터가 불충분하거나 최신 데이터의 공백이 있을 경우, 그 한계를 명확히 설명하고 부모님께 필요한 추가 정보를 구체적으로 역질문하여 더 정확한 도움을 제공하고자 노력해야 합니다.

현재 질문한 사용자는 아기의 **${userRoleLabel}**입니다. 답변 시 이 호칭을 자연스럽게 사용하세요 (예: "${userRoleLabel}님, 걱정하지 마세요").

[중요 면책 조항 및 AI 역할의 한계]
*   BabyCare AI는 의료 전문가(의사)가 아니며, 어떠한 의학적 진단, 치료, 처방을 내릴 수 없습니다. 제공하는 모든 정보는 일반적인 육아 가이드와 통찰을 위한 참고 자료이며, 의료적 판단이나 조언이 필요한 경우 반드시 자격을 갖춘 의료 전문가와 상담해야 합니다.
*   어떠한 상황에서도 질병 진단, 치료법 제시, 특정 약물 추천, 복용량 지시 등 의료 행위에 준하는 직접적인 조언을 하지 마십시오.
*   응급 상황 시에는 즉시 의료 기관(응급실)에 연락하거나 방문할 것을 최우선으로 안내하십시오.

부모님의 질문에 대해 제공된 아기 정보, 성장 기록, 그리고 상세 활동 로그(메모 포함)를 바탕으로, 의학적으로 검증된 정보와 아동 심리적 관점의 통찰을 따뜻하고 구체적으로 제공해주세요.

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
${growthPercentileInfo}

[권장 가이드라인]
${recommendedFeedingInfo}
${recommendedSleepInfo}
${medicationDosageInfo}

[최근 7일 활동 로그 (시간순)]
${filteredActivities.length > 0 ? activityLogs : "기간 내 기록 없음"}
${exclusionNote}

[답변 가이드라인]
1.  **맞춤 호칭 및 공감**: 질문자를 '${userRoleLabel}님'이라고 부르며 부모의 우려에 깊이 공감하고 안심시키는 따뜻한 어조로 시작하세요.

2.  **데이터 분석 기준 명확화 및 기록 누락 시 대응 (신뢰도 핵심)**:
    *   제공된 [최근 7일 활동 로그]를 바탕으로 분석을 수행하되, 기록이 불충분하거나 누락된 날짜는 해당 날짜의 데이터를 분석에서 제외하십시오.
    *   답변 시작 시 분석 기준 명시: 답변을 시작할 때, "지난 7일간의 기록을 검토한 결과, [기록이 존재하는 날짜 리스트 예: 11월 20일, 11월 22일~25일]의 데이터를 바탕으로 철수의 상태를 분석해 드리겠습니다. [기록이 불충분하거나 누락된 날짜 리스트 예: 11월 19일, 11월 21일]의 기록은 이번 분석에서 제외되었습니다." 와 같이 AI가 어떤 날짜의 데이터를 기준으로 답변하는지 명확히 밝히세요.
    *   기록이 불충분했던 날짜에 대한 설명: 만약 최근 7일 중 기록이 불충분했던 날짜가 있다면, 해당 날짜의 데이터가 없음을 명확히 언급하고 그 공백이 분석에 미치는 영향을 설명해야 합니다.
        *   예시: "특히, [기록이 불충분했던 날짜]의 기록이 확인되지 않아, 해당 기간 동안 아기의 상태 변화를 정확히 파악하는 데 어려움이 있습니다. 이로 인해 분석의 정확도에 한계가 있을 수 있습니다."
        *   데이터 공백이 주는 통찰 및 역질문: "기록되지 않은 기간 동안 아기에게 특별한 변화(예: 평소와 다른 컨디션, 새로운 증상, 식사량 변화 등)는 없었는지, 또는 혹시 이 기간 동안의 기록이 누락된 다른 이유가 있는지 알려주시면 저의 분석에 큰 도움이 될 것입니다." 와 같이 부모의 추가 정보 제공을 유도하고, 기록의 중요성을 강조하십시오.
    *   기록된 데이터만으로 답변 구성: 기록이 없는 날의 데이터는 제외하고, 오직 분석 기준으로 삼은 '기록이 존재하는 날짜'의 데이터를 바탕으로 답변을 구성하되, 위에서 언급한 데이터 공백의 한계를 반드시 함께 설명해야 합니다.

3.  데이터 기반의 심층 분석: 막연한 답변 대신, 제공된 모든 기록 데이터(활동 유형, 시작/종료 시간, 지속 시간, 수량, 배변 상태/색깔, 체온, 투약 정보, 성장 기록 추세, 특히 [note]필드에 기록된 부모의 상세 관찰 내용과 감정)를 통합적으로 분석하여, 아기에게 특화된 현상 설명과 통찰을 제공하세요. 데이터 간의 연관성(예: 특정 수유량 변화 후 배변 변화, 수면 패턴 변화 후 컨디션 변화)을 적극적으로 찾아내 설명하세요.

4.  객관적 상황 설명 및 가능성 제시:
    *   관찰된 데이터 설명: "데이터에 따르면, [특정 활동/지표]에서 [특정 패턴/변화]가 관찰됩니다."
    *   일반적 정보 제시: "이러한 변화는 일반적으로 [A, B, C]와 같은 가능성을 시사할 수 있습니다. (진단 아님을 명확히 인지)"

5.  부모의 다음 행동 가이드 (단계별/위기 상황 포함):
    *   가정 내 조치: 현재 상황에서 부모가 아기를 편안하게 해주기 위해 취할 수 있는 구체적인 행동(예: 미온수 마사지, 환경 조절, 수유 간격 조정)을 제시하세요.
    *   병원 방문 필요 징후: 어떤 추가적인 증상(예: 고열 지속, 탈수 징후, 의식 변화, 호흡 곤란)이 나타나면 주저하지 말고 가까운 병원을 방문해야 하는지 명확히 안내하세요.
    *   야간/응급 상황 시 지시: 야간이나 병원 방문이 어려운 상황에서는 "현재 아기의 [특정 징후]를 고려할 때, 119 또는 야간 응급실에 연락하여 전문가의 도움을 받는 것을 최우선으로 고려해야 합니다."와 같이 응급 의료기관으로의 연결을 강력히 권고하십시오.

6.  정보 부족 시 구체적인 역질문: 답변에 필요한 데이터가 불충분하다고 판단되거나, 특히 최신 기록의 공백으로 인해 아기 상태 파악에 어려움이 있을 경우, 다음과 같이 부모님께 필요한 정보를 구체적으로 역질문하여 더 정확하고 유용한 상담을 제공하고자 노력해야 합니다.
    *   "이 질문에 대해 더 정확한 통찰을 드리기 위해 몇 가지 추가 정보가 필요합니다. 혹시 [특정 시간대의 수유량/아기가 보인 다른 특이 증상/수면 중 뒤척임 정도/최근 기록이 없는 기간 동안의 아기 상태 변화] 등에 대해 더 자세히 알려주실 수 있으실까요?"
    *   "기록된 활동 외에 혹시 아기가 [어떤 행동]을 보였는지, 또는 [다른 변화]는 없었는지 알려주시면 분석에 큰 도움이 됩니다."
7.  설정 존중: 사용자가 제외한 데이터에 대해서는 "기록이 부족합니다"라고 지적하지 마세요. 해당 항목에 대한 질문이라면 기록이 없음을 언급하고 일반적인 정보를 제공해주세요.
8.  의료 행위 금지 및 전문가 권고 재강조: 어떠한 상황에서도 질병 진단, 치료법 제시, 특정 약물 추천, 복용량 지시 등 의료 행위에 준하는 직접적인 조언을 하지 마십시오. 모든 답변 끝에는 '최종 판단과 의료적 조언은 전문가에게 맡겨야 한다'는 내용을 다시 상기시키십시오.
9.  말투: 전문적 지식에 기반하되, 부모의 불안감을 해소하고 힘을 북돋아 주는 따뜻하고 긍정적인 말투를 사용하세요. 명확하고 이해하기 쉬운 언어를 사용하십시오.
10. 용어 사용 주의: 답변 시 용어 '분유(formula)', '이유식(baby_food)', '유축 모유(pumped)'와 같이 한글 뒤에 괄호를 사용하여 영어 원문을 병기하는 표현은 사용하지 마십시오. 가능한 경우 순수 한글 표현을 사용하거나, 필요한 경우에만 한글 단독으로 사용하십시오.
11. 주의: 마크다운 볼드(**)를 절대 사용하지 마세요.
`;

    // 3. 스마트 대화 기록 조회
    // 건강/질병 관련 질문은 더 많은 맥락 필요
    const healthKeywords = ['아프', '열', '체온', '증상', '병', '토', '설사', '기침', '콧물', '구토', '통증', '울', '보채'];
    const isHealthRelated = healthKeywords.some(keyword => message.includes(keyword));
    
    const historyCount = isHealthRelated ? 5 : 3;
    
    const recentMessages = await prisma.chatMessage.findMany({
      where: { babyId },
      orderBy: { createdAt: "desc" },
      take: historyCount,
    });
    
    // 시간순 정렬 (과거 -> 현재)
    const historyContext = recentMessages
      .reverse()
      .map(msg => `User: ${msg.message}\nAI: ${msg.reply}`)
      .join("\n\n");

    const finalPrompt = `
    ${systemPrompt}
    
    [이전 대화 기록]
    ${historyContext ? historyContext : "없음"}
    
    [현재 질문]
    User: ${message}
    AI:
    `;
    
        // 4. Gemini API 호출 (Retry Logic 적용)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });    let reply = "";
    let retryCount = 0;
    const MAX_RETRIES = 3;

    while (retryCount <= MAX_RETRIES) {
      try {
        const result = await model.generateContent([finalPrompt]);
        const response = await result.response;
        reply = response.text();
        break; // 성공 시 루프 종료
      } catch (error) {
        retryCount++;
        console.warn(`AI 응답 생성 실패 (시도 ${retryCount}/${MAX_RETRIES + 1}):`, error);
        
        if (retryCount > MAX_RETRIES) {
          throw error; // 최대 재시도 횟수 초과 시 에러 던짐
        }
        
        // 지수 백오프 (1초, 2초, 4초 대기)
        const delay = Math.pow(2, retryCount - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // 5. 볼드 표시 제거
    reply = reply.replace(/\*\*(.+?)\*\*/g, "$1");

    // 6. 대화 기록 저장 (최신 20개 유지)
    const CHAT_HISTORY_LIMIT = 20;

    const simpleSummary = {
      logCount: filteredActivities.length,
      excluded: excludedCategories,
      growthDataCount: growthHistory.length,
    };

    // 트랜잭션으로 원자성 보장
    await prisma.$transaction(async (tx) => {
      const count = await tx.chatMessage.count({
        where: { babyId },
      });

      if (count >= CHAT_HISTORY_LIMIT) {
        // 가장 오래된 메시지 찾기
        const oldestMessage = await tx.chatMessage.findFirst({
          where: { babyId },
          orderBy: { createdAt: "asc" },
          select: { id: true },
        });

        // 삭제
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
          userId: userId,
          message,
          reply: reply || "",
          summary: JSON.stringify(simpleSummary),
        },
      });
    });

    return {
      success: true,
      data: {
        reply,
        summary: simpleSummary as any,
      },
    };
  } catch (error) {
    const { logger } = await import('@/shared/lib/logger');
    logger.error("AI 채팅 실패");
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
    const { logger } = await import('@/shared/lib/logger');
    logger.error("대화 기록 조회 실패");
    return { success: false, error: "대화 기록 조회에 실패했습니다" };
  }
}
