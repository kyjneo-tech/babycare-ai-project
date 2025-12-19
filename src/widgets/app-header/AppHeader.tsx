// src/widgets/app-header/AppHeader.tsx
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { BabySwitcher } from "@/components/common/BabySwitcher";
import LogoutButton from "./LogoutButton";
import { useBabyStore } from "@/stores";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppHeader() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const params = useParams();
  const prevSessionRef = useRef<string | null>(null);

  // ✨ Zustand Store 구독 (자동 업데이트!)
  const babies = useBabyStore((state) => state.babies);

  // ⚠️ CRITICAL: 세션 사용자 변경 감지 (다른 사용자 로그인 또는 로그아웃 시 자동 Store 초기화)
  useEffect(() => {
    const currentUserId = session?.user?.id || null;

    // 이전 세션과 현재 세션이 다른 경우 (사용자 변경 또는 로그아웃)
    if (prevSessionRef.current !== null && prevSessionRef.current !== currentUserId) {
      console.log(`[SECURITY] User session changed (${prevSessionRef.current} → ${currentUserId}) - Clearing all stores`);

      // 모든 Store 초기화 (다른 사용자 데이터 유출 방지)
      const clearAllStores = async () => {
        try {
          const { useBabyStore, useActivityStore, useMeasurementStore, useFamilyStore, useNoteStore, useChatStore } = await import('@/stores');

          useBabyStore.getState().clearBabies();
          useActivityStore.getState().clearAll();
          useMeasurementStore.getState().clearAll();
          useFamilyStore.getState().clearFamily();
          useNoteStore.getState().clearNotes();
          useChatStore.getState().clearMessages();

          console.log('[SECURITY] All stores cleared after user session change');
        } catch (error) {
          console.error('[SECURITY] Failed to clear stores:', error);
        }
      };

      clearAllStores();
    }

    prevSessionRef.current = currentUserId;
  }, [session?.user?.id]);

  // 게스트 모드 확인
  const isGuestMode = pathname?.includes("guest-baby-id") || false;

  // 현재 선택된 아기 ID 추출
  const currentBabyId = (params?.babyId || params?.id || "") as string;

  // 홈 링크 결정: 아기가 선택되어 있으면 해당 아기의 기록 화면, 아니면 루트
  const homeHref = currentBabyId
    ? `/babies/${currentBabyId}?tab=activities`
    : babies.length > 0
      ? `/babies/${babies[0].id}?tab=activities`
      : "/";

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-blue-50">
      <nav className="container mx-auto px-[clamp(12px,4vw,24px)]">
        <div className="flex justify-between items-center py-[clamp(8px,2vw,12px)]">
          <div className="flex items-center space-x-[clamp(8px,2vw,16px)]">
            <Link
              href={homeHref}
              className="group flex items-center gap-2 transition-opacity hover:opacity-80"
            >
              {/* 로고 이미지 */}
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                <Image
                  src="/logo.jpg"
                  alt="BebeKnock Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              {/* 타이틀 텍스트 */}
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-1.5 leading-tight">
                  <h1 className="text-lg sm:text-xl font-black text-brand-navy tracking-tight">BebeKnock</h1>
                  <span className="text-xs sm:text-sm font-bold text-primary">베베노크</span>
              </div>
            </Link>
            
            {babies.length > 0 && !isGuestMode && (
              <div className="min-w-[7rem] max-w-[10rem]">
                <BabySwitcher babies={babies} />
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {isGuestMode ? (
              // 게스트 모드: 로그인/회원가입 버튼
              <>
                <span className="text-sm text-muted-foreground hidden sm:block">
                  👀 게스트 모드
                </span>
                <Link
                  href="/login"
                  className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-2xl shadow-sm hover:bg-primary/90 transition-all"
                >
                  로그인 하기
                </Link>
              </>
            ) : (
              // 로그인 상태: 사용자 이름 + 설정 + 로그아웃 버튼
              <>
                <span className="text-foreground font-medium hidden sm:block">
                  {session?.user?.name}님
                </span>
                <Link href="/dashboard/settings">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-muted"
                    aria-label="설정"
                  >
                    <Settings className="w-5 h-5" />
                  </Button>
                </Link>
                <LogoutButton callbackUrl="/login" variant="destructive" size="default" />
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
