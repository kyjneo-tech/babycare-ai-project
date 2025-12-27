// babycare-ai/src/shared/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// PrismaClient의 전역 인스턴스를 저장할 변수를 선언합니다.
declare global {
  var prisma: PrismaClient | undefined;
}

// PrismaClient 인스턴스를 생성합니다.
// 개발 환경에서는 전역 변수를 사용하여 인스턴스를 재사용하고,
// 프로덕션 환경에서는 매번 새로운 인스턴스를 생성합니다.
// 이는 Next.js의 "hot-reloading" 기능으로 인해 개발 중에
// 불필요하게 많은 PrismaClient 인스턴스가 생성되는 것을 방지합니다.
export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'production'
      ? ['error'] // 프로덕션: 에러만 로깅 (성능 최적화)
      : ['warn', 'error'], // 개발: warn, error만 (query 로그 제거로 터미널 깔끔하게)
  });

// 개발 환경에서만 global.prisma에 인스턴스를 할당합니다.
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
