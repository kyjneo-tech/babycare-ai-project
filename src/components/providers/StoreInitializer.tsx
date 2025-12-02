'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useBabyStore, useAppStore } from '@/stores';

interface StoreInitializerProps {
  children: React.ReactNode;
}

/**
 * Store 초기화 컴포넌트
 * - 세션 로드 시 가족 데이터를 Store에 로드
 * - 현재 아기 설정
 */
export function StoreInitializer({ children }: StoreInitializerProps) {
  const { data: session, status } = useSession();
  const setInitialized = useAppStore((state) => state.setInitialized);

  useEffect(() => {
    if (status === 'loading') return;

    if (session?.user?.id) {
      // 가족 데이터 로드
      fetch('/api/families/my-family')
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch family data');
          return res.json();
        })
        .then((data) => {
          if (data.babies && Array.isArray(data.babies)) {
            useBabyStore.getState().setBabies(data.babies);

            // 현재 아기 설정 우선순위:
            // 1. JWT의 mainBabyId (기존 세션 호환성)
            // 2. 가족의 첫 번째 아기
            if (session.user.mainBabyId) {
              const babyExists = data.babies.some(
                (b: any) => b.id === session.user.mainBabyId
              );
              if (babyExists) {
                useBabyStore.getState().setCurrentBaby(session.user.mainBabyId);
              } else if (data.babies.length > 0) {
                useBabyStore.getState().setCurrentBaby(data.babies[0].id);
              }
            } else if (data.babies.length > 0) {
              useBabyStore.getState().setCurrentBaby(data.babies[0].id);
            }
          }

          setInitialized(true);
        })
        .catch((error) => {
          console.error('Failed to initialize store:', error);
          setInitialized(true); // 에러가 나도 초기화 완료로 표시
        });
    } else {
      // 로그인하지 않은 경우
      setInitialized(true);
    }
  }, [session?.user?.id, session?.user?.mainBabyId, status, setInitialized]);

  return <>{children}</>;
}
