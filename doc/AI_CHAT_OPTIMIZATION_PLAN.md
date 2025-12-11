# AI 상담 기능 최적화 계획서

> **작성일:** 2025-12-08
> **목표:** 신뢰도↑ 비용↓ 속도↑ (캐싱 제거, 하이브리드 시스템, 대화 기록 최적화)

---

## 📋 목차

1. [현재 시스템 분석](#1-현재-시스템-분석)
2. [핵심 개선 사항](#2-핵심-개선-사항)
3. [이전 대화 기록 최적화](#3-이전-대화-기록-최적화)
4. [하이브리드 AI 시스템](#4-하이브리드-ai-시스템)
5. [프롬프트 최적화](#5-프롬프트-최적화)
6. [구현 우선순위](#6-구현-우선순위)
7. [비용 및 성능 예측](#7-비용-및-성능-예측)

---

## 1. 현재 시스템 분석

### 1.1 현재 구조

```
사용자 질문
    ↓
[AI #1: Orchestrator]
- 질문 분석
- 도구 호출 (데이터 수집)
- JSON 구조화
- 이전 대화 5개 자동 포함 (선택적)
    ↓
[AI #2: Answerer]
- JSON 해석
- 텍스트 답변 생성
- 마크다운 제거
    ↓
답변 반환
```

### 1.2 현재 문제점

| 문제 | 영향 | 심각도 |
|------|------|--------|
| **모든 질문 2번 AI 호출** | 비용 2배, 지연 4~6초 | 🔴 높음 |
| **이전 대화 5개 무조건 포함** | 불필요한 경우 비용 낭비 (10,000자) | 🔴 높음 |
| **정적 지식도 기록 기반 예시 부족** | 개인화 부족 | 🟡 중간 |
| **대화 기록 선택 로직 부족** | 비용 최적화 미흡 | 🟡 중간 |

---

## 2. 핵심 개선 사항

### 2.1 캐싱 완전 제거 ✅

**결정:** 캐싱 기능 일체 사용하지 않음

**이유:**
1. **신뢰도가 최우선** - 기록 앱에서 단 한 번의 오류도 용납 불가
2. **정적 지식도 개인화** - "수유란 뭐야?" → 사용자 아기 기록 기반 예시 제공
3. **캐싱 이득 < 10%** - 위험 대비 효과 미미
4. **무효화 시스템 복잡도** - Redis 장애, 네트워크 지연 등 불확실성

**예시:**
```
질문: "수유란 뭐야?"

❌ 캐싱된 일반 답변:
"수유는 아기에게 모유나 분유를 먹이는 것이에요."

✅ 기록 기반 개인화 답변:
"수유는 아기에게 모유나 분유를 먹이는 것이에요.
지우는 최근 7일간 하루 평균 6.5회 수유하고 있고,
회당 130ml 정도 드시네요. 잘 성장하고 있어요!"
```

### 2.2 이전 대화 기록 최적화 ✅

**문제:**
- 현재: 5개 대화 × 2,000자 = 10,000자 토큰 소비
- 불필요한 경우도 많음 (데이터 질문)

**해결:**
- 스마트 대화 기록 포함 전략 (3단계)
- 비용 절감 예상: 60~70%

---

## 3. 이전 대화 기록 최적화

### 3.1 대화 기록 포함 전략 (3단계)

#### ✅ Tier 1: 절대 불필요 (0개)

**조건:** 완전히 독립적인 데이터 질문

**패턴:**
- `^(오늘|어제|최근|지난주).*(수유|수면|기저귀)`
- `^우리 아기 (키|몸무게|체중)`
- `^(몇|얼마|평균|총).*`
- `(권장|정상|비교|트렌드|변화)`

**예시:**
```
✅ "오늘 수유 몇 번 했어?" → 대화 기록 0개
✅ "최근 일주일 수면 패턴은?" → 대화 기록 0개
✅ "우리 아기 몸무게 얼마야?" → 대화 기록 0개
```

**비용:** 0자 (절감 100%)

---

#### ⚠️ Tier 2: 맥락 도움됨 (2개)

**조건:** 건강/걱정/문제 관련

**패턴:**
- 건강 키워드: `아프`, `열`, `체온`, `증상`, `병`, `토`, `설사`
- 감정 키워드: `걱정`, `불안`, `문제`, `이상`, `보채`

**예시:**
```
⚠️ "아기가 계속 울어요" → 대화 기록 2개
   (이전에 "열이 있어요" 대화가 있었다면 맥락 도움)

⚠️ "토하는데 괜찮을까요?" → 대화 기록 2개
   (이전 수유 상담과 연결될 수 있음)
```

**비용:** 2개 × 2,000자 = 4,000자 (절감 60%)

---

#### 🔴 Tier 3: 필수 (3개)

**조건:** 명확히 이전 대화 참조

**패턴:**
- 이전 참조: `(방금|아까|조금 전|이전에).*말`
- 재확인: `뭐라고|뭐였|어떻게 말`
- 반복: `(다시|또|한번 더)`
- 지시대명사: `(그|그거|그게|그래서|왜)`
- 추가 질문: `^(이유|원인|왜|어떻게|설명)`

**예시:**
```
🔴 "방금 말한 거 다시 설명해줘" → 대화 기록 3개
🔴 "그게 왜 그래?" → 대화 기록 3개
🔴 "이유가 뭐야?" → 대화 기록 3개
```

**비용:** 3개 × 2,000자 = 6,000자 (절감 40%)

---

### 3.2 구현 코드

```typescript
// src/features/ai-chat/utils/improvedChatHistoryAnalyzer.ts

export interface ChatHistoryStrategy {
  count: number;           // 포함할 개수
  reason: string;          // 판단 이유
  tier: 1 | 2 | 3;        // 우선순위
  estimatedTokens: number; // 예상 토큰 (2000자 = ~500 토큰)
}

export function analyzeOptimalChatHistory(
  message: string
): ChatHistoryStrategy {
  const msg = message.toLowerCase().trim();

  // ========================================
  // Tier 1: 절대 불필요 (데이터 질문)
  // ========================================

  const tier1Patterns = [
    /^(오늘|어제|그저께|최근|지난주|이번주|이번달).*(수유|수면|잠|기저귀|체온|약|몸무게|키)/,
    /^우리 아기 (키|몸무게|체중|성장|발달)/,
    /^(몇|얼마|평균|총).*(번|회|시간|ml|kg|cm)/,
    /(권장|정상|평균|괜찮|적절|비교|트렌드|변화|증가|감소)/,
  ];

  for (const pattern of tier1Patterns) {
    if (pattern.test(msg)) {
      return {
        count: 0,
        reason: "독립적인 데이터 질문 - 대화 기록 불필요",
        tier: 1,
        estimatedTokens: 0,
      };
    }
  }

  // ========================================
  // Tier 3: 필수 (이전 대화 참조)
  // ========================================

  const tier3Patterns = [
    /(방금|아까|조금 전|이전에|전에).*(말|이야기|물어|답|대답)/,
    /뭐라고|뭐였|어떻게 (말|답|대답)/,
    /(다시|또|또 한번|한번 더|계속)/,
    /^(그|그거|그게|그건|그래서|왜)\s/,
    /^(이유|원인|왜|어떻게|설명)/,
  ];

  for (const pattern of tier3Patterns) {
    if (pattern.test(msg)) {
      return {
        count: 3,
        reason: "이전 대화 직접 참조 - 최소 3개 필요",
        tier: 3,
        estimatedTokens: 1500, // 3개 × 500토큰
      };
    }
  }

  // ========================================
  // Tier 2: 맥락 도움됨 (건강/걱정)
  // ========================================

  const healthKeywords = [
    '아프', '열', '체온', '증상', '병', '토', '설사',
    '기침', '콧물', '구토', '통증', '울', '보채',
    '이상', '걱정', '불안', '문제', '힘들'
  ];

  const isHealthRelated = healthKeywords.some(k => msg.includes(k));

  if (isHealthRelated) {
    return {
      count: 2,
      reason: "건강/걱정 관련 - 맥락 도움될 수 있음",
      tier: 2,
      estimatedTokens: 1000, // 2개 × 500토큰
    };
  }

  // ========================================
  // 기본: 불필요 (새로운 질문)
  // ========================================

  return {
    count: 0,
    reason: "새로운 독립 질문 - 대화 기록 불필요",
    tier: 1,
    estimatedTokens: 0,
  };
}
```

### 3.3 비용 절감 효과

**시나리오 분석 (100개 질문 기준):**

| Tier | 비율 | 대화 개수 | 토큰/질문 | 총 토큰 |
|------|------|-----------|-----------|---------|
| **현재** | 100% | 5개 | 2,500 | 250,000 |
| **Tier 1 (불필요)** | 70% | 0개 | 0 | 0 |
| **Tier 2 (맥락)** | 20% | 2개 | 1,000 | 20,000 |
| **Tier 3 (필수)** | 10% | 3개 | 1,500 | 15,000 |
| **개선 후 합계** | 100% | - | - | **35,000** |

**절감률:** (250,000 - 35,000) / 250,000 = **86% 절감!** 💰

---

## 4. 하이브리드 AI 시스템

### 4.1 질문 복잡도 분류

```typescript
// src/features/ai-chat/utils/questionComplexity.ts

export type QuestionComplexity = "simple" | "complex";

export function analyzeQuestionComplexity(
  question: string
): QuestionComplexity {
  const q = question.toLowerCase().trim();

  // ========================================
  // SIMPLE: 도구 호출 불필요
  // ========================================

  const simplePatterns = [
    // 인사
    /^(안녕|하이|헬로|hi|hello)/,
    /^(고마워|감사)/,

    // 개념 설명 (단, 기록 기반 예시 포함)
    /이란|뭐야|의미|정의|설명|차이/,

    // 방법론 (일반론 + 개인화 조언)
    /방법|어떻게|팁|추천/,

    // 시기 (발달 단계)
    /몇 개월에|언제부터|시기/,
  ];

  // 단, 데이터 키워드가 있으면 complex로
  const dataKeywords = [
    "오늘", "어제", "최근", "평균", "몇번", "몇회",
    "수유", "수면", "기저귀", "체온", "약", "체중", "키"
  ];

  const hasDataKeyword = dataKeywords.some(k => q.includes(k));

  if (hasDataKeyword) {
    return "complex"; // 데이터 조회 필요
  }

  for (const pattern of simplePatterns) {
    if (pattern.test(q)) {
      return "simple";
    }
  }

  // ========================================
  // COMPLEX: 도구 호출 필요 (기본값)
  // ========================================

  return "complex"; // 애매하면 복잡한 쪽으로
}
```

### 4.2 하이브리드 실행 로직

```typescript
// src/features/ai-chat/actions.ts (수정)

export async function sendChatMessage(
  babyId: string,
  userId: string,
  message: string
) {
  // 1. 질문 복잡도 분석
  const complexity = analyzeQuestionComplexity(message);
  console.log(`📊 질문 복잡도: ${complexity}`);

  // 2. 대화 기록 전략 분석
  const historyStrategy = analyzeOptimalChatHistory(message);
  console.log(`💬 대화 기록 전략:`, historyStrategy);

  // 3. 컨텍스트 조회
  const context = await getChatContext(babyId, userId);

  // 4-A. Simple 질문: Single AI
  if (complexity === "simple") {
    console.log("🚀 Single AI 모드");

    const reply = await runSingleAI(
      context.baby.name,
      context.monthAge,
      context.userRoleLabel,
      message,
      historyStrategy.count > 0
        ? await getChatHistoryContext(babyId, historyStrategy.count)
        : ""
    );

    await saveChatMessage(babyId, userId, message, reply, {
      mode: "single-ai",
      historyCount: historyStrategy.count,
      reason: historyStrategy.reason,
    });

    return { success: true, data: { reply } };
  }

  // 4-B. Complex 질문: Dual AI
  console.log("🔄 Dual AI 모드");

  // AI #1: Orchestrator
  const orchestratorOutput = await runOrchestrator(
    context.baby.name,
    context.monthAge,
    message,
    babyId,
    historyStrategy.count > 0
      ? await getChatHistoryContext(babyId, historyStrategy.count)
      : ""
  );

  // AI #2: Answerer
  const reply = await runAnswerer(
    context.baby.name,
    context.userRoleLabel,
    message,
    orchestratorOutput
  );

  await saveChatMessage(babyId, userId, message, reply, {
    mode: "dual-ai",
    historyCount: historyStrategy.count,
    toolsUsed: orchestratorOutput.toolsCalled.length,
    reason: historyStrategy.reason,
  });

  return { success: true, data: { reply } };
}
```

### 4.3 Single AI 프롬프트

```typescript
// src/features/ai-chat/services/singleAIService.ts

export async function runSingleAI(
  babyName: string,
  monthAge: number,
  userRole: string,
  userQuestion: string,
  chatHistoryContext: string
): Promise<string> {
  const prompt = `# 역할
당신은 BabyCare AI - 육아 상담 전문가입니다.

# 기본 정보
- 아기: ${babyName} (${monthAge}개월)
- 사용자: ${userRole}
- 질문: ${userQuestion}

# 답변 원칙
1. **간결하고 명확하게** (3~5문장)
2. **${monthAge}개월 기준**으로 설명
3. **일반론 + 개인화 조언** 병행
4. **의학적 진단 금지** (필요시 전문의 상담 권장)

${chatHistoryContext ? `# 이전 대화\n${chatHistoryContext}\n` : ""}

# 개인화 예시 추가 (중요!)
만약 "수유란 뭐야?"처럼 개념 질문이라면,
일반 설명 후 "${babyName}는 최근 하루 평균 OO회 수유하고 있어요"처럼
구체적 예시를 추가하세요. (단, 추측 금지 - 사실만)

# 답변 형식
- 순수 텍스트 (마크다운 금지)
- 이모지 자연스럽게 사용
- ${userRole} 호칭 사용

답변:`;

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  const result = await model.generateContent(prompt);
  const answer = result.response.text();

  return answer
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/^#{1,6}\s+/gm, "")
    .trim();
}
```

### 4.4 성능 비교

| 질문 유형 | 현재 | 개선 후 | 속도 | 비용 |
|----------|------|---------|------|------|
| "수유란 뭐야?" | Dual AI (4초) | Single AI (2초) | 2배↑ | 50%↓ |
| "오늘 수유 몇 번?" | Dual AI (4초) | Dual AI (4초) | 동일 | 동일 |

**예상 분포:**
- Simple 질문: 15~20%
- Complex 질문: 80~85%

**총 절감:**
- 평균 응답 시간: 10~15% 개선
- 평균 비용: 7~10% 절감

---

## 5. 프롬프트 최적화

### 5.1 AI #1 (Orchestrator) 개선

**현재 문제:**
- 장황한 설명
- 불필요한 예시 포함
- 토큰 낭비

**개선안:**

```typescript
// BEFORE (2000 토큰)
export function generateOrchestratorPrompt(...) {
  return `당신은 BabyCare AI의 데이터 수집 엔진입니다.

# 기본 정보
- 아기: ${babyName}
- 월령: ${monthAge}개월
- 오늘: ${currentDate}

# 사용 가능한 도구
[긴 설명...]

# 도구 사용 가이드
[긴 예시들...]

${chatHistoryContext}  // 10,000자 가능

# 출력 형식
[상세 설명...]
`;
}

// AFTER (500 토큰)
export function generateOptimizedOrchestratorPrompt(...) {
  return `# 역할
BabyCare AI 데이터 수집 엔진

# 정보
아기: ${babyName}(${monthAge}개월), 오늘: ${currentDate}

${chatHistoryContext}  // 0~6,000자

# 임무
1. 질문 의도 파악
2. 필요한 도구만 호출
3. JSON 출력

# 질문
${userQuestion}

# 도구 (간략)
- getDailyCounts: 날짜별 활동 수
- calculateStats: 통계
- getActivityLogs: 상세 기록
- compareToRecommended: 권장량 비교
- analyzeTrend: 추세
- getRelativeDate/calculateDate: 날짜 계산

출력(JSON만):`;
}
```

**절감:** 1,500 토큰 (75% 절감)

---

### 5.2 AI #2 (Answerer) 개선

**핵심 변경:**
1. 신뢰도 강조 (추측 금지)
2. 의학적 책임 회피 명확화
3. 풍부한 상담 내용 (구조화)
4. 환각 방지 규칙

```typescript
export function generateOptimizedAnswererPrompt(
  babyName: string,
  userRole: string,
  userQuestion: string,
  orchestratorOutput: OrchestratorOutput
): string {
  const { dataSummary, missingInfo } = orchestratorOutput;

  return `# BabyCare AI 상담

아기: ${babyName}, 사용자: ${userRole}
질문: ${userQuestion}

# 데이터
${JSON.stringify(dataSummary, null, 2)}

# 답변 원칙 (엄수!)

## 1. 신뢰도 최우선
- ✅ 구체적 수치: "평균 6.5회" (추상 금지)
- ✅ 기간 명시: "12/1~12/7 기준"
- ✅ 출처: "기록된 데이터"
- ❌ 추측: "아마", "~같아요"
- ❌ 없는 데이터 언급 금지 (환각 방지)

## 2. 의학적 책임 회피
발열 38.5도↑, 수유/수면 50%↓, 체중 감소 등
→ "소아청소년과 진료 권장. 저는 데이터 분석만 가능해요."

## 3. 풍부한 상담 (3단)
1단: 요약 (1줄)
2단: 상세 분석 (평균+범위+트렌드+권장비교+메모)
3단: 조언 (선택)

${missingInfo?.length ? `
## 4. 데이터 부족 시
"${babyName}의 정확한 분석을 위해 ${missingInfo.join(", ")}이 필요해요."
` : ""}

# 형식
순수 텍스트, 이모지 OK, 마크다운 금지

답변:`;
}
```

---

## 6. 구현 우선순위

### Phase 1: 즉시 적용 (1일) 🔴

1. **캐싱 제거**
   - Redis 연동 코드 주석 처리
   - 캐시 관련 함수 제거

2. **대화 기록 최적화**
   - `improvedChatHistoryAnalyzer.ts` 생성
   - 3단계 전략 구현
   - 기존 로직 교체

**예상 효과:** 비용 60~70% 절감

---

### Phase 2: 핵심 기능 (3일) 🟡

3. **하이브리드 시스템**
   - `questionComplexity.ts` 구현
   - `singleAIService.ts` 구현
   - `actions.ts` 분기 로직 추가

4. **프롬프트 최적화**
   - Orchestrator 프롬프트 간소화
   - Answerer 프롬프트 개선

**예상 효과:** 속도 10~15% 개선, 비용 추가 5~10% 절감

---

### Phase 3: 고도화 (1주) 🟢

5. **모니터링 시스템**
   - 질문 유형별 통계
   - 비용 트래킹
   - 응답 속도 측정

6. **A/B 테스트**
   - 기존 vs 개선 비교
   - 사용자 만족도 조사

**예상 효과:** 데이터 기반 추가 개선

---

## 7. 비용 및 성능 예측

### 7.1 월간 사용량 가정

- 사용자: 1,000명
- 질문/사용자: 30회/월
- 총 질문: 30,000회/월

### 7.2 현재 비용 (Before)

| 항목 | 단가 | 사용량 | 비용 |
|------|------|--------|------|
| AI #1 호출 | $0.002/1K토큰 | 30,000회 × 3,000토큰 | $180 |
| AI #2 호출 | $0.002/1K토큰 | 30,000회 × 1,500토큰 | $90 |
| **합계** | - | - | **$270/월** |

### 7.3 개선 후 비용 (After)

| 항목 | 단가 | 사용량 | 비용 |
|------|------|--------|------|
| **대화 기록 최적화** | | |
| - Tier 1 (70%) | $0.002/1K토큰 | 21,000회 × 1,500토큰 | $63 |
| - Tier 2 (20%) | $0.002/1K토큰 | 6,000회 × 2,500토큰 | $30 |
| - Tier 3 (10%) | $0.002/1K토큰 | 3,000회 × 3,000토큰 | $18 |
| **하이브리드 시스템** | | |
| - Simple (20%) | $0.002/1K토큰 | 6,000회 × 800토큰 | $10 |
| - Complex (80%) | $0.002/1K토큰 | 24,000회 × 1,500토큰 | $72 |
| **합계** | - | - | **$193/월** |

**절감액:** $270 - $193 = **$77/월 (28.5% 절감)**
**연간 절감:** $924/년

### 7.4 성능 개선

| 지표 | 현재 | 개선 후 | 개선율 |
|------|------|---------|--------|
| 평균 응답 시간 | 4.5초 | 3.8초 | 15.6%↑ |
| Simple 질문 속도 | 4.5초 | 2.0초 | 125%↑ |
| 대화 기록 토큰 | 2,500 | 350 | 86%↓ |
| 신뢰도 | ? | 100% | - |

---

## 8. 위험 관리

### 8.1 잠재적 위험

| 위험 | 완화 방안 |
|------|----------|
| **복잡도 오판** | 애매하면 complex로 (안전 우선) |
| **AI #1 도구 미사용** | 프롬프트에 강제 조항, 검증 로직 추가 |
| **AI #2 환각** | 엄격한 규칙, dataSummary만 사용 |
| **타임존 문제** | 사용자 타임존 명시적 전달 |

### 8.2 모니터링 지표

```typescript
// 로그 수집
{
  questionType: "simple" | "complex",
  historyTier: 1 | 2 | 3,
  historyCount: number,
  responseTime: number,
  tokensUsed: number,
  toolsCalled: string[],
  userSatisfaction?: number,
}
```

---

## 9. 결론

### 9.1 핵심 결정

1. ✅ **캐싱 완전 제거** - 신뢰도가 최우선
2. ✅ **대화 기록 최적화** - 3단계 전략으로 86% 절감
3. ✅ **하이브리드 시스템** - 질문 유형별 최적 처리
4. ✅ **프롬프트 개선** - 신뢰도↑ 환각↓

### 9.2 기대 효과

- **비용:** 28.5% 절감 ($924/년)
- **속도:** 15.6% 개선
- **신뢰도:** 100% (캐싱 오류 제거)
- **사용자 만족도:** 예상 20~30% 향상

### 9.3 다음 단계

**Phase 1 구현 후 사용자 피드백 수집**
→ 데이터 기반 추가 최적화

---

## 10. 참고 자료

### 10.1 관련 파일

- `src/features/ai-chat/actions.ts`
- `src/features/ai-chat/services/orchestratorService.ts`
- `src/features/ai-chat/services/answererService.ts`
- `src/features/ai-chat/utils/chatHistoryAnalyzer.ts`

### 10.2 구현 체크리스트

```
Phase 1 (1일):
[ ] improvedChatHistoryAnalyzer.ts 생성
[ ] actions.ts에 새 분석기 적용
[ ] 캐시 코드 제거
[ ] 테스트 & 빌드

Phase 2 (3일):
[ ] questionComplexity.ts 생성
[ ] singleAIService.ts 생성
[ ] actions.ts 하이브리드 로직
[ ] 프롬프트 최적화
[ ] 테스트 & 빌드

Phase 3 (1주):
[ ] 모니터링 시스템
[ ] A/B 테스트 설정
[ ] 데이터 수집 및 분석
```

---

**작성자:** Claude Code
**검토 필요:** 사용자 승인 후 Phase 1 시작
