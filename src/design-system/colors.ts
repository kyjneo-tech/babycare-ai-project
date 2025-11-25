/**
 * Color Design Tokens
 * shadcn/ui CSS 변수 기반
 */

export const COLORS = {
  // Primary (Blue)
  primary: {
    bg: 'bg-primary',
    text: 'text-primary',
    foreground: 'text-primary-foreground',
    hover: 'hover:bg-primary/90',
  },

  // Secondary (Pink)
  secondary: {
    bg: 'bg-secondary',
    text: 'text-secondary',
    foreground: 'text-secondary-foreground',
    hover: 'hover:bg-secondary/90',
  },

  // Accent (Orange)
  accent: {
    bg: 'bg-accent',
    text: 'text-accent',
    foreground: 'text-accent-foreground',
    hover: 'hover:bg-accent/90',
  },

  // Muted (Lavender)
  muted: {
    bg: 'bg-muted',
    text: 'text-muted',
    foreground: 'text-muted-foreground',
  },

  // Destructive (Red)
  destructive: {
    bg: 'bg-destructive',
    text: 'text-destructive',
    foreground: 'text-destructive-foreground',
    hover: 'hover:bg-destructive/90',
  },

  // Card/Surface
  card: {
    bg: 'bg-card',
    foreground: 'text-card-foreground',
    border: 'border-border',
  },

  // Gradients (기존 스타일 유지하면서 통일)
  gradient: {
    primary: 'bg-gradient-to-r from-pink-500 to-purple-600',
    primaryHover: 'hover:from-pink-600 hover:to-purple-700',
    soft: 'bg-gradient-to-r from-pink-50 to-purple-50',
    softBlue: 'bg-gradient-to-r from-blue-50 to-indigo-50',
  },
} as const;
