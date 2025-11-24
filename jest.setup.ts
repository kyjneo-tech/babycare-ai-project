import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset } from 'jest-mock-extended';

/** @type {import('jest-mock-extended').DeepMockProxy<import('@prisma/client').PrismaClient>} */
export const prismaMock = mockDeep<PrismaClient>();

// 2. @/shared/lib/prisma 모듈을 모킹합니다.
// 이제 실제 prisma 대신 prismaMock을 사용하게 됩니다.
jest.mock('@/shared/lib/prisma', () => ({
  __esModule: true,
  prisma: prismaMock,
}));

// next-auth 모킹
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

// 3. 각 테스트가 실행되기 전에 prismaMock의 상태를 초기화합니다.
beforeEach(() => {
  mockReset(prismaMock);
});

// getServerSession 모킹을 위한 헬퍼 함수 (테스트에서 import하여 사용)
import { getServerSession } from 'next-auth';
export const mockGetServerSession = getServerSession as jest.Mock;
