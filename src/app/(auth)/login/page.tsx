"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<"google" | "kakao" | null>(null);
  const [error, setError] = useState("");

  const callbackUrl = searchParams.get("callbackUrl") || "/";

  async function handleGuestLogin() {
    setLoading(true);
    router.push("/babies/guest-baby-id?tab=activities");
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
    <Card className="shadow-lg border-none bg-white/90 backdrop-blur-sm">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold text-foreground">
          환영합니다! 👋
        </CardTitle>
        <CardDescription>
          간편하게 로그인하고 시작해보세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {error && (
          <Alert variant="destructive" className="rounded-2xl">
            <AlertDescription className="flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <span>{error}</span>
            </AlertDescription>
          </Alert>
        )}

        {/* 소셜 로그인 버튼 */}
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 text-base font-medium border border-input hover:bg-gray-50 transition-all rounded-2xl justify-start px-6 relative"
            onClick={() => handleSocialLogin("google")}
            disabled={loading}
          >
            {loadingProvider === "google" ? (
              <div className="w-full flex justify-center items-center">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                로그인 중...
              </div>
            ) : (
              <>
                <svg className="h-5 w-5 absolute left-6" viewBox="0 0 24 24">
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
                <span className="w-full text-center">Google로 시작하기</span>
              </>
            )}
          </Button>

          <Button
            type="button"
            className="w-full h-12 text-base font-medium bg-[#FEE500] hover:bg-[#FDD835] text-[#000000] transition-all border-none rounded-2xl justify-start px-6 relative shadow-none"
            onClick={() => handleSocialLogin("kakao")}
            disabled={loading}
          >
            {loadingProvider === "kakao" ? (
              <div className="w-full flex justify-center items-center">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                로그인 중...
              </div>
            ) : (
              <>
                <svg className="h-5 w-5 absolute left-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3C6.48 3 2 6.58 2 11c0 2.89 1.86 5.43 4.65 6.88-.2.72-.75 2.65-.87 3.08-.14.52.19.51.39.37.14-.09 2.3-1.57 3.17-2.16.56.08 1.14.12 1.66.12 5.52 0 10-3.58 10-8S17.52 3 12 3z" />
                </svg>
                <span className="w-full text-center">Kakao로 시작하기</span>
              </>
            )}
          </Button>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-muted" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">
              또는
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          className="w-full h-12 rounded-2xl font-bold text-secondary-foreground"
          onClick={handleGuestLogin}
          disabled={loading}
        >
          게스트로 둘러보기 👀
        </Button>

        <p className="text-center text-sm text-muted-foreground mt-4">
          계정이 없으신가요?{" "}
          <Link href="/signup" className="text-primary font-bold hover:underline">
            회원가입
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">
      {/* 배경 장식 요소들 (Soft & Warm) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-3xl animate-pulse delay-1000" />

      {/* 메인 컨텐츠 */}
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-8 items-center z-10">
        {/* 왼쪽: 소개 섹션 */}
        <Card className="bg-white/60 backdrop-blur-sm border-none shadow-none bg-transparent">
          <CardHeader>
            <CardTitle className="text-5xl md:text-6xl font-extrabold text-primary font-heading leading-tight">
              따뜻한 육아,
              <br />
              <span className="text-secondary">Babycare AI</span>
            </CardTitle>
            <CardDescription className="text-lg md:text-xl text-muted-foreground leading-relaxed font-medium mt-6">
              초보 엄마아빠를 위한 든든한 AI 육아 동반자.
              <br />
              아이의 모든 순간을 기록하고 분석해드려요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 mt-4">
            <div className="flex items-center space-x-4 p-3 rounded-2xl bg-white/50 hover:bg-white/80 transition-colors">
              <span className="text-2xl bg-primary/20 p-2 rounded-full">🍼</span>
              <p className="text-foreground font-medium">수유 & 수면 패턴 스마트 분석</p>
            </div>
            <div className="flex items-center space-x-4 p-3 rounded-2xl bg-white/50 hover:bg-white/80 transition-colors">
              <span className="text-2xl bg-secondary/20 p-2 rounded-full">🤖</span>
              <p className="text-foreground font-medium">24시간 AI 육아 상담</p>
            </div>
            <div className="flex items-center space-x-4 p-3 rounded-2xl bg-white/50 hover:bg-white/80 transition-colors">
              <span className="text-2xl bg-accent/20 p-2 rounded-full">📈</span>
              <p className="text-foreground font-medium">또래 대비 성장 발달 체크</p>
            </div>
          </CardContent>
        </Card>

        {/* 오른쪽: 로그인 폼 */}
        <Suspense fallback={
          <Card className="shadow-sm border-none">
            <CardContent className="flex items-center justify-center h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        }>
          <LoginForm />
        </Suspense>
      </div>

      {/* 푸터 */}
      <footer className="absolute bottom-4 w-full text-center text-muted-foreground text-sm">
        <p className="flex items-center justify-center space-x-2">
          <span>© 2025 Babycare AI</span>
          <span>•</span>
          <span>All rights reserved</span>
        </p>
      </footer>
    </div>
  );
}