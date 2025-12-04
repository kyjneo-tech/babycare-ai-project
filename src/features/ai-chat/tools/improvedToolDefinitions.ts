/**
 * 개선된 AI 도구 정의
 *
 * 주요 개선 사항:
 * 1. 구체적인 사용 예시 포함
 * 2. 입력/출력 형식 명시
 * 3. 다른 도구와의 조합 방법 설명
 */

export const IMPROVED_AI_TOOLS = [
  {
    name: "getDailyCounts",
    description: `날짜별 활동 기록 수를 조회합니다.

사용 시나리오:
- "최근 7일 수유 기록 알려줘" → 먼저 이 도구로 어느 날에 기록이 있는지 확인
- 기록이 부족한 날을 제외하고 정확한 통계를 내기 위한 사전 조사용

입력 예시:
{
  "startDate": "2024-12-01",
  "endDate": "2024-12-07"
}

출력 예시:
{
  "2024-12-01": { "feeding": 8, "sleep": 3, "diaper": 10 },
  "2024-12-02": { "feeding": 7, "sleep": 2, "diaper": 9 },
  ...
}

다음 단계: 기록이 충분한 날만 선택해서 calculateStats 호출`,
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
    description: `지정한 기간의 통계를 계산합니다.

사용 시나리오:
- "최근 일주일 평균 수유량은?" → 이 도구로 평균 계산
- excludeDates로 기록이 없는 날을 제외할 수 있음

입력 예시 1 (전체 기간):
{
  "startDate": "2024-12-01",
  "endDate": "2024-12-07",
  "activityType": "FEEDING"
}

입력 예시 2 (특정 날 제외):
{
  "startDate": "2024-12-01",
  "endDate": "2024-12-07",
  "activityType": "SLEEP",
  "excludeDates": ["2024-12-03"]  // 이 날은 기록이 없어서 제외
}

출력 예시:
{
  "feeding": { "avgCount": 7.5, "avgAmount": 150, "totalAmount": 1050 },
  "sleep": { "avgHours": 14.2, "totalHours": 99.4 }
}

다음 단계: compareToRecommended로 권장량과 비교`,
    parameters: {
      type: "object",
      properties: {
        startDate: { type: "string", description: "시작 날짜 (YYYY-MM-DD)" },
        endDate: { type: "string", description: "종료 날짜 (YYYY-MM-DD)" },
        activityType: {
          type: "string",
          enum: ["FEEDING", "SLEEP", "DIAPER", "ALL"],
          description: "계산할 활동 타입 (기본값: ALL)",
          default: "ALL"
        },
        excludeDates: {
          type: "array",
          items: { type: "string" },
          description: "제외할 날짜 배열 (예: 기록이 없는 날)",
          default: []
        },
      },
      required: ["startDate", "endDate"],
    },
  },
  {
    name: "calculateSpecificDates",
    description: `특정 날짜들만 선택하여 통계를 계산합니다.

사용 시나리오:
- "평일만 수유 패턴 분석해줘" → 평일 날짜만 지정
- "주말 수면 시간은 얼마나 돼?" → 주말 날짜만 지정

입력 예시:
{
  "dates": ["2024-12-02", "2024-12-03", "2024-12-04"],  // 평일만
  "activityType": "FEEDING"
}

출력 예시:
{
  "feeding": { "avgCount": 8, "avgAmount": 160 }
}`,
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
          description: "계산할 활동 타입",
          default: "ALL"
        },
      },
      required: ["dates"],
    },
  },
  {
    name: "compareToRecommended",
    description: `계산한 값을 월령별 권장 기준과 비교합니다.

사용 시나리오:
- calculateStats 결과를 받은 후 권장량과 비교
- "우리 아기는 평균보다 많이/적게 먹나요?" 질문에 답변

입력 예시:
{
  "metric": "feeding_volume",
  "actualValue": 150  // calculateStats에서 나온 평균 수유량
}

출력 예시:
{
  "recommended": "140-160ml",
  "actual": 150,
  "status": "정상",
  "message": "권장 범위 내에 있습니다"
}

metric 종류:
- feeding_count: 하루 수유 횟수
- feeding_volume: 1회 평균 수유량
- sleep_total: 하루 총 수면 시간
- sleep_night: 밤 수면 시간
- sleep_nap: 낮잠 시간`,
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
    description: `최근 N일간의 트렌드(증가/감소/유지)를 분석합니다.

사용 시나리오:
- "요즘 수면 시간이 줄어들고 있나요?" → 이 도구로 한 번에 트렌드 분석
- "수유량이 늘고 있나요?"

입력 예시:
{
  "days": 7,  // 최근 7일
  "metric": "sleep_hours"
}

출력 예시:
{
  "trend": "decreasing",  // increasing / decreasing / stable
  "change": -1.5,  // 시간당 변화량
  "message": "최근 7일간 수면 시간이 1.5시간 감소했습니다"
}

metric 종류:
- feeding_amount: 수유량
- feeding_count: 수유 횟수
- sleep_hours: 수면 시간
- diaper_count: 기저귀 교체 횟수`,
    parameters: {
      type: "object",
      properties: {
        days: {
          type: "number",
          description: "분석할 일수 (기본값 7)",
          default: 7
        },
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
    description: `특정 날짜의 구체적인 활동 로그(시간, 메모 등)를 조회합니다.

사용 시나리오:
- "어제 몇 시에 잤어?" → 구체적인 시간 정보 필요
- "오늘 특이사항 있어?" → 메모 내용 확인
- "그때 기분은 어땠어?" → 메모에 기록된 감정 상태 확인

⚠️ 주의: 통계가 아닌 구체적인 기록 정보가 필요할 때만 사용하세요

입력 예시:
{
  "date": "2024-12-06"
}

출력 예시 (텍스트):
"[수면]
- 13:30-15:00 (1.5시간) - 메모: 잘 잤음
- 20:00-06:30 (10.5시간) - 메모: 중간에 한 번 깸

[수유]
- 08:00 (150ml) - 분유
- 12:00 (140ml) - 분유"`,
    parameters: {
      type: "object",
      properties: {
        date: {
          type: "string",
          description: "조회할 날짜 (YYYY-MM-DD)"
        }
      },
      required: ["date"]
    }
  }
];
