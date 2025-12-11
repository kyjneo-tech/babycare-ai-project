import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/shared/lib/prisma";
import { genAI } from "@/shared/lib/gemini";
import { createSystemPrompt } from "@/features/ai-chat/prompts/systemPrompt";

// Helper function to remove null values recursively
function removeNulls(obj: any): any {
  if (obj === null || obj === undefined) {
    return undefined;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => removeNulls(item)).filter(item => item !== undefined);
  }

  if (typeof obj === 'object' && !(obj instanceof Date)) {
    const newObj: { [key: string]: any } = {};
    for (const key in obj) {
      if (obj[key] !== null) {
        const cleanedValue = removeNulls(obj[key]);
        if (cleanedValue !== undefined) {
          newObj[key] = cleanedValue;
        }
      }
    }
    return newObj;
  }

  return obj;
}

// Helper function to format date to Korean-friendly short format
function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  const yy = String(date.getFullYear()).slice(2); // 2025 → 25
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');

  return `${yy}-${mm}-${dd}, ${hh}:${min}`;
}

// Helper function to translate enum values to Korean
function translateEnum(value: string | null | undefined): string | undefined {
  if (!value) return undefined;

  const map: Record<string, string> = {
    // 수유
    'BREAST': '모유',
    'FORMULA': '분유',
    'PUMPED': '유축',
    'BABY_FOOD': '이유식',
    'LEFT': '왼쪽',
    'RIGHT': '오른쪽',
    'BOTH': '양쪽',

    // 수면
    'NIGHT': '밤잠',
    'NAP': '낮잠',

    // 기저귀
    'PEE': '소변',
    'POOP': '대변',
    'NORMAL': '정상',
    'SOFT': '무름',
    'HARD': '딱딱',
    'WATERY': '설사'
  };

  return map[value] || value;
}

// Helper function to translate family relation to Korean
function translateRelation(relation: string | null | undefined): string {
  if (!relation) return '보호자';

  const map: Record<string, string> = {
    'mother': '엄마',
    'father': '아빠',
    'grandmother_maternal': '외할머니',
    'grandmother_paternal': '친할머니',
    'grandfather_maternal': '외할아버지',
    'grandfather_paternal': '친할아버지',
    'nanny': '돌봄이',
    'parent': '보호자',
    'other': '보호자'
  };

  return map[relation] || '보호자';
}

// Helper function to convert raw data to Korean text format
function toKoreanData(rawData: any): string {
  const sections: string[] = [];

  // 수유 데이터 변환
  if (rawData.feedings && rawData.feedings.length > 0) {
    const lines = rawData.feedings.map((f: any) => {
      const parts: string[] = [];
      parts.push(formatDateTime(f.startTime));

      // 종류와 양/시간
      if (f.feedingType) {
        const type = translateEnum(f.feedingType);
        if (f.feedingType === 'BREAST') {
          // 모유는 쪽과 시간
          const side = f.breastSide ? translateEnum(f.breastSide) : '';
          const duration = f.duration ? `${f.duration}분` : '';
          parts.push(`${type} ${side} ${duration}`.trim());
        } else {
          // 분유/유축/이유식은 양
          const amount = f.feedingAmount ? `${f.feedingAmount}ml` : '';
          parts.push(`${type} ${amount}`.trim());
        }
      }

      if (f.memo) parts.push(f.memo);
      return `- ${parts.join(' | ')}`;
    });
    sections.push(`수유 기록 (${rawData.feedings.length}건)\n${lines.join('\n')}`);
  }

  // 수면 데이터 변환
  if (rawData.sleeps && rawData.sleeps.length > 0) {
    const lines = rawData.sleeps.map((s: any) => {
      const parts: string[] = [];

      // 시작 ~ 끝 시간
      if (s.endTime) {
        parts.push(`${formatDateTime(s.startTime)} ~ ${formatDateTime(s.endTime)}`);
      } else {
        parts.push(formatDateTime(s.startTime));
      }

      if (s.sleepType) parts.push(translateEnum(s.sleepType));
      if (s.memo) parts.push(s.memo);

      return `- ${parts.join(' | ')}`;
    });
    sections.push(`수면 기록 (${rawData.sleeps.length}건)\n${lines.join('\n')}`);
  }

  // 기저귀 데이터 변환
  if (rawData.diapers && rawData.diapers.length > 0) {
    const lines = rawData.diapers.map((d: any) => {
      const parts: string[] = [];
      parts.push(formatDateTime(d.startTime));

      if (d.diaperType) {
        const type = translateEnum(d.diaperType);
        const condition = d.stoolCondition ? translateEnum(d.stoolCondition) : '';
        parts.push(`${type} ${condition}`.trim());
      }

      if (d.memo) parts.push(d.memo);
      return `- ${parts.join(' | ')}`;
    });
    sections.push(`기저귀 기록 (${rawData.diapers.length}건)\n${lines.join('\n')}`);
  }

  // 성장 데이터 변환
  if (rawData.weights && rawData.weights.length > 0) {
    const lines = rawData.weights.map((w: any) => {
      const parts: string[] = [];
      parts.push(formatDateTime(w.measuredAt));

      const measurements: string[] = [];
      if (w.weight) measurements.push(`${w.weight}kg`);
      if (w.height) measurements.push(`${w.height}cm`);
      if (measurements.length > 0) parts.push(measurements.join(', '));

      return `- ${parts.join(' | ')}`;
    });
    sections.push(`성장 기록 (${rawData.weights.length}건)\n${lines.join('\n')}`);
  }

  return sections.join('\n\n');
}


// Force dynamic since we use headers/session
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // 1. Parse Request
    const body = await req.json();
    const { messages, babyId: bodyBabyId } = body;
    const headerBabyId = req.headers.get("X-Baby-Id");
    const babyId = bodyBabyId || headerBabyId;

    if (!babyId) {
      return new Response("Unauthorized or Missing BabyID", { status: 401 });
    }

    const lastMessage = messages[messages.length - 1];

    // 2. Fetch Baby Info
    const baby = await prisma.baby.findFirst({
      where: { id: babyId, Family: { FamilyMembers: { some: { userId: userId } } } }
    });

    if (!baby) {
      return new Response("Unauthorized or Baby not found", { status: 403 });
    }
    
    const familyMember = await prisma.familyMember.findFirst({
      where: { userId: userId, Family: { Babies: { some: { id: babyId } } } },
      select: { relation: true }
    });
    const userRole = translateRelation(familyMember?.relation);

    const today = new Date();
    const birthDate = new Date(baby.birthDate);
    let monthAge = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
    if (today.getDate() < birthDate.getDate()) monthAge--;
    if (monthAge < 0) monthAge = 0;
    
    // 3. Fetch Raw Data directly from DB using correct Prisma models and `select`
    console.log("📊 Loading selected raw data from DB...");
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);

    const feedings = await prisma.activity.findMany({
      where: { babyId, startTime: { gte: sevenDaysAgo }, type: 'FEEDING' },
      select: { startTime: true, memo: true, feedingType: true, feedingAmount: true, breastSide: true, duration: true },
      orderBy: { startTime: 'desc' }
    });

    const sleeps = await prisma.activity.findMany({
      where: { babyId, startTime: { gte: sevenDaysAgo }, type: 'SLEEP' },
      select: { startTime: true, endTime: true, memo: true, sleepType: true },
      orderBy: { startTime: 'desc' }
    });

    const diapers = await prisma.activity.findMany({
      where: { babyId, startTime: { gte: sevenDaysAgo }, type: 'DIAPER' },
      select: { startTime: true, memo: true, diaperType: true, stoolCondition: true },
      orderBy: { startTime: 'desc' }
    });

    const weights = await prisma.babyMeasurement.findMany({
      where: { babyId, measuredAt: { gte: sevenDaysAgo } },
      select: { measuredAt: true, weight: true, height: true },
      orderBy: { measuredAt: 'desc' }
    });
    
    // Construct and clean the data
    const rawData = {
      feedings,
      sleeps,
      diapers,
      weights,
    };

    const cleanedData = removeNulls(rawData);
    const preloadedData = toKoreanData(cleanedData);

    console.log("✅ [DATA FETCH] Korean text formatted data for AI:");
    console.log(preloadedData);
    console.log("📏 Data size:", preloadedData.length, "characters");

    // 4. Create System Prompt
    const systemPrompt = createSystemPrompt({
      babyName: baby.name,
      monthAge,
      userName: session.user?.name || "사용자",
      userRole,
      today: today.toISOString().split('T')[0],
      preloadedData
    });
    
    console.log("🔍 Generated System Prompt Length:", systemPrompt.length);
    console.log("📄 Final System Prompt:\n", systemPrompt);

    // 5. Execute AI Call
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const chat = model.startChat({
      history: messages.slice(0, -1).map((msg: any) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }]
      })),
      systemInstruction: {
        role: "system",
        parts: [{ text: systemPrompt }]
      }
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const result = await chat.sendMessageStream(lastMessage.content);
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              controller.enqueue(new TextEncoder().encode(chunkText));
            }
          }
        } catch (error: any) {
          console.error("❌ Stream Error:", error);
          const errorMsg = "죄송해요, 응답 중 오류가 발생했어요. 다시 시도해주세요.";
          controller.enqueue(new TextEncoder().encode(errorMsg));
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });

  } catch (error: any) {
    console.error("Chat API Error Detailed:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error", details: String(error) }), { status: 500 });
  }
}
