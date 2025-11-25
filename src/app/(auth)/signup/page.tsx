// src/app/(auth)/signup/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signup } from "@/features/auth/actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      setLoading(false);
      return;
    }

    const result = await signup({ name, email, password });

    if (result.success) {
      router.push("/login");
    } else {
      setError(result.error || "회원가입에 실패했습니다.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">
      {/* 배경 장식 요소들 (Soft & Warm) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-3xl animate-pulse delay-1000" />

      {/* 메인 컨텐츠 */}
      <div className="max-w-md w-full z-10">
        <Card className="shadow-lg border-none bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-extrabold text-primary font-heading mb-2">
              <span className="text-secondary">Babycare AI</span>
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              새로운 육아 여정을 시작하세요 ✨
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" className="rounded-2xl">
                <AlertDescription className="flex items-center gap-2">
                  <span className="text-xl">⚠️</span>
                  <span>{error}</span>
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="홍길동"
                  required
                  disabled={loading}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  enterKeyHint="next"
                  placeholder="your@email.com"
                  required
                  disabled={loading}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  minLength={6}
                  className="rounded-xl"
                />
                <p className="text-xs text-muted-foreground">
                  최소 6자 이상 입력해주세요
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  minLength={6}
                  className="rounded-xl"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-2xl font-bold text-lg shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    가입 중...
                  </>
                ) : (
                  "회원가입 🚀"
                )}
              </Button>
            </form>

            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                이미 계정이 있으신가요?{" "}
                <Link
                  href="/login"
                  className="font-bold text-primary hover:text-primary/80 hover:underline transition-colors"
                >
                  로그인 하기 →
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
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
