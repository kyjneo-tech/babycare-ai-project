import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/shared/lib/prisma";
import { genAI } from "@/shared/lib/gemini";
import { createSystemPrompt } from "@/features/ai-chat/prompts/systemPrompt";
import { removeNulls } from "@/features/ai-chat/utils/dataCleanup";
import { translateRelation } from "@/features/ai-chat/utils/enumTranslator";
import { toKoreanData } from "@/features/ai-chat/formatters";
import { collectBabyActivityData } from "@/features/ai-chat/services/dataCollector";
import { calculateMonthAge } from "@/features/ai-chat/services/ageCalculator";
import { buildGuidelineMessages } from "@/features/ai-chat/services/guidelineBuilder";

// Force dynamic since we use headers/session
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 1. 인증 및 권한 확인
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { messages, babyId: bodyBabyId } = body;
    const headerBabyId = req.headers.get("X-Baby-Id");
    const babyId = bodyBabyId || headerBabyId;

    if (!babyId) {
      return new Response("Unauthorized or Missing BabyID", { status: 401 });
    }

    // 2. 아기 및 가족 구성원 정보 조회
    const baby = await prisma.baby.findFirst({
      where: { id: babyId, Family: { FamilyMembers: { some: { userId } } } },
    });

    if (!baby) {
      return new Response("Unauthorized or Baby not found", { status: 403 });
    }

    const familyMember = await prisma.familyMember.findFirst({
      where: { userId, Family: { Babies: { some: { id: babyId } } } },
      select: { relation: true },
    });
    const userRole = translateRelation(familyMember?.relation);

    // 3. 아기 나이 계산
    const today = new Date();
    const birthDate = new Date(baby.birthDate);
    const monthAge = calculateMonthAge(birthDate, today);

    // 4. 활동 데이터 수집
    console.log("📊 Loading selected raw data from DB...");
    const rawData = await collectBabyActivityData(babyId, 7);
    const cleanedData = removeNulls(rawData);
    const preloadedData = toKoreanData(cleanedData, 7);

    console.log("✅ [DATA FETCH] Korean text formatted data for AI:\n", preloadedData);

    // 5. 가이드라인 생성
    const currentWeight =
      rawData.weights && rawData.weights.length > 0
        ? rawData.weights[0].weight ?? null
        : null;
    const guidelineInfo = buildGuidelineMessages(currentWeight, monthAge);

    // 6. 시스템 프롬프트 생성
    const systemPrompt = createSystemPrompt({
      babyName: baby.name,
      monthAge,
      userName: session.user?.name || "사용자",
      userRole,
      today: today.toISOString().split("T")[0],
      dataCollectionPeriod: "최근 7일 (오늘 포함)",
      preloadedData,
      guidelineInfo,
    });

    console.log("📄 Final System Prompt:\n", systemPrompt);

    // 7. AI 채팅 스트리밍
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const chat = model.startChat({
      history: messages.slice(0, -1).map((msg: any) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })),
      systemInstruction: { role: "system", parts: [{ text: systemPrompt }] },
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const result = await chat.sendMessageStream(
            messages[messages.length - 1].content
          );
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              controller.enqueue(new TextEncoder().encode(chunkText));
            }
          }
        } catch (error: any) {
          console.error("❌ Stream Error:", error);
          const errorMsg =
            "죄송해요, 응답 중 오류가 발생했어요. 다시 시도해주세요.";
          controller.enqueue(new TextEncoder().encode(errorMsg));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error: any) {
    console.error("Chat API Error Detailed:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        details: String(error),
      }),
      { status: 500 }
    );
  }
}
