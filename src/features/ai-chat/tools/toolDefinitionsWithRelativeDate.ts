/**
 * 개선된 AI 도구 정의 (상대 날짜 변환 포함)
 */

export const AI_TOOLS_WITH_RELATIVE_DATE = [
  {
    name: "getRelativeDate",
    description: `상대적 날짜("오늘", "어제" 등)를 절대 날짜(YYYY-MM-DD)로 변환합니다.

🆕 이 도구를 먼저 호출하여 날짜를 확정하세요!

사용 시나리오:
- "오늘 수유량 알려줘" → 먼저 getRelativeDate("today") 호출
- "어제 잘 잤어?" → 먼저 getRelativeDate("yesterday") 호출
- "이번 주 평균은?" → 먼저 getRelativeDate("this_week") 호출

입력 예시:
{
  "relative": "today"
}

출력 예시:
{
  "startDate": "2024-12-04",
  "endDate": "2024-12-04",
  "description": "오늘"
}

지원하는 값:
- "today": 오늘
- "yesterday": 어제
- "this_week": 이번 주 (월~오늘)
- "last_week": 지난 주 (월~일)
- "this_month": 이번 달
- "last_month": 지난 달`,
    parameters: {
      type: "object",
      properties: {
        relative: {
          type: "string",
          enum: ["today", "yesterday", "this_week", "last_week", "this_month", "last_month"],
          description: "변환할 상대 날짜"
        }
      },
      required: ["relative"]
    }
  },
  {
    name: "getDailyCounts",
    description: "날짜별 활동 기록 수를 조회합니다. 어느 날짜에 기록이 충분한지 판단하는 데 사용하세요.",
    parameters: {
      type: "object",
      properties: {
        startDate: { type: "string", description: "시작 날짜 (YYYY-MM-DD)" },
        endDate: { type: "string", description: "종료 날짜 (YYYY-MM-DD)" },
      },
      required: ["startDate", "endDate"],
    },
  },
  {
    name: "calculateStats",
    description: "지정한 기간의 통계를 계산합니다. excludeDates로 제외할 날짜를 지정할 수 있습니다.",
    parameters: {
      type: "object",
      properties: {
        startDate: { type: "string", description: "시작 날짜" },
        endDate: { type: "string", description: "종료 날짜" },
        activityType: {
          type: "string",
          enum: ["FEEDING", "SLEEP", "DIAPER", "ALL"],
          description: "계산할 활동 타입",
          default: "ALL"
        },
        excludeDates: {
          type: "array",
          items: { type: "string" },
          description: "제외할 날짜 배열 (YYYY-MM-DD)",
          default: []
        },
      },
      required: ["startDate", "endDate"],
    },
  },
  {
    name: "calculateSpecificDates",
    description: "특정 날짜들만 선택하여 통계를 계산합니다.",
    parameters: {
      type: "object",
      properties: {
        dates: {
          type: "array",
          items: { type: "string" },
          description: "계산할 날짜들 (YYYY-MM-DD)"
        },
        activityType: {
          type: "string",
          enum: ["FEEDING", "SLEEP", "DIAPER", "ALL"],
          default: "ALL"
        },
      },
      required: ["dates"],
    },
  },
  {
    name: "compareToRecommended",
    description: "계산한 값을 월령별 권장 기준과 비교합니다.",
    parameters: {
      type: "object",
      properties: {
        metric: {
          type: "string",
          enum: ["feeding_count", "feeding_volume", "sleep_total", "sleep_night", "sleep_nap"],
          description: "비교할 지표"
        },
        actualValue: {
          type: "number",
          description: "실제 측정값 (예: 하루 평균 수유 횟수)"
        },
      },
      required: ["metric", "actualValue"],
    },
  },
  {
    name: "analyzeTrend",
    description: "최근 N일간의 트렌드(증가/감소/유지)를 분석합니다.",
    parameters: {
      type: "object",
      properties: {
        days: { type: "number", description: "분석할 일수 (기본값 7)", default: 7 },
        metric: {
          type: "string",
          enum: ["feeding_amount", "feeding_count", "sleep_hours", "diaper_count"],
          description: "분석할 지표"
        }
      },
      required: ["metric"]
    }
  },
  {
    name: "getActivityLogs",
    description: "특정 날짜의 구체적인 활동 로그(메모, 시간 등)를 텍스트로 조회합니다. '어제 기분 어땠어?', '오늘 몇 시에 잤어?' 같은 구체적 질문에 사용하세요.",
    parameters: {
      type: "object",
      properties: {
        date: { type: "string", description: "조회할 날짜 (YYYY-MM-DD)" }
      },
      required: ["date"]
    }
  }
];
