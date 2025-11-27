/**
 * Typography Design Tokens
 * Mobile-First 접근
 */

export const TYPOGRAPHY = {
  // 페이지 타이틀
  display: 'text-2xl sm:text-3xl lg:text-4xl font-bold font-sans tracking-tight',

  // 섹션 제목
  h1: 'text-xl sm:text-2xl lg:text-3xl font-bold font-sans tracking-tight',

  // 서브섹션 제목
  h2: 'text-lg sm:text-xl lg:text-2xl font-semibold font-sans tracking-tight',

  // 카드 제목
  h3: 'text-base sm:text-lg font-semibold font-sans',

  // 본문
  body: {
    default: 'text-sm sm:text-base font-sans leading-relaxed',
    large: 'text-base sm:text-lg font-sans leading-relaxed',
    small: 'text-xs sm:text-sm font-sans',
  },

  // 캡션/보조 텍스트
  caption: 'text-xs text-muted-foreground font-sans',

  // 버튼 텍스트
  button: 'text-sm sm:text-base font-semibold font-sans',
} as const;

export const FONT_WEIGHTS = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
} as const;
