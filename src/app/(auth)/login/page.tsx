"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  const isDeleted = searchParams.get("deleted") === "true";

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
    <Card className="relative shadow-soft border-none bg-card/80 backdrop-blur-xl overflow-hidden group p-2 rounded-[var(--radius)]">
      {/* 카드 테두리 애니메이션 효과 */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
      
      <div className="relative">
        <CardHeader className="text-center pb-6 pt-8 px-8">
          <div className="flex justify-center mb-6">
             <div className="relative w-24 h-24 rounded-[2rem] overflow-hidden shadow-soft transition-transform duration-500 hover:scale-105 hover:rotate-3">
                <Image
                  src="/logo.png"
                  alt="BebeKnock Logo"
                  fill
                  className="object-cover"
                  priority
                />
             </div>
          </div>
          <CardTitle className="text-3xl font-black text-foreground">
            환영합니다! 👋
          </CardTitle>
          <CardDescription className="text-base mt-2 text-muted-foreground">
            아이와 함께하는 따뜻한 하루를 기록해보세요
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-2 px-8 pb-8">
          {isDeleted && (
            <Alert className="rounded-2xl shadow-soft border-none bg-green-50 text-green-800">
              <AlertDescription className="flex items-center gap-2 font-medium">
                <span className="text-lg">✓</span>
                <span>회원 탈퇴가 완료되었습니다. 그동안 이용해주셔서 감사합니다.</span>
              </AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive" className="rounded-2xl animate-shake shadow-soft border-none bg-destructive/10 text-destructive">
              <AlertDescription className="flex items-center gap-2 font-medium">
                <span className="text-lg">⚠️</span>
                <span>{error}</span>
              </AlertDescription>
            </Alert>
          )}

          {/* 소셜 로그인 버튼 */}
          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              className="w-full h-14 text-base font-bold bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-sm hover:shadow-soft hover:scale-[1.02] transition-all duration-300 rounded-3xl justify-start px-6 relative overflow-hidden group/btn btn-jelly"
              onClick={() => handleSocialLogin("google")}
              disabled={loading}
            >
              {loadingProvider === "google" ? (
                <div className="w-full flex justify-center items-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
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
              className="w-full h-14 text-base font-bold bg-[#FEE500] hover:bg-[#FDD835] text-[#3c1e1e] hover:shadow-soft hover:scale-[1.02] transition-all duration-300 border-none rounded-3xl justify-start px-6 relative shadow-sm overflow-hidden group/btn btn-jelly"
              onClick={() => handleSocialLogin("kakao")}
              disabled={loading}
            >
              {loadingProvider === "kakao" ? (
                <div className="w-full flex justify-center items-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin text-[#3c1e1e]" />
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
              <span className="w-full border-t border-muted/50" />
            </div>
            <div className="relative flex justify-center text-xs font-medium uppercase">
              <span className="bg-transparent px-4 text-muted-foreground">
                또는
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            className="w-full h-14 rounded-3xl font-bold text-secondary-foreground hover:shadow-soft hover:scale-[1.02] transition-all duration-300 bg-secondary/80 hover:bg-secondary btn-jelly"
            onClick={handleGuestLogin}
            disabled={loading}
          >
            <Sparkles className="w-5 h-5 mr-2 animate-pulse text-secondary-foreground/70" />
            게스트로 둘러보기
          </Button>
        </CardContent>
      </div>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">
      {/* Luminous Warmth Animated Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl animate-blob mix-blend-multiply" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-secondary to-transparent blur-3xl animate-blob animation-delay-2000 mix-blend-multiply" />
      <div className="absolute top-1/3 left-1/3 w-[50%] h-[50%] rounded-full bg-gradient-to-br from-brand-yellow/10 to-transparent blur-3xl animate-blob animation-delay-4000 mix-blend-multiply" />

      {/* Floating Particles */}
      <div className="absolute top-20 left-20 w-3 h-3 bg-primary/30 rounded-full animate-float blur-[1px]" />
      <div className="absolute top-40 right-32 w-4 h-4 bg-secondary-foreground/20 rounded-full animate-float animation-delay-1000 blur-[1px]" />
      <div className="absolute bottom-32 left-40 w-3 h-3 bg-brand-yellow/40 rounded-full animate-float animation-delay-2000 blur-[1px]" />

      {/* Main Content */}
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center z-10 relative">
        {/* Left: Introduction Section */}
        <div className="space-y-10 animate-fade-in-up">
          <div>
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/50 backdrop-blur-sm border border-white/60 mb-6 shadow-sm">
                <span className="text-sm font-bold text-gradient-coral">
                    Better Parenting with AI
                </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6 tracking-tight text-brand-navy">
              사랑의 노크,<br/>
              <span className="text-gradient-coral inline-block">
                BebeKnock
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-medium max-w-lg">
              초보 엄마아빠를 위한 든든한 AI 육아 동반자.<br />
              아이의 모든 순간을 더 따뜻하게 더 똑똑하게 기록하세요.
            </p>
          </div>

          <div className="space-y-4">
            <FeatureItem 
                icon={<Baby className="w-6 h-6 text-primary" />}
                title="AI 패턴 분석"
                desc="수유와 수면 사이클을 자동으로 분석해요"
                delay="delay-300"
                color="bg-primary/10"
            />
            <FeatureItem 
                icon={<Bot className="w-6 h-6 text-secondary-foreground" />}
                title="24시간 육아 상담"
                desc="궁금한 육아 상식, 언제든 물어보세요"
                delay="delay-500"
                color="bg-secondary/20"
            />
            <FeatureItem 
                icon={<TrendingUp className="w-6 h-6 text-brand-yellow" />}
                title="성장 발달 체크"
                desc="우리 아이가 잘 자라고 있는지 확인해요"
                delay="delay-700"
                color="bg-brand-yellow/10"
            />
          </div>
        </div>

        {/* Right: Login Form */}
        <div className="animate-fade-in-up animation-delay-200 w-full max-w-md mx-auto">
          <Suspense fallback={
            <Card className="shadow-soft border-none bg-white/80 backdrop-blur-xl h-[500px] flex items-center justify-center rounded-[var(--radius)]">
               <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </Card>
          }>
            <LoginForm />
          </Suspense>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 w-full text-center text-muted-foreground/60 text-xs font-medium">
        <p className="flex items-center justify-center space-x-2">
          <span>© 2025 BebeKnock</span>
          <span>•</span>
          <span>All rights reserved</span>
        </p>
      </footer>
    </div>
  );
}

function FeatureItem({ icon, title, desc, delay, color }: { icon: React.ReactNode, title: string, desc: string, delay: string, color: string }) {
    return (
        <div className={`flex items-center space-x-4 p-4 rounded-[2rem] bg-white/40 backdrop-blur-sm border border-white/40 hover:bg-white/60 transition-colors duration-300 animate-fade-in-up ${delay}`}>
            <div className={`p-3 rounded-2xl ${color} shadow-sm`}>
                {icon}
            </div>
            <div>
                <p className="font-bold text-base text-foreground">{title}</p>
                <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
        </div>
    )
}