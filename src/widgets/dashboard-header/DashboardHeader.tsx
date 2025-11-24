// src/widgets/dashboard-header/DashboardHeader.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { BabySwitcher } from "@/features/babies/components/BabySwitcher";
import { NavigationLinks } from "./NavigationLinks";
import LogoutButton from "./LogoutButton";
import { useEffect, useState } from "react";

export default function DashboardHeader() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [babies, setBabies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 게스트 모드 확인
  const isGuestMode = pathname?.includes("guest-baby-id") || false;

  useEffect(() => {
    async function fetchBabies() {
      if (!session?.user?.id || isGuestMode) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/families/my-family");
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
  }, [session, isGuestMode]);

  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="text-xl sm:text-2xl font-bold text-blue-600"
            >
              🍼 Babycare AI
            </Link>
            {!loading && babies.length > 0 && !isGuestMode && (
              <div className="w-28 sm:w-40">
                <BabySwitcher babies={babies} />
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isGuestMode ? (
              // 게스트 모드: 로그인/회원가입 버튼
              <>
                <span className="text-sm text-gray-500 hidden sm:block">
                  👀 게스트 모드
                </span>
                <Link
                  href="/login"
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-semibold rounded-lg shadow hover:shadow-lg hover:from-pink-600 hover:to-purple-700 transition-all"
                >
                  로그인 하기
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-white text-purple-600 text-sm font-semibold rounded-lg border-2 border-purple-600 hover:bg-purple-50 transition-all hidden sm:block"
                >
                  회원가입
                </Link>
              </>
            ) : (
              // 로그인 상태: 사용자 이름 + 로그아웃 버튼
              <>
                <span className="text-gray-700 hidden sm:block">
                  {session?.user?.name}님
                </span>
                <LogoutButton callbackUrl="/login" variant="danger" size="medium" />
              </>
            )}
          </div>
        </div>
        {!loading && babies.length > 0 && !isGuestMode && <NavigationLinks />}
      </nav>
    </header>
  );
}

