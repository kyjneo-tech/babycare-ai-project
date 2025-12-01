"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Sparkles, Baby, Bot, TrendingUp } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";

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
      if (provider === "google" && Capacitor.isNativePlatform()) {
        const googleUser = await GoogleAuth.signIn();
        const result = await signIn("google-native", {
          id_token: googleUser.authentication.idToken,
          redirect: false,
          callbackUrl,
        });

        if (result?.error) {
          throw new Error(result.error);
        }

        router.push(callbackUrl);
      } else {
        await signIn(provider, { callbackUrl });
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError(`${provider === "google" ? "Google" : "Kakao"} 로그인에 실패했습니다. 다시 시도해주세요.`);
      setLoading(false);
      setLoadingProvider(null);
    }
  }

  return (
    <Card className="relative shadow-2xl border-none bg-white/80 backdrop-blur-xl overflow-hidden group">
      {/* 카드 테두리 애니메이션 효과 */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
      
      <div className="relative">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary animate-gradient-x">
            환영합니다! 👋
          </CardTitle>
          <CardDescription className="text-base mt-2">
            간편하게 로그인하고 시작해보세요
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-2">
          {error && (
            <Alert variant="destructive" className="rounded-2xl animate-shake">
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
              className="w-full h-14 text-base font-semibold border-2 border-gray-200 hover:border-primary/50 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 rounded-2xl justify-start px-6 relative overflow-hidden group/btn"
              onClick={() => handleSocialLogin("google")}
              disabled={loading}
            >
              {/* Shimmer 효과 */}
              <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              
              {loadingProvider === "google" ? (
                <div className="w-full flex justify-center items-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  로그인 중...
                </div>
              ) : (
                <>
                  <svg className="h-6 w-6 absolute left-6" viewBox="0 0 24 24">
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
              className="w-full h-14 text-base font-semibold bg-[#FEE500] hover:bg-[#FDD835] text-[#000000] hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-none rounded-2xl justify-start px-6 relative shadow-md overflow-hidden group/btn"
              onClick={() => handleSocialLogin("kakao")}
              disabled={loading}
            >
              {/* Shimmer 효과 */}
              <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
              
              {loadingProvider === "kakao" ? (
                <div className="w-full flex justify-center items-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  로그인 중...
                </div>
              ) : (
                <>
                  <svg className="h-6 w-6 absolute left-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3C6.48 3 2 6.58 2 11c0 2.89 1.86 5.43 4.65 6.88-.2.72-.75 2.65-.87 3.08-.14.52.19.51.39.37.14-.09 2.3-1.57 3.17-2.16.56.08 1.14.12 1.66.12 5.52 0 10-3.58 10-8S17.52 3 12 3z" />
                  </svg>
                  <span className="w-full text-center">Kakao로 시작하기</span>
                </>
              )}
            </Button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/80 backdrop-blur-sm px-4 text-muted-foreground font-medium">
                또는
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            className="w-full h-14 rounded-2xl font-bold text-secondary-foreground hover:shadow-lg hover:scale-[1.02] transition-all duration-300 bg-gradient-to-r from-secondary/90 to-secondary/70 hover:from-secondary hover:to-secondary/80"
            onClick={handleGuestLogin}
            disabled={loading}
          >
            <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
            게스트로 둘러보기
          </Button>
        </CardContent>
      </div>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-blue-50 to-green-50 relative overflow-hidden p-4">
      {/* 애니메이션 배경 요소들 */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl animate-blob" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-secondary/20 to-transparent blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute top-1/2 left-1/2 w-[50%] h-[50%] rounded-full bg-gradient-to-br from-accent/10 to-transparent blur-3xl animate-blob animation-delay-4000" />

      {/* 떠다니는 파티클들 */}
      <div className="absolute top-20 left-20 w-2 h-2 bg-primary/40 rounded-full animate-float" />
      <div className="absolute top-40 right-32 w-3 h-3 bg-secondary/40 rounded-full animate-float animation-delay-1000" />
      <div className="absolute bottom-32 left-40 w-2 h-2 bg-accent/40 rounded-full animate-float animation-delay-2000" />
      <div className="absolute bottom-20 right-20 w-3 h-3 bg-primary/30 rounded-full animate-float animation-delay-3000" />

      {/* 메인 컨텐츠 */}
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center z-10">
        {/* 왼쪽: 소개 섹션 */}
        <div className="space-y-8 animate-fade-in-up">
          <div>
            <h1 className="text-6xl md:text-7xl font-black leading-tight mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 animate-gradient-x inline-block">
                따뜻한 육아,
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 animate-gradient-x inline-block animation-delay-200">
                Babycare AI
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 leading-relaxed font-medium">
              초보 엄마아빠를 위한 든든한 AI 육아 동반자.
              <br />
              아이의 모든 순간을 기록하고 분석해드려요.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-4 p-5 rounded-2xl bg-white/60 backdrop-blur-sm hover:bg-white/80 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border border-white/50 group animate-fade-in-up animation-delay-300">
              <div className="bg-gradient-to-br from-rose-100 to-pink-100 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <Baby className="w-7 h-7 text-rose-500 animate-wiggle" />
              </div>
              <div>
                <p className="font-bold text-lg text-slate-800">수유 & 수면 패턴 스마트 분석</p>
                <p className="text-sm text-slate-500 mt-1">AI가 아기의 패턴을 학습하고 예측해요</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-5 rounded-2xl bg-white/60 backdrop-blur-sm hover:bg-white/80 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border border-white/50 group animate-fade-in-up animation-delay-500">
              <div className="bg-gradient-to-br from-emerald-100 to-green-100 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <Bot className="w-7 h-7 text-emerald-500 animate-pulse" />
              </div>
              <div>
                <p className="font-bold text-lg text-slate-800">24시간 AI 육아 상담</p>
                <p className="text-sm text-slate-500 mt-1">언제 어디서나 궁금한 점을 물어보세요</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-5 rounded-2xl bg-white/60 backdrop-blur-sm hover:bg-white/80 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border border-white/50 group animate-fade-in-up animation-delay-700">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-blue-500 animate-bounce-slow" />
              </div>
              <div>
                <p className="font-bold text-lg text-slate-800">또래 대비 성장 발달 체크</p>
                <p className="text-sm text-slate-500 mt-1">우리 아이의 성장을 한눈에 확인하세요</p>
              </div>
            </div>
          </div>
        </div>

        {/* 오른쪽: 로그인 폼 */}
        <div className="animate-fade-in-up animation-delay-200">
          <Suspense fallback={
            <Card className="shadow-2xl border-none bg-white/80 backdrop-blur-xl">
              <CardContent className="flex items-center justify-center h-[500px]">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </CardContent>
            </Card>
          }>
            <LoginForm />
          </Suspense>
        </div>
      </div>

      {/* 푸터 */}
      <footer className="absolute bottom-6 w-full text-center text-slate-500 text-sm">
        <p className="flex items-center justify-center space-x-2 backdrop-blur-sm">
          <span>© 2025 Babycare AI</span>
          <span>•</span>
          <span>All rights reserved</span>
        </p>
      </footer>
    </div>
  );
}