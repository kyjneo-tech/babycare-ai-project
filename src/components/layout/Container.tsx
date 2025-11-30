/**
 * Container Component
 * 페이지 레이아웃을 위한 일관된 컨테이너
 * shadcn/ui 스타일과 호환
 */

import { cn } from '@/lib/utils';
import { SPACING } from '@/design-system';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'mobile' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function Container({
  children,
  className = '',
  size = 'lg'
}: ContainerProps) {
  const sizeClasses = {
    mobile: 'max-w-md',    // 448px - 모바일 최적화
    sm: 'max-w-2xl',       // 672px
    md: 'max-w-4xl',       // 896px
    lg: 'max-w-6xl',       // 1152px
    xl: 'max-w-7xl',       // 1280px
    full: 'max-w-full',
  };

  return (
    <div className={cn(
      'container mx-auto',
      SPACING.container.all,
      sizeClasses[size],
      className
    )}>
      {children}
    </div>
  );
}
