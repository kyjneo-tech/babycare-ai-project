/**
 * PageHeader Component
 * 페이지 상단 제목 및 설명을 위한 컴포넌트
 */

import { cn } from '@/lib/utils';
import { TYPOGRAPHY, SPACING } from '@/design-system';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  children,
  className = ''
}: PageHeaderProps) {
  return (
    <div className={cn(SPACING.space.lg, "px-4", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={TYPOGRAPHY.h1}>{title}</h1>
          {description && (
            <p className={cn(TYPOGRAPHY.body.default, 'text-muted-foreground mt-1')}>
              {description}
            </p>
          )}
        </div>
        {children && (
          <div className="flex-shrink-0">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
