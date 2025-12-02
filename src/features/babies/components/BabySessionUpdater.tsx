'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface BabySessionUpdaterProps {
  babyId: string;
}

/**
 * Client component that updates the session's mainBabyId when viewing a baby page.
 * This ensures the session always reflects the currently viewed baby.
 */
export function BabySessionUpdater({ babyId }: BabySessionUpdaterProps) {
  const { data: session, update } = useSession();
  const router = useRouter();
  const isUpdatingRef = useRef(false);
  const lastUpdatedBabyIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Prevent infinite loop: only update once per baby
    if (
      session?.user?.mainBabyId !== babyId &&
      !isUpdatingRef.current &&
      lastUpdatedBabyIdRef.current !== babyId
    ) {
      isUpdatingRef.current = true;
      lastUpdatedBabyIdRef.current = babyId;
      
      console.log(`Updating session mainBabyId from ${session?.user?.mainBabyId} to: ${babyId}`);
      
      update().then(() => {
        // Refresh to update server components (like header)
        router.refresh();
        isUpdatingRef.current = false;
      }).catch((error) => {
        console.error('Failed to update session:', error);
        isUpdatingRef.current = false;
      });
    }
  }, [babyId, session?.user?.mainBabyId, update, router]);

  return null; // This component doesn't render anything
}
