import type { Pose, FormAnalysis, RepState } from '../types/pose';
import { POSE_LANDMARKS } from '../types/pose';
import { 
  calculateJointAngle,
  calculateTorsoAngle, 
  areAllVisible,
} from '../utils/math';

// Kettle press criteria
const PRESS_CRITERIA = {
  minElbowAngle: 80,      // Full lockout at top
  maxElbowAngle: 160,     // Rack position at bottom
  torsoMaxDeviation: 10,  // Torso should stay vertical
  coreStability: 15,      // Max hip sway
};

export interface KettlePressState {
  repState: RepState;
  repCount: number;
  elbowAngle: number;
  torsoAngle: number;
  isLockedOut: boolean;
  coreSway: number;
}

export function analyzeKettlePress(pose: Pose): FormAnalysis {
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
  
  // Check core stability (hip sway)
  const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
  const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
  const hipSway = Math.abs(leftHip.x - rightHip.x);
  
  details.torsoAngle = Math.round(torsoAngle);
  details.elbowAngle = Math.round(workingElbow);
  details.hipSway = Math.round(hipSway * 100);
  
  // Check torso (should be vertical)
  if (torsoAngle > PRESS_CRITERIA.torsoMaxDeviation) {
    feedback.push('Pionowy tułów! Nie odchylaj się');
    details.torsoOk = false;
  } else {
    details.torsoOk = true;
  }
  
  // Check core stability
  if (hipSway > 0.1) {
    feedback.push('Stabilizuj biodra - napięty brzuch');
    details.coreOk = false;
  } else {
    details.coreOk = true;
  }
  
  // Check elbow lockout at top
  if (workingElbow > PRESS_CRITERIA.maxElbowAngle) {
    feedback.push('Zablokuj łokieć na górze');
    details.lockoutOk = false;
  } else if (workingElbow < PRESS_CRITERIA.minElbowAngle) {
    details.lockoutOk = true;
  } else {
    details.lockoutOk = true;
  }
  
  // Calculate score
  let score = 100;
  if (!details.torsoOk) score -= 30;
  if (!details.coreOk) score -= 25;
  if (!details.lockoutOk) score -= 20;
  
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

export function detectKettlePressRep(
  currentState: KettlePressState,
  pose: Pose
): { newState: KettlePressState; repCompleted: boolean } {
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
  
  const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
  const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
  const hipSway = Math.abs(leftHip.x - rightHip.x);
  
  const newState: KettlePressState = {
    ...currentState,
    elbowAngle: workingElbow,
    torsoAngle,
    coreSway: hipSway,
  };
  
  // Rep detection: rack -> overhead -> rack
  const isLockedOut = workingElbow < PRESS_CRITERIA.minElbowAngle;
  newState.isLockedOut = isLockedOut;
  
  const isInRack = workingElbow > PRESS_CRITERIA.maxElbowAngle;
  
  switch (currentState.repState) {
    case 'down': // Rack position
      if (isLockedOut) {
        newState.repState = 'up';
      }
      break;
      
    case 'up': // Lockout position
      if (isInRack) {
        newState.repState = 'down';
        newState.repCount = currentState.repCount + 1;
        return { newState, repCompleted: true };
      }
      break;
      
    case 'transition':
      if (isLockedOut) {
        newState.repState = 'up';
      } else if (isInRack) {
        newState.repState = 'down';
      }
      break;
  }
  
  return { newState, repCompleted: false };
}

export function getInitialKettlePressState(): KettlePressState {
  return {
    repState: 'down',
    repCount: 0,
    elbowAngle: 180,
    torsoAngle: 0,
    isLockedOut: false,
    coreSway: 0,
  };
}
