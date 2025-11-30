/**
 * MobileContainer Component
 * 모바일 우선 디자인을 위한 컨테이너
 * 
 * 특징:
 * - 모바일: 전체 너비 (좌우 패딩만)
 * - 데스크톱: 448px 고정 + 중앙 정렬
 * - Capacitor 네이티브 앱 전환 시 완벽 호환
 */

import { cn } from '@/lib/utils';

interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean; // 패딩 제거 옵션
}

export function MobileContainer({
  children,
  className = '',
  noPadding = false,
}: MobileContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-md', // max-w-md = 448px
        !noPadding && 'px-4 py-6',
        className
      )}
    >
      {children}
    </div>
  );
}
