"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Sparkles, Baby, Bot, TrendingUp, ChevronRight, Quote, Moon, Star } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { NativeFeatures } from "@/shared/lib/native-features";

// --- Onboarding Slide Data ---
const ONBOARDING_SLIDES = [
  {
    id: 1,
    title: "AI 육아 패턴 분석",
    desc: "우리 아이의 수면과 수유 흐름,\nAI가 똑똑하게 찾아드려요.",
    icon: <Baby className="w-10 h-10 text-white" />,
    gradient: "from-pink-500 to-rose-600",
    shadow: "shadow-pink-500/30",
  },
  {
    id: 2,
    title: "24시간 육아 상담",
    desc: "갑자기 열이 나거나 궁금할 때,\n언제든 물어보세요.",
    icon: <Bot className="w-10 h-10 text-white" />,
    gradient: "from-violet-500 to-indigo-600",
    shadow: "shadow-indigo-500/30",
  },
  {
    id: 3,
    title: "소중한 성장 기록",
    desc: "하루가 다르게 크는 아이,\n그 모든 순간을 담아두세요.",
    icon: <TrendingUp className="w-10 h-10 text-white" />,
    gradient: "from-amber-400 to-orange-500",
    shadow: "shadow-orange-500/30",
  },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<"google" | null>(null);
  const [error, setError] = useState("");
  
  // Embla Carousel Setup
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  const isDeleted = searchParams.get("deleted") === "true";
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  async function handleGuestLogin() {
    await NativeFeatures.haptic();
    setLoading(true);
    router.push("/babies/guest-baby-id?tab=activities");
  }

  async function handleSocialLogin(provider: "google") {
    await NativeFeatures.haptic();
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
      setError("로그인에 실패했습니다. 다시 시도해주세요.");
      setLoading(false);
      setLoadingProvider(null);
    }
  }

  return (
    <div className="flex flex-col h-full justify-between relative z-10">
      {/* 1. Brand & Carousel Section */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 pt-14 pb-8 px-6">
        
        {/* Brand Identity */}
        <div className="flex flex-col items-center mb-8 animate-fade-in-down">
           <div className="flex items-center gap-3 mb-3">
             <div className="relative w-10 h-10 p-1 bg-white/10 rounded-xl backdrop-blur-md border border-white/10 shadow-lg">
                <Image src="/logo.png" alt="Logo" fill className="object-contain p-1" />
             </div>
             <span className="text-2xl font-black text-white tracking-tight drop-shadow-md">BebeKnock</span>
           </div>
           <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
             <Star className="w-3 h-3 text-amber-300 fill-amber-300" />
             <span className="text-xs font-semibold text-slate-300 tracking-wider">SMART PARENTING</span>
           </div>
        </div>

        {/* Carousel Area */}
        <div className="w-full max-w-[340px] relative" ref={emblaRef}>
          <div className="flex">
            {ONBOARDING_SLIDES.map((slide) => (
              <div key={slide.id} className="flex-[0_0_100%] min-w-0 pl-4 pr-4 py-4">
                {/* Dark Glassmorphism Card */}
                <div className="relative flex flex-col items-center text-center p-8 rounded-[2.5rem] bg-white/[0.07] backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgb(0,0,0,0.3)] transition-transform duration-500">
                  
                  {/* Glowing Icon Container */}
                  <div className={`relative mb-6 p-5 rounded-2xl bg-gradient-to-br ${slide.gradient} shadow-lg ${slide.shadow} ring-1 ring-white/20`}>
                    <div className="relative z-10">{slide.icon}</div>
                    <div className="absolute inset-0 rounded-2xl bg-white/20 blur-sm" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                    {slide.title}
                  </h3>
                  
                  <p className="text-slate-300 font-medium leading-relaxed text-[15px] word-keep-all opacity-90">
                    {slide.desc}
                  </p>

                  {/* Decorative Elements */}
                  <div className="absolute top-6 right-6 opacity-10">
                    <Quote className="w-6 h-6 text-white rotate-12" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Elegant Pagination */}
        <div className="flex gap-2 mt-8">
          {ONBOARDING_SLIDES.map((_, index) => (
            <button
              key={index}
              className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                index === selectedIndex 
                  ? "w-8 bg-white" 
                  : "w-1.5 bg-white/20 hover:bg-white/40"
              }`}
              onClick={() => emblaApi?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 2. Action Section (Dark Glass Panel) */}
      <div className="w-full px-6 pb-[clamp(32px,8vh,48px)] pt-6">
        {isDeleted && (
          <Alert className="mb-4 rounded-2xl bg-emerald-500/10 backdrop-blur-md text-emerald-200 border-emerald-500/20">
            <AlertDescription className="flex items-center gap-2 text-sm font-bold justify-center">
              <span>✓ 탈퇴가 완료되었습니다</span>
            </AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Alert variant="destructive" className="mb-4 rounded-2xl bg-red-500/10 backdrop-blur-md text-red-200 border-red-500/20">
            <AlertDescription className="flex items-center gap-2 text-sm font-bold justify-center">
              <span>⚠️ {error}</span>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3 max-w-sm mx-auto">
          {/* Google Login Button */}
          <Button
            type="button"
            className="w-full h-[56px] text-[15px] font-bold bg-white text-slate-900 hover:bg-slate-100 border-none shadow-[0_0_20px_rgba(255,255,255,0.1)] rounded-[20px] relative overflow-hidden group transition-all duration-300 transform active:scale-[0.98]"
            onClick={() => handleSocialLogin("google")}
            disabled={loading}
          >
            {loadingProvider === "google" ? (
              <div className="flex items-center justify-center gap-2.5">
                <Loader2 className="h-5 w-5 animate-spin text-slate-900" />
                <span>연결 중...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full">
                <div className="absolute left-6">
                   <svg className="h-5 w-5" viewBox="0 0 24 24">
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
                </div>
                <span>Google로 시작하기</span>
              </div>
            )}
          </Button>

          {/* Guest Mode Button */}
          <Button
            type="button"
            variant="ghost"
            className="w-full h-12 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/10 rounded-2xl transition-all"
            onClick={handleGuestLogin}
            disabled={loading}
          >
            <div className="flex items-center gap-1.5">
                <span>먼저 둘러보기</span>
                <ChevronRight className="w-4 h-4 opacity-50" />
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[100dvh] bg-[#0F172A] relative overflow-hidden font-sans">
      {/* Dark & Sophisticated Background */}
      <div className="absolute inset-0 z-0">
          {/* Deep Space Gradients */}
          <div className="absolute top-[-20%] left-[-10%] w-[90%] h-[90%] rounded-full bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-transparent blur-3xl animate-blob" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[90%] h-[90%] rounded-full bg-gradient-to-tl from-blue-900/30 via-slate-800/40 to-transparent blur-3xl animate-blob animation-delay-2000" />
          
          {/* Subtle Stars/Dust */}
          <div className="absolute inset-0 opacity-[0.15] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          <div className="absolute top-20 right-10 w-1 h-1 bg-white rounded-full opacity-50 animate-pulse" />
          <div className="absolute top-40 left-20 w-1 h-1 bg-white rounded-full opacity-30 animate-pulse delay-700" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-full">
        <Suspense fallback={
            <div className="flex h-[100dvh] items-center justify-center">
               <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}