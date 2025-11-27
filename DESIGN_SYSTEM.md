# 🎨 Babycare AI 디자인 시스템

## 📝 개요

이 문서는 Babycare AI 프로젝트의 디자인 시스템을 정의합니다.
일관된 사용자 경험과 유지보수성을 위해 모든 개발자는 이 가이드를 따라야 합니다.

---

## 🏗️ 핵심 원칙

### 1. **8pt Grid System**
- 모든 간격은 8의 배수를 사용합니다: 4px, 8px, 12px, 16px, 24px, 32px, 48px

### 2. **Mobile-First**
- 기본값은 항상 모바일 크기
- 반응형은 `sm:` → `md:` → `lg:` 순서로 적용

### 3. **Single Source of Truth**
- 모든 디자인 토큰은 `/src/design-system`에서 관리
- 하드코딩된 값 사용 금지

---

## 📦 디자인 토큰

### Spacing (간격)

위치: `src/design-system/spacing.ts`

```typescript
import { SPACING } from '@/design-system';

// 컨테이너 패딩
SPACING.container.all // 'px-4 sm:px-6 lg:px-8'

// 카드 내부 패딩
SPACING.card.small    // 'p-4' (16px)
SPACING.card.medium   // 'p-4 sm:p-6' (16px → 24px)
SPACING.card.large    // 'p-6 sm:p-8' (24px → 32px)

// 요소 간 간격
SPACING.gap.xs  // 'gap-2' (8px)
SPACING.gap.sm  // 'gap-3' (12px)
SPACING.gap.md  // 'gap-4' (16px) ⭐ 기본값
SPACING.gap.lg  // 'gap-6' (24px)

// Space-between 간격
SPACING.space.sm  // 'space-y-3' (12px)
SPACING.space.md  // 'space-y-4' (16px)
SPACING.space.lg  // 'space-y-6' (24px)
```

### Typography (타이포그래피)

위치: `src/design-system/typography.ts`

```typescript
import { TYPOGRAPHY } from '@/design-system';

// 제목
TYPOGRAPHY.display  // 'text-2xl sm:text-3xl lg:text-4xl font-bold'
TYPOGRAPHY.h1       // 'text-xl sm:text-2xl lg:text-3xl font-bold'
TYPOGRAPHY.h2       // 'text-lg sm:text-xl lg:text-2xl font-semibold'
TYPOGRAPHY.h3       // 'text-base sm:text-lg font-semibold'

// 본문
TYPOGRAPHY.body.default  // 'text-sm sm:text-base'
TYPOGRAPHY.body.large    // 'text-base sm:text-lg'
TYPOGRAPHY.body.small    // 'text-xs sm:text-sm'

// 캡션
TYPOGRAPHY.caption  // 'text-xs text-muted-foreground'
```

### Colors (색상)

위치: `src/design-system/colors.ts`

```typescript
import { COLORS } from '@/design-system';

// Primary (Blue)
COLORS.primary.bg          // 'bg-primary'
COLORS.primary.foreground  // 'text-primary-foreground'

// Gradient
COLORS.gradient.primary      // Pink → Purple 그라데이션
COLORS.gradient.primaryHover // Hover 상태
```

---

## 🧩 레이아웃 컴포넌트

### Container

페이지 전체 레이아웃을 위한 컨테이너

```tsx
import { Container } from '@/components/layout';

<Container size="lg">
  {/* 콘텐츠 */}
</Container>
```

**Props:**
- `size`: `'sm' | 'md' | 'lg' | 'xl' | 'full'` (기본값: `'lg'`)

### Section

페이지 내 섹션 구분

```tsx
import { Section } from '@/components/layout';

<Section>
  {/* 섹션 콘텐츠 */}
</Section>
```

### PageHeader

페이지 상단 제목 및 설명

```tsx
import { PageHeader } from '@/components/layout';

<PageHeader
  title="우리 아기"
  description="아기 정보를 관리하세요"
>
  {/* 선택적 액션 버튼 */}
  <Button>추가하기</Button>
</PageHeader>
```

---

## 🎨 shadcn/ui 컴포넌트 활용

### Card

```tsx
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { SPACING } from '@/design-system';

<Card>
  <CardContent className={SPACING.card.medium}>
    {/* 콘텐츠 */}
  </CardContent>
  <CardFooter className={SPACING.gap.sm}>
    {/* 푸터 */}
  </CardFooter>
</Card>
```

### Button

```tsx
import { Button } from '@/components/ui/button';

<Button variant="default" size="sm">
  클릭
</Button>

// Variants: default, destructive, outline, secondary, ghost, link
// Sizes: default, sm, lg, icon
```

### Badge

```tsx
import { Badge } from '@/components/ui/badge';

<Badge variant="secondary">
  라벨
</Badge>

// Variants: default, secondary, destructive, outline
```

---

## 📐 반응형 브레이크포인트

```typescript
// Tailwind 기본 브레이크포인트
sm: 640px   // 모바일 가로/소형 태블릿
md: 768px   // 태블릿
lg: 1024px  // 데스크톱
xl: 1280px  // 큰 데스크톱
```

### 사용 예시

```tsx
// 모바일: p-4, 태블릿: p-6, 데스크톱: p-8
className="p-4 sm:p-6 lg:p-8"

// 모바일: text-sm, 태블릿 이상: text-base
className="text-sm sm:text-base"

// 모바일: 1열, 태블릿: 2열, 데스크톱: 3열
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
```

---

## ✅ 베스트 프랙티스

### DO (해야 할 것) ✅

1. **디자인 토큰 사용**
   ```tsx
   // ✅ Good
   <div className={SPACING.card.medium}>

   // ❌ Bad
   <div className="p-4 sm:p-6">
   ```

2. **shadcn/ui 컴포넌트 활용**
   ```tsx
   // ✅ Good
   <Button variant="default">

   // ❌ Bad
   <button className="px-4 py-2 bg-blue-500...">
   ```

3. **의미론적 색상 사용**
   ```tsx
   // ✅ Good
   <div className="bg-primary text-primary-foreground">

   // ❌ Bad
   <div className="bg-blue-500 text-white">
   ```

### DON'T (하지 말아야 할 것) ❌

1. **임의의 값 사용 금지**
   ```tsx
   // ❌ Bad
   <div className="p-5 gap-7">
   ```

2. **하드코딩된 색상 금지**
   ```tsx
   // ❌ Bad
   <div className="text-[#3B82F6]">
   ```

3. **인라인 스타일 금지**
   ```tsx
   // ❌ Bad
   <div style={{ padding: '20px' }}>
   ```

---

## 🔄 리팩토링 가이드

기존 코드를 디자인 시스템에 맞춰 수정하는 방법:

### Before
```tsx
<div className="container mx-auto p-3 sm:p-6 lg:p-8">
  <div className="bg-white p-4 rounded-lg shadow-md">
    <h2 className="text-lg font-semibold mb-4">제목</h2>
    <p className="text-sm text-gray-600">내용</p>
  </div>
</div>
```

### After
```tsx
import { Container } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { SPACING, TYPOGRAPHY } from '@/design-system';
import { cn } from '@/lib/utils';

<Container>
  <Card>
    <CardContent className={SPACING.card.medium}>
      <h2 className={cn(TYPOGRAPHY.h2, SPACING.space.sm)}>제목</h2>
      <p className={cn(TYPOGRAPHY.body.small, 'text-muted-foreground')}>
        내용
      </p>
    </CardContent>
  </Card>
</Container>
```

---

## 📚 참고 자료

- [Tailwind CSS 공식 문서](https://tailwindcss.com/docs)
- [shadcn/ui 공식 문서](https://ui.shadcn.com)
- [8pt Grid System](https://spec.fm/specifics/8-pt-grid)

---

**마지막 업데이트**: 2025-11-25
