// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // NEXTAUTH_SECRET 확인
  if (!process.env.NEXTAUTH_SECRET) {
    console.error("❌ NEXTAUTH_SECRET is not set. Middleware will not work correctly.");
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // 게스트 모드 허용 경로 (인증 불필요)
  const guestAllowedPaths = [
    '/dashboard/analytics/guest-baby-id',
  ];

  // 게스트 모드 체크
  if (guestAllowedPaths.some(path => pathname.startsWith(path))) {
    console.log("✅ Guest mode path detected:", pathname);
    return NextResponse.next();
  }

  // 보호된 경로 체크 (/dashboard로 시작하는 모든 경로)
  if (pathname.startsWith('/dashboard')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token) {
      console.log("🚫 Protected path without authentication:", pathname);
      console.log("   Redirecting to login...");
      
      // 로그인 페이지로 리다이렉트 (callbackUrl 포함)
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      
      return NextResponse.redirect(loginUrl);
    }

    console.log("✅ Authenticated access to:", pathname);
  }

  return NextResponse.next();
}

// 미들웨어 실행 범위 지정
export const config = {
  matcher: [
    '/dashboard/:path*',  // 모든 dashboard 경로 보호
    '/api/auth/:path*',   // NextAuth API 경로
  ],
};

