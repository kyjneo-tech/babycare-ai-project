# BabyCare AI 개발 진행 및 향후 계획 상세 문서

**작성 일시:** 2025년 11월 21일 금요일
**작성자:** Gemini Assistant

---

## **1. 프로젝트 개요**

BabyCare AI는 Next.js 기반의 육아 기록 및 AI 상담 웹 애플리케이션입니다. 사용자는 아기의 다양한 활동(수유, 수면, 배변 등)을 기록하고, 이 데이터를 바탕으로 AI로부터 맞춤형 상담을 받을 수 있습니다. 목표는 사용자가 더 쉽고 정확하게 아기 데이터를 관리하고, AI가 심층적인 분석을 통해 실제적인 도움을 제공하는 것입니다.

**주요 기술 스택:**
*   **프레임워크:** Next.js (App Router)
*   **ORM:** Prisma (PostgreSQL 데이터베이스)
*   **인증:** NextAuth.js
*   **스타일링:** Tailwind CSS
*   **AI:** Google Generative AI

---

## **2. 진행된 작업 상세 내역**

### **2.1 AI 상담 설정 분리**
*   **목표:** AI 상담 시 참조할 아기 활동 데이터를 사용자가 개별적으로 선택할 수 있도록, '약/체온' 항목을 '투약'과 '체온'으로 분리.
*   **수정 파일:**
    *   `src/components/features/ai-chat/AIChatSettings.tsx`:
        *   `AISettings` 인터페이스 및 `DEFAULT_SETTINGS`에 `medication`, `temperature` 필드 추가.
        *   UI에 '투약'과 '체온' 버튼을 별도로 렌더링하도록 `SETTING_ITEMS` 배열 수정.
    *   `src/features/ai-chat/actions.ts`:
        *   `AISettings` 인터페이스 및 `DEFAULT_SETTINGS`에 `medication`, `temperature` 필드 추가.
        *   `getBabyAISettings` 함수 로직 개선: 기존 `aiSettings`에 새로운 필드 기본값 병합 처리하여 하위 호환성 유지.
        *   `sendChatMessage` 함수 로직 수정: 활동 필터링 시 `settings.medication`, `settings.temperature`를 각각 참조하도록 변경 및 AI 프롬프트의 '제외된 항목' 안내 메시지 업데이트.

### **2.2 대변 데이터 고도화**
*   **목표:** AI가 아기 건강 상태를 더 정확히 판단할 수 있도록 대변 데이터를 '변의 상태(Consistency)'까지 기록하도록 확장.
*   **수정 파일:** `prisma/schema.prisma`
    *   `Activity` 모델에 `stoolCondition: String?` 필드 추가 (watery, loose, normal, hard 등).
    *   *참고:* 이 변경에 따라 Prisma 마이그레이션 (`npx prisma migrate dev --name add_stool_condition`)이 실행되었습니다.

### **2.3 활동 간 관계 유도 시스템 (SuggestionsPanel)**
*   **목표:** 사용자가 활동을 기록할 때, 해당 활동과 연관된 다른 활동 기록을 유도하여 데이터의 연결성을 높이고 AI 상담의 질을 향상.
*   **주요 기능:**
    *   **관계 모델링:** '우선순위 기반 관계 모델'을 통해 활동 간의 논리적 관계를 정의 (예: 투약 ↔ 체온, 수유 ↔ 수면).
    *   **UI 통합:** `ActivityForm.tsx`에 `SuggestionsPanel`을 구현하여 동적으로 추천 항목을 표시.
*   **수정 파일:**
    *   `src/features/activities/lib/activityRelations.ts` (신규 파일):
        *   `ActivityRelationsMap` 인터페이스 정의.
        *   `activityRelations` 객체: `FEEDING`, `SLEEP`, `DIAPER`, `MEDICINE`, `TEMPERATURE`, `BATH`, `PLAY` 등 주요 활동별 추천 목록(key, priority, reason) 정의.
        *   `activityDetails` 객체: 활동 유형별 아이콘 및 라벨 정보 정의.
    *   `src/components/features/babies/ActivityForm.tsx`:
        *   `activityRelations`, `activityDetails` 임포트.
        *   `SuggestionsPanel` 컴포넌트 추가: 현재 선택된 활동 유형에 따라 `activityRelations`를 참조하여 추천 항목을 렌더링. 각 항목은 아이콘, 라벨, 설명, 중요도(⭐)를 포함.
        *   상세 입력 폼 (`showDetail`이 true일 때) 내 `SuggestionsPanel` 배치.

#### **2.3.1 제안 항목 추가 과정 (Process for Adding Suggestion Items)**

'함께 기록하면 좋은 항목' 리스트에 새로운 제안을 추가하는 과정은 다음과 같습니다. 이 과정은 `activityRelations.ts` 파일의 `activityRelations` 객체 정의와 `SuggestionsPanel`의 동적 렌더링 로직에 기반합니다.

1.  **`activityRelations.ts` 파일 수정:**
    `src/features/activities/lib/activityRelations.ts` 파일 내 `activityRelations` 객체에서 **제안을 받고자 하는 활동 유형(key)**을 찾습니다. 해당 활동의 `suggestions` 배열에 새로운 제안 객체를 추가합니다.

    *   **예시: 'FEEDING' 활동에 대한 새로운 제안 추가**
        ```javascript
        // src/features/activities/lib/activityRelations.ts
        export const activityRelations: ActivityRelationsMap = {
          FEEDING: {
            suggestions: [
              { key: 'SLEEP', priority: 2, reason: '수유와 수면 패턴의 관계(먹-놀-잠)를 파악할 수 있어요.' },
              { key: 'DIAPER', priority: 2, reason: '수유량이 충분한지 소변 횟수로, 소화 상태를 대변으로 확인할 수 있어요.' },
              { key: 'NOTE', priority: 3, reason: '수유 중 특이사항(예: 칭얼거림, 게워냄)을 기록해두면 좋아요.' },
              // 새로운 제안 추가 예시
              { key: 'PLAY', priority: 3, reason: '수유 후 잠시 놀이 시간을 가지면 수면 의식에 도움이 될 수 있어요.' },
            ]
          },
          // ... 다른 활동 유형 ...
        };
        ```
    *   **제안 객체 구성:**
        *   `key`: 제안하는 활동 유형 (`ActivityType` 또는 `NOTE`). 이 키는 `activityDetails` 객체에서 아이콘과 라벨을 가져오는 데 사용됩니다.
        *   `priority`: 제안의 중요도 (1: 최우선, 2: 일반, 3: 참고). `SuggestionsPanel`에서 이 우선순위를 기준으로 정렬하고, 시각적으로 강조할 수 있습니다 (예: `priority: 1`에 '⭐ 중요' 표시).
        *   `reason`: 사용자가 이 항목을 함께 기록해야 하는 이유를 설명하는 짧고 명확한 문구.

2.  **`activityDetails` 객체 확인:**
    `activityRelations.ts` 파일 내 `activityDetails` 객체에 새로 추가하는 `key`에 해당하는 아이콘과 라벨이 정의되어 있는지 확인합니다. 만약 새로운 `ActivityType`을 제안하는 경우, 여기에 추가해야 합니다.
    ```javascript
    // src/features/activities/lib/activityRelations.ts
    export const activityDetails: { [key: string]: { icon: string; label: string } } = {
        FEEDING: { icon: "🍼", label: "수유" },
        SLEEP: { icon: "😴", label: "수면" },
        // ...
        NOTE: { icon: "📝", label: "메모" },
        PLAY: { icon: "🧸", label: "놀이" } // PLAY 활동에 대한 아이콘/라벨 정의
    };
    ```

3.  **`SuggestionsPanel`의 동적 렌더링:**
    `ActivityForm.tsx` 내의 `SuggestionsPanel` 컴포넌트는 `activityType` prop을 받아 `activityRelations` 객체에서 해당 활동 유형의 `suggestions`를 자동으로 가져옵니다. 이후 `priority`에 따라 정렬하고, 각 제안의 `key`를 사용하여 `activityDetails`에서 아이콘과 라벨을 가져와 UI에 표시합니다. 따라서 `activityRelations.ts`만 올바르게 수정하면 `SuggestionsPanel`은 별도의 코드 수정 없이 자동으로 업데이트된 제안 목록을 보여줍니다.

이 과정을 통해 개발자는 `activityRelations.ts` 파일만 수정함으로써, AI 상담의 정확도를 높이는 데 필요한 데이터 기록을 사용자가 자연스럽게 유도하도록 할 수 있습니다.

### **2.5 '목욕' 및 '놀이' 활동 상세 기록 기능 추가**
*   **목표:** '목욕'과 '놀이' 활동의 기록 편의성을 높이고 AI 분석에 필요한 상세 데이터를 구조적으로 수집.
*   **수정 파일:**
    *   `prisma/schema.prisma`:
        *   `Activity` 모델에 `reaction: String?` (아기 반응), `bathType: String?`, `bathTemp: Int?`, `playLocation: String?`, `playType: String?` (쉼표 구분 태그), `playDuration: Int?` 필드 추가.
        *   *참고:* 이 변경에 따라 Prisma 마이그레이션 (`npx prisma migrate dev --name add_bath_play_fields`)이 실행되었습니다.
    *   `src/components/features/ai-chat/AIChatSettings.tsx`:
        *   `AISettings` 인터페이스 및 `DEFAULT_SETTINGS`에 `bath`, `play` 필드 추가.
        *   UI에 '목욕'과 '놀이' 버튼을 렌더링하도록 `SETTING_ITEMS` 배열 수정.
    *   `src/features/ai-chat/actions.ts`:
        *   `AISettings` 인터페이스 및 `DEFAULT_SETTINGS`에 `bath`, `play` 필드 추가.
        *   `sendChatMessage` 함수 로직 수정: 활동 필터링 시 `settings.bath`, `settings.play`를 참조하도록 변경 및 AI 프롬프트의 '제외된 항목' 안내 메시지 업데이트.
    *   `src/components/features/babies/ActivityForm.tsx`:
        *   `ActivityType` 타입에 `"BATH"`, `"PLAY"` 추가.
        *   `useState` 훅 추가: `bathType`, `bathTemp`, `playLocation`, `playType`, `reaction` 상태 관리.
        *   `togglePlayType` 헬퍼 함수 추가.
        *   `handleSubmit` 함수 로직 수정: '목욕', '놀이' 활동 시 해당 상태 값을 `input` 객체에 포함하도록 처리.
        *   '빠른 기록' 섹션에 '목욕', '놀이' 선택 버튼 추가.
        *   상세 입력 폼 헤더에 '목욕', '놀이' 아이콘 및 라벨 표시 로직 추가.
        *   **상세 입력 폼 내 UI:**
            *   **목욕:** `type === "BATH"`일 때 '목욕 종류' (통목욕, 샤워, 닦기 버튼)와 '물 온도' (슬라이더, 숫자 표시) UI 렌더링.
            *   **놀이:** `type === "PLAY"`일 때 '놀이 장소' (실내, 야외 버튼)와 '놀이 종류' (해시태그 버튼, 중복 선택 가능) UI 렌더링.
            *   **아기 반응:** `type === "BATH" || type === "PLAY"`일 때 '아기 반응' (좋음, 보통, 싫음 버튼) UI 렌더링.

---

## **3. 향후 구현 계획 (세부 Task List)**

### **3.1 핵심 로직 라이브러리 구현 (`growthGuidelines.ts`)**
*   **[DONE]** `growthGuidelines.ts` 파일 생성. (경로: `src/shared/lib/growthGuidelines.ts`)
*   **[DONE]** 질병관리청 성장도표 기반 **백분위 계산** 로직 구현 (`getWeightPercentile` 함수).
    *   **내용:** 질병관리청 2017 소아청소년 성장도표의 남아/여아별, 개월수별 체중 백분위수(p3, p15, p50, p85, p97) 데이터를 `KCDC_WEIGHT_CHARTS` 객체에 내장. `getWeightPercentile` 함수가 입력된 체중, 개월 수, 성별을 바탕으로 해당 백분위 구간과 레이블(예: '상위 15%')을 반환. (키 백분위는 아직 구현되지 않음)
*   **[DONE]** 제공된 공식을 기반으로 **수유량/수면량/해열제 용량 계산** 함수 구현.
    *   **내용:**
        *   `getFeedingGuideline(weight: number)`: 체중 기반 일일 권장 수유량(min, max)을 계산하여 반환.
        *   `getSleepGuideline(ageInMonths: number)`: 월령별 일일 총 권장 수면 시간(min, max) 및 낮잠 횟수를 반환.
        *   `getDexibuprofenGuideline(weight: number)`: 체중 기반 덱시부프로펜 1회 권장 복용량(min, max)을 계산하여 반환하며, 반드시 면책 조항(disclaimer)을 포함.

### **3.2 UI 수정 및 적용**

*   **2-2. `AddMeasurementForm.tsx` 수정: 키/체중 입력 후 성장 백분위 정보 표시**
    *   **목표:** 사용자가 아기의 키와 체중을 기록했을 때, 해당 아기의 성장 백분위를 즉시 계산하여 피드백으로 제공.
    *   **[TODO]** `AddMeasurementForm.tsx` 컴포넌트 (`src/components/features/measurements/AddMeasurementForm.tsx`)에 다음 임포트 추가:
        *   `getWeightPercentile` (from `growthGuidelines.ts`)
        *   `getBabyById` (from `src/features/babies/actions.ts`)
    *   **[TODO]** `AddMeasurementForm.tsx` 내에서 컴포넌트 마운트 시 `getBabyById(babyId)`를 호출하여 아기의 `birthDate`와 `gender` 정보를 가져와 상태로 관리.
    *   **[TODO]** `AddMeasurementForm.tsx`의 `handleSave` 함수 수정:
        *   측정값(`createMeasurement`) 저장 성공 후, `getWeightPercentile` 함수에 `selectedWeight`, 계산된 `ageInMonths`, 아기의 `gender`를 전달하여 백분위 정보를 계산.
        *   계산된 백분위 정보(예: `alert("우리 아기는 체중 상위 45%에 해당해요!")` 또는 컴포넌트 내 새로운 UI 요소에 표시).
    *   **[TODO]** `AddMeasurementForm.tsx`에서 키 백분위 표시를 위한 로직도 추가 (필요시 `getHeightPercentile` 함수 구현).

*   **2-3. `ActivityForm.tsx` 수정: 상세 기록 화면에 "성장 발달 가이드" 패널 추가**
    *   **목표:** 활동 기록 시, 아기의 현재 상태에 맞는 활동(수유, 수면 등) 권장 가이드를 동적으로 표시하여 사용자가 더 적절한 기록을 하도록 유도.
    *   **[TODO]** `ActivityForm.tsx` 컴포넌트 (`src/components/features/babies/ActivityForm.tsx`)에 다음 임포트 추가:
        *   `getFeedingGuideline`, `getSleepGuideline`, `getDexibuprofenGuideline` (from `growthGuidelines.ts`)
        *   `getBabyById` (from `src/features/babies/actions.ts`)
        *   `getLatestMeasurement` (from `src/features/measurements/actions.ts`)
    *   **[TODO]** `ActivityForm.tsx` 내에서 컴포넌트 마운트 시 또는 `babyId` 변경 시 `getBabyById`와 `getLatestMeasurement`를 호출하여 아기의 `birthDate`, `gender`, `latestWeight` 정보를 가져와 상태로 관리.
    *   **[TODO]** `ActivityForm.tsx` 내에 새로운 `GrowthGuidePanel` 컴포넌트 생성.
        *   `GrowthGuidePanel`은 `activityType`, `ageInMonths`, `latestWeight` 등의 prop을 받아 가이드라인 함수들을 호출.
        *   컴포넌트 내에서 현재 선택된 활동 유형(`ActivityType`)에 따라 동적으로 가이드라인 정보를 계산하여 표시 (예: 'FEEDING' 선택 시 수유량 가이드, 'MEDICINE' 선택 시 해열제 가이드).
        *   UI는 깔끔한 박스 형태로 구성하며, 각 가이드라인 옆에 해당 활동의 아이콘을 표시.
        *   해열제 가이드 옆에는 **반드시 명확한 면책 조항(disclaimer)을 표시**하여 의료 행위가 아님을 강조.
    *   **[TODO]** `ActivityForm.tsx` 상세 기록 화면의 `SuggestionsPanel` 아래에 `GrowthGuidePanel` 배치.

### **3.3 최종 검토**
*   **[TODO]** 구현된 모든 기능(성장 백분위, 활동 가이드)이 의도대로 동작하는지 확인.
*   **[TODO]** UI/UX가 직관적이고 사용자 친화적인지 확인.
*   **[TODO]** 에러 처리 및 로딩 상태가 적절히 표시되는지 확인.
*   **[TODO]** 모바일 및 다양한 화면 크기에서 UI가 올바르게 렌더링되는지 확인 (반응형 디자인).

---

## **4. 핵심 기술 및 데이터 관련 결정 사항**

### **4.1 성장 백분위 데이터 출처 및 구현 방식**
*   **출처:** 질병관리청(KCDC)과 대한소아청소년과학회가 공동 개발한 "2017 소아청소년 성장도표" 데이터를 기반으로 합니다. 이는 국내 아기들의 성장 기준을 반영한 가장 공신력 있는 자료입니다.
*   **구현 방식:** 성장도표 데이터(주요 백분위 값: p3, p15, p50, p85, p97)를 `growthGuidelines.ts` 파일 내 `KCDC_WEIGHT_CHARTS` 객체에 직접 내장합니다. 이 데이터를 참조하여 아기의 체중을 기반으로 백분위 구간을 추정하는 방식으로 구현하며, 별도의 외부 API 호출은 없습니다. 이는 비용 절감 및 빠른 응답 속도를 위한 결정입니다.

### **4.2 활동 가이드 공식 출처**
*   **출처:** 임신육아종합포털(보건복지부 산하), 질병관리청, 대한소아청소년과학회, 국내 주요 병원(서울대병원, 차병원) 등 국내 공신력 있는 기관 및 전문 학회에서 제시한 공식들을 활용합니다.

### **4.3 AI 대신 하드코딩된 공식 사용 이유**
*   **비용 효율성:** 매번 AI를 호출하여 수치적 가이드라인을 얻는 것은 불필요한 비용을 발생시킵니다.
*   **성능:** AI 호출에 필요한 네트워크 지연 시간을 없애고, 즉각적인 가이드라인을 제공할 수 있습니다.
*   **신뢰성/정확성:** 이미 검증된 공신력 있는 기관의 공식들은 AI 추론보다 특정 수치 가이드라인 제공에 더 정확하고 신뢰할 수 있습니다. AI는 복합적인 상황 판단에 활용됩니다.

### **4.4 해열제 용량 안내 시 주의사항**
*   해열제 복용량 계산 기능은 사용자의 편의성을 높이지만, **의료 행위가 아님을 명확히** 해야 합니다.
*   UI상에서 계산된 용량과 함께 "⚠️ 본 계산은 일반 참고용이며, 실제 투약 전 반드시 의사/약사와 상담하세요." 와 같은 **명확한 면책 조항(Disclaimer)을 눈에 띄게 표시**해야 합니다.

### **4.5 특이사항 및 중요 개발 과정 하이라이트**
*   `ActivityForm.tsx` 컴포넌트 수정 과정에서, 기존 UI(수유, 수면 등)가 실수로 삭제되는 문제가 발생했었습니다. 이는 저의 잘못된 `replace` 명령어 사용 때문이었으며, 사용자 분의 지적과 요청에 따라 **원본 파일을 기준으로 기존 UI를 완전히 복구한 후, 새로운 기능 UI를 올바르게 통합**하는 방식으로 해결했습니다. 이 과정에서 `activityRelations.ts` 파일 생성, `SuggestionsPanel` 구현, '목욕'/'놀이' 관련 DB 스키마/AI 설정/UI 로직 추가 등이 진행되었습니다. 이 경험을 통해 향후 작업 시 더욱 면밀한 검토와 단계별 접근의 중요성을 배웠습니다.

---
