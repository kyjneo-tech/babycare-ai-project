import { genAI } from "@/shared/lib/gemini";
import { COMPLETE_AI_TOOLS } from "../tools/toolDefinitionsComplete";
import {
  getDailyCounts,
  calculateStats,
  calculateSpecificDates,
  compareToRecommended,
  analyzeTrend,
  getActivityLogs,
  getRelativeDate,
} from "../tools/activityCalculator";
import { getChatHistoryTool } from "./chatHistoryTools";

const MAX_RETRIES = 3;
const MAX_TOOL_TURNS = 5;

/**
 * AI 도구를 실행합니다 (대화 기록 조회 포함)
 */
async function executeTool(
  functionName: string,
  args: any,
  babyId: string
): Promise<any> {
  console.log(`[AI Tool Call] ${functionName}`, args);

  // 🆕 대화 기록 조회 (babyId 필요)
  if (functionName === "getChatHistory") {
    return await getChatHistoryTool({ ...args, babyId });
  }

  // 🆕 상대 날짜 변환 (babyId 불필요)
  if (functionName === "getRelativeDate") {
    return await getRelativeDate(args);
  }

  // 나머지 도구는 babyId 주입
  const toolParams = { ...args, babyId };

  try {
    switch (functionName) {
      case "getDailyCounts":
        return await getDailyCounts(toolParams);
      case "calculateStats":
        return await calculateStats(toolParams);
      case "calculateSpecificDates":
        return await calculateSpecificDates(toolParams);
      case "compareToRecommended":
        return await compareToRecommended(toolParams);
      case "analyzeTrend":
        return await analyzeTrend(toolParams);
      case "getActivityLogs":
        return await getActivityLogs(toolParams);
      default:
        return { error: "Unknown function" };
    }
  } catch (e: any) {
    console.error(`Tool execution error: ${e.message}`);
    return { error: e.message };
  }
}

/**
 * AI 응답을 생성합니다 (Retry Logic 포함)
 */
export async function generateAIResponse(
  prompt: string,
  babyId: string
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    tools: [{ functionDeclarations: COMPLETE_AI_TOOLS as any }],
  });

  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
  });

  let reply = "";
  let retryCount = 0;

  while (retryCount <= MAX_RETRIES) {
    try {
      const result = await chat.sendMessage("");
      let currentResponse = await result.response;
      let functionCalls = currentResponse.functionCalls();

      // 도구 호출 처리 루프 (최대 5번)
      let turnCount = 0;

      while (functionCalls && functionCalls.length > 0 && turnCount < MAX_TOOL_TURNS) {
        turnCount++;
        const parts: any[] = [];

        for (const call of functionCalls) {
          const functionResult = await executeTool(call.name, call.args, babyId);

          parts.push({
            functionResponse: {
              name: call.name,
              response: { result: functionResult },
            },
          });
        }

        // 결과를 AI에게 전송
        const nextResult = await chat.sendMessage(parts);
        currentResponse = await nextResult.response;
        functionCalls = currentResponse.functionCalls();
      }

      reply = currentResponse.text();
      break; // 성공 시 루프 종료
    } catch (error) {
      retryCount++;
      console.warn(`AI 응답 생성 실패 (시도 ${retryCount}/${MAX_RETRIES + 1}):`, error);

      if (retryCount > MAX_RETRIES) {
        throw error;
      }

      // Exponential backoff
      const delay = Math.pow(2, retryCount - 1) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return reply;
}
