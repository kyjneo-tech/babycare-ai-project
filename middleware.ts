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
    '/analytics/guest-baby-id', // Updated path
  ];

  // 인증이 필요 없는 공개 경로 정의
  const publicPaths = ['/login', '/signup', '/join']; // Root path '/' will be handled by config.matcher for protection
  const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith(`${path}/`));

  // 게스트 모드 체크
  if (guestAllowedPaths.some(path => pathname.startsWith(path))) {
    console.log("✅ Guest mode path detected:", pathname);
    return NextResponse.next();
  }

  // 보호된 경로 체크 (공개 경로가 아니면 보호)
  // `config.matcher`에서 `/`를 포함한 모든 경로를 보호하도록 설정되어 있으므로,
  // 여기서는 `publicPaths`에 명시된 경로만 보호하지 않습니다.
  if (!isPublicPath) {
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
    // Protect all routes except API routes, _next/*, static files, and explicit public paths (login, signup, join)
    // The middleware function itself will handle redirection for unauthenticated users
    // on paths covered by this matcher.
    '/((?!api|_next/static|_next/image|favicon.ico|login|signup|join).*)',
  ],
};

