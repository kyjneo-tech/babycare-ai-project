import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Note, NoteType } from '@prisma/client';

interface NoteState {
  // 상태
  notes: Record<string, Note[]>; // key: babyId
  upcomingSchedules: Record<string, Note[]>; // 다가오는 일정 캐시 (7일 이내)
  isLoading: boolean;
  error: string | null;

  // Actions
  setNotes: (babyId: string, notes: Note[]) => void;
  addNote: (babyId: string, note: Note) => void;
  updateNote: (noteId: string, data: Partial<Note>) => void;
  deleteNote: (noteId: string) => void;
  completeNote: (noteId: string) => void;
  uncompleteNote: (noteId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearNotes: () => void; // 전체 초기화 (로그아웃 시 사용)

  // Computed Selectors
  getUpcomingSchedules: (babyId: string, days?: number) => Note[];
  getTodoList: (babyId: string) => Note[];
  getVaccinations: (babyId: string) => Note[];
  getHealthCheckups: (babyId: string) => Note[];
  getNotesByType: (babyId: string, type: NoteType) => Note[];
  getOverdueTodos: (babyId: string) => Note[];
}

export const useNoteStore = create<NoteState>()(
  devtools(
    (set, get) => ({
      notes: {},
      upcomingSchedules: {},
      isLoading: false,
      error: null,

      setNotes: (babyId, notes) =>
        set((state) => ({
          notes: { ...state.notes, [babyId]: notes },
        })),
      addNote: (babyId, note) =>
        set((state) => ({
          notes: {
            ...state.notes,
            [babyId]: [note, ...(state.notes[babyId] || [])].sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            ),
          },
        })),
      updateNote: (noteId, data) =>
        set((state) => {
          const newNotes = { ...state.notes };
          for (const babyId in newNotes) {
            newNotes[babyId] = newNotes[babyId].map((n) =>
              n.id === noteId ? { ...n, ...data } : n
            );
          }
          return { notes: newNotes };
        }),
      deleteNote: (noteId) =>
        set((state) => {
          const newNotes = { ...state.notes };
          for (const babyId in newNotes) {
            newNotes[babyId] = newNotes[babyId].filter((n) => n.id !== noteId);
          }
          return { notes: newNotes };
        }),
      completeNote: (noteId) =>
        get().updateNote(noteId, { completedAt: new Date() }),
      uncompleteNote: (noteId) =>
        get().updateNote(noteId, { completedAt: null }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      clearNotes: () => set({
        notes: {},
        upcomingSchedules: {},
        isLoading: false,
        error: null,
      }),

      // Computed Selectors
      getUpcomingSchedules: (babyId, days = 7) => {
        const notes = get().notes[babyId] || [];
        const now = new Date();
        const future = new Date();
        future.setDate(now.getDate() + days);

        return notes.filter((n) => {
          if (!n.reminderDays) return false;
          // TODO: reminderDays 로직 구현 필요 (단순 날짜 비교로 가정)
          const targetDate = new Date(n.createdAt); // 임시: createdAt 기준
          return targetDate >= now && targetDate <= future;
        });
      },
      getTodoList: (babyId) => {
        return (get().notes[babyId] || []).filter(
          (n) => n.type === 'TODO'
        );
      },
      getVaccinations: (babyId) => {
        return (get().notes[babyId] || []).filter(
          (n) => n.type === 'VACCINATION'
        );
      },
      getHealthCheckups: (babyId) => {
        return (get().notes[babyId] || []).filter(
          (n) => n.type === 'HEALTH_CHECKUP'
        );
      },
      getNotesByType: (babyId, type) => {
        return (get().notes[babyId] || []).filter((n) => n.type === type);
      },
      getOverdueTodos: (babyId) => {
        const now = new Date();
        return (get().notes[babyId] || []).filter(
          (n) => n.type === 'TODO' && !n.completedAt && new Date(n.createdAt) < now // 임시 로직
        );
      },
    }),
    { name: 'NoteStore' }
  )
);
