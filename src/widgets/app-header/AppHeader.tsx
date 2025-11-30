// src/widgets/app-header/AppHeader.tsx
"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { BabySwitcher } from "@/components/common/BabySwitcher";
import LogoutButton from "./LogoutButton";
import { useEffect, useState } from "react";

export default function AppHeader() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const params = useParams();
  const [babies, setBabies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    async function fetchBabies() {
      if (!session?.user?.id || isGuestMode) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/families/my-family", {
          cache: 'no-store', // 캐시 방지로 항상 최신 데이터 가져오기
        });
        if (response.ok) {
          const data = await response.json();
          setBabies(data.babies || []);
        }
      } catch (error) {
        console.error("Failed to fetch babies:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBabies();
  }, [session, isGuestMode, pathname]);

  // 아기 삭제 시 드롭다운 즉시 업데이트를 위한 이벤트 리스너
  useEffect(() => {
    const handleBabyDeleted = () => {
      // 아기 목록 재조회
      if (session?.user?.id && !isGuestMode) {
        fetch("/api/families/my-family", {
          cache: 'no-store',
        })
          .then(res => res.json())
          .then(data => setBabies(data.babies || []))
          .catch(err => console.error("Failed to refresh babies:", err));
      }
    };

    window.addEventListener('baby-deleted', handleBabyDeleted);
    return () => window.removeEventListener('baby-deleted', handleBabyDeleted);
  }, [session, isGuestMode]);

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-blue-50">
      <nav className="container mx-auto px-[clamp(12px,4vw,24px)]">
        <div className="flex justify-between items-center py-[clamp(8px,2vw,12px)]">
          <div className="flex items-center space-x-[clamp(8px,2vw,16px)]">
            <Link
              href={homeHref}
              className="text-[clamp(18px,5vw,24px)] font-bold text-primary font-heading flex items-center"
            >
              <span className="hidden sm:inline">🍼 Babycare AI</span>
              <span className="sm:hidden text-[clamp(24px,6vw,32px)]">🍼</span>
            </Link>
            {!loading && babies.length > 0 && !isGuestMode && (
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
                <Link
                  href="/signup"
                  className="px-5 py-2.5 bg-white text-primary text-sm font-bold rounded-2xl border border-primary hover:bg-blue-50 transition-all hidden sm:block"
                >
                  회원가입
                </Link>
              </>
            ) : (
              // 로그인 상태: 사용자 이름 + 로그아웃 버튼
              <>
                <span className="text-foreground font-medium hidden sm:block">
                  {session?.user?.name}님
                </span>
                <LogoutButton callbackUrl="/login" variant="destructive" size="default" />
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

