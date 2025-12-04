/**
 * 완전한 AI 도구 정의
 * - 상대 날짜 변환
 * - 대화 기록 조회 (AI가 선택)
 * - 활동 데이터 분석
 */

import { SchemaType } from "@google/generative-ai";
import { AI_TOOLS } from "./toolDefinitions";

const CHAT_HISTORY_TOOL = {
  name: "getChatHistory",
  description: `이전 대화 기록을 조회합니다.

⚠️ 주의: 이 도구는 꼭 필요할 때만 사용하세요!

✅ 언제 사용하나요?
1. 사용자가 이전 대화를 명시적으로 참조할 때
   - "방금 뭐라고 했지?"
   - "아까 말한 약 이름 뭐였어?"
   - "다시 설명해줘"

2. 대화를 이어갈 때
   - "그래서?" (이전 맥락 필요)
   - "왜 그래?" (이유를 이미 설명했을 수 있음)
   - "그거 어떻게 하는데?" (이전에 언급한 '그거')

3. 키워드로 검색이 필요할 때
   - "약 이름 뭐였지?" → searchKeyword: "약"
   - "열 날 때 뭐라고 했어?" → searchKeyword: "열"

❌ 사용하지 마세요:
- "오늘 수유량 알려줘" (새로운 데이터 질문)
- "우리 아기 키는?" (성장 정보 질문)
- "최근 7일 평균은?" (통계 질문)

입력 예시:
{
  "count": 3,           // 최근 3개 대화
  "searchKeyword": "약"  // "약" 포함된 대화만
}

출력 예시:
{
  "conversations": [
    {
      "timeAgo": "5분 전",
      "userMessage": "타이레놀 먹여도 돼?",
      "aiReply": "체중 8kg이면 80mg이 적정 용량입니다..."
    }
  ],
  "totalFound": 1,
  "message": "'약'와 관련된 대화 1개를 찾았습니다."
}`,
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      count: {
        type: SchemaType.NUMBER,
        description: "가져올 대화 개수 (기본 3, 최대 10)",
        default: 3,
        minimum: 1,
        maximum: 10
      },
      searchKeyword: {
        type: SchemaType.STRING,
        description: "검색할 키워드 (선택)"
      }
    }
  }
};

const RELATIVE_DATE_TOOL = {
  name: "getRelativeDate",
  description: `상대적 날짜("오늘", "어제" 등)를 절대 날짜(YYYY-MM-DD)로 변환합니다.

⚠️ 먼저 이 도구를 호출하여 날짜를 확정하세요!

사용 시나리오:
- "오늘 수유량 알려줘" → getRelativeDate("today")
- "어제 잘 잤어?" → getRelativeDate("yesterday")
- "이번 주 평균은?" → getRelativeDate("this_week")

지원하는 값:
- "today": 오늘
- "yesterday": 어제
- "this_week": 이번 주 (월~오늘)
- "last_week": 지난 주 (월~일)
- "this_month": 이번 달
- "last_month": 지난 달`,
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      relative: {
        type: SchemaType.STRING,
        enum: ["today", "yesterday", "this_week", "last_week", "this_month", "last_month"],
        description: "변환할 상대 날짜"
      }
    },
    required: ["relative"]
  }
};

export const COMPLETE_AI_TOOLS = [
  CHAT_HISTORY_TOOL,
  RELATIVE_DATE_TOOL,
  ...AI_TOOLS,
];
