import { Pose, FormAnalysis, RepState, POSE_LANDMARKS } from '../types/pose';
import { 
  calculateKneeAngle, 
  calculateTorsoAngle, 
  getAverage, 
  checkSymmetry,
  areAllVisible,
  calculateJointAngle,
} from '../utils/math';

// Goblet squat criteria
const GOBLET_SQUAT_CRITERIA = {
  minDepth: 90,           // Hip below parallel
  maxDepth: 30,           // Safety limit
  maxKneeValgus: 15,      // Knees shouldn't cave inward
  minTorsoAngle: 25,      // Can be more upright with kettlebell
  maxTorsoAngle: 55,      // But not too bent
  symmetryThreshold: 10,  // Max difference between left/right
};

export interface GobletSquatState {
  repState: RepState;
  repCount: number;
  kneeAngle: number;
  hipAngle: number;
  torsoAngle: number;
  isAtBottom: boolean;
  symmetryScore: number;
}

export function analyzeGobletSquat(pose: Pose): FormAnalysis {
  const { landmarks } = pose;
  const feedback: string[] = [];
  const details: Record<string, number | boolean> = {};
  
  // Check visibility
  const requiredIndices = [
    POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.RIGHT_HIP,
    POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.RIGHT_KNEE,
    POSE_LANDMARKS.LEFT_ANKLE, POSE_LANDMARKS.RIGHT_ANKLE,
    POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER,
    POSE_LANDMARKS.LEFT_WRIST, POSE_LANDMARKS.RIGHT_WRIST,
  ];
  
  if (!areAllVisible(landmarks, requiredIndices, 0.5)) {
    return {
      isValid: false,
      score: 0,
      feedback: ['Nie widzę całej sylwetki. Ustaw kamerę lepiej.'],
      details: {},
    };
  }
  
  // Calculate angles
  const leftKneeAngle = calculateKneeAngle(landmarks, 'left');
  const rightKneeAngle = calculateKneeAngle(landmarks, 'right');
  const avgKneeAngle = getAverage(leftKneeAngle, rightKneeAngle);
  
  const torsoAngle = calculateTorsoAngle(landmarks);
  const symmetry = checkSymmetry(leftKneeAngle, rightKneeAngle);
  
  details.kneeAngle = Math.round(avgKneeAngle);
  details.torsoAngle = Math.round(torsoAngle);
  details.symmetry = Math.round(symmetry);
  
  // Check depth
  if (avgKneeAngle > GOBLET_SQUAT_CRITERIA.minDepth) {
    feedback.push('Schodź niżej!');
    details.depthOk = false;
  } else {
    details.depthOk = true;
  }
  
  // Check torso (kettle allows more upright position)
  if (torsoAngle > GOBLET_SQUAT_CRITERIA.maxTorsoAngle) {
    feedback.push('Prostszy tułów - trzymaj kettle przy klatce');
    details.torsoOk = false;
  } else if (torsoAngle < GOBLET_SQUAT_CRITERIA.minTorsoAngle) {
    feedback.push('Lepsze zagłębienie bioder');
    details.torsoOk = false;
  } else {
    details.torsoOk = true;
  }
  
  // Check knee tracking
  if (symmetry > GOBLET_SQUAT_CRITERIA.symmetryThreshold) {
    feedback.push('Kolana nierówno - kontroluj technikę');
    details.symmetryOk = false;
  } else {
    details.symmetryOk = true;
  }
  
  // Calculate score
  let score = 100;
  if (!details.depthOk) score -= 30;
  if (!details.torsoOk) score -= 20;
  if (!details.symmetryOk) score -= 20;
  
  if (feedback.length === 0) {
    feedback.push('Dobra technika!');
  }
  
  return {
    isValid: score >= 70,
    score: Math.max(0, score),
    feedback,
    details,
  };
}

export function detectGobletSquatRep(
  currentState: GobletSquatState,
  pose: Pose
): { newState: GobletSquatState; repCompleted: boolean } {
  const { landmarks } = pose;
  
  const leftKneeAngle = calculateKneeAngle(landmarks, 'left');
  const rightKneeAngle = calculateKneeAngle(landmarks, 'right');
  const avgKneeAngle = getAverage(leftKneeAngle, rightKneeAngle);
  const torsoAngle = calculateTorsoAngle(landmarks);
  const symmetry = checkSymmetry(leftKneeAngle, rightKneeAngle);
  
  const newState: GobletSquatState = {
    ...currentState,
    kneeAngle: avgKneeAngle,
    torsoAngle,
    symmetryScore: 100 - symmetry,
  };
  
  const isAtBottom = avgKneeAngle < GOBLET_SQUAT_CRITERIA.minDepth;
  newState.isAtBottom = isAtBottom;
  
  // State machine
  switch (currentState.repState) {
    case 'up':
      if (isAtBottom) {
        newState.repState = 'down';
      }
      break;
      
    case 'down':
      if (!isAtBottom && avgKneeAngle > 120) {
        newState.repState = 'up';
        newState.repCount = currentState.repCount + 1;
        return { newState, repCompleted: true };
      }
      break;
      
    case 'transition':
      if (isAtBottom) {
        newState.repState = 'down';
      } else if (avgKneeAngle > 150) {
        newState.repState = 'up';
      }
      break;
  }
  
  return { newState, repCompleted: false };
}

export function getInitialGobletSquatState(): GobletSquatState {
  return {
    repState: 'up',
    repCount: 0,
    kneeAngle: 180,
    hipAngle: 180,
    torsoAngle: 0,
    isAtBottom: false,
    symmetryScore: 100,
  };
}
