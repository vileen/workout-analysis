import type { Pose, FormAnalysis, RepState } from '../types/pose';
import { POSE_LANDMARKS } from '../types/pose';
import { 
  calculateJointAngle,
  calculateTorsoAngle, 
  areAllVisible,
  getAverage,
} from '../utils/math';

// Kettle floor press criteria
const FLOOR_PRESS_CRITERIA = {
  minElbowAngle: 80,      // Full lockout at top
  maxElbowAngle: 160,     // Kettle at chest position
  torsoMaxDeviation: 15,  // Torso should stay flat on floor
  elbowFlareMax: 60,      // Elbows at ~45° from body
  shoulderStability: 0.08, // Max shoulder drift
};

export interface KettleFloorPressState {
  repState: RepState;
  repCount: number;
  elbowAngle: number;
  torsoAngle: number;
  elbowFlare: number;
  isLockedOut: boolean;
}

export function analyzeKettleFloorPress(pose: Pose): FormAnalysis {
  const { landmarks } = pose;
  const feedback: string[] = [];
  const details: Record<string, number | boolean> = {};
  
  // Check visibility
  const requiredIndices = [
    POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER,
    POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.RIGHT_ELBOW,
    POSE_LANDMARKS.LEFT_WRIST, POSE_LANDMARKS.RIGHT_WRIST,
    POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.RIGHT_HIP,
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
  
  // Use the straighter arm (the working arm)
  const workingElbow = Math.max(leftElbow, rightElbow);
  
  // Check elbow flare (how far elbow is from body - using wrist position relative to shoulder)
  const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
  const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
  const leftWrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];
  const rightWrist = landmarks[POSE_LANDMARKS.RIGHT_WRIST];
  
  const shoulderMidX = getAverage(leftShoulder.x, rightShoulder.x);
  const wristMidX = getAverage(leftWrist.x, rightWrist.x);
  const elbowFlare = Math.abs(wristMidX - shoulderMidX);
  
  details.torsoAngle = Math.round(torsoAngle);
  details.elbowAngle = Math.round(workingElbow);
  details.elbowFlare = Math.round(elbowFlare * 100);
  
  // Check torso (should be relatively flat/horizontal when lying)
  if (torsoAngle > FLOOR_PRESS_CRITERIA.torsoMaxDeviation) {
    feedback.push('Utrzymuj płaską pozycję tułowia');
    details.torsoOk = false;
  } else {
    details.torsoOk = true;
  }
  
  // Check elbow flare (keep at ~45°)
  if (elbowFlare > FLOOR_PRESS_CRITERIA.elbowFlareMax / 100) {
    feedback.push('Łokcie pod kątem 45° - nie rozchylaj');
    details.elbowFlareOk = false;
  } else {
    details.elbowFlareOk = true;
  }
  
  // Check shoulder stability (don't let shoulders drift)
  const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
  const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
  const shoulderHipDiff = Math.abs((leftShoulder.y + rightShoulder.y) / 2 - (leftHip.y + rightHip.y) / 2);
  
  if (shoulderHipDiff > 0.15) {
    feedback.push('Stabilizuj barki - nie pozwól im odjeżdżać');
    details.shouldersOk = false;
  } else {
    details.shouldersOk = true;
  }
  
  // Check elbow lockout at top
  if (workingElbow > FLOOR_PRESS_CRITERIA.maxElbowAngle) {
    feedback.push('Zablokuj łokieć na górze');
    details.lockoutOk = false;
  } else if (workingElbow < FLOOR_PRESS_CRITERIA.minElbowAngle) {
    details.lockoutOk = true;
  } else {
    details.lockoutOk = true;
  }
  
  // Calculate score
  let score = 100;
  if (!details.torsoOk) score -= 20;
  if (!details.elbowFlareOk) score -= 25;
  if (!details.shouldersOk) score -= 25;
  if (!details.lockoutOk) score -= 15;
  
  if (feedback.length === 0) {
    if (workingElbow < 90) {
      feedback.push('Mocne wyciśnięcie!');
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

export function detectKettleFloorPressRep(
  currentState: KettleFloorPressState,
  pose: Pose
): { newState: KettleFloorPressState; repCompleted: boolean } {
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
  
  const workingElbow = Math.max(leftElbow, rightElbow);
  
  // Check elbow flare
  const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
  const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
  const leftWrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];
  const rightWrist = landmarks[POSE_LANDMARKS.RIGHT_WRIST];
  const wristMidX = getAverage(leftWrist.x, rightWrist.x);
  const shoulderMidX = getAverage(leftShoulder.x, rightShoulder.x);
  const elbowFlare = Math.abs(wristMidX - shoulderMidX);
  
  const newState: KettleFloorPressState = {
    ...currentState,
    elbowAngle: workingElbow,
    torsoAngle,
    elbowFlare,
  };
  
  // Rep detection: chest -> overhead -> chest
  const isLockedOut = workingElbow < FLOOR_PRESS_CRITERIA.minElbowAngle;
  newState.isLockedOut = isLockedOut;
  
  const isAtChest = workingElbow > FLOOR_PRESS_CRITERIA.maxElbowAngle;
  
  switch (currentState.repState) {
    case 'down': // Chest position
      if (isLockedOut) {
        newState.repState = 'up';
      }
      break;
      
    case 'up': // Lockout position
      if (isAtChest) {
        newState.repState = 'down';
        newState.repCount = currentState.repCount + 1;
        return { newState, repCompleted: true };
      }
      break;
      
    case 'transition':
      if (isLockedOut) {
        newState.repState = 'up';
      } else if (isAtChest) {
        newState.repState = 'down';
      }
      break;
  }
  
  return { newState, repCompleted: false };
}

export function getInitialKettleFloorPressState(): KettleFloorPressState {
  return {
    repState: 'down',
    repCount: 0,
    elbowAngle: 180,
    torsoAngle: 0,
    elbowFlare: 0,
    isLockedOut: false,
  };
}
