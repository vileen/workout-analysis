import { Pose, FormAnalysis, RepState, POSE_LANDMARKS } from '../types/pose';
import { 
  calculateJointAngle,
  calculateTorsoAngle, 
  areAllVisible,
  getAverage,
} from '../utils/math';

// Kettle row criteria
const ROW_CRITERIA = {
  minTorsoAngle: 30,      // Torso bent forward
  maxTorsoAngle: 60,      // But not too much
  minElbowAngle: 60,      // Full contraction
  maxElbowAngle: 170,     // Full extension at bottom
  backStraightness: 20,   // Max deviation from straight line
};

export interface KettleRowState {
  repState: RepState;
  repCount: number;
  elbowAngle: number;
  torsoAngle: number;
  backAngle: number;
  isContracted: boolean;
}

export function analyzeKettleRow(pose: Pose): FormAnalysis {
  const { landmarks } = pose;
  const feedback: string[] = [];
  const details: Record<string, number | boolean> = {};
  
  // Check visibility
  const requiredIndices = [
    POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER,
    POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.RIGHT_ELBOW,
    POSE_LANDMARKS.LEFT_WRIST, POSE_LANDMARKS.RIGHT_WRIST,
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
  
  // Calculate angles
  const torsoAngle = calculateTorsoAngle(landmarks);
  
  // Elbow angles (working arm)
  const leftElbow = calculateJointAngle(
    landmarks,
    POSE_LANDMARKS.LEFT_SHOULDER,
    POSE_LANDMARKS.LEFT_ELBOW,
    POSE_LANDMARKS.LEFT_WRIST
  );
  const rightElbow = calculateJointAngle(
    landmarks,
    POSE_LANDMARKS.RIGHT_SHOULDER,
    POSE_LANDMARKS.RIGHT_ELBOW,
    POSE_LANDMARKS.RIGHT_WRIST
  );
  
  // Use the more bent elbow (the working arm)
  const workingElbow = Math.min(leftElbow, rightElbow);
  
  details.torsoAngle = Math.round(torsoAngle);
  details.elbowAngle = Math.round(workingElbow);
  
  // Check torso position (should be bent forward)
  if (torsoAngle < ROW_CRITERIA.minTorsoAngle) {
    feedback.push('Bardziej pochyl tułów');
    details.torsoOk = false;
  } else if (torsoAngle > ROW_CRITERIA.maxTorsoAngle) {
    feedback.push('Mniejszy pochyl - ochrona pleców');
    details.torsoOk = false;
  } else {
    details.torsoOk = true;
  }
  
  // Check elbow range
  if (workingElbow > ROW_CRITERIA.maxElbowAngle) {
    feedback.push('Pełne rozciągnięcie na dole');
  } else if (workingElbow < ROW_CRITERIA.minElbowAngle) {
    feedback.push('Mocne ściągnięcie łopatki!');
  }
  
  // Check for back rounding (compare shoulder-hip line)
  const shoulderMidY = getAverage(
    landmarks[POSE_LANDMARKS.LEFT_SHOULDER].y,
    landmarks[POSE_LANDMARKS.RIGHT_SHOULDER].y
  );
  const hipMidY = getAverage(
    landmarks[POSE_LANDMARKS.LEFT_HIP].y,
    landmarks[POSE_LANDMARKS.RIGHT_HIP].y
  );
  
  // In row, shoulders should be slightly higher than hips
  if (hipMidY > shoulderMidY + 0.1) {
    feedback.push('Proste plecy! Nie zaokrąglaj');
    details.backOk = false;
  } else {
    details.backOk = true;
  }
  
  // Calculate score
  let score = 100;
  if (!details.torsoOk) score -= 25;
  if (!details.backOk) score -= 35;
  
  if (feedback.length === 0) {
    feedback.push('Kontrola ruchu!');
  }
  
  return {
    isValid: score >= 70,
    score: Math.max(0, score),
    feedback,
    details,
  };
}

export function detectKettleRowRep(
  currentState: KettleRowState,
  pose: Pose
): { newState: KettleRowState; repCompleted: boolean } {
  const { landmarks } = pose;
  
  const torsoAngle = calculateTorsoAngle(landmarks);
  
  const leftElbow = calculateJointAngle(
    landmarks,
    POSE_LANDMARKS.LEFT_SHOULDER,
    POSE_LANDMARKS.LEFT_ELBOW,
    POSE_LANDMARKS.LEFT_WRIST
  );
  const rightElbow = calculateJointAngle(
    landmarks,
    POSE_LANDMARKS.RIGHT_SHOULDER,
    POSE_LANDMARKS.RIGHT_ELBOW,
    POSE_LANDMARKS.RIGHT_WRIST
  );
  
  const workingElbow = Math.min(leftElbow, rightElbow);
  
  const newState: KettleRowState = {
    ...currentState,
    elbowAngle: workingElbow,
    torsoAngle,
  };
  
  // Rep detection: extended -> contracted -> extended
  const isContracted = workingElbow < ROW_CRITERIA.minElbowAngle;
  newState.isContracted = isContracted;
  
  const isExtended = workingElbow > ROW_CRITERIA.maxElbowAngle;
  
  switch (currentState.repState) {
    case 'down': // Extended position
      if (isContracted) {
        newState.repState = 'up';
      }
      break;
      
    case 'up': // Contracted position
      if (isExtended) {
        newState.repState = 'down';
        newState.repCount = currentState.repCount + 1;
        return { newState, repCompleted: true };
      }
      break;
      
    case 'transition':
      if (isContracted) {
        newState.repState = 'up';
      } else if (isExtended) {
        newState.repState = 'down';
      }
      break;
  }
  
  return { newState, repCompleted: false };
}

function getAverage(a: number, b: number): number {
  return (a + b) / 2;
}

export function getInitialKettleRowState(): KettleRowState {
  return {
    repState: 'down',
    repCount: 0,
    elbowAngle: 180,
    torsoAngle: 45,
    backAngle: 0,
    isContracted: false,
  };
}
