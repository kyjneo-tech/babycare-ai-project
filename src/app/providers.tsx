"use client";

import { SessionProvider, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import AppHeader from '@/widgets/app-header/AppHeader';
import { QuickRecordModal } from '@/features/activities/components/QuickRecordModal';
import { BottomNavBar } from '@/components/layout/BottomNavBar';


function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isQuickRecordOpen, setIsQuickRecordOpen] = useState(false);
  const [currentBabyId, setCurrentBabyId] = useState<string | undefined>(undefined);

  // URL에서 babyId 추출 또는 localStorage에서 가져오기 (경로 수정됨)
  useEffect(() => {
    const newBabyIdFromPath = pathname?.match(/\/babies\/([^\/]+)/)?.[1];
    let newBabyIdToSet: string | undefined = undefined;

    if (newBabyIdFromPath) {
      newBabyIdToSet = newBabyIdFromPath;
      if (newBabyIdFromPath !== 'guest-baby-id') {
        localStorage.setItem('lastBabyId', newBabyIdFromPath);
      }
    } else {
      const lastBabyIdFromStorage = localStorage.getItem('lastBabyId');
      if (lastBabyIdFromStorage) {
        newBabyIdToSet = lastBabyIdFromStorage;
      }
    }

    if (currentBabyId !== newBabyIdToSet) {
      setCurrentBabyId(newBabyIdToSet);
    }
  }, [pathname, currentBabyId]);

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
      <AppShell>{children}</AppShell>
    </SessionProvider>
  );
}
