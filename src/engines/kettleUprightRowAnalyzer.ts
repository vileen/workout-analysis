import type { Pose, FormAnalysis, RepState } from '../types/pose';
import { POSE_LANDMARKS } from '../types/pose';
import { 
  calculateJointAngle,
  calculateTorsoAngle, 
  areAllVisible,
  getAverage,
} from '../utils/math';

// Kettle upright row criteria
const UPRIGHT_ROW_CRITERIA = {
  minElbowAngle: 60,      // Elbows high at top
  maxElbowAngle: 160,     // Arms extended at bottom
  minElbowHeight: 0.05,   // Elbows should be above shoulder level at top
  maxShoulderShrug: 0.08, // Don't let shoulders go to ears
  torsoMaxDeviation: 15,  // Keep torso upright
};

export interface KettleUprightRowState {
  repState: RepState;
  repCount: number;
  elbowAngle: number;
  elbowHeight: number;
  torsoAngle: number;
  isAtTop: boolean;
}

export function analyzeKettleUprightRow(pose: Pose): FormAnalysis {
  const { landmarks } = pose;
  const feedback: string[] = [];
  const details: Record<string, number | boolean> = {};
  
  // Check visibility
  const requiredIndices = [
    POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER,
    POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.RIGHT_ELBOW,
    POSE_LANDMARKS.LEFT_WRIST, POSE_LANDMARKS.RIGHT_WRIST,
    POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.RIGHT_HIP,
    POSE_LANDMARKS.NOSE,
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
  
  // Elbow angles
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
  
  // Use the more bent elbow (the working arm during row)
  const workingElbow = Math.min(leftElbow, rightElbow);
  
  // Check elbow height relative to shoulders
  const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
  const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
  const leftElbowLandmark = landmarks[POSE_LANDMARKS.LEFT_ELBOW];
  const rightElbowLandmark = landmarks[POSE_LANDMARKS.RIGHT_ELBOW];
  const nose = landmarks[POSE_LANDMARKS.NOSE];
  
  const shoulderY = getAverage(leftShoulder.y, rightShoulder.y);
  const elbowY = getAverage(leftElbowLandmark.y, rightElbowLandmark.y);
  const elbowHeight = shoulderY - elbowY; // Positive when elbows are above shoulders
  
  // Check for shoulder shrug (shoulders going up toward ears)
  const earY = nose.y - 0.1; // Approximate ear position
  const shoulderShrug = shoulderY - earY;
  
  details.torsoAngle = Math.round(torsoAngle);
  details.elbowAngle = Math.round(workingElbow);
  details.elbowHeight = Math.round(elbowHeight * 100);
  
  // Check elbow height (lead with elbows high)
  if (workingElbow < 90 && elbowHeight < UPRIGHT_ROW_CRITERIA.minElbowHeight) {
    feedback.push('Łokcie wyżej! Prowadź łokciami');
    details.elbowHeightOk = false;
  } else {
    details.elbowHeightOk = true;
  }
  
  // Check for shoulder shrug (don't let shoulders go to ears)
  if (shoulderShrug < UPRIGHT_ROW_CRITERIA.maxShoulderShrug) {
    feedback.push('Opuszczaj barki! Nie ciągnij do uszu');
    details.shouldersOk = false;
  } else {
    details.shouldersOk = true;
  }
  
  // Check torso position
  if (torsoAngle > UPRIGHT_ROW_CRITERIA.torsoMaxDeviation) {
    feedback.push('Pionowy tułów! Nie bujaj się');
    details.torsoOk = false;
  } else {
    details.torsoOk = true;
  }
  
  // Check full extension at bottom
  if (workingElbow > UPRIGHT_ROW_CRITERIA.maxElbowAngle - 10) {
    details.extensionOk = true;
  } else {
    details.extensionOk = false;
  }
  
  // Calculate score
  let score = 100;
  if (!details.elbowHeightOk) score -= 25;
  if (!details.shouldersOk) score -= 30;
  if (!details.torsoOk) score -= 20;
  
  if (feedback.length === 0) {
    if (workingElbow < 80 && elbowHeight > 0.05) {
      feedback.push('Mocne ściągnięcie!');
    } else {
      feedback.push('Kontroluj ruch');
    }
  }
  
  return {
    isValid: score >= 70,
    score: Math.max(0, score),
    feedback,
    details,
  };
}

export function detectKettleUprightRowRep(
  currentState: KettleUprightRowState,
  pose: Pose
): { newState: KettleUprightRowState; repCompleted: boolean } {
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
  
  // Check elbow height
  const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
  const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
  const leftElbowLandmark = landmarks[POSE_LANDMARKS.LEFT_ELBOW];
  const rightElbowLandmark = landmarks[POSE_LANDMARKS.RIGHT_ELBOW];
  const shoulderY = getAverage(leftShoulder.y, rightShoulder.y);
  const elbowY = getAverage(leftElbowLandmark.y, rightElbowLandmark.y);
  const elbowHeight = shoulderY - elbowY;
  
  const newState: KettleUprightRowState = {
    ...currentState,
    elbowAngle: workingElbow,
    elbowHeight,
    torsoAngle,
  };
  
  // Rep detection: bottom -> top -> bottom
  const isAtTop = workingElbow < UPRIGHT_ROW_CRITERIA.minElbowAngle && elbowHeight > UPRIGHT_ROW_CRITERIA.minElbowHeight;
  newState.isAtTop = isAtTop;
  
  const isAtBottom = workingElbow > UPRIGHT_ROW_CRITERIA.maxElbowAngle - 15;
  
  switch (currentState.repState) {
    case 'down': // Bottom position (arms extended)
      if (isAtTop) {
        newState.repState = 'up';
      }
      break;
      
    case 'up': // Top position (elbows high)
      if (isAtBottom) {
        newState.repState = 'down';
        newState.repCount = currentState.repCount + 1;
        return { newState, repCompleted: true };
      }
      break;
      
    case 'transition':
      if (isAtTop) {
        newState.repState = 'up';
      } else if (isAtBottom) {
        newState.repState = 'down';
      }
      break;
  }
  
  return { newState, repCompleted: false };
}

export function getInitialKettleUprightRowState(): KettleUprightRowState {
  return {
    repState: 'down',
    repCount: 0,
    elbowAngle: 180,
    elbowHeight: 0,
    torsoAngle: 0,
    isAtTop: false,
  };
}
