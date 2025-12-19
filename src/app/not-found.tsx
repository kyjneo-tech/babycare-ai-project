import Link from "next/link";
import { Footer } from "@/shared/ui/Footer";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="text-8xl font-black text-primary/20">404</div>
          <h1 className="text-3xl font-bold text-foreground">
            페이지를 찾을 수 없습니다
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-full hover:bg-primary/90 transition-colors shadow-lg"
            >
              <Home className="w-5 h-5" />
              홈으로 이동
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary font-bold rounded-full hover:bg-primary/5 transition-colors"
            >
              <Search className="w-5 h-5" />
              서비스 소개
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
