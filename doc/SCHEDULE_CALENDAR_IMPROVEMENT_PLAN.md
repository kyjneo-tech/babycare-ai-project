# 일정 관리 페이지 개선 계획서

> 작성일: 2025-12-04
> 목표: 타임라인/달력 하이브리드 뷰 구현 및 사용성 개선

---

## 📋 개선 목표

1. **타임라인/달력 하이브리드 뷰** - 사용자가 상황에 맞게 선택
2. **Sticky 헤더** - 스크롤해도 필터/전환 버튼 접근 가능
3. **투데이 핀 보장** - 초기 로드 시 항상 오늘 위치로 스크롤
4. **불필요한 요소 제거** - UI 간소화
5. **반응형 달력** - 화면 크기별 최적화
6. **발달 이정표 추가** - 월령별 발달 정보 제공

---

## 🎯 Phase 1: 서버 API 개선

### 1.1 초기 로드 API 추가

**파일:** `src/features/notes/actions.ts`

**새로운 액션 추가:**
```typescript
export async function getInitialSchedulesWithToday(
  babyId: string
): Promise<ActionResult<{
  schedules: Note[];
  todayIndex: number;
  hasMorePast: boolean;
  hasMoreFuture: boolean;
}>>
```

**로직:**
- 오늘 기준으로 과거 10개, 미래 40개 조회 (총 50개)
- Promise.all로 병렬 처리
- todayIndex 정확히 계산하여 반환
- 추가 로드 가능 여부 반환

**장점:**
- ✅ 항상 투데이 핀 위치 포함
- ✅ 초기 로드 최적화
- ✅ 기존 무한 스크롤 API와 병행 사용

### 1.2 기존 API 유지

**파일:** `src/features/notes/actions.ts`

**유지할 액션:**
```typescript
getAllSchedulesForBaby() // 무한 스크롤용
```

---

## 🎨 Phase 2: UI 컴포넌트 구조 개편

### 2.1 Sticky 헤더 구조

**파일:** `src/features/schedules/components/InteractiveScheduleTimeline.tsx`

**구조:**
```
┌─────────────────────────────────────┐
│ Sticky Zone (position: sticky)      │
├─────────────────────────────────────┤
│ [📋 타임라인] [📅 달력]             │ ← Tabs 컴포넌트
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│ 🔍 일정 검색...                     │ ← Input 컴포넌트
│ [타입] [기간] [+ 추가]              │ ← Select + Button
└─────────────────────────────────────┘
```

**스타일:**
```css
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 12px;
}
```

### 2.2 제거할 요소

❌ **삭제 목록:**
1. "55개 중 55개 표시" 텍스트
2. FloatingActionButton (기능은 Sticky 헤더로 이동)
3. 중복된 상태 표시

✅ **유지/개선:**
1. 검색 Input
2. 타입 Select (전체, 예방접종, 건강검진, 도약기, 발달이정표, 사용자일정)
3. 기간 Select (전체, 이번주, 이번달, 3개월)

---

## 🗓️ Phase 3: 달력 뷰 구현

### 3.1 shadcn Calendar 컴포넌트 설치

```bash
npx shadcn@latest add calendar
```

### 3.2 CalendarView 컴포넌트 생성

**파일:** `src/features/schedules/components/CalendarView.tsx`

**기능:**
1. **반응형 표시**
   - 데스크톱 (≥768px): 일정 제목 + D-day 표시
   - 모바일 (<768px): 색깔 점으로 표시

2. **타입별 색상**
   - 예방접종: `bg-blue-500`
   - 건강검진: `bg-green-500`
   - 도약기: `bg-purple-500`
   - 수면퇴행: `bg-indigo-500`
   - 이유식: `bg-orange-500`
   - 사용자일정: `bg-gray-500`

3. **상호작용**
   - 날짜 클릭 → Popover로 일정 미리보기 (데스크톱)
   - 날짜 클릭 → Dialog로 일정 리스트 (모바일)
   - "타임라인으로 이동" 버튼 → 해당 날짜로 스크롤

### 3.3 컴포넌트 구조

```tsx
<CalendarView
  schedules={schedules}
  onDateClick={(date) => {
    // 타임라인으로 전환 + 해당 날짜로 스크롤
    setCurrentView('timeline');
    scrollToDate(date);
  }}
/>
```

**세부 구현:**
```tsx
// 큰 화면
<div className="hidden md:block">
  <Calendar
    components={{
      Day: ({ date }) => (
        <div className="min-h-[80px] p-2">
          <div className="font-medium">{format(date, 'd')}</div>
          {/* 일정 제목 표시 */}
          {daySchedules.slice(0, 2).map(s => (
            <Badge variant="outline" className="text-[10px]">
              {s.title.slice(0, 10)}
            </Badge>
          ))}
          {daySchedules.length > 2 && (
            <div className="text-[10px] text-gray-500">
              +{daySchedules.length - 2}
            </div>
          )}
        </div>
      )
    }}
  />
</div>

// 작은 화면
<div className="md:hidden">
  <Calendar
    components={{
      Day: ({ date }) => (
        <div className="p-2">
          <div className="font-medium">{format(date, 'd')}</div>
          {/* 색깔 점 표시 */}
          <div className="flex gap-0.5 mt-1 justify-center">
            {daySchedules.slice(0, 3).map(s => (
              <div className={`w-1.5 h-1.5 rounded-full ${getTypeColor(s.type)}`} />
            ))}
          </div>
        </div>
      )
    }}
  />
</div>
```

---

## 🔄 Phase 4: 뷰 전환 로직 + 사용자 선호도 저장

### 4.1 상태 관리 및 선호도 저장

**파일:** `src/features/schedules/components/InteractiveScheduleTimeline.tsx`

**localStorage 사용 (추천):**
```typescript
const STORAGE_KEY = 'schedule-view-preference';

// 초기값: localStorage에서 가져오거나 기본값 'timeline'
const [currentView, setCurrentView] = useState<'timeline' | 'calendar'>(() => {
  if (typeof window !== 'undefined') {
    return (localStorage.getItem(STORAGE_KEY) as 'timeline' | 'calendar') || 'timeline';
  }
  return 'timeline';
});

// 뷰 변경 시 localStorage에 저장
const handleViewChange = (newView: 'timeline' | 'calendar') => {
  setCurrentView(newView);
  localStorage.setItem(STORAGE_KEY, newView);

  // URL도 동기화
  const params = new URLSearchParams(searchParams);
  params.set('view', newView);
  router.push(`?${params.toString()}`, { scroll: false });
};
```

**장점:**
- ✅ 빠른 조회 (서버 요청 없음)
- ✅ 구현 간단
- ✅ 브라우저별 독립적 저장
- ✅ 로그인 불필요

**대안: DB 저장 (선택사항):**
```typescript
// UserSettings 테이블에 scheduleViewPreference 컬럼 추가
// 로그인 사용자만 여러 기기에서 동기화 필요 시
```

### 4.2 Tabs 컴포넌트 사용

```tsx
<Tabs value={currentView} onValueChange={handleViewChange}>
  <TabsList className="grid w-full grid-cols-2">
    <TabsTrigger value="timeline">
      <CalendarDays className="w-4 h-4 mr-2" />
      타임라인
    </TabsTrigger>
    <TabsTrigger value="calendar">
      <Calendar className="w-4 h-4 mr-2" />
      달력
    </TabsTrigger>
  </TabsList>
</Tabs>
```

---

## 📍 Phase 5: 투데이 핀 개선

### 5.1 초기 로드 수정

**파일:** `src/features/schedules/components/InteractiveScheduleTimeline.tsx`

**변경 전:**
```typescript
const fetchSchedules = async (reset: boolean = false) => {
  const result = await getAllSchedulesForBaby(babyId, {
    offset: 0,
    limit: 50
  });
  // 문제: 과거 일정 많으면 오늘 이후가 안 불려옴
}
```

**변경 후:**
```typescript
const fetchInitialSchedules = async () => {
  setIsLoading(true);

  // 새 API 사용: 오늘 기준 앞뒤로 로드
  const result = await getInitialSchedulesWithToday(babyId);

  if (result.success) {
    setSchedules(result.data.schedules);
    setTodayIndex(result.data.todayIndex);
    setHasMorePast(result.data.hasMorePast);
    setHasMoreFuture(result.data.hasMoreFuture);
  }

  setIsLoading(false);
};

useEffect(() => {
  fetchInitialSchedules();
}, [babyId]);
```

### 5.2 자동 스크롤 개선

```typescript
useEffect(() => {
  if (!isLoading && schedules.length > 0 && todayIndex >= 0 && !hasAutoScrolledRef.current) {
    // todayIndex 사용 (서버에서 정확히 계산된 위치)
    const targetElement = schedules[todayIndex]?.ref;
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'auto',
        block: 'center'
      });
      hasAutoScrolledRef.current = true;
    }
  }
}, [isLoading, schedules, todayIndex]);
```

---

## 🚀 Phase 6: 발달 이정표 추가

### 6.1 템플릿 데이터 생성

**파일:** `src/shared/templates/developmental-milestones.ts`

```typescript
export type DevelopmentalMilestone = {
  id: string;
  ageRangeMonths: [number, number]; // [0, 3] = 0-3개월
  title: string;
  categories: {
    grossMotor: string[];    // 대근육
    fineMotor: string[];     // 소근육
    language: string[];      // 언어
    social: string[];        // 사회성
  };
};

export const MILESTONES: DevelopmentalMilestone[] = [
  {
    id: '0-3months',
    ageRangeMonths: [0, 3],
    title: '0-3개월',
    categories: {
      grossMotor: [
        '엎드려 머리 들기 (2개월)',
        '가슴까지 들기 (3개월)',
        '다리를 차며 움직이기',
        '팔다리를 부드럽게 움직이기'
      ],
      fineMotor: [
        '눈으로 물체 추적하기',
        '손목과 발목 흔들기',
        '주먹 쥐었다 펴기',
        '얼굴 가까이 있는 물체 응시하기'
      ],
      language: [
        '옹알이 시작 (아~, 우~ 소리)',
        '울음으로 감정 표현하기',
        '목소리에 반응하기',
        '다양한 울음소리로 요구사항 전달'
      ],
      social: [
        '사회적 미소 짓기 (6주)',
        '사람 얼굴 응시하기',
        '눈 맞추며 상호작용',
        '익숙한 목소리에 진정하기'
      ]
    }
  },
  {
    id: '4-6months',
    ageRangeMonths: [4, 6],
    title: '4-6개월',
    categories: {
      grossMotor: [
        '뒤집기 (배→등, 등→배)',
        '지지 없이 앉기 시도',
        '양손으로 몸 지탱하며 엎드려 있기',
        '발 딛고 튀어오르기 (지지한 채)'
      ],
      fineMotor: [
        '손 뻗어 물건 잡기',
        '양손으로 장난감 옮기기',
        '입으로 물건 탐색하기',
        '딸랑이 흔들며 소리 내기'
      ],
      language: [
        '옹알이 발전 (바바, 다다)',
        '소리 나는 쪽 돌아보기',
        '자음+모음 조합 소리 내기',
        '목소리 톤으로 감정 인식'
      ],
      social: [
        '거울 속 자신에게 미소',
        '낯가림 시작',
        '좋아하는 사람 알아보기',
        '까꿍 놀이 즐기기'
      ]
    }
  },
  {
    id: '7-9months',
    ageRangeMonths: [7, 9],
    title: '7-9개월',
    categories: {
      grossMotor: [
        '혼자 앉기',
        '배밀이 또는 기어다니기',
        '붙잡고 일어서기',
        '가구 잡고 옆으로 이동'
      ],
      fineMotor: [
        '엄지와 검지로 물건 집기 (집게 쥐기)',
        '물건 한 손에서 다른 손으로 옮기기',
        '손가락으로 작은 물건 집기',
        '물건 두드리기'
      ],
      language: [
        '"마마", "다다" 등 단어 흉내',
        '간단한 지시 이해 ("안돼")',
        '다양한 옹알이 조합',
        '이름 부르면 반응하기'
      ],
      social: [
        '낯가림 심화',
        '분리불안 시작',
        '간단한 사회적 게임 참여 (짝짜꿍)',
        '선호하는 장난감 표현'
      ]
    }
  },
  {
    id: '10-12months',
    ageRangeMonths: [10, 12],
    title: '10-12개월',
    categories: {
      grossMotor: [
        '혼자 서기',
        '몇 걸음 걷기',
        '기구 잡고 걷기',
        '앉았다 일어서기 반복'
      ],
      fineMotor: [
        '컵 들고 마시기 시도',
        '숟가락 쥐기',
        '블록 2개 쌓기',
        '그림책 넘기기 (도움 필요)',
        '검지로 가리키기'
      ],
      language: [
        '첫 단어 말하기 (엄마, 아빠)',
        '간단한 지시 따르기 ("주세요")',
        '"안녕" 손흔들기',
        '고개 끄덕이기/젓기'
      ],
      social: [
        '간단한 놀이 흉내 (전화하기)',
        '관심 끌려고 행동 반복',
        '혼자 노는 시간 증가',
        '애착 인형/물건 갖기'
      ]
    }
  },
  {
    id: '13-18months',
    ageRangeMonths: [13, 18],
    title: '13-18개월',
    categories: {
      grossMotor: [
        '혼자 잘 걷기',
        '계단 기어오르기',
        '뒤로 걷기',
        '공 앞으로 차기',
        '의자에 올라가기'
      ],
      fineMotor: [
        '블록 3-4개 쌓기',
        '크레용으로 낙서하기',
        '컵으로 혼자 마시기',
        '숟가락 사용 시도',
        '그림책 페이지 넘기기'
      ],
      language: [
        '10-20개 단어 말하기',
        '간단한 지시 2개 이해',
        '몸 부위 가리키기 (코, 눈)',
        '그림책 속 사물 가리키기',
        '"어" 하며 요구하기'
      ],
      social: [
        '다른 아이에게 관심 보이기',
        '관심 끌기 위해 소리 지르기',
        '분리불안 지속',
        '어른 행동 따라하기 (청소, 전화)',
        '선호하는 것 선택 표현'
      ]
    }
  },
  {
    id: '19-24months',
    ageRangeMonths: [19, 24],
    title: '19-24개월',
    categories: {
      grossMotor: [
        '뛰어다니기',
        '계단 난간 잡고 오르내리기',
        '발끝으로 서기',
        '공 던지기',
        '세발자전거 페달 밟기 시도'
      ],
      fineMotor: [
        '블록 6개 이상 쌓기',
        '원형 그리기 시도',
        '숟가락/포크로 혼자 먹기',
        '장난감 나사 돌리기',
        '단추 풀기',
        '책장 한 장씩 넘기기'
      ],
      language: [
        '50개 이상 단어 말하기',
        '2-3단어 문장 ("엄마 물 주세요")',
        '간단한 노래 따라 부르기',
        '"나", "내 것" 사용',
        '신체 부위 여러 개 인식'
      ],
      social: [
        '또래와 나란히 놀기 (평행놀이)',
        '역할놀이 시작 (인형 먹이기)',
        '독립심 증가 ("내가 할래")',
        '간단한 집안일 돕기',
        '감정 표현 풍부해짐 (질투, 자랑)',
        '소유욕 강해짐'
      ]
    }
  }
];
```

### 6.2 표시 위치 및 구현 방법 (추천안)

**추천: 옵션 C - 일정 타임라인 통합**

**이유:**
- ✅ 예방접종, 건강검진과 함께 시간순으로 표시되어 직관적
- ✅ 기존 필터 시스템 활용 가능 (발달 이정표만 보기/숨기기)
- ✅ 새로운 UI 없이 기존 구조 재사용
- ✅ 타임라인/달력 모두에서 일관되게 표시

**구현 단계:**

**1) scheduleGeneratorService.ts에 이정표 생성 함수 추가**
```typescript
export function generateDevelopmentalMilestones(
  babyId: string,
  userId: string,
  birthDate: Date
): CreateNoteInput[] {
  return MILESTONES.map((milestone) => {
    // 연령대 중간값 사용 (예: 0-3개월 → 1.5개월)
    const middleMonth =
      (milestone.ageRangeMonths[0] + milestone.ageRangeMonths[1]) / 2;
    const dueDate = addMonthsToBirthDate(birthDate, middleMonth);

    // 카테고리별 체크리스트 포맷팅
    const grossMotorList = milestone.categories.grossMotor
      .map(item => `☐ ${item}`).join('\n');
    const fineMotorList = milestone.categories.fineMotor
      .map(item => `☐ ${item}`).join('\n');
    const languageList = milestone.categories.language
      .map(item => `☐ ${item}`).join('\n');
    const socialList = milestone.categories.social
      .map(item => `☐ ${item}`).join('\n');

    return {
      babyId,
      userId,
      type: 'MILESTONE' as NoteType,
      title: `📍 ${milestone.title} 발달 이정표`,
      content: `
🏃 대근육 발달
${grossMotorList}

✋ 소근육 발달
${fineMotorList}

💬 언어 발달
${languageList}

👶 사회성 발달
${socialList}

💡 발달은 개인차가 있습니다. 이정표는 참고용이며, 우려사항이 있다면 전문가와 상담하세요.
      `.trim(),
      dueDate,
      completed: false,
      priority: 'MEDIUM',
      tags: ['발달', '이정표', milestone.title],
      metadata: {
        milestoneId: milestone.id,
        ageRangeMonths: milestone.ageRangeMonths,
      },
      reminderDays: [0],
    };
  });
}
```

**2) generateAllSchedules 함수에 이정표 포함**
```typescript
// src/features/notes/services/scheduleGeneratorService.ts
export function generateAllSchedules(
  babyId: string,
  userId: string,
  birthDate: Date,
  options: {
    includeVaccination?: boolean;
    includeHealthCheck?: boolean;
    includeMilestone?: boolean; // 기존 마일스톤 (단일 체크용)
    includeWonderWeeks?: boolean;
    includeSleepRegression?: boolean;
    includeFeedingStage?: boolean;
    includeDevelopmentalMilestones?: boolean; // 새로 추가!
  } = {}
): CreateNoteInput[] {
  const {
    includeVaccination = true,
    includeHealthCheck = true,
    includeMilestone = true,
    includeWonderWeeks = true,
    includeSleepRegression = true,
    includeFeedingStage = true,
    includeDevelopmentalMilestones = true, // 기본값 true
  } = options;

  const allSchedules: CreateNoteInput[] = [];

  // ... 기존 코드 ...

  if (includeDevelopmentalMilestones) {
    allSchedules.push(
      ...generateDevelopmentalMilestones(babyId, userId, birthDate)
    );
  }

  return allSchedules;
}
```

**3) 필터 UI에 "발달 이정표" 타입 추가**
```tsx
// InteractiveScheduleTimeline.tsx
const typeOptions = [
  { value: 'all', label: '전체' },
  { value: 'VACCINATION', label: '💉 예방접종' },
  { value: 'HEALTH_CHECKUP', label: '🏥 건강검진' },
  { value: 'MILESTONE', label: '📍 발달 이정표' }, // 추가
  { value: 'WONDER_WEEK', label: '🌊 도약기' },
  { value: 'SLEEP_REGRESSION', label: '😴 수면퇴행' },
  { value: 'FEEDING_STAGE', label: '🍼 이유식' },
  { value: 'APPOINTMENT', label: '📅 사용자 일정' },
];
```

**4) 발달 이정표 카드 디자인 (기존 ScheduleCard 확장)**
```tsx
// src/features/schedules/components/ScheduleCard.tsx
{note.type === 'MILESTONE' && (
  <Card className="border-l-4 border-l-amber-500 bg-amber-50/30">
    <CardHeader>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-amber-900">
          {note.title}
        </h3>
        <Badge variant="secondary" className="bg-amber-100 text-amber-800">
          {format(new Date(note.dueDate), 'M월 d일')}
        </Badge>
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-sm text-gray-700 whitespace-pre-line">
        {note.content}
      </div>
      {/* 달성률 표시 (선택사항) */}
      <div className="mt-3 pt-3 border-t">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>달성률</span>
          <span className="font-medium">미구현</span>
        </div>
      </div>
    </CardContent>
  </Card>
)}
```

**5) 달력 뷰에서 색상 표시**
```typescript
// CalendarView.tsx
const getMilestoneColor = (noteType: NoteType) => {
  if (noteType === 'MILESTONE') return 'bg-amber-500';
  // ... 기존 색상 매핑
};
```

---

## 🛠️ 구현 순서

### Phase 1 (1-2일): 서버 API 및 기반 작업
- [ ] **1일차**
  - [ ] `getInitialSchedulesWithToday` API 추가
  - [ ] 투데이 핀 보장 로직 구현
  - [ ] 테스트: 과거 일정 많을 때도 오늘 위치 정확히 로드되는지

- [ ] **2일차**
  - [ ] Sticky 헤더 구조 변경
  - [ ] "55개 중 55개 표시" 제거
  - [ ] FloatingActionButton 기능을 Sticky 헤더로 이동
  - [ ] localStorage 기반 뷰 선호도 저장 구현

### Phase 2 (3-4일): 달력 뷰 구현
- [ ] **3일차**
  - [ ] `npx shadcn@latest add calendar` 설치
  - [ ] CalendarView 컴포넌트 기본 구조 생성
  - [ ] 반응형 레이아웃 (데스크톱/모바일 분기)

- [ ] **4일차**
  - [ ] 일정 데이터 달력에 매핑
  - [ ] 타입별 색상 표시 (데스크톱: 제목, 모바일: 점)
  - [ ] 날짜 클릭 → 타임라인 전환 + 해당 날짜 스크롤
  - [ ] Popover/Dialog로 일정 미리보기

### Phase 3 (5-6일): 발달 이정표 추가
- [ ] **5일차**
  - [ ] `developmental-milestones.ts` 템플릿 파일 생성
  - [ ] 6개 연령대 데이터 입력 (0-3, 4-6, 7-9, 10-12, 13-18, 19-24개월)
  - [ ] `generateDevelopmentalMilestones` 함수 구현

- [ ] **6일차**
  - [ ] `generateAllSchedules`에 이정표 통합
  - [ ] 필터 UI에 "발달 이정표" 타입 추가
  - [ ] ScheduleCard에 MILESTONE 타입 디자인 추가
  - [ ] 달력 뷰에 amber 색상 추가
  - [ ] 기존 아기 데이터에 이정표 일정 생성 (마이그레이션 스크립트)

### Phase 4 (7-8일): 통합 및 테스트
- [ ] **7일차**
  - [ ] 전체 기능 통합 테스트
  - [ ] 타임라인 ↔ 달력 전환 테스트
  - [ ] 모바일/데스크톱 반응형 테스트
  - [ ] 실시간 업데이트 테스트

- [ ] **8일차**
  - [ ] 성능 최적화 (메모이제이션, 렌더링 최적화)
  - [ ] 접근성 개선 (키보드 네비게이션, ARIA 라벨)
  - [ ] 버그 수정 및 엣지 케이스 처리
  - [ ] 최종 사용성 점검

---

## 📝 기술 스택

### 사용할 shadcn 컴포넌트
- ✅ `Tabs` - 타임라인/달력 전환
- ✅ `Calendar` - 달력 뷰 (신규 설치)
- ✅ `Select` - 필터 (기존)
- ✅ `Input` - 검색 (기존)
- ✅ `Button` - 액션 버튼 (기존)
- ✅ `Badge` - D-day, 타입 표시 (기존)
- ✅ `Popover` - 일정 미리보기 (기존)
- ✅ `Dialog` - 모바일 일정 리스트 (기존)
- ✅ `Checkbox` - 이정표 체크리스트 (기존)

### 라이브러리
- `date-fns` - 날짜 처리 (이미 사용 중)
- `react-intersection-observer` - 무한 스크롤 (이미 사용 중)

---

## ⚠️ 주의사항

1. **기존 기능 유지**
   - 무한 스크롤 계속 작동
   - 검색/필터 기능 유지
   - 일정 추가/수정/삭제 기능 유지

2. **성능 고려**
   - 달력 뷰는 메모이제이션 필수
   - 일정 그룹화 로직 최적화
   - 초기 로드 시간 모니터링

3. **접근성**
   - 키보드 네비게이션 지원
   - ARIA 라벨 추가
   - 색상만으로 정보 전달 금지 (점 + 텍스트)

4. **모바일 최적화**
   - 터치 이벤트 최적화
   - 스와이프 제스처 고려
   - 작은 화면에서 가독성 확보

---

## 🎯 성공 지표

- [ ] 타임라인 ↔ 달력 전환이 1초 이내
- [ ] 투데이 핀 100% 정확도
- [ ] 모바일/데스크톱 모두 사용성 테스트 통과
- [ ] 초기 로드 시간 2초 이내
- [ ] 사용자 피드백 긍정적

---

## 📚 참고 자료

- [shadcn Calendar](https://ui.shadcn.com/docs/components/calendar)
- [date-fns 한국어](https://date-fns.org/v2.29.3/docs/locale)
- [발달 이정표 CDC](https://www.cdc.gov/ncbddd/actearly/milestones/index.html)

---

## 🔄 변경 이력

- 2025-12-04 (v1.0): 초안 작성 - 타임라인/달력 하이브리드 뷰 계획
- 2025-12-04 (v1.1): Phase 4 추가 - localStorage 기반 사용자 뷰 선호도 저장
- 2025-12-04 (v1.2): Phase 6 완성 - 발달 이정표 6개 연령대 전체 데이터 추가 및 구현 방법 상세화
- 2025-12-04 (v1.3): 구현 순서 개편 - 8일 일정으로 단계별 작업 명확화
