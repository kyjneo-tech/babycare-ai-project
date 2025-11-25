/**
 * Design System - Component Variants
 * 재사용 가능한 컴포넌트 변형 정의
 */

/**
 * Card 컴포넌트 변형
 *
 * @example
 * <Card className={CARD_VARIANTS.elevated}>
 * <Card className={CARD_VARIANTS.glass}>
 */
export const CARD_VARIANTS = {
  default: "",
  elevated: "hover:shadow-lg transition-shadow",
  glass: "bg-white/50 backdrop-blur-sm border-none shadow-sm",
  outlined: "border-primary/20 shadow-md",
  subtle: "border-none shadow-sm",
} as const;

/**
 * 터치 타겟 최소 크기
 * iOS/Android 접근성 가이드라인 준수 (최소 44x44px)
 *
 * @example
 * <Button className={TOUCH_TARGET.minimum}>
 * <Checkbox className="h-11 w-11">
 */
export const TOUCH_TARGET = {
  minimum: "min-h-[44px] min-w-[44px]", // iOS/Android 최소 권장
  comfortable: "min-h-[48px] min-w-[48px]", // 더 편한 터치
  large: "min-h-[56px] min-w-[56px]", // 큰 터치 영역
} as const;

/**
 * 안전 영역 (Safe Area)
 * 모바일 노치/Dynamic Island 대응
 *
 * @example
 * <nav className={SAFE_AREA.bottom}>
 * <header className={SAFE_AREA.top}>
 */
export const SAFE_AREA = {
  top: "pt-[env(safe-area-inset-top)]",
  bottom: "pb-[env(safe-area-inset-bottom)]",
  left: "pl-[env(safe-area-inset-left)]",
  right: "pr-[env(safe-area-inset-right)]",
  all: "pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)]",
} as const;

/**
 * 애니메이션 변형
 * Tailwind CSS 애니메이션 유틸리티 활용
 *
 * @example
 * <div className={ANIMATION.fadeIn}>
 * <div className={ANIMATION.slideUp}>
 */
export const ANIMATION = {
  fadeIn: "animate-in fade-in duration-300",
  fadeOut: "animate-out fade-out duration-200",
  slideUp: "animate-in slide-in-from-bottom-4 duration-300",
  slideDown: "animate-in slide-in-from-top-4 duration-300",
  scaleIn: "animate-in zoom-in-95 duration-200",
} as const;
