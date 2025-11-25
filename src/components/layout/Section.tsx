/**
 * Section Component
 * 페이지 내 섹션 구분을 위한 컴포넌트
 */

import { cn } from '@/lib/utils';
import { SPACING } from '@/design-system';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
}

export function Section({ children, className = '' }: SectionProps) {
  return (
    <section className={cn(
      SPACING.section.all,
      className
    )}>
      {children}
    </section>
  );
}
