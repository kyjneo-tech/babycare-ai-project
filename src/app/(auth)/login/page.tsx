// src/app/(auth)/login/page.tsx
"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<"google" | "kakao" | null>(null);
  const [error, setError] = useState("");

  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  async function handleGuestLogin() {
    setLoading(true);
    router.push("/dashboard/babies/guest-baby-id?tab=activities");
  }

  async function handleSocialLogin(provider: "google" | "kakao") {
    setLoading(true);
    setLoadingProvider(provider);
    setError("");

    try {
      await signIn(provider, { callbackUrl });
    } catch (err) {
      setError(`${provider === "google" ? "Google" : "Kakao"} 로그인에 실패했습니다. 다시 시도해주세요.`);
      setLoading(false);
      setLoadingProvider(null);
    }
  }

  return (
    <Card className="shadow-2xl hover:shadow-3xl transition-shadow duration-300">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
          로그인
        </CardTitle>
        <CardDescription>아기와 함께하는 특별한 시간 🌈</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription className="flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <span>{error}</span>
            </AlertDescription>
          </Alert>
        )}

        {/* 소셜 로그인 버튼 */}
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 text-base font-medium border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all"
            onClick={() => handleSocialLogin("google")}
            disabled={loading}
          >
            {loadingProvider === "google" ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                로그인 중...
              </>
            ) : (
              <>
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google로 시작하기
              </>
            )}
          </Button>

          <Button
            type="button"
            className="w-full h-12 text-base font-medium bg-[#FEE500] hover:bg-[#FDD835] text-[#000000] transition-all border-none"
            onClick={() => handleSocialLogin("kakao")}
            disabled={loading}
          >
            {loadingProvider === "kakao" ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                로그인 중...
              </>
            ) : (
              <>
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3C6.48 3 2 6.58 2 11c0 2.89 1.86 5.43 4.65 6.88-.2.72-.75 2.65-.87 3.08-.14.52.19.51.39.37.14-.09 2.3-1.57 3.17-2.16.56.08 1.14.12 1.66.12 5.52 0 10-3.58 10-8S17.52 3 12 3z" />
                </svg>
                Kakao로 시작하기
              </>
            )}
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              또는
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full bg-gradient-to-r from-blue-400 to-cyan-400 text-white hover:from-blue-500 hover:to-cyan-500 border-none"
          onClick={handleGuestLogin}
          disabled={loading}
        >
          게스트로 시작하기 👀
        </Button>

        <p className="text-center text-sm text-gray-500 mt-4">
          소셜 로그인으로 간편하게 시작하세요
        </p>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 relative overflow-hidden p-4">
      {/* 배경 장식 요소들 */}
      <div className="absolute top-10 left-10 text-6xl opacity-20 animate-bounce">
        🍼
      </div>
      <div className="absolute top-20 right-20 text-5xl opacity-20 animate-pulse">
        👶
      </div>
      <div className="absolute bottom-20 left-20 text-5xl opacity-20 animate-bounce">
        🧸
      </div>
      <div className="absolute bottom-10 right-10 text-6xl opacity-20 animate-pulse">
        ⭐
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-8 items-center z-10">
        {/* 왼쪽: 소개 섹션 */}
        <Card className="bg-white/40 backdrop-blur-sm border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              🍼 Babycare AI
            </CardTitle>
            <CardDescription className="text-lg md:text-xl text-gray-700 leading-relaxed font-medium mt-4">
              신생아 부모를 위한 똑똑한 육아 도우미,
              <br />
              <span className="text-purple-600 font-bold">Babycare AI</span>와 함께하세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🍼</span>
              <p className="text-gray-600 pt-1">수유 기록 및 패턴 분석</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">😴</span>
              <p className="text-gray-600 pt-1">수면 시간 추적 및 관리</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">💩</span>
              <p className="text-gray-600 pt-1">배변 활동 기록</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🤖</span>
              <p className="text-gray-600 pt-1">AI 기반 맞춤형 육아 상담</p>
            </div>
            <p className="text-md text-gray-500 italic pt-4">
              육아의 모든 순간을 스마트하게 관리해 드립니다 ✨
            </p>
          </CardContent>
        </Card>

        {/* 오른쪽: 로그인 폼 */}
        <Suspense fallback={
          <Card className="shadow-2xl">
            <CardContent className="flex items-center justify-center h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        }>
          <LoginForm />
        </Suspense>
      </div>

      {/* 푸터 */}
      <footer className="absolute bottom-4 w-full text-center text-gray-500 text-sm">
        <p className="flex items-center justify-center space-x-2">
          <span>© 2025 Babycare AI</span>
          <span>•</span>
          <span>모든 권리 보유</span>
          <span className="text-lg">💝</span>
        </p>
      </footer>
    </div>
  );
}