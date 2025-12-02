# 🎯 BabyCare AI - Zustand 전역 상태 관리 마이그레이션 계획서

> **작성일**: 2025-12-02
> **버전**: 1.0
> **담당**: Development Team
> **목표**: 전역 상태 관리를 Zustand로 통합하여 실시간 데이터 동기화 및 성능 최적화

---

## 📑 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [현재 상황 분석](#2-현재-상황-분석)
3. [아키텍처 설계](#3-아키텍처-설계)
4. [Store 상세 스펙](#4-store-상세-스펙)
5. [데이터 흐름 패턴](#5-데이터-흐름-패턴)
6. [성능 최적화 전략](#6-성능-최적화-전략)
7. [마이그레이션 계획](#7-마이그레이션-계획)
8. [구현 로드맵](#8-구현-로드맵)
9. [테스트 전략](#9-테스트-전략)
10. [위험 관리](#10-위험-관리)
11. [성공 지표](#11-성공-지표)
12. [참고 자료](#12-참고-자료)

---

## 1. 프로젝트 개요

### 1.1 배경

현재 BabyCare AI 애플리케이션은 다음과 같은 상태 관리 문제를 겪고 있습니다:

- **데이터 동기화 지연**: 체중/키 측정값 입력 후 수유량/투약량 가이드가 즉시 반영되지 않음 (새로고침 필요)
- **중복 데이터 fetching**: 같은 데이터를 여러 컴포넌트에서 반복적으로 조회
- **복잡한 상태 전파**: `useEffect` + `dependency array` 패턴의 한계
- **캐시 무효화 불확실성**: `revalidatePath` + `router.refresh()`의 비동기적 특성으로 인한 예측 불가능성

### 1.2 목표

**주요 목표:**
1. ⚡ **실시간 동기화**: 모든 데이터 변경이 전역적으로 즉시 반영
2. 🚀 **성능 향상**: 중복 API 호출 제거 및 불필요한 리렌더링 최소화
3. 🧹 **코드 단순화**: 복잡한 상태 로직을 중앙 집중식으로 관리
4. 🐛 **디버깅 용이성**: Redux DevTools를 통한 상태 추적

**핵심 성공 기준:**
- 체중 입력 후 0.1초 이내 수유량 가이드 반영
- 활동 기록 시 타임라인 즉시 업데이트 (낙관적 업데이트)
- 불필요한 리렌더링 50% 이상 감소

### 1.3 범위

**포함:**
- 7개 도메인 Store 구축
- 기존 Server Actions 유지 (재사용)
- 낙관적 업데이트 패턴 적용
- Redux DevTools 연동

**제외:**
- Server Components 상태 관리 (기존 유지)
- 인증 상태 (next-auth 유지)
- 라우팅 상태 (Next.js Router 유지)

---

## 2. 현재 상황 분석

### 2.1 기술 스택

```
프레임워크: Next.js 16.0.3 (App Router, Turbopack)
React: 19.2.0
언어: TypeScript 5
데이터베이스: PostgreSQL (Prisma ORM 6.19.0)
인증: NextAuth.js 4.24.13
상태 관리: useState (로컬), sessionStorage (현재 아기 ID)
```

### 2.2 코드베이스 현황

```
총 파일 수: 500+ 파일
useState 사용: 84개 파일
revalidatePath 사용: 53회 (5개 actions 파일)
복잡한 폼 상태: useActivityFormState (169줄, 30개 이상 상태)
기존 훅: useCurrentBabyId, useMeasurementForm 등
```

### 2.3 데이터 모델 (Prisma Schema)

```typescript
핵심 엔티티:
- User (사용자)
- Family (가족)
- FamilyMember (가족 구성원)
- Baby (아기)
- Activity (활동: 수유, 수면, 배변, 투약, 체온, 목욕, 놀이)
- BabyMeasurement (체중/키 측정)
- Note (노트/일정: 메모, 투두, 예방접종, 건강검진 등)
- ChatMessage (AI 채팅)
- UserSettings (사용자 설정)
```

### 2.4 문제 상황 재현 시나리오

**시나리오 1: 체중 입력 후 가이드 미반영**
```
1. 사용자가 "측정 기록" → 체중 5.5kg 입력 → 저장
2. 바로 "활동 기록" → "수유" 선택
3. 문제: 가이드에 이전 체중 기준 수유량 표시 (5.5kg 기준 아님)
4. 새로고침 후에야 5.5kg 기준 가이드 표시

원인: ActivityForm이 useEffect로 데이터 로드, babyId만 dependency
→ 체중 변경 감지 못함
```

**시나리오 2: 활동 기록 후 타임라인 지연**
```
1. 사용자가 수유 기록 저장
2. 타임라인 컴포넌트가 1-2초 후 업데이트
3. 체감상 느림

원인: Server Action → revalidatePath → 클라이언트 refetch
→ 2-3번의 네트워크 왕복
```

### 2.5 기존 해결 시도 및 한계

**시도 1: `router.refresh()` 추가**
```typescript
// useMeasurementForm.ts, EditMeasurementForm.tsx
await createMeasurement(data);
router.refresh(); // ✅ 추가함
```
- 결과: 여전히 새로고침 필요
- 이유: `router.refresh()`는 Server Components만 재렌더링, Client Component useEffect는 재실행 안됨

**시도 2: `revalidatePath` 사용**
```typescript
// measurements/actions.ts
revalidatePath(`/babies/${babyId}`);
```
- 결과: 서버 캐시는 무효화되나 클라이언트 반영 안됨
- 이유: 클라이언트 컴포넌트는 자동 refetch 안됨

**결론: 전역 상태 관리 필요**

---

## 3. 아키텍처 설계

### 3.1 전체 구조

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js App Router                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                  Server Components                     │  │
│  │  (SSR, Data Fetching, Server Actions)                 │  │
│  └───────────────────────────────────────────────────────┘  │
│                            ↕                                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                 Client Components                      │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │          Zustand Store (전역 상태)              │  │  │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐         │  │  │
│  │  │  │   Baby   │ │Measure-  │ │ Activity │ ...     │  │  │
│  │  │  │  Store   │ │  ment    │ │  Store   │         │  │  │
│  │  │  │          │ │  Store   │ │          │         │  │  │
│  │  │  └──────────┘ └──────────┘ └──────────┘         │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                       ↕                                 │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │         UI Components (구독)                    │  │  │
│  │  │   ActivityForm, Timeline, Dashboard, etc.       │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↕
                  ┌──────────────────┐
                  │   PostgreSQL     │
                  │  (Prisma ORM)    │
                  └──────────────────┘
```

### 3.2 Store 구조 (7개 도메인 분리)

```
src/stores/
├── index.ts                    # 통합 export, 공통 타입, 유틸리티
├── useAppStore.ts             # 앱 전역 상태 (로딩, 에러, 초기화)
├── useBabyStore.ts            # 아기 정보 + 현재 선택된 아기
├── useMeasurementStore.ts     # 체중/키 측정 (핵심!)
├── useActivityStore.ts        # 활동 기록 (수유, 수면, 배변 등)
├── useFamilyStore.ts          # 가족 + 구성원 + 권한
├── useNoteStore.ts            # 일정/메모/투두
└── useChatStore.ts            # AI 채팅
```

**분리 기준:**
- Prisma 엔티티 단위
- 독립적인 생명주기
- 명확한 책임 분리

### 3.3 데이터 흐름

```
사용자 액션
    ↓
UI Component
    ↓
Store Action (낙관적 업데이트)
    ↓
[즉시 UI 반영] ← 사용자가 보는 순간
    ↓
Server Action (백그라운드)
    ↓
Database
    ↓
Server Response
    ↓
Store Update (실제 데이터로 교체)
    ↓
UI 최종 확정
```

### 3.4 폴더 구조

```
src/
├── stores/                        # Zustand 스토어
│   ├── index.ts                  # 통합 export
│   ├── types.ts                  # 공통 타입 정의
│   ├── middleware/               # 커스텀 미들웨어
│   │   ├── logger.ts            # 개발용 로거
│   │   └── errorHandler.ts      # 에러 핸들링
│   ├── useAppStore.ts
│   ├── useBabyStore.ts
│   ├── useMeasurementStore.ts
│   ├── useActivityStore.ts
│   ├── useFamilyStore.ts
│   ├── useNoteStore.ts
│   └── useChatStore.ts
├── app/
│   ├── providers.tsx             # Store 초기화 로직 추가
│   └── ...
├── features/
│   ├── activities/
│   │   ├── actions.ts           # 기존 Server Actions (유지)
│   │   ├── components/
│   │   │   └── ActivityForm.tsx # Store 구독으로 변경
│   │   └── hooks/
│   │       └── useActivityFormState.ts # 점진적으로 Store로 이동
│   ├── measurements/
│   │   ├── actions.ts           # 기존 유지
│   │   └── hooks/
│   │       └── useMeasurementForm.ts # Store 업데이트 로직 추가
│   └── ...
└── ...
```

---

## 4. Store 상세 스펙

### 4.1 useAppStore - 앱 전역 상태

**책임:**
- 앱 초기화 상태
- 전역 로딩/에러
- 네트워크 상태
- 토스트/알림

**인터페이스:**

```typescript
// src/stores/useAppStore.ts

interface AppState {
  // 상태
  isInitialized: boolean;
  isOnline: boolean;
  globalLoading: boolean;
  globalError: string | null;

  // Actions
  setInitialized: (value: boolean) => void;
  setOnline: (value: boolean) => void;
  setGlobalLoading: (value: boolean) => void;
  setGlobalError: (error: string | null) => void;
  clearError: () => void;
}

// 사용 예시
const isInitialized = useAppStore(state => state.isInitialized);
const setGlobalError = useAppStore(state => state.setGlobalError);
```

**초기값:**

```typescript
{
  isInitialized: false,
  isOnline: true,
  globalLoading: false,
  globalError: null,
}
```

---

### 4.2 useBabyStore - 아기 정보

**책임:**
- 가족의 모든 아기 목록
- 현재 선택된 아기 추적
- 아기 CRUD

**인터페이스:**

```typescript
// src/stores/useBabyStore.ts

import { Baby } from '@prisma/client';

interface BabyState {
  // 상태
  babies: Baby[];
  currentBabyId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setBabies: (babies: Baby[]) => void;
  setCurrentBaby: (babyId: string) => void;
  addBaby: (baby: Baby) => void;
  updateBaby: (babyId: string, data: Partial<Baby>) => void;
  deleteBaby: (babyId: string) => void;

  // Computed Selectors
  getCurrentBaby: () => Baby | undefined;
  getBabyById: (id: string) => Baby | undefined;
  getBabyAge: (babyId: string) => number; // 월령
}

// 사용 예시
const currentBaby = useBabyStore(state => state.getCurrentBaby());
const setCurrentBaby = useBabyStore(state => state.setCurrentBaby);
```

**초기값:**

```typescript
{
  babies: [],
  currentBabyId: null,
  isLoading: false,
  error: null,
}
```

**현재 아기 선택 로직:**

```typescript
// 우선순위:
// 1. URL 파라미터 (/babies/[id])
// 2. Store의 currentBabyId
// 3. sessionStorage (마이그레이션 호환성)
// 4. 가족의 첫 번째 아기
```

---

### 4.3 useMeasurementStore - 체중/키 측정 (핵심!)

**책임:**
- 아기별 측정 이력
- 최신 측정값 캐싱 (빠른 조회)
- 성장 추이 계산

**인터페이스:**

```typescript
// src/stores/useMeasurementStore.ts

import { BabyMeasurement } from '@prisma/client';

interface LatestMeasurement {
  weight: number;
  height: number;
  measuredAt: Date;
}

interface MeasurementState {
  // 상태 (아기별 그룹화)
  measurements: Record<string, BabyMeasurement[]>; // key: babyId
  latestMeasurements: Record<string, LatestMeasurement>; // 캐시

  // Actions
  setMeasurements: (babyId: string, measurements: BabyMeasurement[]) => void;
  addMeasurement: (babyId: string, measurement: BabyMeasurement) => void;
  updateMeasurement: (measurementId: string, data: Partial<BabyMeasurement>) => void;
  deleteMeasurement: (measurementId: string) => void;

  // 낙관적 업데이트 전용
  addMeasurementOptimistic: (babyId: string, tempData: Omit<BabyMeasurement, 'id'>) => string; // returns tempId
  replaceMeasurement: (tempId: string, realData: BabyMeasurement) => void;
  rollbackMeasurement: (tempId: string) => void;

  // Computed Selectors
  getLatestMeasurement: (babyId: string) => LatestMeasurement | null;
  getMeasurementHistory: (babyId: string, limit?: number) => BabyMeasurement[];
  getGrowthTrend: (babyId: string) => 'increasing' | 'stable' | 'decreasing';
}

// 사용 예시 (ActivityForm에서)
const latestWeight = useMeasurementStore(
  state => state.getLatestMeasurement(babyId)?.weight ?? null
);
// latestWeight 변경 시 자동 리렌더링 → 수유량 가이드 즉시 반영!
```

**초기값:**

```typescript
{
  measurements: {},
  latestMeasurements: {},
}
```

**핵심 로직: 최신 측정값 자동 갱신**

```typescript
addMeasurement: (babyId, measurement) => {
  set(state => {
    const newMeasurements = [
      measurement,
      ...(state.measurements[babyId] || [])
    ].sort((a, b) => b.measuredAt - a.measuredAt);

    return {
      measurements: {
        ...state.measurements,
        [babyId]: newMeasurements,
      },
      latestMeasurements: {
        ...state.latestMeasurements,
        [babyId]: {
          weight: measurement.weight,
          height: measurement.height,
          measuredAt: measurement.measuredAt,
        },
      },
    };
  });
},
```

---

### 4.4 useActivityStore - 활동 기록

**책임:**
- 모든 활동 타입 관리 (수유, 수면, 배변, 투약, 체온, 목욕, 놀이)
- 최근 활동 캐싱 (타임라인 성능)
- 진행 중인 수면 추적

**인터페이스:**

```typescript
// src/stores/useActivityStore.ts

import { Activity, ActivityType } from '@prisma/client';

interface ActivityState {
  // 상태
  activities: Record<string, Activity[]>; // key: babyId
  recentActivities: Record<string, Activity[]>; // 최근 20개 캐시
  ongoingSleep: Record<string, Activity | null>; // 진행 중인 수면

  // Actions
  setActivities: (babyId: string, activities: Activity[]) => void;
  addActivity: (babyId: string, activity: Activity) => void;
  updateActivity: (activityId: string, data: Partial<Activity>) => void;
  deleteActivity: (activityId: string) => void;

  // 낙관적 업데이트
  addActivityOptimistic: (babyId: string, tempData: Omit<Activity, 'id'>) => string;
  replaceActivity: (tempId: string, realData: Activity) => void;
  rollbackActivity: (tempId: string) => void;

  // 수면 타이머 전용
  startSleep: (babyId: string, activity: Activity) => void;
  endSleep: (babyId: string, activityId: string, endTime: Date) => void;

  // Computed Selectors
  getActivitiesByType: (babyId: string, type: ActivityType) => Activity[];
  getRecentActivities: (babyId: string, limit?: number) => Activity[];
  getOngoingSleep: (babyId: string) => Activity | null;
  getActivitiesForDate: (babyId: string, date: Date) => Activity[];
  getLastFeeding: (babyId: string) => Activity | null; // Smart Defaults용
}

// 사용 예시
const recentActivities = useActivityStore(
  state => state.getRecentActivities(babyId, 20)
);
const ongoingSleep = useActivityStore(
  state => state.getOngoingSleep(babyId)
);
```

**초기값:**

```typescript
{
  activities: {},
  recentActivities: {},
  ongoingSleep: {},
}
```

**Smart Defaults 지원:**

```typescript
// 마지막 수유 정보를 기본값으로 제공
const lastFeeding = useActivityStore(state => state.getLastFeeding(babyId));

useEffect(() => {
  if (lastFeeding) {
    setFeedingType(lastFeeding.feedingType);
    setFeedingAmount(lastFeeding.feedingAmount?.toString() || '');
  }
}, [lastFeeding]);
```

---

### 4.5 useFamilyStore - 가족 관리

**책임:**
- 가족 정보 및 초대 코드
- 가족 구성원 목록
- 권한 관리

**인터페이스:**

```typescript
// src/stores/useFamilyStore.ts

import { Family, FamilyMember } from '@prisma/client';

type Permission = 'owner' | 'admin' | 'member' | 'viewer';

interface FamilyState {
  // 상태
  family: Family | null;
  members: FamilyMember[];
  currentUserPermission: Permission | null;

  // Actions
  setFamily: (family: Family) => void;
  setMembers: (members: FamilyMember[]) => void;
  addMember: (member: FamilyMember) => void;
  removeMember: (userId: string) => void;
  updateMember: (userId: string, data: Partial<FamilyMember>) => void;
  updateInviteCode: (newCode: string, expiresAt?: Date) => void;
  setCurrentUserPermission: (permission: Permission) => void;

  // Computed Selectors
  canManageFamily: () => boolean; // owner 또는 admin
  canInviteMembers: () => boolean;
  canEditBaby: () => boolean;
  canDeleteActivity: (activityUserId: string) => boolean; // 본인 또는 admin
  getMemberByUserId: (userId: string) => FamilyMember | undefined;
  isInviteCodeExpired: () => boolean;
}

// 사용 예시
const canManageFamily = useFamilyStore(state => state.canManageFamily());
const members = useFamilyStore(state => state.members);
```

**초기값:**

```typescript
{
  family: null,
  members: [],
  currentUserPermission: null,
}
```

**권한 로직:**

```typescript
canManageFamily: () => {
  const { currentUserPermission } = get();
  return currentUserPermission === 'owner' || currentUserPermission === 'admin';
},

canDeleteActivity: (activityUserId: string) => {
  const { currentUserPermission } = get();
  const currentUserId = useSession().data?.user?.id;

  return (
    activityUserId === currentUserId || // 본인 활동
    currentUserPermission === 'owner' ||
    currentUserPermission === 'admin'
  );
},
```

---

### 4.6 useNoteStore - 일정/메모

**책임:**
- 모든 타입의 노트 (메모, 투두, 예방접종, 건강검진 등)
- 다가오는 일정 캐싱
- 완료 상태 관리

**인터페이스:**

```typescript
// src/stores/useNoteStore.ts

import { Note, NoteType, Priority } from '@prisma/client';

interface NoteState {
  // 상태
  notes: Record<string, Note[]>; // key: babyId
  upcomingSchedules: Record<string, Note[]>; // 다가오는 일정 캐시 (7일 이내)

  // Actions
  setNotes: (babyId: string, notes: Note[]) => void;
  addNote: (babyId: string, note: Note) => void;
  updateNote: (noteId: string, data: Partial<Note>) => void;
  deleteNote: (noteId: string) => void;
  completeNote: (noteId: string) => void;
  uncompleteNote: (noteId: string) => void;

  // Computed Selectors
  getUpcomingSchedules: (babyId: string, days?: number) => Note[];
  getTodoList: (babyId: string) => Note[];
  getVaccinations: (babyId: string) => Note[];
  getHealthCheckups: (babyId: string) => Note[];
  getNotesByType: (babyId: string, type: NoteType) => Note[];
  getOverdueTodos: (babyId: string) => Note[];
}

// 사용 예시
const upcomingSchedules = useNoteStore(
  state => state.getUpcomingSchedules(babyId, 7)
);
const todos = useNoteStore(state => state.getTodoList(babyId));
```

**초기값:**

```typescript
{
  notes: {},
  upcomingSchedules: {},
}
```

---

### 4.7 useChatStore - AI 채팅

**책임:**
- AI 채팅 메시지 이력
- 생성 중 상태 관리
- 메시지 캐싱

**인터페이스:**

```typescript
// src/stores/useChatStore.ts

import { ChatMessage } from '@prisma/client';

interface ChatState {
  // 상태
  messages: Record<string, ChatMessage[]>; // key: babyId
  isGenerating: boolean;
  streamingMessage: string; // 스트리밍 중인 메시지

  // Actions
  setMessages: (babyId: string, messages: ChatMessage[]) => void;
  addMessage: (babyId: string, message: ChatMessage) => void;
  setGenerating: (isGenerating: boolean) => void;
  setStreamingMessage: (message: string) => void;
  clearStreamingMessage: () => void;
  clearHistory: (babyId: string) => void;

  // Computed Selectors
  getMessageHistory: (babyId: string) => ChatMessage[];
  getLastMessage: (babyId: string) => ChatMessage | null;
}

// 사용 예시
const messages = useChatStore(state => state.getMessageHistory(babyId));
const isGenerating = useChatStore(state => state.isGenerating);
```

**초기값:**

```typescript
{
  messages: {},
  isGenerating: false,
  streamingMessage: '',
}
```

---

## 5. 데이터 흐름 패턴

### 5.1 낙관적 업데이트 (Optimistic Update)

**개념:**
UI를 먼저 업데이트하고, 서버 동기화는 백그라운드에서 처리

**3단계 흐름:**

```typescript
// 예시: 체중 측정 기록

async function handleSaveMeasurement(babyId: string, data: { weight: number, height: number }) {
  const store = useMeasurementStore.getState();
  const appStore = useAppStore.getState();

  // 1️⃣ 낙관적 업데이트 (UI 즉시 반영)
  const tempId = store.addMeasurementOptimistic(babyId, {
    babyId,
    weight: data.weight,
    height: data.height,
    measuredAt: new Date(),
    note: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // ✨ 이 시점에서 사용자는 이미 업데이트된 UI를 봄
  // ActivityForm의 latestWeight가 즉시 변경됨!

  try {
    // 2️⃣ 서버 동기화 (백그라운드)
    const result = await createMeasurement({ babyId, ...data });

    if (result.success && result.data) {
      // 3️⃣ 실제 데이터로 교체 (서버 ID 반영)
      store.replaceMeasurement(tempId, result.data);
    } else {
      // 실패 시 롤백
      store.rollbackMeasurement(tempId);
      appStore.setGlobalError('저장에 실패했습니다');
    }
  } catch (error) {
    // 네트워크 오류 시 롤백
    store.rollbackMeasurement(tempId);
    appStore.setGlobalError('네트워크 오류가 발생했습니다');
  }
}
```

**장점:**
- ⚡ **즉각적인 UI 반응** (사용자 경험 최상)
- 🔄 **백그라운드 동기화** (안정성)
- 🔙 **자동 롤백** (데이터 정합성)

**적용 대상:**
- ✅ 활동 기록 (수유, 수면, 배변 등)
- ✅ 측정값 기록
- ✅ 투두 완료/미완료
- ❌ 삭제 작업 (신중함 필요 - 확인 후 서버 먼저)

### 5.2 Server-first Update

**개념:**
서버 응답을 기다린 후 UI 업데이트

**적용 시나리오:**

```typescript
// 예시: 아기 삭제 (중요한 작업)

async function handleDeleteBaby(babyId: string) {
  const confirmed = confirm('정말 삭제하시겠습니까?');
  if (!confirmed) return;

  const appStore = useAppStore.getState();
  appStore.setGlobalLoading(true);

  try {
    // 1️⃣ 서버 먼저 실행
    const result = await deleteBaby(babyId);

    if (result.success) {
      // 2️⃣ 성공 후 Store 업데이트
      useBabyStore.getState().deleteBaby(babyId);
    } else {
      appStore.setGlobalError(result.error || '삭제 실패');
    }
  } catch (error) {
    appStore.setGlobalError('삭제 중 오류 발생');
  } finally {
    appStore.setGlobalLoading(false);
  }
}
```

**적용 대상:**
- ✅ 삭제 작업
- ✅ 권한 변경
- ✅ 가족 탈퇴
- ✅ 결제 관련 (향후)

### 5.3 초기 데이터 로드

**Provider에서 초기화:**

```typescript
// src/app/providers.tsx

'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useBabyStore } from '@/stores/useBabyStore';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { useMeasurementStore } from '@/stores/useMeasurementStore';
import { useAppStore } from '@/stores/useAppStore';

export default function StoreInitializer({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const setInitialized = useAppStore(state => state.setInitialized);

  useEffect(() => {
    async function initializeStores() {
      if (status !== 'authenticated' || !session?.user?.familyId) {
        setInitialized(true);
        return;
      }

      try {
        // 병렬 로드 (성능 최적화)
        const [familyResult, babiesResult] = await Promise.all([
          getFamilyWithMembers(session.user.familyId),
          getBabiesByFamily(session.user.familyId),
        ]);

        // 1. 가족 정보
        if (familyResult.success) {
          useFamilyStore.getState().setFamily(familyResult.data.family);
          useFamilyStore.getState().setMembers(familyResult.data.members);

          // 현재 사용자 권한 설정
          const currentMember = familyResult.data.members.find(
            m => m.userId === session.user.id
          );
          if (currentMember) {
            useFamilyStore.getState().setCurrentUserPermission(currentMember.permission);
          }
        }

        // 2. 아기 목록
        if (babiesResult.success && babiesResult.data.length > 0) {
          useBabyStore.getState().setBabies(babiesResult.data);

          // 현재 아기 설정 (sessionStorage 또는 첫 번째)
          const lastViewedId = sessionStorage.getItem('lastViewedBabyId');
          const currentBabyId = lastViewedId || babiesResult.data[0].id;
          useBabyStore.getState().setCurrentBaby(currentBabyId);

          // 3. 현재 아기의 최신 측정값 (캐시)
          const measurementResult = await getLatestMeasurement(currentBabyId);
          if (measurementResult.success && measurementResult.data) {
            useMeasurementStore.getState().addMeasurement(
              currentBabyId,
              measurementResult.data
            );
          }
        }

      } catch (error) {
        console.error('Store initialization failed:', error);
        useAppStore.getState().setGlobalError('초기화 실패');
      } finally {
        setInitialized(true);
      }
    }

    initializeStores();
  }, [status, session, setInitialized]);

  // 초기화 전까지 로딩 표시
  const isInitialized = useAppStore(state => state.isInitialized);

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
```

### 5.4 실시간 동기화 예시

**Before (문제 상황):**

```typescript
// ActivityForm.tsx
const [latestWeight, setLatestWeight] = useState<number | null>(null);

useEffect(() => {
  async function loadWeight() {
    const result = await getLatestMeasurement(babyId);
    if (result.success) {
      setLatestWeight(result.data.weight);
    }
  }
  loadWeight();
}, [babyId]); // ❌ babyId만 dependency → 체중 변경 감지 못함
```

**After (해결):**

```typescript
// ActivityForm.tsx
const latestWeight = useMeasurementStore(
  state => state.getLatestMeasurement(babyId)?.weight ?? null
);
// ✅ useMeasurementStore가 업데이트되면 자동 리렌더링!
```

**동작 원리:**

```
1. 사용자가 체중 5.5kg 입력 → 저장
2. useMeasurementForm에서:
   store.addMeasurement(babyId, { weight: 5.5, ... })
3. useMeasurementStore 내부에서 latestMeasurements 자동 업데이트
4. ActivityForm이 구독 중이므로 즉시 리렌더링
5. latestWeight = 5.5kg으로 변경
6. GuidelinePanel에 5.5kg 기준 수유량 가이드 표시
7. 총 소요 시간: 0.1초 이내 ✨
```

---

## 6. 성능 최적화 전략

### 6.1 선택적 구독 (Selector Pattern)

**원칙: 필요한 것만 구독**

```typescript
// ❌ 나쁜 예: 전체 store 구독
const store = useMeasurementStore();
// store의 모든 값 변경 시 리렌더링

// ✅ 좋은 예: 필요한 값만 구독
const latestWeight = useMeasurementStore(
  state => state.getLatestMeasurement(babyId)?.weight
);
// latestWeight 변경 시에만 리렌더링
```

**성능 차이:**
- 나쁜 예: 측정값 100개 추가 → 모든 구독 컴포넌트 리렌더링
- 좋은 예: 최신 체중만 변경 → 해당 값 구독 컴포넌트만 리렌더링

### 6.2 Shallow Equality 비교

**배열/객체 구독 시:**

```typescript
import { useShallow } from 'zustand/react/shallow';

// ❌ 나쁜 예: 매번 새 배열 생성 → 항상 리렌더링
const data = useMeasurementStore(state => [
  state.getLatestMeasurement(babyId)?.weight,
  state.getLatestMeasurement(babyId)?.height,
]);

// ✅ 좋은 예: 값이 실제로 변경될 때만 리렌더링
const [weight, height] = useMeasurementStore(
  useShallow(state => [
    state.getLatestMeasurement(babyId)?.weight,
    state.getLatestMeasurement(babyId)?.height,
  ])
);
```

### 6.3 메모이제이션 (계산 캐싱)

**Store 내부에서 계산 결과 캐싱:**

```typescript
// useMeasurementStore.ts

const useMeasurementStore = create<MeasurementState>((set, get) => ({
  measurements: {},
  latestMeasurements: {}, // 캐시!

  addMeasurement: (babyId, measurement) => {
    set(state => {
      const newMeasurements = [
        measurement,
        ...(state.measurements[babyId] || [])
      ].sort((a, b) => b.measuredAt - a.measuredAt);

      return {
        measurements: {
          ...state.measurements,
          [babyId]: newMeasurements,
        },
        // ✅ 최신값 자동 캐싱
        latestMeasurements: {
          ...state.latestMeasurements,
          [babyId]: {
            weight: measurement.weight,
            height: measurement.height,
            measuredAt: measurement.measuredAt,
          },
        },
      };
    });
  },

  getLatestMeasurement: (babyId) => {
    // ✅ 캐시부터 확인 (빠름)
    const cached = get().latestMeasurements[babyId];
    if (cached) return cached;

    // 캐시 미스 시 계산
    const measurements = get().measurements[babyId] || [];
    return measurements[0] || null;
  },
}));
```

**효과:**
- 반복 조회 시 O(1) 성능
- 불필요한 배열 정렬 제거

### 6.4 구독 분할 (Store Slices)

**큰 Store를 작은 Slice로 분할:**

```typescript
// useActivityStore.ts

// ❌ 나쁜 예: 모든 활동 데이터를 하나의 상태로
const activities = useActivityStore(state => state.activities);
// 수유 데이터만 필요한데 수면, 배변도 포함됨

// ✅ 좋은 예: 타입별로 분리
const feedingActivities = useActivityStore(
  state => state.getActivitiesByType(babyId, 'FEEDING')
);
// 수유 데이터만 변경 시에만 리렌더링
```

### 6.5 Devtools Middleware (개발 환경)

```typescript
import { devtools } from 'zustand/middleware';

const useStore = create(
  devtools(
    (set, get) => ({ /* ... */ }),
    {
      name: 'MeasurementStore',
      enabled: process.env.NODE_ENV === 'development', // 프로덕션에서는 비활성화
    }
  )
);
```

**효과:**
- 개발 중에만 활성화
- 프로덕션 번들에서 제외 (성능 영향 없음)

### 6.6 예상 성능 개선 지표

| 항목 | Before | After | 개선율 |
|-----|--------|-------|--------|
| 체중 입력 → 가이드 반영 | 3초+ (새로고침) | 0.1초 | **97% 개선** |
| 활동 추가 → 타임라인 업데이트 | 1-2초 | 0초 (즉시) | **100% 개선** |
| 같은 데이터 조회 | N번 API 호출 | 1번 (캐시 공유) | **N배 개선** |
| 불필요한 리렌더링 | 모든 구독자 | 변경된 값 구독자만 | **50%+ 감소** |
| 번들 크기 | 기준 | +1.2KB (gzipped) | 미미함 |

---

## 7. 마이그레이션 계획

### 7.1 점진적 마이그레이션 전략

**원칙:**
- 기존 코드와 공존
- 단계별 검증
- 롤백 가능

**하위 호환성 유지:**

```typescript
// 기존 API (Deprecated)
export function useLatestWeight(babyId: string) {
  const [weight, setWeight] = useState<number | null>(null);

  useEffect(() => {
    getLatestMeasurement(babyId).then(result => {
      if (result.success) {
        setWeight(result.data.weight);
      }
    });
  }, [babyId]);

  return weight;
}

// 새 API (권장)
export function useLatestWeightV2(babyId: string) {
  return useMeasurementStore(
    state => state.getLatestMeasurement(babyId)?.weight ?? null
  );
}

// 점진적으로 V2로 교체
// 1단계: V2 추가 → 병렬 운영
// 2단계: 기존 코드를 V2로 교체
// 3단계: V1 제거
```

### 7.2 Server Actions 유지

**중요: Server Actions는 그대로 사용**

```typescript
// features/measurements/actions.ts (기존 유지)
export async function createMeasurement(data: CreateMeasurementInput) {
  'use server';

  const validated = CreateMeasurementSchema.parse(data);

  const measurement = await prisma.babyMeasurement.create({
    data: validated,
  });

  revalidatePath(`/babies/${data.babyId}`); // 서버 캐시 무효화 (유지)

  return { success: true, data: measurement };
}
```

**Store는 클라이언트 상태만 관리:**

```typescript
// useMeasurementForm.ts (수정됨)
const handleSave = async () => {
  // 1. 낙관적 업데이트
  const tempId = useMeasurementStore.getState().addMeasurementOptimistic(babyId, data);

  // 2. 기존 Server Action 호출
  const result = await createMeasurement(data);

  // 3. Store 업데이트
  if (result.success) {
    useMeasurementStore.getState().replaceMeasurement(tempId, result.data);
  } else {
    useMeasurementStore.getState().rollbackMeasurement(tempId);
  }
};
```

### 7.3 revalidatePath 정리

**현재 상황:**
- 53회 사용 (5개 actions 파일)

**마이그레이션 후:**
- Server Components용으로 유지
- Client Components는 Store 구독으로 대체

**정리 기준:**

```typescript
// ✅ 유지: Server Component가 사용하는 경로
revalidatePath(`/babies/${babyId}`); // SSR 페이지

// ❌ 제거 가능: Client Component만 사용
// router.refresh()도 제거 가능
```

### 7.4 단계별 체크리스트

**Phase 1: 인프라 구축 (1일)**
- [ ] Zustand 설치 (완료)
- [ ] Store 파일 구조 생성
- [ ] useAppStore 구현
- [ ] Providers에서 Store 초기화 로직 추가
- [ ] Devtools 연결
- [ ] 테스트: Store 기본 동작 확인

**Phase 2: 핵심 문제 해결 (1일) - 우선순위 최상**
- [ ] useMeasurementStore 구현
- [ ] useMeasurementForm에서 Store 업데이트 로직 추가
- [ ] EditMeasurementForm에서 Store 업데이트 로직 추가
- [ ] ActivityForm에서 Store 구독으로 변경
- [ ] 테스트: 체중 입력 → 수유 가이드 즉시 반영 확인
- [ ] 성공 기준: 0.1초 이내 반영

**Phase 3: 아기 정보 (1일)**
- [ ] useBabyStore 구현
- [ ] useCurrentBabyId 로직 통합
- [ ] 아기 선택 UI 연동
- [ ] 테스트: 아기 전환 시 데이터 정상 로드

**Phase 4: 활동 기록 (1-2일)**
- [ ] useActivityStore 구현
- [ ] ActivityForm 저장 시 낙관적 업데이트
- [ ] Timeline/Dashboard에서 Store 구독
- [ ] 수면 타이머 Store 통합
- [ ] Smart Defaults Store 연동
- [ ] 테스트: 활동 추가 시 즉시 반영 확인

**Phase 5: 가족 관리 (1일)**
- [ ] useFamilyStore 구현
- [ ] 가족 CRUD Store 연동
- [ ] 권한 관리 로직 Store로 이동
- [ ] 테스트: 가족원 추가/삭제 시 즉시 반영

**Phase 6: 일정/메모 (1일)**
- [ ] useNoteStore 구현
- [ ] 일정/투두 CRUD Store 연동
- [ ] 다가오는 일정 캐싱
- [ ] 테스트: 투두 완료 시 즉시 반영

**Phase 7: AI 채팅 (0.5일)**
- [ ] useChatStore 구현
- [ ] 채팅 메시지 Store 연동
- [ ] 스트리밍 상태 관리
- [ ] 테스트: 채팅 입력 시 정상 동작

**Phase 8: 정리 및 최적화 (1일)**
- [ ] 불필요한 revalidatePath 제거
- [ ] 불필요한 router.refresh() 제거
- [ ] 성능 프로파일링 (React DevTools Profiler)
- [ ] 메모리 누수 확인
- [ ] 문서화 (README 업데이트)
- [ ] 팀 공유 및 피드백

**총 예상 기간: 7-9일**

---

## 8. 구현 로드맵

### 8.1 병렬 실행 계획 (서브에이전트 활용)

**7개 서브에이전트 동시 실행:**

```
Agent 1: App Store & Infrastructure
  파일: src/stores/useAppStore.ts
       src/stores/index.ts
       src/stores/types.ts
  책임: 전역 상태, Devtools 설정, 공통 타입

Agent 2: Baby Store
  파일: src/stores/useBabyStore.ts
  책임: 아기 정보, 현재 아기 선택 로직
  연동: useCurrentBabyId 통합

Agent 3: Measurement Store (핵심!)
  파일: src/stores/useMeasurementStore.ts
  책임: 체중/키 측정, 최신값 캐싱
  연동: useMeasurementForm, EditMeasurementForm, ActivityForm

Agent 4: Activity Store
  파일: src/stores/useActivityStore.ts
  책임: 모든 활동 타입, 낙관적 업데이트
  연동: ActivityForm, Timeline, Dashboard

Agent 5: Family Store
  파일: src/stores/useFamilyStore.ts
  책임: 가족 정보, 구성원, 권한 관리
  연동: FamilyManagementPage, 권한 체크 로직

Agent 6: Note & Chat Stores
  파일: src/stores/useNoteStore.ts
       src/stores/useChatStore.ts
  책임: 일정/메모, AI 채팅
  연동: ScheduleTimeline, AIChatView

Agent 7: Providers & Testing
  파일: src/app/providers.tsx
  책임: Store 초기화, 통합 테스트, 문서화
  연동: 모든 Store 초기 데이터 로드
```

**실행 순서:**
1. Agent 1 먼저 완료 (인프라)
2. Agent 2-6 병렬 실행
3. Agent 7 마지막 (통합)

### 8.2 의존성 관리

```
Agent 1 (Infrastructure)
  ↓
Agent 2, 3, 4, 5, 6 (병렬 실행)
  ↓
Agent 7 (통합)
```

**Agent 간 충돌 방지:**
- 각 Agent는 독립된 Store 파일 작업
- index.ts는 Agent 1이 생성, 나머지가 export 추가
- types.ts는 Agent 1이 공통 타입 정의

### 8.3 검증 체크포인트

**Phase 2 완료 시 (체중 문제 해결):**
```
테스트 시나리오:
1. 측정 기록 → 체중 5.5kg 입력 → 저장
2. 활동 기록 → 수유 선택
3. 확인: 가이드에 5.5kg 기준 수유량 표시 (새로고침 없이)

성공 기준:
- 0.1초 이내 반영
- Console 에러 없음
- Redux DevTools에서 상태 변화 확인 가능
```

**Phase 4 완료 시 (활동 기록):**
```
테스트 시나리오:
1. 수유 기록 추가
2. 확인: 타임라인에 즉시 표시
3. 새로고침 후에도 데이터 유지

성공 기준:
- 낙관적 업데이트 동작 (즉시 표시)
- 서버 동기화 완료
- 실패 시 롤백 동작
```

---

## 9. 테스트 전략

### 9.1 단위 테스트 (Store별)

**테스트 도구:**
- Jest
- @testing-library/react
- @testing-library/react-hooks

**예시: useMeasurementStore.test.ts**

```typescript
import { renderHook, act } from '@testing-library/react';
import { useMeasurementStore } from '@/stores/useMeasurementStore';

describe('useMeasurementStore', () => {
  beforeEach(() => {
    // 각 테스트 전에 store 초기화
    useMeasurementStore.setState({
      measurements: {},
      latestMeasurements: {},
    });
  });

  test('addMeasurement: 측정값 추가 시 최신값 자동 갱신', () => {
    const { result } = renderHook(() => useMeasurementStore());

    const babyId = 'baby-123';
    const measurement = {
      id: 'measure-1',
      babyId,
      weight: 5.5,
      height: 65.0,
      measuredAt: new Date(),
      note: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    act(() => {
      result.current.addMeasurement(babyId, measurement);
    });

    const latest = result.current.getLatestMeasurement(babyId);

    expect(latest).toEqual({
      weight: 5.5,
      height: 65.0,
      measuredAt: measurement.measuredAt,
    });
  });

  test('낙관적 업데이트: tempId 생성 및 교체', () => {
    const { result } = renderHook(() => useMeasurementStore());

    const babyId = 'baby-123';
    const tempData = {
      babyId,
      weight: 6.0,
      height: 66.0,
      measuredAt: new Date(),
      note: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    let tempId: string;

    act(() => {
      tempId = result.current.addMeasurementOptimistic(babyId, tempData);
    });

    const latest = result.current.getLatestMeasurement(babyId);
    expect(latest?.weight).toBe(6.0);

    const realData = {
      id: 'measure-real',
      ...tempData,
    };

    act(() => {
      result.current.replaceMeasurement(tempId!, realData);
    });

    const measurements = result.current.getMeasurementHistory(babyId);
    expect(measurements[0].id).toBe('measure-real');
  });

  test('롤백: 실패 시 임시 데이터 제거', () => {
    const { result } = renderHook(() => useMeasurementStore());

    const babyId = 'baby-123';
    const tempData = {
      babyId,
      weight: 7.0,
      height: 67.0,
      measuredAt: new Date(),
      note: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    let tempId: string;

    act(() => {
      tempId = result.current.addMeasurementOptimistic(babyId, tempData);
    });

    expect(result.current.getLatestMeasurement(babyId)?.weight).toBe(7.0);

    act(() => {
      result.current.rollbackMeasurement(tempId!);
    });

    expect(result.current.getLatestMeasurement(babyId)).toBeNull();
  });
});
```

### 9.2 통합 테스트 (컴포넌트 + Store)

**예시: ActivityForm 통합 테스트**

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActivityForm } from '@/features/activities/components/ActivityForm';
import { useMeasurementStore } from '@/stores/useMeasurementStore';

describe('ActivityForm - 체중 즉시 반영 테스트', () => {
  test('체중 입력 후 수유 가이드 즉시 반영', async () => {
    const babyId = 'baby-123';

    // 1. 초기 체중 설정
    useMeasurementStore.getState().addMeasurement(babyId, {
      id: 'measure-1',
      babyId,
      weight: 5.0,
      height: 65.0,
      measuredAt: new Date(),
      note: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    render(<ActivityForm babyId={babyId} />);

    // 2. 수유 선택
    const feedingButton = screen.getByText('수유');
    await userEvent.click(feedingButton);

    // 3. 5.0kg 기준 가이드 확인
    expect(screen.getByText(/5.0kg 기준/)).toBeInTheDocument();

    // 4. 체중 변경 (다른 창에서)
    useMeasurementStore.getState().addMeasurement(babyId, {
      id: 'measure-2',
      babyId,
      weight: 6.0,
      height: 66.0,
      measuredAt: new Date(),
      note: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 5. 즉시 6.0kg 기준 가이드로 변경 확인
    await waitFor(() => {
      expect(screen.getByText(/6.0kg 기준/)).toBeInTheDocument();
    }, { timeout: 200 }); // 0.2초 이내
  });
});
```

### 9.3 E2E 테스트 (Playwright)

**시나리오: 체중 입력 → 수유 기록 전체 플로우**

```typescript
import { test, expect } from '@playwright/test';

test('체중 입력 후 수유 가이드 즉시 반영 E2E', async ({ page }) => {
  // 1. 로그인
  await page.goto('/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');

  // 2. 아기 페이지로 이동
  await expect(page).toHaveURL(/\/babies\/.+/);

  // 3. 측정 기록
  await page.click('button:has-text("측정 기록")');
  await page.fill('input[name="weight"]', '5.5');
  await page.fill('input[name="height"]', '65.5');
  await page.click('button:has-text("저장")');

  // 4. 활동 기록으로 이동
  await page.click('button:has-text("활동 기록")');
  await page.click('button:has-text("수유")');

  // 5. 가이드 확인 (즉시 반영)
  await expect(page.locator('text=/5.5kg 기준/')).toBeVisible({ timeout: 1000 });

  // 6. 새로고침 후에도 유지
  await page.reload();
  await page.click('button:has-text("활동 기록")');
  await page.click('button:has-text("수유")');
  await expect(page.locator('text=/5.5kg 기준/')).toBeVisible();
});
```

### 9.4 성능 테스트

**React DevTools Profiler 사용:**

```typescript
import { Profiler } from 'react';

function App() {
  return (
    <Profiler
      id="ActivityForm"
      onRender={(id, phase, actualDuration) => {
        console.log(`${id} (${phase}) took ${actualDuration}ms`);
      }}
    >
      <ActivityForm babyId={babyId} />
    </Profiler>
  );
}
```

**측정 지표:**
- 체중 업데이트 후 ActivityForm 리렌더링 시간
- 목표: 100ms 이하

---

## 10. 위험 관리

### 10.1 위험 식별 및 대응

| 위험 | 확률 | 영향도 | 대응 방안 | 담당자 |
|-----|------|--------|----------|--------|
| **초기 로딩 지연** | 낮음 | 중간 | - 스켈레톤 UI 표시<br>- 병렬 데이터 로드 (Promise.all)<br>- 필수 데이터만 초기 로드 | Agent 7 |
| **메모리 누수** | 낮음 | 높음 | - Zustand는 자동 구독 해제<br>- useEffect cleanup 철저히<br>- 메모리 프로파일링 | Agent 7 |
| **데이터 불일치** | 중간 | 높음 | - 낙관적 업데이트 롤백 로직<br>- 서버 응답 검증<br>- 에러 핸들링 강화 | All Agents |
| **번들 크기 증가** | 낮음 | 낮음 | - Zustand는 1.2KB<br>- Tree-shaking 지원<br>- 프로덕션 빌드 확인 | Agent 1 |
| **기존 코드 호환성** | 중간 | 중간 | - 점진적 마이그레이션<br>- V1/V2 API 병렬 운영<br>- 충분한 테스트 | All Agents |
| **팀원 학습 곡선** | 중간 | 낮음 | - 문서화<br>- 코드 리뷰<br>- 예제 코드 제공 | Agent 7 |
| **디버깅 어려움** | 낮음 | 중간 | - Redux DevTools<br>- Logger middleware<br>- 명확한 에러 메시지 | Agent 1 |

### 10.2 롤백 계획

**Phase 2 실패 시 (체중 문제 해결 안됨):**
```
1. useMeasurementStore 제거
2. 기존 router.refresh() 유지
3. 다른 접근 방법 검토 (React Query 등)
```

**전체 마이그레이션 중단 시:**
```
1. 완료된 Phase만 배포
2. 나머지는 기존 방식 유지
3. Store 코드는 남겨두고 사용 안함 (향후 재시도 대비)
```

### 10.3 모니터링

**개발 환경:**
- Redux DevTools로 상태 추적
- Console.log로 성능 측정
- React DevTools Profiler

**프로덕션:**
- Sentry 에러 추적
- 사용자 피드백 수집
- 성능 메트릭 (Web Vitals)

---

## 11. 성공 지표

### 11.1 정량적 지표

| 지표 | 현재 | 목표 | 측정 방법 |
|-----|------|------|----------|
| 체중 입력 → 가이드 반영 시간 | 3초+ (새로고침) | 0.1초 이하 | E2E 테스트 |
| 활동 추가 → 타임라인 업데이트 | 1-2초 | 즉시 (0초) | E2E 테스트 |
| 중복 API 호출 | N번 | 1번 (캐시) | Network 탭 |
| 불필요한 리렌더링 | 기준 | 50% 감소 | React Profiler |
| 번들 크기 증가 | - | +10KB 이하 | next build |
| 테스트 커버리지 | - | 80% 이상 | Jest |

### 11.2 정성적 지표

- [ ] 사용자 피드백: "반응이 빨라졌어요"
- [ ] 개발자 만족도: "코드가 간결해졌어요"
- [ ] 버그 감소: 상태 관련 버그 50% 감소
- [ ] 디버깅 시간: 문제 원인 파악 시간 단축

---

## 12. 참고 자료

### 12.1 공식 문서

- [Zustand 공식 문서](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Next.js App Router 문서](https://nextjs.org/docs/app)
- [React 19 문서](https://react.dev/)
- [Prisma 문서](https://www.prisma.io/docs)

### 12.2 패턴 및 베스트 프랙티스

- [Zustand Best Practices](https://docs.pmnd.rs/zustand/guides/best-practices)
- [Optimistic Updates Pattern](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)
- [React Performance Optimization](https://react.dev/reference/react/useMemo)

### 12.3 유사 프로젝트 사례

- [Vercel Commerce (Zustand 사용)](https://github.com/vercel/commerce)
- [Next.js Examples](https://github.com/vercel/next.js/tree/canary/examples)

### 12.4 내부 문서

- `prisma/schema.prisma` - 데이터 모델
- `PLAN_FOR_GEMINI_3_0.md` - AI 채팅 계획
- `doc/REFACTORING_PLAN.md` - 리팩토링 계획

---

## 부록: 코드 템플릿

### A. Store 템플릿

```typescript
// src/stores/useExampleStore.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface ExampleState {
  // 상태
  data: Record<string, any>;
  isLoading: boolean;
  error: string | null;

  // Actions
  setData: (key: string, value: any) => void;
  clearData: () => void;

  // Computed
  getData: (key: string) => any;
}

export const useExampleStore = create<ExampleState>()(
  devtools(
    (set, get) => ({
      // 초기 상태
      data: {},
      isLoading: false,
      error: null,

      // Actions 구현
      setData: (key, value) => set(state => ({
        data: { ...state.data, [key]: value }
      })),

      clearData: () => set({ data: {} }),

      // Computed 구현
      getData: (key) => get().data[key],
    }),
    { name: 'ExampleStore' }
  )
);
```

### B. 낙관적 업데이트 템플릿

```typescript
async function optimisticMutation(data: any) {
  const store = useStore.getState();

  // 1. 낙관적 업데이트
  const tempId = `temp-${Date.now()}`;
  store.addItemOptimistic(tempId, data);

  try {
    // 2. 서버 동기화
    const result = await serverAction(data);

    if (result.success) {
      // 3. 성공: 실제 데이터로 교체
      store.replaceItem(tempId, result.data);
    } else {
      // 실패: 롤백
      store.rollbackItem(tempId);
      useAppStore.getState().setGlobalError(result.error);
    }
  } catch (error) {
    // 에러: 롤백
    store.rollbackItem(tempId);
    useAppStore.getState().setGlobalError('네트워크 오류');
  }
}
```

### C. 선택적 구독 템플릿

```typescript
// ❌ 나쁜 예
const store = useStore();

// ✅ 좋은 예: 값만
const value = useStore(state => state.value);

// ✅ 좋은 예: 배열/객체 (useShallow)
import { useShallow } from 'zustand/react/shallow';

const [value1, value2] = useStore(
  useShallow(state => [state.value1, state.value2])
);

// ✅ 좋은 예: 함수
const setValue = useStore(state => state.setValue);
```

---

## 문서 히스토리

| 버전 | 날짜 | 작성자 | 변경 내용 |
|-----|------|--------|----------|
| 1.0 | 2025-12-02 | Dev Team | 최초 작성 |

---

**문서 승인:**
- [ ] 기획자
- [ ] 개발자
- [ ] QA

**구현 시작 승인 대기 중...**
