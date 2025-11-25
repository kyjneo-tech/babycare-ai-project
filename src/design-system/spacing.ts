/**
 * Spacing Design Tokens
 * 8pt Grid System 기반
 */

export const SPACING = {
  // 컨테이너 패딩 (페이지 전체)
  container: {
    mobile: 'px-4',           // 16px
    tablet: 'sm:px-6',        // 24px
    desktop: 'lg:px-8',       // 32px
    all: 'px-4 sm:px-6 lg:px-8',
  },

  // 섹션 간격 (세로)
  section: {
    mobile: 'py-6',           // 24px
    desktop: 'sm:py-8',       // 32px
    all: 'py-6 sm:py-8',
  },

  // 카드 내부 패딩
  card: {
    small: 'p-4',             // 16px
    medium: 'p-4 sm:p-6',     // 16px → 24px
    large: 'p-6 sm:p-8',      // 24px → 32px
  },

  // 요소 간 간격 (Gap)
  gap: {
    xs: 'gap-2',              // 8px
    sm: 'gap-3',              // 12px
    md: 'gap-4',              // 16px
    lg: 'gap-6',              // 24px
    xl: 'gap-8',              // 32px
  },

  // Space-between 간격
  space: {
    xs: 'space-y-2',          // 8px
    sm: 'space-y-3',          // 12px
    md: 'space-y-4',          // 16px
    lg: 'space-y-6',          // 24px
    xl: 'space-y-8',          // 32px
  },
} as const;
