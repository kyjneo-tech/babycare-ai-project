"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Footer } from "@/shared/ui/Footer";
import { Home, RefreshCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="text-8xl font-black text-destructive/20">500</div>
          <h1 className="text-3xl font-bold text-foreground">
            문제가 발생했습니다
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            일시적인 오류가 발생했습니다.<br />
            잠시 후 다시 시도해주세요.
          </p>
          {process.env.NODE_ENV === "development" && (
            <div className="bg-destructive/10 p-4 rounded-lg text-left">
              <p className="text-sm font-mono text-destructive">
                {error.message}
              </p>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button
              onClick={() => reset()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-full hover:bg-primary/90 transition-colors shadow-lg"
            >
              <RefreshCcw className="w-5 h-5" />
              다시 시도
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary font-bold rounded-full hover:bg-primary/5 transition-colors"
            >
              <Home className="w-5 h-5" />
              홈으로 이동
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
