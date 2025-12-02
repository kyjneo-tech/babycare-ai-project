// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // /schedules 페이지 리디렉션 (timeline 탭으로 통합됨)
  if (pathname === '/schedules') {
    const babyId = req.nextUrl.searchParams.get('babyId');
    if (babyId) {
      return NextResponse.redirect(new URL(`/babies/${babyId}?tab=timeline`, req.url));
    }
    // babyId가 없으면 홈으로 리디렉션
    return NextResponse.redirect(new URL('/', req.url));
  }

  // NEXTAUTH_SECRET 확인
  if (!process.env.NEXTAUTH_SECRET) {
    console.error("❌ NEXTAUTH_SECRET is not set. Middleware will not work correctly.");
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // 게스트 모드 허용 경로 (인증 불필요)
  const guestAllowedPaths = [
    '/babies/guest-baby-id',
    '/analytics/guest-baby-id',
  ];

  // 인증이 필요 없는 공개 경로 정의
  const publicPaths = ['/login', '/signup', '/join']; // Root path '/' will be handled by config.matcher for protection
  const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith(`${path}/`));

  // 게스트 모드 체크
  if (guestAllowedPaths.some(path => pathname.startsWith(path))) {
    console.log("✅ Guest mode path detected:", pathname);
    return NextResponse.next();
  }

  // 토큰 가져오기 (공개 경로와 보호된 경로 모두 체크)
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // 이미 로그인한 사용자가 로그인/회원가입 페이지에 접근하면 홈으로 리다이렉트
  if (isPublicPath && token) {
    console.log("🔄 Already authenticated, redirecting to home:", pathname);
    return NextResponse.redirect(new URL('/', req.url));
  }

  // 보호된 경로 체크 (공개 경로가 아니면 보호)
  // `config.matcher`에서 `/`를 포함한 모든 경로를 보호하도록 설정되어 있으므로,
  // 여기서는 `publicPaths`에 명시된 경로만 보호하지 않습니다.
  if (!isPublicPath) {
    if (!token) {
      console.log("🚫 Protected path without authentication:", pathname);
      console.log("   Redirecting to login...");

      // 로그인 페이지로 리다이렉트 (callbackUrl 포함)
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);

      return NextResponse.redirect(loginUrl);
    }

    // 로그인했지만 mainBabyId가 없는 경우 (가족/아기 미등록 상태)
    // /add-baby, /family, /api/auth/signout 경로는 허용
    const isSetupPath = ['/add-baby', '/family'].some(path => pathname === path || pathname.startsWith(`${path}/`));
    const isSignOut = pathname === '/api/auth/signout';
    
    if (!token.mainBabyId && !isSetupPath && !isSignOut) {
      console.log("🚫 Authenticated but no baby/family:", pathname);
      console.log("   Redirecting to /add-baby...");
      return NextResponse.redirect(new URL('/add-baby', req.url));
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
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|login|signup|join).*)',
  ],
};

