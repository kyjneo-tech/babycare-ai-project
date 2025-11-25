/**
 * Typography Design Tokens
 * Mobile-First 접근
 */

export const TYPOGRAPHY = {
  // 페이지 타이틀
  display: 'text-2xl sm:text-3xl lg:text-4xl font-bold',

  // 섹션 제목
  h1: 'text-xl sm:text-2xl lg:text-3xl font-bold',

  // 서브섹션 제목
  h2: 'text-lg sm:text-xl lg:text-2xl font-semibold',

  // 카드 제목
  h3: 'text-base sm:text-lg font-semibold',

  // 본문
  body: {
    default: 'text-sm sm:text-base',
    large: 'text-base sm:text-lg',
    small: 'text-xs sm:text-sm',
  },

  // 캡션/보조 텍스트
  caption: 'text-xs text-muted-foreground',

  // 버튼 텍스트
  button: 'text-sm sm:text-base font-semibold',
} as const;

export const FONT_WEIGHTS = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
} as const;
