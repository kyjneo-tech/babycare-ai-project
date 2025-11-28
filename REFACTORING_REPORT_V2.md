# 📊 종합 코드 품질 및 리팩토링 보고서 v2.0

> **프로젝트:** babycare-ai
> **분석 일시:** 2025년 11월 28일
> **분석 범위:** 전체 225개 소스 파일
> **현재 테스트 커버리지:** 8% (18/225)
> **목표 테스트 커버리지:** 70%

---

## 📋 실행 계획 체크리스트

### Phase 1: 즉시 실행 (1-2일)
- [ ] 리팩토링 보고서 문서 생성
- [ ] Dead Code 삭제
  - [ ] `src/features/babies/components/BabySwitcher.tsx` 삭제
  - [ ] import 경로 확인 (사용 중인 곳 없음 확인됨)
- [ ] ButtonGroup 통합
  - [ ] `features/activities/components/ui/ButtonGroup.tsx` 삭제
  - [ ] 모든 import를 `@/components/common/ButtonGroup`으로 변경
- [ ] 위젯 폴더 재배치
  - [ ] `widgets/family-todo` → `features/notes/components`
  - [ ] `widgets/upcoming-schedules` → `features/schedules/components`
- [ ] Git 커밋

### Phase 2: 단기 목표 (1-2주)
- [ ] AddMeasurementForm.tsx 리팩토링
  - [ ] `useMeasurementForm` 훅 분리
  - [ ] `ScrollablePicker` 컴포넌트 추출
  - [ ] `MeasurementAnalysis` 컴포넌트 분리
- [ ] 테스트 파일 생성
  - [ ] `inviteFamilyService.test.ts`
  - [ ] `scheduleGeneratorService.test.ts`
  - [ ] `ActivityForm.test.tsx`
- [ ] 테스트 커버리지 25% 달성

### Phase 3: 중기 목표 (1개월)
- [ ] 300줄 이상 컴포넌트 리팩토링 (7개)
- [ ] 테스트 커버리지 50% 달성
- [ ] CI/CD 테스트 자동화

### Phase 4: 장기 목표 (2-3개월)
- [ ] Storybook 도입
- [ ] 테스트 커버리지 70% 달성
- [ ] Chromatic 시각적 회귀 테스트

---

## 1. 📂 Structure Reorganization (구조 개편)

### ✅ 현재 상태
- Feature-Sliced Architecture 잘 적용됨
- 대부분 컴포넌트가 `src/features/[feature-name]/components`로 중앙화됨

### ⚠️ 개선 필요 사항

#### 1.1 위젯 폴더 재배치

**현재 구조:**
```
src/widgets/
├── app-header/          ✅ 유지 (전역 위젯)
├── family-todo/         ❌ 재배치 필요
├── upcoming-schedules/  ❌ 재배치 필요
└── activity-feed/       ❌ 재배치 필요
```

**재배치 계획:**
```
src/widgets/family-todo/FamilyTodoWidget.tsx
→ src/features/notes/components/FamilyTodoWidget.tsx

src/widgets/upcoming-schedules/UpcomingSchedulesWidget.tsx
→ src/features/schedules/components/UpcomingSchedulesWidget.tsx

src/widgets/activity-feed/
→ src/features/activities/components/ActivityFeedWidget.tsx
```

**이유:**
- 응집도 향상 (관련 기능이 한 곳에 모임)
- 의존성 명확화
- 유지보수성 개선

---

## 2. 🚨 Critical Issues & Code Diet

### 🗑️ Dead Code (삭제 대상)

#### 2.1 완전 중복 파일

**BabySwitcher 중복:**
```bash
# ❌ 삭제 대상
src/features/babies/components/BabySwitcher.tsx

# ✅ 유지 (실제 사용 중)
src/components/common/BabySwitcher.tsx
```
- 두 파일이 100% 동일
- `src/widgets/app-header/AppHeader.tsx`에서 common 버전만 사용 중
- features 버전은 Dead Code

#### 2.2 ButtonGroup 이중 구현

**문제점:**
- `src/features/activities/components/ui/ButtonGroup.tsx` (커스텀 구현)
- `src/components/common/ButtonGroup.tsx` (Shadcn ToggleGroup 사용)

**해결:**
- common 버전 (Shadcn 기반)을 표준으로 채택
- features 버전 삭제
- 모든 import 경로 변경

#### 2.3 중복 가능성이 있는 파일

```bash
# 사용 현황 조사 필요
src/features/activities/components/ui/QuickSelectButtons.tsx
src/components/common/QuickSelectButtons.tsx
```

#### 2.4 Deprecated 스크립트

```bash
scripts/deprecated/delete-milestones.ts
scripts/deprecated/capture-login.js
→ Git history로 충분, 물리적 삭제 권장
```

---

## 3. 🧩 Shadcn/UI Migration

### ✅ 현재 상태
- 대부분의 UI 컴포넌트가 Shadcn/UI 기반
- Dialog, Button, Card, Input, Select, Tabs 등 모두 적용됨

### ⚠️ ButtonGroup 통합 필요

**현재 (커스텀):**
```tsx
// ❌ src/features/activities/components/ui/ButtonGroup.tsx
<Button
  variant={value === option.value ? "default" : "outline"}
  className="bg-blue-500 text-white"  // 하드코딩
>
  {option.label}
</Button>
```

**권장 (Shadcn):**
```tsx
// ✅ src/components/common/ButtonGroup.tsx
<ToggleGroup type="single" value={value} onValueChange={onChange}>
  <ToggleGroupItem value={option.value}>
    {option.label}
  </ToggleGroupItem>
</ToggleGroup>
```

**이점:**
- 테마 시스템 통합
- 접근성 (Radix UI)
- 일관된 스타일링
- 유지보수 부담 감소

### ✅ 유지 적합한 커스텀 컴포넌트

1. **BottomSheet** - Shadcn에 없음, 모바일 최적화
2. **Timeline** - 프로젝트 특화 컴포넌트
3. **FABMenu** - 모바일 네비게이션 필수
4. **FloatingActionButton** - 간단한 유틸리티

---

## 4. 🛠️ SOLID & Tidy Refactoring

### 🚩 SRP 위반: 비대한 컴포넌트

| 파일명 | 줄 수 | 문제점 | 우선순위 |
|--------|------|--------|----------|
| AddMeasurementForm.tsx | 505줄 | 폼 로직, 데이터 로딩, 스크롤, 백분위 계산 혼재 | 🔥 높음 |
| InteractiveScheduleTimeline.tsx | 391줄 | 데이터 처리, 필터링, UI 렌더링 혼재 | 🔥 높음 |
| EditActivityDialog.tsx | 387줄 | 모든 활동 타입의 편집 로직 포함 | 🟡 중간 |
| QuickRecordModal.tsx | 361줄 | 빠른 기록 UI + 검증 + 제출 로직 | 🟡 중간 |
| FamilyManagementPage.tsx | 312줄 | 가족 관리 전체 기능 포함 | 🟡 중간 |
| ActivityList.tsx | 310줄 | 무한 스크롤, 그룹핑, Realtime 구독 | 🟡 중간 |
| ActivityForm.tsx | 301줄 | 타입 선택, 폼, 제출 (이미 훅 사용 중 ✅) | 🟢 양호 |

### 📐 리팩토링 예시: AddMeasurementForm.tsx

**Before (505줄):**
```tsx
export function AddMeasurementForm() {
  // 상태 관리 (30줄)
  // 데이터 로딩 (50줄)
  // 스크롤 제어 (80줄)
  // 백분위 계산 (100줄)
  // UI 렌더링 (200줄)
}
```

**After:**
```tsx
// ✅ hooks/useMeasurementForm.ts
export function useMeasurementForm(babyId: string) {
  // 비즈니스 로직만
}

// ✅ components/ScrollablePicker.tsx
export function ScrollablePicker({ options, value, onChange }) {
  // 재사용 가능한 스크롤 컴포넌트
}

// ✅ components/MeasurementAnalysis.tsx
export function MeasurementAnalysis({ analysis }) {
  // 백분위, 가이드라인 표시
}

// ✅ AddMeasurementForm.tsx (~150줄)
export function AddMeasurementForm({ babyId, onSuccess }) {
  const formState = useMeasurementForm(babyId);
  return (
    <>
      <ScrollablePicker ... />
      <MeasurementAnalysis analysis={formState.analysis} />
    </>
  );
}
```

### 🧹 Tidy First: Guard Clause

**Before:**
```tsx
const handleSubmit = async () => {
  if (session) {
    if (babyId) {
      if (selectedWeight > 0) {
        // 실제 로직 (3단계 들여쓰기)
      }
    }
  }
};
```

**After:**
```tsx
const handleSubmit = async () => {
  if (!session) return;
  if (!babyId) return;
  if (selectedWeight <= 0) {
    alert("체중을 입력하세요");
    return;
  }

  // 실제 로직 (1단계 들여쓰기)
};
```

---

## 5. 🧪 Testing Roadmap

### 📊 현재 상태
```
테스트 파일: 18개
소스 파일: 225개
커버리지: 8%
목표: 70%
```

### 🎯 Phase 1: 핵심 비즈니스 로직 (25% 목표)

#### 우선순위 높음 🔥

**TC-001: 가족 초대 기능**
```typescript
// src/features/families/services/__tests__/inviteFamilyService.test.ts
describe('inviteFamilyService', () => {
  it('초대 코드 생성 시 7일 만료 기간 설정', async () => {
    const result = await generateInviteCode(familyId);
    const expiryDate = new Date(result.expiresAt);
    const today = new Date();
    const diff = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
    expect(diff).toBe(7);
  });

  it('만료된 초대 코드로 참여 시도 시 에러', async () => {
    // 만료된 코드 생성
    const expiredCode = await createExpiredInviteCode();

    // 참여 시도
    const result = await joinFamilyByCode(expiredCode, userId);

    expect(result.success).toBe(false);
    expect(result.error).toContain('만료');
  });

  it('이미 가족 구성원인 사용자 재초대 방지', async () => {
    // ...
  });
});
```

**TC-002: 일정 관리**
```typescript
// src/features/schedules/services/__tests__/scheduleGeneratorService.test.ts
describe('scheduleGeneratorService', () => {
  it('생후 1개월 아기의 BCG 예방접종 일정 생성', async () => {
    const baby = { birthDate: new Date('2024-10-28') };
    const schedules = await generateVaccinationSchedules(baby);

    const bcg = schedules.find(s => s.title.includes('BCG'));
    expect(bcg).toBeDefined();
    expect(bcg.dueDate).toEqual(new Date('2024-11-28'));
  });

  it('건강검진 일정 자동 생성', async () => {
    // ...
  });
});
```

**TC-003: AI 채팅**
```typescript
// src/features/ai-chat/services/__tests__/getSampleChatHistoryService.test.ts
describe('getSampleChatHistoryService', () => {
  it('아기 데이터 기반 프롬프트 생성', async () => {
    const baby = { name: '아기', birthDate: new Date('2024-01-01') };
    const prompt = await generateChatPrompt(baby);

    expect(prompt).toContain('아기');
    expect(prompt).toContain('개월');
  });
});
```

### 🎯 Phase 2: 컴포넌트 테스트 (50% 목표)

**TC-004: UI 컴포넌트**
```typescript
// src/features/activities/components/__tests__/ActivityForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';

describe('ActivityForm', () => {
  it('수유 타입 선택 시 수유 폼 섹션 표시', () => {
    render(<ActivityForm babyId="test-baby" />);

    fireEvent.click(screen.getByText('🍼 수유'));

    expect(screen.getByText('수유량')).toBeInTheDocument();
  });

  it('게스트 모드에서는 모든 입력 비활성화', () => {
    // Mock unauthenticated session
    render(<ActivityForm babyId="guest-baby-id" />);

    expect(screen.getByText('🍼 수유')).toBeDisabled();
  });
});
```

### 🎯 Phase 3: 통합 테스트 (70% 목표)

**TC-005: 활동 기록 → 통계 업데이트**
```typescript
// src/features/activities/__tests__/integration/recordActivity.test.ts
describe('활동 기록 통합 테스트', () => {
  it('활동 기록 후 일일 요약 업데이트', async () => {
    // 1. 활동 생성
    await createActivity({
      babyId: 'test-baby',
      type: 'FEEDING',
      amount: 120,
    });

    // 2. 일일 요약 조회
    const summary = await getDailySummary('test-baby', new Date());

    // 3. 검증
    expect(summary.feedingCount).toBe(1);
    expect(summary.totalFeedingAmount).toBe(120);
  });
});
```

---

## 6. 💡 Growth Master's Tip

### 🎯 "테스트 커버리지 70% 달성 로드맵"

**1단계: Quick Wins (1-2주, 25%)**
- 기존 테스트 패턴 재사용
- 서비스 레이어 우선 테스트
- Jest + @testing-library/react 활용

**2단계: 핵심 기능 보호 (2-3주, 50%)**
- 가장 자주 버그 발생하는 영역 집중
- 가족 초대, 활동 기록, 측정값 계산

**3단계: 지속 가능한 문화 (4주+, 70%)**
- 새 기능 개발 시 TDD
- CI/CD 테스트 자동화
- Codecov 통합

### 🏗️ "컴포넌트 분리의 황금 법칙"

> "한 파일이 300줄을 넘어가면, 그것은 하나의 책임이 아니다."

**리팩토링 우선순위:**
1. AddMeasurementForm.tsx (505줄) 🔥
2. InteractiveScheduleTimeline.tsx (391줄) 🔥
3. EditActivityDialog.tsx (387줄) 🔥

### 🚀 "다음 스텝: Storybook + Chromatic"

현재 `src/components/ui`에 37개의 Shadcn 컴포넌트 보유.

**Storybook 도입 시 이점:**
- 🎨 컴포넌트 카탈로그
- ⚡ 독립적 개발 환경
- 🧪 Chromatic 시각적 회귀 테스트

```bash
# Storybook 설치
npx storybook@latest init
```

---

## 📈 진행 상황 추적

### 완료된 작업 ✅
- [x] 프로젝트 전체 구조 분석
- [x] Dead Code 식별
- [x] 중복 코드 탐지
- [x] Shadcn/UI 마이그레이션 검토
- [x] SOLID 원칙 위반 분석
- [x] 테스트 커버리지 분석
- [x] 종합 리팩토링 보고서 작성

### 진행 중 🚧
- [ ] Dead Code 삭제
- [ ] ButtonGroup 통합
- [ ] 위젯 재배치
- [ ] 테스트 파일 생성

### 예정 📅
- [ ] 비대한 컴포넌트 리팩토링
- [ ] 테스트 커버리지 향상
- [ ] Storybook 도입

---

## 🎉 최종 평가

이 프로젝트는 **Feature-Sliced Architecture**와 **Shadcn/UI**를 기반으로 탄탄한 구조를 갖추고 있습니다.

**강점:**
- ✅ 명확한 폴더 구조
- ✅ Shadcn/UI 표준화
- ✅ Repository 패턴 적용
- ✅ 서버 액션 분리

**개선 영역:**
- 🔥 테스트 커버리지 8% → 70%
- 🔥 비대한 컴포넌트 분리 (300줄+)
- 🟡 Dead Code 제거
- 🟡 위젯 폴더 재정리

**다음 단계:**
1. Phase 1 즉시 실행 항목 완료 (1-2일)
2. 테스트 파일 작성 시작 (1-2주)
3. 비대한 컴포넌트 리팩토링 (1개월)
4. Storybook 도입 (장기)

---

**문서 버전:** v2.0
**최종 업데이트:** 2025-11-28
**다음 리뷰:** Phase 1 완료 후
