// src/app/providers.tsx
'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import AppHeader from '@/widgets/app-header/AppHeader';
import { QuickRecordModal } from '@/components/features/activities/QuickRecordModal';
import { FABMenu } from '@/components/ui/fab-menu';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';


function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isQuickRecordOpen, setIsQuickRecordOpen] = useState(false);
  const [isFABMenuOpen, setIsFABMenuOpen] = useState(false); // New state for FAB menu
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

  const authRoutes = ['/login', '/signup', '/join'];
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  if (status === 'loading' || isAuthRoute || !session) {
    return <>{children}</>;
  }
  
  return (
    <div className="min-h-[100dvh] flex flex-col">
      <AppHeader />
      <main className="flex-1 pb-20">
        {children}
      </main>

      {/* FAB Menu (우측 하단, 네비바 위) */}
      <div className="fixed bottom-20 right-4 z-50">
        <FABMenu
          isOpen={isFABMenuOpen}
          onOpenChange={setIsFABMenuOpen}
          pathname={pathname}
        />
      </div>

      {/* AI Chat Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg border-t border-purple-600/20">
        <Button
          size="lg"
          className="w-full h-16 rounded-none bg-transparent hover:bg-white/10 text-white font-semibold text-lg"
          asChild
        >
          <Link href={currentBabyId ? `/ai-chat/${currentBabyId}` : '/add-baby'}>
            <MessageCircle className="mr-2 h-6 w-6" />
            🤖 AI에게 육아 상담받기
          </Link>
        </Button>
      </div>

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
