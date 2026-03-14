import { Pose, FormAnalysis, RepState, POSE_LANDMARKS } from '../types/pose';
import { 
  calculateJointAngle,
  areAllVisible,
} from '../utils/math';

// Russian twist criteria
const TWIST_CRITERIA = {
  minTorsoLean: 30,       // Torso should be leaned back
  maxTorsoLean: 60,       // But not too much (safety)
  rotationThreshold: 20,  // Degrees of rotation to count
  shoulderStability: 10,  // Shoulders should stay level
};

export interface RussianTwistState {
  repState: RepState;
  repCount: number;
  torsoLean: number;
  rotationAngle: number;
  isLeaningBack: boolean;
  lastSide: 'left' | 'right' | null;
}

export function analyzeRussianTwist(pose: Pose): FormAnalysis {
  const { landmarks } = pose;
  const feedback: string[] = [];
  const details: Record<string, number | boolean> = {};
  
  // Check visibility
  const requiredIndices = [
    POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER,
    POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.RIGHT_HIP,
    POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.RIGHT_KNEE,
  ];
  
  if (!areAllVisible(landmarks, requiredIndices, 0.5)) {
    return {
      isValid: false,
      score: 0,
      feedback: ['Nie widzę całej sylwetki.'],
      details: {},
    };
  }
  
  // Calculate torso lean (angle between hips and shoulders relative to vertical)
  const shoulderY = (landmarks[POSE_LANDMARKS.LEFT_SHOULDER].y + landmarks[POSE_LANDMARKS.RIGHT_SHOULDER].y) / 2;
  const hipY = (landmarks[POSE_LANDMARKS.LEFT_HIP].y + landmarks[POSE_LANDMARKS.RIGHT_HIP].y) / 2;
  
  // Calculate rotation (difference in shoulder X positions)
  const shoulderRotation = Math.abs(
    landmarks[POSE_LANDMARKS.LEFT_SHOULDER].x - landmarks[POSE_LANDMARKS.RIGHT_SHOULDER].x
  );
  
  // Lean angle estimation (torso angle from vertical)
  const torsoLean = calculateJointAngle(
    landmarks,
    POSE_LANDMARKS.LEFT_SHOULDER,
    POSE_LANDMARKS.LEFT_HIP,
    POSE_LANDMARKS.LEFT_KNEE
  );
  
  details.torsoLean = Math.round(torsoLean);
  details.rotation = Math.round(shoulderRotation * 100);
  
  // Check torso lean
  if (torsoLean < TWIST_CRITERIA.minTorsoLean) {
    feedback.push('Odchyl się bardziej do tyłu');
    details.leanOk = false;
  } else if (torsoLean > TWIST_CRITERIA.maxTorsoLean) {
    feedback.push('Lekko do przodu - ochrona pleców');
    details.leanOk = false;
  } else {
    details.leanOk = true;
  }
  
  // Check for proper rotation
  if (shoulderRotation < 0.05) {
    feedback.push('Rotuj tułów!');
    details.rotationOk = false;
  } else {
    details.rotationOk = true;
  }
  
  // Check shoulder level (should stay relatively flat)
  const shoulderDiff = Math.abs(
    landmarks[POSE_LANDMARKS.LEFT_SHOULDER].y - landmarks[POSE_LANDMARKS.RIGHT_SHOULDER].y
  );
  if (shoulderDiff > 0.05) {
    feedback.push('Równie barki - rotacja, nie bok');
    details.shouldersOk = false;
  } else {
    details.shouldersOk = true;
  }
  
  // Calculate score
  let score = 100;
  if (!details.leanOk) score -= 30;
  if (!details.rotationOk) score -= 30;
  if (!details.shouldersOk) score -= 20;
  
  if (feedback.length === 0) {
    feedback.push('Kontrola rotacji!');
  }
  
  return {
    isValid: score >= 70,
    score: Math.max(0, score),
    feedback,
    details,
  };
}

export function detectRussianTwistRep(
  currentState: RussianTwistState,
  pose: Pose
): { newState: RussianTwistState; repCompleted: boolean } {
  const { landmarks } = pose;
  
  // Calculate lean
  const torsoLean = calculateJointAngle(
    landmarks,
    POSE_LANDMARKS.LEFT_SHOULDER,
    POSE_LANDMARKS.LEFT_HIP,
    POSE_LANDMARKS.LEFT_KNEE
  );
  
  // Determine rotation side based on shoulder positions
  const leftShoulderX = landmarks[POSE_LANDMARKS.LEFT_SHOULDER].x;
  const rightShoulderX = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER].x;
  const shoulderMidX = (leftShoulderX + rightShoulderX) / 2;
  const hipMidX = (landmarks[POSE_LANDMARKS.LEFT_HIP].x + landmarks[POSE_LANDMARKS.RIGHT_HIP].x) / 2;
  
  // If shoulders rotated left of hips
  const currentSide: 'left' | 'right' | null = 
    shoulderMidX < hipMidX - 0.03 ? 'left' :
    shoulderMidX > hipMidX + 0.03 ? 'right' : null;
  
  const newState: RussianTwistState = {
    ...currentState,
    torsoLean,
    rotationAngle: Math.abs(shoulderMidX - hipMidX) * 100,
    isLeaningBack: torsoLean > TWIST_CRITERIA.minTorsoLean,
  };
  
  // Count reps: left -> right -> left (or vice versa)
  // Each full cycle (left-right or right-left) = 1 rep
  if (currentSide && currentSide !== currentState.lastSide) {
    // Changed side
    if (currentState.lastSide !== null) {
      // Completed a side-to-side movement
      newState.repCount = currentState.repCount + 0.5;
      
      // Full rep = both sides
      if (newState.repCount % 1 === 0) {
        return { newState, repCompleted: true };
      }
    }
    newState.lastSide = currentSide;
  }
  
  return { newState, repCompleted: false };
}

export function getInitialRussianTwistState(): RussianTwistState {
  return {
    repState: 'up',
    repCount: 0,
    torsoLean: 0,
    rotationAngle: 0,
    isLeaningBack: false,
    lastSide: null,
  };
}
