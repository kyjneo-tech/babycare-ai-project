# AI 도구 분석 및 개선 사항

## 📊 현재 도구 목록

### ✅ 구현된 도구 (6개)

1. **getActivityLogs** - 특정 날짜의 상세 활동 로그
2. **getDailyCounts** - 날짜별 활동 수 조회
3. **calculateStats** - 기간 통계 계산
4. **calculateSpecificDates** - 특정 날짜들만 통계
5. **compareToRecommended** - 권장 기준 비교
6. **analyzeTrend** - 트렌드 분석 (선형 회귀)

---

## ❌ 문제점 및 누락된 기능

### 🚨 심각한 문제

#### 1. **날짜/시간대(Timezone) 처리 불일치**

```typescript
// activityCalculator.ts:260-263
const start = new Date(startDate);  // 입력: "2024-12-01"
start.setHours(0, 0, 0, 0);         // Local timezone 00:00

// 문제: DB가 UTC로 저장되어 있으면 9시간 차이 발생!
// 2024-12-01 00:00 KST = 2024-11-30 15:00 UTC
```

**증상**:
- "오늘 수유량" 조회 시 어제 오후 3시부터 오늘 오후 3시까지 조회
- 날짜 경계에서 데이터 누락 또는 중복

**해결책**:
```typescript
// UTC로 통일하거나 명시적으로 KST 변환
const start = new Date(`${startDate}T00:00:00+09:00`);  // KST 명시
```

#### 2. **"오늘", "어제" 등 상대적 날짜 변환 안됨**

```typescript
// 현재: AI가 직접 날짜를 계산해야 함
User: "오늘 수유량 알려줘"
AI: ??? "오늘"이 뭐지? 2024-12-04?

// 필요: 상대 날짜 변환 도구
getRelativeDate("today")    → "2024-12-04"
getRelativeDate("yesterday") → "2024-12-03"
getRelativeDate("this_week") → { start: "2024-12-02", end: "2024-12-08" }
```

**현재 상황**: AI가 프롬프트의 "현재 시각" 정보를 보고 추론해야 함 → 부정확

#### 3. **데이터 없을 때 처리 불완전**

```typescript
// calculateStats:326
const analyzedDays = Math.max(1, totalDays - excludeDates.length);

// 문제: 기록이 하나도 없어도 analyzedDays = 1
// → avgPerDay = 0/1 = 0 (정상처럼 보임)

// 개선: 실제 기록이 있는 날짜 수를 세야 함
const actualDaysWithData = new Set(
  activities.map(a => formatDate(a.startTime))
).size;
```

#### 4. **다른 활동 타입들 누락**

```typescript
// 현재: FEEDING, SLEEP, DIAPER만 통계
// 누락: BATH, HOSPITAL, MEDICINE, TEMPERATURE, OTHERS

User: "이번 주 목욕 몇 번 했어?"
AI: ??? (도구 없음)

User: "최근에 병원 자주 가나?"
AI: ??? (도구 없음)
```

---

### ⚠️ 중요한 누락 기능

#### 5. **기간 비교 기능 없음**

```typescript
User: "지난주랑 이번주 수유량 비교해줘"
AI: ???

// 필요한 도구
comparePeriods({
  period1: { start: "2024-11-25", end: "2024-12-01" },
  period2: { start: "2024-12-02", end: "2024-12-08" },
  metric: "feeding_amount"
})

→ {
  period1Value: 850,
  period2Value: 920,
  change: +70,
  changePercent: +8.2
}
```

#### 6. **메모 검색 기능 없음**

```typescript
User: "메모에 '열'이라고 쓴 날 찾아줘"
User: "컨디션 안 좋았던 날 알려줘"
AI: ??? (메모 내용 검색 불가)

// 필요한 도구
searchMemos({
  babyId,
  keyword: "열",
  activityType: "ALL",
  dateRange: { start: "2024-11-01", end: "2024-12-04" }
})
```

#### 7. **시간대별 분석 없음**

```typescript
User: "밤에 주로 몇 시에 깨?"
User: "낮잠은 보통 오후 몇 시에 자?"
AI: ??? (시간대 분석 도구 없음)

// 필요한 도구
analyzeTimePattern({
  babyId,
  activityType: "SLEEP",
  dateRange: { start: "2024-11-01", end: "2024-12-04" }
})

→ {
  mostCommonWakeTime: "06:30",
  mostCommonNapTime: "14:00",
  nightWakings: [
    { time: "02:30", frequency: "70%" },
    { time: "05:00", frequency: "30%" }
  ]
}
```

#### 8. **이상치 감지 없음**

```typescript
User: "요즘 수면 패턴이 이상한 거 같은데"
AI: ??? (이상치 감지 불가)

// 필요한 도구
detectAnomalies({
  babyId,
  metric: "sleep_hours",
  days: 14
})

→ {
  anomalies: [
    { date: "2024-12-01", value: 8, expected: 13, deviation: -38% },
    { date: "2024-12-03", value: 16, expected: 13, deviation: +23% }
  ],
  message: "12월 1일과 3일에 평소와 다른 수면 패턴이 관찰되었습니다"
}
```

#### 9. **상관관계 분석 없음**

```typescript
User: "수유량이 많으면 잠을 더 오래 자나?"
AI: ??? (상관관계 분석 불가)

// 필요한 도구
analyzeCorrelation({
  babyId,
  metric1: "feeding_amount",
  metric2: "sleep_hours",
  days: 30
})

→ {
  correlation: 0.65,  // -1 ~ 1
  interpretation: "약한 양의 상관관계",
  message: "수유량이 많을 때 수면 시간이 약간 증가하는 경향이 있습니다"
}
```

#### 10. **날짜 범위 검증 없음**

```typescript
// 현재: 잘못된 입력 검증 없음
getDailyCounts({
  startDate: "2024-12-10",
  endDate: "2024-12-01"  // end가 start보다 이전!
})
// → 빈 배열 반환 (에러 없음)

// 개선: 명시적 검증 필요
if (new Date(startDate) > new Date(endDate)) {
  throw new Error("시작 날짜가 종료 날짜보다 늦습니다");
}
```

---

## ✅ 잘 구현된 부분

### 1. **트렌드 분석 (선형 회귀)**
```typescript
// analyzeTrend:648-661
// 선형 회귀로 정확한 트렌드 계산
const slope = (n * xySum - xSum * ySum) / (n * xxSum - xSum * xSum);
```
→ 수학적으로 정확한 구현 ✅

### 2. **권장 기준 비교**
```typescript
// compareToRecommended:537-605
// 월령에 맞는 권장 기준 적용
const monthAge = getMonthAge(baby.birthDate);
const rec = getFeedingRecommendationRange(monthAge);
```
→ 아기 개별 맞춤 기준 적용 ✅

### 3. **제외 날짜 필터링**
```typescript
// calculateStats:320-323
const filteredActivities = activities.filter(a => {
  const dateStr = formatDate(a.startTime);
  return !excludeDates.includes(dateStr);
});
```
→ AI가 기록 없는 날을 제외할 수 있음 ✅

### 4. **활동 타입별 분리 통계**
```typescript
// 수유: 모유/분유 분리
// 수면: 밤잠/낮잠 분리
// 기저귀: 소변/대변 + 상태별 분리
```
→ 세분화된 통계 제공 ✅

---

## 🎯 시나리오별 대처 가능 여부

### ✅ 대처 가능한 시나리오

| 질문 | 도구 조합 | 대처 |
|------|----------|------|
| "최근 7일 평균 수유량은?" | getDailyCounts → calculateStats | ✅ |
| "어제 몇 시에 잤어?" | getActivityLogs | ✅ |
| "요즘 수면 시간 줄어들고 있어?" | analyzeTrend | ✅ |
| "우리 아기 수유량 정상이야?" | calculateStats → compareToRecommended | ✅ |
| "월요일부터 금요일까지만 통계 내줘" | calculateSpecificDates | ✅ |
| "12월 1일 기록 없으니까 제외하고 계산해줘" | calculateStats(excludeDates) | ✅ |

### ❌ 대처 불가능한 시나리오

| 질문 | 문제 | 필요 도구 |
|------|------|----------|
| "오늘 수유량 알려줘" | "오늘" 날짜 변환 안됨 | getRelativeDate ❌ |
| "지난주 vs 이번주 수유량" | 기간 비교 불가 | comparePeriods ❌ |
| "메모에 열 쓴 날 찾아줘" | 메모 검색 불가 | searchMemos ❌ |
| "밤에 주로 몇 시에 깨?" | 시간대 분석 불가 | analyzeTimePattern ❌ |
| "이번 주 목욕 몇 번 했어?" | BATH 타입 통계 없음 | calculateStats 확장 필요 ❌ |
| "수유량 많으면 잘 자나?" | 상관관계 분석 없음 | analyzeCorrelation ❌ |
| "12월 1일 왜 이렇게 안 잤지?" | 이상치 감지 없음 | detectAnomalies ❌ |

---

## 🔧 즉시 수정 필요한 버그

### 버그 1: Timezone 불일치
```typescript
// activityCalculator.ts:260-263, 303-306, 등
// 현재
const start = new Date(startDate);
start.setHours(0, 0, 0, 0);

// 수정
function parseLocalDate(dateStr: string): Date {
  // "2024-12-01" → KST 기준 2024-12-01 00:00:00
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

function parseLocalDateEnd(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 23, 59, 59, 999);
}
```

### 버그 2: 빈 데이터 처리
```typescript
// calculateStats:326
// 현재
const analyzedDays = Math.max(1, totalDays - excludeDates.length);

// 수정
const datesWithData = new Set(
  filteredActivities.map(a => formatDate(a.startTime))
);
const analyzedDays = Math.max(1, datesWithData.size);

// 데이터 없을 때 명시적 반환
if (filteredActivities.length === 0) {
  return {
    ...result,
    message: "이 기간에는 기록이 없습니다"
  };
}
```

### 버그 3: 날짜 검증 없음
```typescript
// 모든 도구 시작 부분에 추가
if (new Date(startDate) > new Date(endDate)) {
  throw new Error("시작 날짜가 종료 날짜보다 늦습니다");
}

if (new Date(endDate) > new Date()) {
  throw new Error("미래 날짜는 조회할 수 없습니다");
}
```

---

## 📈 우선순위별 개선 계획

### 🔥 긴급 (즉시 수정 필요)
1. ✅ **Timezone 버그** - 날짜 경계 오류
2. ✅ **빈 데이터 처리** - 0으로 나누기 방지
3. ✅ **날짜 검증** - 잘못된 입력 차단

### 🚀 높음 (이번 주 내)
4. ⭐ **상대 날짜 변환** - "오늘", "어제" 지원
5. ⭐ **다른 활동 타입** - BATH, HOSPITAL 등 통계

### 📊 중간 (2주 내)
6. 📅 **기간 비교** - 지난주 vs 이번주
7. 🔍 **메모 검색** - 키워드로 날짜 찾기
8. ⏰ **시간대 분석** - 주로 몇 시에?

### 🎨 낮음 (여유 있을 때)
9. 📉 **이상치 감지** - 평소와 다른 패턴
10. 🔗 **상관관계 분석** - 수유량 vs 수면

---

## 💡 결론

### 현재 도구 커버리지: **약 60-70%**

**잘하는 것**:
- ✅ 기본 통계 (평균, 합계)
- ✅ 트렌드 분석 (증가/감소)
- ✅ 권장 기준 비교
- ✅ 상세 로그 조회

**못하는 것**:
- ❌ 상대 날짜 ("오늘", "어제")
- ❌ 기간 비교 ("지난주 vs 이번주")
- ❌ 메모 검색
- ❌ 시간대 분석
- ❌ 다른 활동 타입 (목욕, 병원 등)
- ❌ 이상치 감지
- ❌ 상관관계 분석

**버그**:
- 🐛 Timezone 불일치 (심각)
- 🐛 빈 데이터 처리 불완전
- 🐛 날짜 검증 없음

**종합 평가**:
- 기본 기능은 잘 작동하지만, **긴급 버그 3개는 즉시 수정 필요**
- 상대 날짜 변환 기능이 없어서 실제 사용성이 떨어짐
- 약 30-40%의 사용자 질문에는 답변 불가
