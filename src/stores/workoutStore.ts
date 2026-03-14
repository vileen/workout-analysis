import { create } from 'zustand';
import type { Exercise, WorkoutSession, Rep } from '../types/pose';

interface WorkoutStore {
  // Current session
  currentExercise: Exercise | null;
  session: WorkoutSession | null;
  isActive: boolean;
  
  // Rep tracking
  repCount: number;
  reps: Rep[];
  currentRepStartTime: number | null;
  
  // Form tracking
  currentFormScore: number;
  formFeedback: string[];
  
  // Actions
  startExercise: (exercise: Exercise, targetReps: number) => void;
  endExercise: () => void;
  addRep: (rep: Rep) => void;
  updateFormFeedback: (feedback: string[], score: number) => void;
  reset: () => void;
}

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  // Initial state
  currentExercise: null,
  session: null,
  isActive: false,
  repCount: 0,
  reps: [],
  currentRepStartTime: null,
  currentFormScore: 100,
  formFeedback: [],
  
  // Start a new exercise session
  startExercise: (exercise: Exercise, targetReps: number) => {
    const session: WorkoutSession = {
      id: Date.now().toString(),
      exerciseId: exercise.id,
      startTime: Date.now(),
      reps: [],
      targetReps,
    };
    
    set({
      currentExercise: exercise,
      session,
      isActive: true,
      repCount: 0,
      reps: [],
      currentRepStartTime: null,
      currentFormScore: 100,
      formFeedback: ['Gotowy do treningu!'],
    });
  },
  
  // End current session
  endExercise: () => {
    const { session, reps } = get();
    
    if (session) {
      const completedSession: WorkoutSession = {
        ...session,
        endTime: Date.now(),
        reps,
      };
      
      // TODO: Save to localStorage or backend
      console.log('Session completed:', completedSession);
      
      set({
        session: completedSession,
        isActive: false,
      });
    }
  },
  
  // Add a completed rep
  addRep: (rep: Rep) => {
    const { reps } = get();
    set({
      reps: [...reps, rep],
      repCount: reps.length + 1,
    });
  },
  
  // Update form feedback
  updateFormFeedback: (feedback: string[], score: number) => {
    set({
      formFeedback: feedback,
      currentFormScore: score,
    });
  },
  
  // Reset everything
  reset: () => {
    set({
      currentExercise: null,
      session: null,
      isActive: false,
      repCount: 0,
      reps: [],
      currentRepStartTime: null,
      currentFormScore: 100,
      formFeedback: [],
    });
  },
}));
