"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * A hook to determine the current baby ID.
 * It prioritizes the ID from the URL parameters.
 * If the ID is in the URL, it saves it to sessionStorage.
 * If the ID is not in the URL, it falls back to the last viewed ID from sessionStorage.
 */
export function useCurrentBabyId() {
  const params = useParams();
  const paramId = (params.id || params.babyId) as string | undefined;

  // Initialize state with a function to avoid accessing sessionStorage on the server.
  const [currentBabyId, setCurrentBabyId] = useState<string | undefined>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('lastViewedBabyId') || undefined;
    }
    return undefined;
  });

  useEffect(() => {
    if (paramId) {
      // If there's an ID in the URL, it's the source of truth.
      sessionStorage.setItem('lastViewedBabyId', paramId);
      if (paramId !== currentBabyId) {
        setCurrentBabyId(paramId);
      }
    } else {
      // If no ID in URL, ensure state is synced with storage on mount.
      const storedId = sessionStorage.getItem('lastViewedBabyId');
      if (storedId && storedId !== currentBabyId) {
        setCurrentBabyId(storedId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramId]); // Rerun only when the URL param changes.

  return paramId || currentBabyId;
}
