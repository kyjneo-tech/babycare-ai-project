import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/shared/lib/prisma";
import { Prisma } from "@prisma/client";
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
      return NextResponse.json("Unauthorized", { status: 401 }); // Use NextResponse.json
    }

    const body = await req.json();
    const { messages, babyId: bodyBabyId } = body;
    const headerBabyId = req.headers.get("X-Baby-Id");
    const babyId = bodyBabyId || headerBabyId;

    if (!babyId) {
      return NextResponse.json("Unauthorized or Missing BabyID", { status: 401 }); // Use NextResponse.json
    }

    // 2. 아기 및 가족 구성원 정보 조회
    const baby = await prisma.baby.findFirst({
      where: { id: babyId, Family: { FamilyMembers: { some: { userId } } } },
    });

    if (!baby) {
      return NextResponse.json("Unauthorized or Baby not found", { status: 403 }); // Use NextResponse.json
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

    // 4. 활동 데이터 수집 (Redis Caching & Safety Rule Implemented)
    const { redis } = await import('@/shared/lib/redis'); // Dynamic import
    const CACHE_KEY = `baby:${babyId}:chat-context:7-days`; // 채팅용 한글 포맷 캐시
    const SAFETY_THRESHOLD_MS = 10 * 60 * 1000; // 10분

    let preloadedData: string | null = null;
    let skipCache = false;

    // [Safety Rule] 10분 이내의 최신 활동이 있는지 확인
    try {
      const [lastActivity, lastMeasurement] = await Promise.all([
        prisma.activity.findFirst({
          where: { babyId },
          orderBy: { createdAt: "desc" }, // 수정 Time 체크가 더 안전할 수 있으나 생성 기준으로 1차 방어
          select: { createdAt: true },
        }),
        prisma.babyMeasurement.findFirst({
          where: { babyId },
          orderBy: { measuredAt: "desc" },
          select: { measuredAt: true },
        }),
      ]);

      const lastActivityTime = lastActivity?.createdAt.getTime() || 0;
      const lastMeasurementTime = lastMeasurement?.measuredAt.getTime() || 0;
      const lastUpdate = Math.max(lastActivityTime, lastMeasurementTime);

      if (Date.now() - lastUpdate < SAFETY_THRESHOLD_MS) {
        console.log("🔥 [CACHE SKIP] Recent activity detected (< 10mins). Forcing DB fetch.");
        skipCache = true;
      }
    } catch (e) {
      console.error("Safety check failed, skipping cache:", e);
      skipCache = true;
    }

    // [Cache Read] 안전하다면 캐시 조회
    if (!skipCache) {
      try {
        preloadedData = await redis.get(CACHE_KEY);
        if (preloadedData) {
          console.log("⚡️ [CACHE HIT] Using cached Korean data.");
        }
      } catch (e) {
        console.error("Redis fetch failed:", e);
      }
    }

    // [Cache Miss or Skip] DB 조회 및 포맷팅
    if (!preloadedData) {
      console.log("📊 [DB FETCH] Loading raw data from DB...");
      const rawData = await collectBabyActivityData(babyId, 7);
      const cleanedData = removeNulls(rawData);
      preloadedData = toKoreanData(cleanedData, 7);

      // [Cache Write] 캐시 스킵 상황이 아니었다면 캐시 저장 (24시간)
      if (!skipCache) {
        try {
          await redis.set(CACHE_KEY, preloadedData, { ex: 86400 });
          console.log("💾 [CACHE SAVE] Updated Redis cache (TTL: 24h).");
        } catch (e) {
          console.error("Redis save failed:", e);
        }
      }
    }

    console.log("✅ [DATA FETCH] Korean text formatted data for AI:\n", preloadedData);

    // 5. 가이드라인 생성
    // rawData가 캐시 히트 시 없을 수 있으므로 별도 조회
    const latestWeightRecord = await prisma.babyMeasurement.findFirst({
      where: { babyId },
      orderBy: { measuredAt: "desc" },
      select: { weight: true },
    });
    const currentWeight = latestWeightRecord?.weight ?? null;
    
    const guidelineInfo = buildGuidelineMessages(currentWeight, monthAge);

    // ============================================================
    // [Phase 3: Context] 이전 대화 요약본 조회 (최신 3개: 본인 + 공유)
    // ============================================================
    // *주의*: 암호화된 summary를 가져와서 복호화해야 함
    const { decrypt } = await import("@/shared/utils/encryption");
    const previousContexts = await prisma.chatMessage.findMany({
      where: {
        babyId,
        NOT: { summary: { equals: Prisma.DbNull } }, // summary가 있는 것만
        OR: [
          { userId: userId },      // 본인이 작성한 메시지
          { isShared: true }       // 가족이 공유한 메시지
        ]
      },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { summary: true }
    });
    
    // 복호화하여 텍스트 배열로 변환
    const recentSummaries = previousContexts
      .map(c => {
        try {
          if (!c.summary) return "";
          
          // Prisma Json 타입 처리: 문자열인지 확인
          let encrypted = "";
          if (typeof c.summary === 'string') {
            encrypted = c.summary;
          } else {
            // 객체나 다른 타입이면 문자열로 변환 시도 or 무시
            // 만약 { key: "iv:val" } 형태라면 파싱해야겠으나, 
            // 현재 로직상 평문 string을 그대로 JSON에 넣는 구조임.
            // 그러나 Prisma가 "string"을 JSON으로 인식해서 반환할 때 따옴표가 붙거나 할 수 있음.
            console.warn(`[Summary Warning] Unexpected type: ${typeof c.summary}`, c.summary);
            return ""; 
          }

          if (!encrypted) return "";
          return decrypt(encrypted);
        } catch (e) { 
          console.error("Summary decryption failed:", e);
          return ""; 
        }
      })
      .filter(s => s.length > 0)
      .reverse(); // 과거 -> 최신 순으로 정렬

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
      recentSummaries, // 추가된 맥락
    });

    console.log("📄 Final System Prompt:\n", systemPrompt);

    // ============================================================
    // [Phase 1: Persistence] 사용자 메시지 저장 (암호화)
    // ============================================================
    const { encrypt } = await import("@/shared/utils/encryption");
    const userMessageContent = messages[messages.length - 1].content;
    const encryptedUserMessage = encrypt(userMessageContent);

    // DB에 사용자 메시지를 먼저 생성 (reply는 빈 문자열로 초기화)
    const chatMessage = await prisma.chatMessage.create({
      data: {
        babyId,
        userId,
        message: encryptedUserMessage,
        reply: "", // 초기값
      },
    });

    console.log(`💾 User message saved (ID: ${chatMessage.id})`);

    // 7. AI 채팅 스트리밍
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const chat = model.startChat({
      history: messages.slice(0, -1).map((msg: { role: string; content: string }) => ({ // Specify msg type
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })),
      systemInstruction: { role: "system", parts: [{ text: systemPrompt }] },
    });

    let fullAiResponse = ""; // 전체 답변 누적용

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const result = await chat.sendMessageStream(
            messages[messages.length - 1].content
          );

          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              fullAiResponse += chunkText; // 청크 누적
              controller.enqueue(new TextEncoder().encode(chunkText));
            }
          }

          // ============================================================
          // [Phase 1 & 3: Persistence & Intelligence] AI 답변 저장 및 요약
          // ============================================================
          if (fullAiResponse) {
            const encryptedAiReply = encrypt(fullAiResponse);
            
            // 1. 답변 저장
            await prisma.chatMessage.update({
              where: { id: chatMessage.id },
              data: { reply: encryptedAiReply },
            });
            console.log(`💾 AI reply saved (Length: ${fullAiResponse.length})`);

            // 2. 비동기 요약 및 저장 (Phase 3)
            // 주의: 클라이언트 응답은 이미 스트리밍 중이므로 지연되지 않음
            // 하지만 이 함수 루프 안에서 await하면 스트림 종료가 늦어질 수 있음.
            // 클라이언트는 controller.close()를 기다리므로, 빠른 응답을 위해
            // 요약은 fire-and-forget 하거나 controller.close() 직전에 수행.
            // 여기서는 await 해도 됨 (몇 초 정도는 괜찮음) or 
            // Vercel Serverless Function 특성상 응답 후 프로세스 종료 가능성 때문에 await 권장.
            
            try {
              const { summarizeConversation } = await import("@/features/ai-chat/services/summarizer");
              const summaryText = await summarizeConversation(userMessageContent, fullAiResponse);
              if (summaryText) {
                const encryptedSummary = encrypt(summaryText);
                await prisma.chatMessage.update({
                  where: { id: chatMessage.id },
                  data: { summary: encryptedSummary },
                });
                console.log(`🧠 Conversation summarized & saved.`);
              }
            } catch (sumError) {
              console.error("Summarization failed:", sumError);
            }
          }

        } catch (error: unknown) { // Remove : any
          console.error("❌ Stream Error:", error);
          const errorMsg =
            "죄송해요, 응답 중 오류가 발생했어요. 다시 시도해주세요.";
          controller.enqueue(new TextEncoder().encode(errorMsg));
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream, { // Use NextResponse for streaming
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error: unknown) { // Remove : any
    console.error("Chat API Error Detailed:", error);
    return NextResponse.json( // Use NextResponse.json
      {
        error: "Internal Server Error",
        details: String(error),
      },
      { status: 500 }
    );
  }
}
