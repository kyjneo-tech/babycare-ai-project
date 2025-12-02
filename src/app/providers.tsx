"use client";

import { SessionProvider, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import AppHeader from '@/widgets/app-header/AppHeader';
import { QuickRecordModal } from '@/features/activities/components/QuickRecordModal';
import { BottomNavBar } from '@/components/layout/BottomNavBar';
import { StoreInitializer } from '@/components/providers/StoreInitializer';

import { useBabyStore } from '@/stores';


function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isQuickRecordOpen, setIsQuickRecordOpen] = useState(false);
  const [currentBabyId, setCurrentBabyId] = useState<string | undefined>(undefined);

  const { babies, isLoading: isBabiesLoading } = useBabyStore();

  // URL에서 babyId 추출 또는 localStorage에서 가져오기 (경로 수정됨)
  useEffect(() => {
    // 1. URL에서 ID 추출
    const newBabyIdFromPath = pathname?.match(/\/babies\/([^\/]+)/)?.[1];
    let newBabyIdToSet: string | undefined = undefined;

    if (newBabyIdFromPath) {
      // URL에 ID가 있으면 그것을 사용
      newBabyIdToSet = newBabyIdFromPath;
      if (newBabyIdFromPath !== 'guest-baby-id') {
        localStorage.setItem('lastBabyId', newBabyIdFromPath);
      }
    } else {
      // URL에 ID가 없으면 로컬 스토리지 확인
      const lastBabyIdFromStorage = localStorage.getItem('lastBabyId');
      if (lastBabyIdFromStorage) {
        newBabyIdToSet = lastBabyIdFromStorage;
      }
    }

    // 2. 유효성 검사 및 자동 전환 (아기 목록이 로드된 경우에만)
    if (!isBabiesLoading && babies.length > 0) {
      const isValidBaby = babies.some(b => b.id === newBabyIdToSet);
      
      if (!isValidBaby && newBabyIdToSet !== 'guest-baby-id') {
        // 선택된 아기가 유효하지 않으면(삭제됨 등) 첫 번째 아기로 전환
        const firstBabyId = babies[0].id;
        newBabyIdToSet = firstBabyId;
        localStorage.setItem('lastBabyId', firstBabyId);
      }
    }

    if (currentBabyId !== newBabyIdToSet) {
      setCurrentBabyId(newBabyIdToSet);
    }
  }, [pathname, currentBabyId, babies, isBabiesLoading]);

  const authRoutes = ['/login', '/join'];
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // 로그인 상태와 관계 없이 Nav를 보여주지 않을 경로
  const noNavRoutes = ['/login', '/join', '/add-baby'];
  const shouldHideNav = noNavRoutes.some(route => pathname.startsWith(route));
  
  // 로딩 중이거나 인증 관련 경로이면 children만 렌더링
  if (status === 'loading' || isAuthRoute) {
    return <>{children}</>;
  }
  
  // 게스트/인증 사용자 모두에게 기본 쉘 제공
  return (
    <div className="min-h-[100dvh] flex flex-col">
      <AppHeader />
      <main className="flex-1 pb-20">
        {children}
      </main>

      {!shouldHideNav && <BottomNavBar currentBabyId={currentBabyId} />}

      <QuickRecordModal
        isOpen={isQuickRecordOpen}
        onClose={() => setIsQuickRecordOpen(false)}
        babyId={currentBabyId}
        onActivityCreated={() => {
          window.location.reload();
        }}
      />
    </div>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <StoreInitializer>
        <AppShell>{children}</AppShell>
      </StoreInitializer>
    </SessionProvider>
  );
}
