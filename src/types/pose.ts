// MediaPipe Pose landmarks
// https://developers.google.com/mediapipe/solutions/vision/pose_landmarker

export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface Pose {
  landmarks: Landmark[];
  worldLandmarks?: Landmark[];
}

// Key landmarks indices
export const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
} as const;

// Exercise types
export type ExerciseType = 
  | 'squat' 
  | 'pushup' 
  | 'plank' 
  | 'lunge' 
  | 'deadlift'
  | 'kettle-goblet-squat'
  | 'kettle-swing'
  | 'kettle-row'
  | 'kettle-press'
  | 'russian-twist';

export interface Exercise {
  id: ExerciseType;
  name: string;
  namePl: string;
  description: string;
  descriptionPl: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// Exercise instructions
export interface ExerciseInstructions {
  setup: string[];
  execution: string[];
  commonMistakes: string[];
  tips: string[];
  muscles: string[];
  videoUrl?: string; // YouTube link
  // English translations
  setupEn?: string[];
  executionEn?: string[];
  commonMistakesEn?: string[];
  tipsEn?: string[];
  musclesEn?: string[];
}

// Rep state for exercise tracking
export type RepState = 'up' | 'down' | 'transition';

export interface Rep {
  id: number;
  timestamp: number;
  duration: number;
  formScore: number;
  feedback: string[];
}

// Form analysis result
export interface FormAnalysis {
  isValid: boolean;
  score: number; // 0-100
  feedback: string[];
  details: Record<string, number | boolean>;
}

// Workout session
export interface WorkoutSession {
  id: string;
  exerciseId: ExerciseType;
  startTime: number;
  endTime?: number;
  reps: Rep[];
  targetReps: number;
}

// Camera settings
export interface CameraSettings {
  facingMode: 'user' | 'environment';
  width: number;
  height: number;
}
