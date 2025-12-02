import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Baby } from '@prisma/client';
import { differenceInMonths } from 'date-fns';

interface BabyState {
  // 상태
  babies: Baby[];
  currentBabyId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setBabies: (babies: Baby[]) => void;
  setCurrentBaby: (babyId: string | null) => void;
  addBaby: (baby: Baby) => void;
  updateBaby: (babyId: string, data: Partial<Baby>) => void;
  deleteBaby: (babyId: string) => void;
  clearBabies: () => void;

  // Computed Selectors
  getCurrentBaby: () => Baby | undefined;
  getBabyById: (id: string) => Baby | undefined;
  getBabyAge: (babyId: string) => number | null; // 월령
}

export const useBabyStore = create<BabyState>()(
  devtools(
    (set, get) => ({
      // 초기 상태
      babies: [],
      currentBabyId: null,
      isLoading: false,
      error: null,

      // Actions
      setBabies: (babies) => {
        set({ babies });
        // 현재 아기가 설정되지 않았고 아기가 있으면 첫 번째 아기를 현재 아기로 설정
        const { currentBabyId } = get();
        if (!currentBabyId && babies.length > 0) {
          set({ currentBabyId: babies[0].id });
        }
      },

      setCurrentBaby: (babyId) => set({ currentBabyId: babyId }),

      addBaby: (baby) =>
        set((state) => ({
          babies: [...state.babies, baby],
          currentBabyId: baby.id, // 새 아기를 현재 아기로 설정
        })),

      updateBaby: (babyId, data) =>
        set((state) => ({
          babies: state.babies.map((b) =>
            b.id === babyId ? { ...b, ...data } : b
          ),
        })),

      deleteBaby: (babyId) =>
        set((state) => {
          const newBabies = state.babies.filter((b) => b.id !== babyId);
          const newCurrentBabyId =
            state.currentBabyId === babyId
              ? newBabies[0]?.id ?? null
              : state.currentBabyId;

          return {
            babies: newBabies,
            currentBabyId: newCurrentBabyId,
          };
        }),

      clearBabies: () => set({ babies: [], currentBabyId: null }),

      // Computed Selectors
      getCurrentBaby: () => {
        const { babies, currentBabyId } = get();
        return babies.find((b) => b.id === currentBabyId);
      },

      getBabyById: (id) => {
        const { babies } = get();
        return babies.find((b) => b.id === id);
      },

      getBabyAge: (babyId) => {
        const baby = get().getBabyById(babyId);
        if (!baby) return null;
        return differenceInMonths(new Date(), new Date(baby.birthDate));
      },
    }),
    { name: 'BabyStore' }
  )
);
