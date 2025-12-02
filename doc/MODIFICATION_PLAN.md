# 수정 계획서

## 📋 전체 수정 사항 요약

### 1. AI 상담 화면 개선
**현재 상태**: 수유, 수면, 배변, 키체중 등 버튼이 화면에 나열됨
**변경 사항**:
- 버튼들을 드롭다운 메뉴로 변경 (체크박스 방식)
- "기타 상담" 옵션 추가
- 확보한 공간만큼 대화창 높이 증가

**재사용 컴포넌트**:
- `@/components/ui/dropdown-menu`
- `@/components/ui/checkbox`

**수정 파일**:
- `src/components/features/ai-chat/AIChatView.tsx` (또는 관련 파일)

---

### 2. 성장 기록 UI 재구조화
**현재 상태**: 폼이 항상 표시되고 Collapsible로 접고 펼침
**변경 사항**:
- 레이아웃:
  ```
  성장 기록 (타이틀 텍스트)   [키&체중 버튼] [차트 보기 버튼]  
  ```
- **차트 보기 버튼**: 클릭 시 성장 곡선 차트 모달 표시
- **키&체중 버튼**: 클릭 시 입력 폼 모달 표시
- 입력 폼에 스크롤 입력 + 직접 입력 칸 병행

**재사용 컴포넌트**:
- `QuickRecordModal` 패턴 재사용
- 기존 `AddMeasurementForm`의 스크롤 입력 로직 유지
- `GrowthChart` 컴포넌트를 모달로 표시
- `@/components/ui/dialog`

**수정 파일**:
- `src/features/measurements/components/MeasurementCard.tsx` - 타이틀 + 두 개의 버튼으로 변경
- `src/features/measurements/components/AddMeasurementForm.tsx` - 직접 입력 칸 추가

---

### 3. 최근 활동 수정 기능 개선
**현재 상태**: 간단한 다이얼로그로 일부 필드만 수정 가능
**변경 사항**:
- 기존 ActivityForm 전체를 모달로 표시
- 모든 필드 수정 가능

**재사용 컴포넌트**:
- `src/features/activities/components/ActivityForm.tsx` (edit mode 추가)
- `@/components/ui/dialog`

**수정 파일**:
- `src/features/activities/components/ActivityForm.tsx` - edit mode prop 추가
- `src/features/activities/components/EditActivityDialog.tsx` - 전체 폼으로 대체
- `src/features/activities/components/ActivityCard.tsx` - 수정 버튼 동작 변경

---

### 4. 통계 화면 비율 조정 및 z-index 수정
**현재 상태**: 모바일에서 3일치만 보임, AI 버튼과 겹침
**변경 사항**:
- 컬럼 너비 축소하여 7일치 표시
- 하단 바 z-index를 더 높게 설정

**수정 파일**:
- `src/components/features/analytics/MobileOptimizedTimeline.tsx` - 컬럼 너비 조정
- `src/app/providers.tsx` - 하단 바 z-index 증가 (z-40 → z-50)

**계산**:
- 모바일 화면 약 375px 기준
- 시간 컬럼: 40px
- 7일 컬럼: (375 - 40) / 7 ≈ 48px per column
- 최소 너비를 48px로 설정

---

## 🔄 작업 순서

1. **통계 화면 비율 조정** (가장 간단, 즉시 효과)
   - MobileOptimizedTimeline.tsx 컬럼 너비 수정
   - providers.tsx z-index 수정

2. **성장 기록 UI 재구조화** (독립적 작업)
   - MeasurementQuickButton 생성
   - MeasurementCard 버튼 방식으로 변경
   - AddMeasurementForm에 직접 입력 칸 추가

3. **AI 상담 화면 개선** (독립적 작업)
   - AIChatView 파일 찾기
   - 버튼들을 드롭다운으로 변경
   - 대화창 높이 조정

4. **최근 활동 수정 기능 개선** (ActivityForm 재사용)
   - ActivityForm에 edit mode 추가
   - EditActivityDialog 교체

---

## 📁 예상 파일 변경 목록

### 수정될 파일
- ✏️ `src/components/features/analytics/MobileOptimizedTimeline.tsx`
- ✏️ `src/app/providers.tsx`
- ✏️ `src/features/measurements/components/MeasurementCard.tsx`
- ✏️ `src/features/measurements/components/AddMeasurementForm.tsx`
- ✏️ `src/components/features/ai-chat/AIChatView.tsx` (확인 필요)
- ✏️ `src/features/activities/components/ActivityForm.tsx`
- ✏️ `src/features/activities/components/EditActivityDialog.tsx`
- ✏️ `src/features/activities/components/ActivityCard.tsx`

### 새로 생성될 파일
- 🆕 `src/features/measurements/components/MeasurementQuickButton.tsx`

---

## ⚠️ 주의사항

1. **컴포넌트 재사용**: 기존 로직 최대한 활용
2. **일관성 유지**: 수유/수면 버튼과 동일한 UI/UX 패턴
3. **모바일 최적화**: 모든 변경사항은 모바일 우선
4. **빌드 검증**: 각 단계마다 빌드 성공 확인

---

## 🎯 기대 효과

1. **AI 상담 화면**: 더 넓은 대화 영역, 깔끔한 UI
2. **성장 기록**: 일관된 UX, 직접 입력 편의성 증가
3. **활동 수정**: 완전한 수정 기능 제공
4. **통계 화면**: 모바일에서 7일치 데이터 한눈에 확인
