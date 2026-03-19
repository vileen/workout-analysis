import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ExerciseType } from '../types/pose';

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];

export interface ScheduledExercise {
  id: string;
  exerciseId: ExerciseType;
  sets: number;
  reps: string;
  restSeconds: number;
  notes?: string;
}

export interface WorkoutSchedule {
  [day: string]: ScheduledExercise[];
}

interface ScheduleStore {
  schedule: WorkoutSchedule;
  addExerciseToDay: (day: DayOfWeek, exercise: Omit<ScheduledExercise, 'id'>) => void;
  removeExerciseFromDay: (day: DayOfWeek, exerciseId: string) => void;
  updateExercise: (day: DayOfWeek, exerciseId: string, updates: Partial<ScheduledExercise>) => void;
  moveExercise: (fromDay: DayOfWeek, toDay: DayOfWeek, exerciseId: string) => void;
  clearDay: (day: DayOfWeek) => void;
  clearAll: () => void;
  getExercisesForDay: (day: DayOfWeek) => ScheduledExercise[];
}

const initialSchedule: WorkoutSchedule = {
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: [],
};

export const useScheduleStore = create<ScheduleStore>()(
  persist(
    (set, get) => ({
      schedule: initialSchedule,

      addExerciseToDay: (day, exercise) => {
        const newExercise: ScheduledExercise = {
          ...exercise,
          id: `${day}-${Date.now()}`,
        };
        set((state) => ({
          schedule: {
            ...state.schedule,
            [day]: [...state.schedule[day], newExercise],
          },
        }));
      },

      removeExerciseFromDay: (day, exerciseId) => {
        set((state) => ({
          schedule: {
            ...state.schedule,
            [day]: state.schedule[day].filter((e) => e.id !== exerciseId),
          },
        }));
      },

      updateExercise: (day, exerciseId, updates) => {
        set((state) => ({
          schedule: {
            ...state.schedule,
            [day]: state.schedule[day].map((e) =>
              e.id === exerciseId ? { ...e, ...updates } : e
            ),
          },
        }));
      },

      moveExercise: (fromDay, toDay, exerciseId) => {
        const exercise = get().schedule[fromDay].find((e) => e.id === exerciseId);
        if (!exercise) return;

        set((state) => ({
          schedule: {
            ...state.schedule,
            [fromDay]: state.schedule[fromDay].filter((e) => e.id !== exerciseId),
            [toDay]: [...state.schedule[toDay], { ...exercise, id: `${toDay}-${Date.now()}` }],
          },
        }));
      },

      clearDay: (day) => {
        set((state) => ({
          schedule: {
            ...state.schedule,
            [day]: [],
          },
        }));
      },

      clearAll: () => {
        set({ schedule: initialSchedule });
      },

      getExercisesForDay: (day) => {
        return get().schedule[day] || [];
      },
    }),
    {
      name: 'workout-schedule-storage',
    }
  )
);
