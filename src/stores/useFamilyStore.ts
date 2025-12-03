import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Family, FamilyMember } from '@prisma/client';

type Permission = 'owner' | 'admin' | 'member' | 'viewer';

export interface ExtendedFamilyMember extends Partial<FamilyMember> {
  userId: string;
  name?: string;
  email?: string;
  permission: string; // Changed from Permission to string to match API
  role?: string;
  relation?: string;
  joinedAt?: Date | string;
}

interface FamilyState {
  // 상태
  family: Partial<Family> | null;
  members: ExtendedFamilyMember[];
  currentUserPermission: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setFamily: (family: Partial<Family> | null) => void;
  setMembers: (members: ExtendedFamilyMember[]) => void;
  addMember: (member: ExtendedFamilyMember) => void;
  removeMember: (userId: string) => void;
  updateMember: (userId: string, data: Partial<ExtendedFamilyMember>) => void;
  updateInviteCode: (newCode: string, expiresAt?: Date) => void;
  setCurrentUserPermission: (permission: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearFamily: () => void; // 전체 초기화 (로그아웃 시 사용)

  // Computed Selectors
  canManageFamily: () => boolean; // owner 또는 admin
  canInviteMembers: () => boolean;
  canEditBaby: () => boolean;
  canDeleteActivity: (activityUserId: string, currentUserId?: string) => boolean; // 본인 또는 admin
  getMemberByUserId: (userId: string) => FamilyMember | undefined;
  isInviteCodeExpired: () => boolean;
}

export const useFamilyStore = create<FamilyState>()(
  devtools(
    (set, get) => ({
      family: null,
      members: [],
      currentUserPermission: null,
      isLoading: false,
      error: null,

      setFamily: (family) => set({ family }),
      setMembers: (members) => set({ members }),
      addMember: (member) => set((state) => ({ members: [...state.members, member] })),
      removeMember: (userId) =>
        set((state) => ({
          members: state.members.filter((m) => m.userId !== userId),
        })),
      updateMember: (userId, data) =>
        set((state) => ({
          members: state.members.map((m) =>
            m.userId === userId ? { ...m, ...data } : m
          ),
        })),
      updateInviteCode: (newCode, expiresAt) =>
        set((state) => ({
          family: state.family
            ? { ...state.family, inviteCode: newCode, inviteCodeExpiry: expiresAt || state.family.inviteCodeExpiry }
            : null,
        })),
      setCurrentUserPermission: (permission) => set({ currentUserPermission: permission }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      clearFamily: () => set({
        family: null,
        members: [],
        currentUserPermission: null,
        isLoading: false,
        error: null,
      }),

      // Computed Selectors
      canManageFamily: () => {
        const { currentUserPermission } = get();
        return currentUserPermission === 'owner' || currentUserPermission === 'admin';
      },
      canInviteMembers: () => {
        const { currentUserPermission } = get();
        return currentUserPermission === 'owner' || currentUserPermission === 'admin';
      },
      canEditBaby: () => {
        const { currentUserPermission } = get();
        return currentUserPermission === 'owner' || currentUserPermission === 'admin';
      },
      canDeleteActivity: (activityUserId, currentUserId) => {
        const { currentUserPermission } = get();
        return (
          activityUserId === currentUserId || // 본인 활동
          currentUserPermission === 'owner' ||
          currentUserPermission === 'admin'
        );
      },
      getMemberByUserId: (userId) => {
        return get().members.find((m) => m.userId === userId);
      },
      isInviteCodeExpired: () => {
        const { family } = get();
        if (!family?.inviteCodeExpiry) return true;
        return new Date(family.inviteCodeExpiry) < new Date();
      },
    }),
    { name: 'FamilyStore' }
  )
);
