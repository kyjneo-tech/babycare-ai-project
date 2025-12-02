import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface AppState {
  // 상태
  isInitialized: boolean;
  isOnline: boolean;
  globalLoading: boolean;
  globalError: string | null;

  // Actions
  setInitialized: (value: boolean) => void;
  setOnline: (value: boolean) => void;
  setGlobalLoading: (value: boolean) => void;
  setGlobalError: (error: string | null) => void;
  clearError: () => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      // 초기 상태
      isInitialized: false,
      isOnline: true,
      globalLoading: false,
      globalError: null,

      // Actions
      setInitialized: (value) => set({ isInitialized: value }),
      setOnline: (value) => set({ isOnline: value }),
      setGlobalLoading: (value) => set({ globalLoading: value }),
      setGlobalError: (error) => set({ globalError: error }),
      clearError: () => set({ globalError: null }),
    }),
    { name: 'AppStore' }
  )
);
