import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Activity, ActivityType } from '@prisma/client';

interface ActivityState {
  // 상태
  activities: Record<string, Activity[]>; // key: babyId
  recentActivities: Record<string, Activity[]>; // 최근 20개 캐시
  ongoingSleep: Record<string, Activity | null>; // 진행 중인 수면

  // Actions
  setActivities: (babyId: string, activities: Activity[]) => void;
  addActivity: (babyId: string, activity: Activity) => void;
  updateActivity: (activityId: string, data: Partial<Activity>) => void;
  deleteActivity: (babyId: string, activityId: string) => void;
  clearActivities: (babyId: string) => void;
  clearAll: () => void; // 전체 초기화 (로그아웃 시 사용)

  // 수면 타이머 전용
  startSleep: (babyId: string, activity: Activity) => void;
  endSleep: (babyId: string, activityId: string, endTime: Date) => void;

  // Computed Selectors
  getActivitiesByType: (babyId: string, type: ActivityType) => Activity[];
  getRecentActivities: (babyId: string, limit?: number) => Activity[];
  getOngoingSleep: (babyId: string) => Activity | null;
  getActivitiesForDate: (babyId: string, date: Date) => Activity[];
  getLastFeeding: (babyId: string) => Activity | null;
  getActivityById: (babyId: string, activityId: string) => Activity | undefined;
}

export const useActivityStore = create<ActivityState>()(
  devtools(
    (set, get) => ({
      // 초기 상태
      activities: {},
      recentActivities: {},
      ongoingSleep: {},

      // Actions
      setActivities: (babyId, activities) => {
        const sorted = [...activities].sort(
          (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );

        set((state) => ({
          activities: {
            ...state.activities,
            [babyId]: sorted,
          },
          recentActivities: {
            ...state.recentActivities,
            [babyId]: sorted.slice(0, 20),
          },
        }));
      },

      addActivity: (babyId, activity) => {
        set((state) => {
          const existing = state.activities[babyId] || [];
          const newActivities = [activity, ...existing].sort(
            (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
          );

          return {
            activities: {
              ...state.activities,
              [babyId]: newActivities,
            },
            recentActivities: {
              ...state.recentActivities,
              [babyId]: newActivities.slice(0, 20),
            },
          };
        });
      },

      updateActivity: (activityId, data) => {
        set((state) => {
          const newActivities = { ...state.activities };
          let updated = false;
          let updatedBabyId: string | null = null;

          // Find and update the activity
          for (const [babyId, activities] of Object.entries(newActivities)) {
            const index = activities.findIndex((a) => a.id === activityId);
            if (index !== -1) {
              newActivities[babyId] = [...activities];
              newActivities[babyId][index] = {
                ...activities[index],
                ...data,
              };
              updated = true;
              updatedBabyId = babyId;
              break;
            }
          }

          if (!updated) return state;

          // Re-sort
          const sorted = newActivities[updatedBabyId!].sort(
            (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
          );

          return {
            activities: {
              ...state.activities,
              [updatedBabyId!]: sorted,
            },
            recentActivities: {
              ...state.recentActivities,
              [updatedBabyId!]: sorted.slice(0, 20),
            },
          };
        });
      },

      deleteActivity: (babyId, activityId) => {
        set((state) => {
          const existing = state.activities[babyId] || [];
          const filtered = existing.filter((a) => a.id !== activityId);

          return {
            activities: {
              ...state.activities,
              [babyId]: filtered,
            },
            recentActivities: {
              ...state.recentActivities,
              [babyId]: filtered.slice(0, 20),
            },
          };
        });
      },

      clearActivities: (babyId) => {
        set((state) => {
          const { [babyId]: _, ...restActivities } = state.activities;
          const { [babyId]: __, ...restRecent } = state.recentActivities;
          const { [babyId]: ___, ...restSleep } = state.ongoingSleep;

          return {
            activities: restActivities,
            recentActivities: restRecent,
            ongoingSleep: restSleep,
          };
        });
      },

      clearAll: () => {
        set({
          activities: {},
          recentActivities: {},
          ongoingSleep: {},
        });
      },

      // 수면 타이머
      startSleep: (babyId, activity) => {
        set((state) => ({
          ongoingSleep: {
            ...state.ongoingSleep,
            [babyId]: activity,
          },
        }));
      },

      endSleep: (babyId, activityId, endTime) => {
        set((state) => {
          const activities = state.activities[babyId] || [];
          const updated = activities.map((a) =>
            a.id === activityId ? { ...a, endTime } : a
          );

          return {
            activities: {
              ...state.activities,
              [babyId]: updated,
            },
            ongoingSleep: {
              ...state.ongoingSleep,
              [babyId]: null,
            },
          };
        });
      },

      // Computed Selectors
      getActivitiesByType: (babyId, type) => {
        const activities = get().activities[babyId] || [];
        return activities.filter((a) => a.type === type);
      },

      getRecentActivities: (babyId, limit = 20) => {
        const recent = get().recentActivities[babyId] || [];
        return limit ? recent.slice(0, limit) : recent;
      },

      getOngoingSleep: (babyId) => {
        return get().ongoingSleep[babyId] || null;
      },

      getActivitiesForDate: (babyId, date) => {
        const activities = get().activities[babyId] || [];
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        return activities.filter((a) => {
          const activityDate = new Date(a.startTime);
          return activityDate >= startOfDay && activityDate <= endOfDay;
        });
      },

      getLastFeeding: (babyId) => {
        const activities = get().activities[babyId] || [];
        return activities.find((a) => a.type === 'FEEDING') || null;
      },

      getActivityById: (babyId, activityId) => {
        const activities = get().activities[babyId] || [];
        return activities.find((a) => a.id === activityId);
      },
    }),
    { name: 'ActivityStore' }
  )
);
