"use client";

import { useEffect } from "react";
import { Baby } from "@prisma/client";
import { useBabyStore } from "@/stores";

interface BabyStoreInitializerProps {
  babies: Baby[];
  currentBabyId: string;
}

/**
 * 서버에서 가져온 babies 데이터를 Zustand Store에 초기화하는 컴포넌트
 * AppHeader의 BabySwitcher가 Store에서 babies를 읽기 때문에 필요
 */
export function BabyStoreInitializer({ babies, currentBabyId }: BabyStoreInitializerProps) {
  useEffect(() => {
    // Store에 babies 설정
    if (babies.length > 0) {
      console.log('[BabyStoreInitializer] Loading babies into store:', babies.length);
      useBabyStore.getState().setBabies(babies);
      useBabyStore.getState().setCurrentBaby(currentBabyId);
    }
  }, [babies, currentBabyId]);

  // UI를 렌더링하지 않음 (데이터 초기화만)
  return null;
}
