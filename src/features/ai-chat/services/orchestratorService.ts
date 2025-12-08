// src/features/ai-chat/services/orchestratorService.ts
/**
 * AI #1: Orchestrator Service
 * 
 * 역할:
 * - 사용자 질문 분석
 * - 필요한 도구 결정 및 호출
 * - 데이터 수집 (메모 포함)
 * - 이전 대화 선택적 포함
 * - 구조화된 JSON 출력
 */

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
  calculateDate,
} from "../tools/activityCalculator";
import { getChatHistoryTool, formatChatHistoryForPrompt } from "./chatHistoryTools";

// ============================================================
// 타입 정의
// ============================================================

export interface OrchestratorOutput {
  // 질문 분류
  questionType: "statistics" | "specific_log" | "trend" | "comparison" | "general" | "recommendation";
  questionIntent: string;
  
  // 도구 호출 결과
  toolsCalled: Array<{
    toolName: string;
    params: Record<string, any>;
    result: any;
    success: boolean;
  }>;
  
  // 데이터 요약
  dataAvailable: boolean;
  dataSummary: {
    period?: { start: string; end: string };
    feeding?: {
      avgPerDay: number;
      avgAmountPerDay: number;
      recommendation?: { min: number; max: number };
      status?: "below" | "normal" | "above";
      memos?: string[];
    };
    sleep?: {
      avgHoursPerDay: number;
      nightAvg: number;
      napAvg: number;
      recommendation?: { min: number; max: number };
      status?: "below" | "normal" | "above";
      memos?: string[];
    };
    diaper?: {
      count: number;
      memos?: string[];
    };
    trend?: {
      direction: "increasing" | "decreasing" | "stable";
      changePercent: number;
    };
    logs?: string;
  };
  
  // 데이터 부족 시
  missingInfo?: string[];
  noDataReason?: string;
}

// ============================================================
// 도구 실행
// ============================================================

async function executeTool(
  functionName: string,
  args: any,
  babyId: string
): Promise<any> {
  console.log(`[Orchestrator Tool Call] ${functionName}`, args);

  // 대화 기록 조회
  if (functionName === "getChatHistory") {
    return await getChatHistoryTool({ ...args, babyId });
  }

  // 상대 날짜 변환
  if (functionName === "getRelativeDate") {
    return await getRelativeDate(args);
  }

  // 동적 날짜 계산
  if (functionName === "calculateDate") {
    return await calculateDate(args);
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

// ============================================================
// Orchestrator 시스템 프롬프트 생성
// ============================================================

function generateOrchestratorPrompt(
  babyName: string,
  monthAge: number,
  currentDate: string,
  userQuestion: string,
  chatHistoryContext: string
): string {
  return `# 역할
BabyCare AI 데이터 수집 엔진

# 정보
아기: ${babyName}(${monthAge}개월), 오늘: ${currentDate}

${chatHistoryContext}

# 임무
1. 질문 의도 파악 (통계/구체적 기록/트렌드/비교/일반)
2. 필요한 도구만 호출 (데이터가 필요없으면 호출X)
3. JSON 출력

# 질문
${userQuestion}

# 데이터 수집 원칙
- **의심스러우면 데이터를 가져오세요**: 질문과 관련이 있을 수 있다면 도구를 호출
- **메모 데이터 포함**: getActivityLogs 호출 시 memo 필드도 반드시 포함
- **데이터 부족 시**: missingInfo 배열에 필요한 정보를 명시
- **날짜 계산**: "어제" → getRelativeDate, "이번 주" → calculateDate

# 출력(JSON만)
{
  "questionType": "...",
  "questionIntent": "...",
  "toolsCalled": [...],
  "dataAvailable": true/false,
  "dataSummary": {...},
  "missingInfo": [...]
}`;
}

// ============================================================
// Orchestrator 실행
// ============================================================

const MAX_TOOL_TURNS = 5;

export async function runOrchestrator(
  babyName: string,
  monthAge: number,
  userQuestion: string,
  babyId: string,
  includeChatHistory: boolean = false
): Promise<OrchestratorOutput> {
  const currentDate = new Date().toISOString().split('T')[0];
  
  // 이전 대화 기록 (필요시)
  let chatHistoryContext = "";
  if (includeChatHistory) {
    const historyResult = await getChatHistoryTool({ babyId, count: 5 });
    chatHistoryContext = formatChatHistoryForPrompt(historyResult);
    console.log("✅ Orchestrator: 이전 대화 5개 포함");
  }

  const prompt = generateOrchestratorPrompt(
    babyName,
    monthAge,
    currentDate,
    userQuestion,
    chatHistoryContext
  );

  console.log("---------------------------------------------------");
  console.log("Orchestrator Prompt:");
  console.log(prompt);
  console.log("---------------------------------------------------");

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

  try {
    const result = await chat.sendMessage("");
    let currentResponse = await result.response;
    let functionCalls = currentResponse.functionCalls();

    // 도구 호출 처리 루프
    let turnCount = 0;
    const toolsExecuted: Array<{
      toolName: string;
      params: Record<string, any>;
      result: any;
      success: boolean;
    }> = [];

    while (functionCalls && functionCalls.length > 0 && turnCount < MAX_TOOL_TURNS) {
      turnCount++;
      const parts: any[] = [];

      for (const call of functionCalls) {
        const functionResult = await executeTool(call.name, call.args, babyId);
        const success = !functionResult.error;

        toolsExecuted.push({
          toolName: call.name,
          params: call.args,
          result: functionResult,
          success,
        });

        parts.push({
          functionResponse: {
            name: call.name,
            response: { result: functionResult },
          },
        });
      }

      const nextResult = await chat.sendMessage(parts);
      currentResponse = await nextResult.response;
      functionCalls = currentResponse.functionCalls();
    }

    // JSON 응답 파싱
    const responseText = currentResponse.text();
    console.log("---------------------------------------------------");
    console.log("Orchestrator Raw Response:");
    console.log(responseText);
    console.log("---------------------------------------------------");

    // JSON 추출 (마크다운 코드 블록 제거)
    let jsonText = responseText.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "");
    }

    const output: OrchestratorOutput = JSON.parse(jsonText);
    
    // toolsCalled가 없으면 실행된 도구 목록 추가
    if (!output.toolsCalled || output.toolsCalled.length === 0) {
      output.toolsCalled = toolsExecuted;
    }

    return output;
  } catch (error: any) {
    console.error("Orchestrator 실행 실패:", error);
    
    // 폴백 응답
    return {
      questionType: "general",
      questionIntent: userQuestion,
      toolsCalled: [],
      dataAvailable: false,
      dataSummary: {},
      noDataReason: "데이터 수집 중 오류가 발생했습니다.",
    };
  }
}
