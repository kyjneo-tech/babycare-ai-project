# 구현 계획 - 디자인 시스템 전면 개편 및 리팩토링

## 목표 설명
앱의 디자인을 "세련된 편안함(Sophisticated Comfort)" 미학(따뜻한 뉴트럴 톤 + 소프트 코랄/세이지 포인트)으로 전면 개편하고, 디자인 일관성과 유지보수성을 위해 코드베이스를 리팩토링합니다. 이 작업은 스타일링 시스템을 Tailwind CSS로 통합하고, 레거시/중복 스타일링 패턴을 제거하며, 모든 컴포넌트가 SOLID 원칙을 따르도록 하는 것을 포함합니다.

## 사용자 검토 필요
> [!IMPORTANT]
> **주요 변경 사항 (Breaking Change)**: 앱의 시각적 정체성이 크게 변경됩니다.
> **리팩토링**: `src/design-system`의 JS 객체 스타일링 방식에서 순수 Tailwind CSS 클래스 방식으로 전환합니다. 이는 많은 파일의 수정을 필요로 합니다.

## 변경 제안 사항

### 1단계: 기초 작업 (디자인 토큰 및 폰트)
#### [전역 스타일]
- [MODIFY] [globals.css](file:///Users/admin/Desktop/bootcamp/personal_project/babycare-ai/src/app/globals.css)
    - `Pretendard` 폰트 도입 (CDN 또는 로컬).
    - `:root` CSS 변수를 새로운 "따뜻한 뉴트럴" 팔레트로 업데이트.
    - `radius` (둥글기) 토큰 업데이트.
    - "부드러운 그림자(Soft Shadows)"를 위한 새로운 유틸리티 클래스 추가.

#### [레이아웃]
- [MODIFY] [layout.tsx](file:///Users/admin/Desktop/bootcamp/personal_project/babycare-ai/src/app/layout.tsx)
    - `Pretendard`를 기본 산세리프 폰트로 적용.
    - `Jua` 폰트 제거.

### 2단계: 디자인 시스템 통합
#### [기존 디자인 시스템]
- [MODIFY] [src/design-system/typography.ts](file:///Users/admin/Desktop/bootcamp/personal_project/babycare-ai/src/design-system/typography.ts)
    - 내보내지는 상수가 새로운 Tailwind 클래스를 사용하도록 업데이트 (예: `font-jua` 대신 `font-sans`).
    - `TYPOGRAPHY` 상수가 새로운 디자인 규칙을 매핑하도록 보장.
- [MODIFY] [src/design-system/colors.ts](file:///Users/admin/Desktop/bootcamp/personal_project/babycare-ai/src/design-system/colors.ts)
    - `globals.css` 변수와 일치하도록 조정.

### 3단계: 컴포넌트 리팩토링 (예시)
#### [UI 컴포넌트]
- [MODIFY] [Button.tsx](file:///Users/admin/Desktop/bootcamp/personal_project/babycare-ai/src/components/ui/button.tsx)
    - 새로운 `rounded` 및 `shadow` 토큰을 사용하도록 확인.
- [MODIFY] [Card.tsx](file:///Users/admin/Desktop/bootcamp/personal_project/babycare-ai/src/components/ui/card.tsx)
    - "떠 있는(floating)" 효과를 위해 그림자와 테두리 스타일 업데이트.

## 검증 계획
### 자동화 테스트
- `npm run build`를 실행하여 제거되거나 변경된 상수로 인한 타입 오류가 없는지 확인합니다.

### 수동 검증
- **대시보드**에서 새로운 컬러 팔레트가 적용되었는지 확인합니다.
- **타이포그래피**에서 Pretendard 폰트가 제대로 렌더링되는지 확인합니다.
- **모바일 뷰**에서 간격 일관성을 확인합니다.
