/**
 * Color Design Tokens
 * shadcn/ui CSS 변수 기반
 */

export const COLORS = {
  // Primary (Soft Coral / Warm Rose)
  primary: {
    bg: 'bg-primary',
    text: 'text-primary',
    foreground: 'text-primary-foreground',
    hover: 'hover:bg-primary/90',
  },

  // Secondary (Sage Green)
  secondary: {
    bg: 'bg-secondary',
    text: 'text-secondary',
    foreground: 'text-secondary-foreground',
    hover: 'hover:bg-secondary/90',
  },

  // Accent (Soft Honey)
  accent: {
    bg: 'bg-accent',
    text: 'text-accent',
    foreground: 'text-accent-foreground',
    hover: 'hover:bg-accent/90',
  },

  // Muted (Warm Stone)
  muted: {
    bg: 'bg-muted',
    text: 'text-muted',
    foreground: 'text-muted-foreground',
  },

  // Destructive (Soft Red)
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

  // Gradients (Updated for Sophisticated Comfort)
  gradient: {
    primary: 'bg-gradient-to-r from-primary to-primary/80',
    primaryHover: 'hover:from-primary/90 hover:to-primary/70',
    soft: 'bg-gradient-to-r from-primary/10 to-secondary/10',
    softBlue: 'bg-gradient-to-r from-sky-50 to-indigo-50', // Kept as a cool alternative
    warm: 'bg-gradient-to-r from-orange-50 to-rose-50',
  },
} as const;
