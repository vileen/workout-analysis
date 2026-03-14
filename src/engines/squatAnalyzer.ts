import type { Pose, FormAnalysis, RepState } from '../types/pose';
import { POSE_LANDMARKS } from '../types/pose';
import { 
  calculateKneeAngle, 
  calculateTorsoAngle, 
  getAverage, 
  checkSymmetry,
  areAllVisible 
} from '../utils/math';

// Squat form criteria
const SQUAT_CRITERIA = {
  minDepth: 90,           // Hip must go below parallel (knee angle < 90°)
  maxDepth: 30,           // But not too deep (knee angle > 30° for safety)
  maxKneeValgus: 15,      // Knees shouldn't cave inward
  minTorsoAngle: 30,      // Torso shouldn't be too upright
  maxTorsoAngle: 60,      // Torso shouldn't be too horizontal
  minHipAngle: 80,        // Hip flexion minimum
  symmetryThreshold: 10,  // Max difference between left/right
};

export interface SquatState {
  repState: RepState;
  repCount: number;
  kneeAngle: number;
  hipAngle: number;
  torsoAngle: number;
  isAtBottom: boolean;
  symmetryScore: number;
}

export function analyzeSquat(pose: Pose): FormAnalysis {
  const { landmarks } = pose;
  const feedback: string[] = [];
  const details: Record<string, number | boolean> = {};
  
  // Check visibility of key landmarks
  const requiredIndices = [
    POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.RIGHT_HIP,
    POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.RIGHT_KNEE,
    POSE_LANDMARKS.LEFT_ANKLE, POSE_LANDMARKS.RIGHT_ANKLE,
    POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER,
  ];
  
  if (!areAllVisible(landmarks, requiredIndices, 0.5)) {
    return {
      isValid: false,
      score: 0,
      feedback: ['Nie widzę całej sylwetki. Sprawdź ustawienie kamery.'],
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
  if (avgKneeAngle > SQUAT_CRITERIA.minDepth) {
    feedback.push('Schodź głębiej!');
    details.depthOk = false;
  } else if (avgKneeAngle < SQUAT_CRITERIA.maxDepth) {
    feedback.push('Za głęboko - dbaj o bezpieczeństwo kolan');
    details.depthOk = false;
  } else {
    details.depthOk = true;
  }
  
  // Check torso angle
  if (torsoAngle < SQUAT_CRITERIA.minTorsoAngle) {
    feedback.push('Nachyl się lekko do przodu');
    details.torsoOk = false;
  } else if (torsoAngle > SQUAT_CRITERIA.maxTorsoAngle) {
    feedback.push('Wyprostuj się - za bardzo pochylony');
    details.torsoOk = false;
  } else {
    details.torsoOk = true;
  }
  
  // Check symmetry
  if (symmetry > SQUAT_CRITERIA.symmetryThreshold) {
    feedback.push('Nierówno! Lewa i prawa strona się nie zgadzają');
    details.symmetryOk = false;
  } else {
    details.symmetryOk = true;
  }
  
  // Calculate overall score
  let score = 100;
  if (!details.depthOk) score -= 30;
  if (!details.torsoOk) score -= 20;
  if (!details.symmetryOk) score -= 20;
  
  // If all good, give positive feedback
  if (feedback.length === 0) {
    feedback.push('Świetna forma!');
  }
  
  return {
    isValid: score >= 70,
    score: Math.max(0, score),
    feedback,
    details,
  };
}

export function detectSquatRep(
  currentState: SquatState,
  pose: Pose
): { newState: SquatState; repCompleted: boolean } {
  const { landmarks } = pose;
  
  const leftKneeAngle = calculateKneeAngle(landmarks, 'left');
  const rightKneeAngle = calculateKneeAngle(landmarks, 'right');
  const avgKneeAngle = getAverage(leftKneeAngle, rightKneeAngle);
  const torsoAngle = calculateTorsoAngle(landmarks);
  const symmetry = checkSymmetry(leftKneeAngle, rightKneeAngle);
  
  const newState: SquatState = {
    ...currentState,
    kneeAngle: avgKneeAngle,
    torsoAngle,
    symmetryScore: 100 - symmetry,
  };
  
  // State machine for rep detection
  // up -> down (below parallel) -> up = 1 rep
  
  const isAtBottom = avgKneeAngle < SQUAT_CRITERIA.minDepth;
  newState.isAtBottom = isAtBottom;
  
  switch (currentState.repState) {
    case 'up':
      if (isAtBottom) {
        newState.repState = 'down';
      }
      break;
      
    case 'down':
      if (!isAtBottom && avgKneeAngle > 120) {
        // Came back up past threshold
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

export function getInitialSquatState(): SquatState {
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
