import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { BabyMeasurement } from '@prisma/client';

interface LatestMeasurement {
  weight: number;
  height: number;
  measuredAt: Date;
}

interface MeasurementState {
  // 상태 (아기별 그룹화)
  measurements: Record<string, BabyMeasurement[]>; // key: babyId
  latestMeasurements: Record<string, LatestMeasurement>; // 캐시

  // Actions
  setMeasurements: (babyId: string, measurements: BabyMeasurement[]) => void;
  addMeasurement: (babyId: string, measurement: BabyMeasurement) => void;
  updateMeasurement: (measurementId: string, data: Partial<BabyMeasurement>) => void;
  deleteMeasurement: (babyId: string, measurementId: string) => void;
  clearMeasurements: (babyId: string) => void;

  // Computed Selectors
  getLatestMeasurement: (babyId: string) => LatestMeasurement | null;
  getMeasurementHistory: (babyId: string, limit?: number) => BabyMeasurement[];
  getMeasurementById: (babyId: string, measurementId: string) => BabyMeasurement | undefined;
}

export const useMeasurementStore = create<MeasurementState>()(
  devtools(
    (set, get) => ({
      // 초기 상태
      measurements: {},
      latestMeasurements: {},

      // Actions
      setMeasurements: (babyId, measurements) => {
        set((state) => {
          const sorted = [...measurements].sort(
            (a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime()
          );

          const latest = sorted[0];
          const newLatest = latest
            ? {
                weight: latest.weight,
                height: latest.height,
                measuredAt: new Date(latest.measuredAt),
              }
            : null;

          return {
            measurements: {
              ...state.measurements,
              [babyId]: sorted,
            },
            latestMeasurements: newLatest
              ? {
                  ...state.latestMeasurements,
                  [babyId]: newLatest,
                }
              : state.latestMeasurements,
          };
        });
      },

      addMeasurement: (babyId, measurement) => {
        set((state) => {
          const existing = state.measurements[babyId] || [];
          const newMeasurements = [measurement, ...existing].sort(
            (a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime()
          );

          return {
            measurements: {
              ...state.measurements,
              [babyId]: newMeasurements,
            },
            latestMeasurements: {
              ...state.latestMeasurements,
              [babyId]: {
                weight: measurement.weight,
                height: measurement.height,
                measuredAt: new Date(measurement.measuredAt),
              },
            },
          };
        });
      },

      updateMeasurement: (measurementId, data) => {
        set((state) => {
          const newMeasurements = { ...state.measurements };
          let updated = false;
          let updatedBabyId: string | null = null;

          // Find and update the measurement
          for (const [babyId, measurements] of Object.entries(newMeasurements)) {
            const index = measurements.findIndex((m) => m.id === measurementId);
            if (index !== -1) {
              newMeasurements[babyId] = [...measurements];
              newMeasurements[babyId][index] = {
                ...measurements[index],
                ...data,
              };
              updated = true;
              updatedBabyId = babyId;
              break;
            }
          }

          if (!updated) return state;

          // Re-sort and update latest
          const sorted = newMeasurements[updatedBabyId!].sort(
            (a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime()
          );

          const latest = sorted[0];

          return {
            measurements: {
              ...state.measurements,
              [updatedBabyId!]: sorted,
            },
            latestMeasurements: {
              ...state.latestMeasurements,
              [updatedBabyId!]: {
                weight: latest.weight,
                height: latest.height,
                measuredAt: new Date(latest.measuredAt),
              },
            },
          };
        });
      },

      deleteMeasurement: (babyId, measurementId) => {
        set((state) => {
          const existing = state.measurements[babyId] || [];
          const filtered = existing.filter((m) => m.id !== measurementId);

          const latest = filtered[0];
          const newLatest = latest
            ? {
                weight: latest.weight,
                height: latest.height,
                measuredAt: new Date(latest.measuredAt),
              }
            : null;

          return {
            measurements: {
              ...state.measurements,
              [babyId]: filtered,
            },
            latestMeasurements: newLatest
              ? {
                  ...state.latestMeasurements,
                  [babyId]: newLatest,
                }
              : (() => {
                  const { [babyId]: _, ...rest } = state.latestMeasurements;
                  return rest;
                })(),
          };
        });
      },

      clearMeasurements: (babyId) => {
        set((state) => {
          const { [babyId]: _, ...restMeasurements } = state.measurements;
          const { [babyId]: __, ...restLatest } = state.latestMeasurements;

          return {
            measurements: restMeasurements,
            latestMeasurements: restLatest,
          };
        });
      },

      // Computed Selectors
      getLatestMeasurement: (babyId) => {
        return get().latestMeasurements[babyId] || null;
      },

      getMeasurementHistory: (babyId, limit) => {
        const measurements = get().measurements[babyId] || [];
        return limit ? measurements.slice(0, limit) : measurements;
      },

      getMeasurementById: (babyId, measurementId) => {
        const measurements = get().measurements[babyId] || [];
        return measurements.find((m) => m.id === measurementId);
      },
    }),
    { name: 'MeasurementStore' }
  )
);
