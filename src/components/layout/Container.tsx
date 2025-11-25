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
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function Container({
  children,
  className = '',
  size = 'lg'
}: ContainerProps) {
  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
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
