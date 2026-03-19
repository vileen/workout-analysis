import type { Pose, FormAnalysis, RepState } from '../types/pose';
import { POSE_LANDMARKS } from '../types/pose';
import { 
  calculateJointAngle,
  calculateTorsoAngle, 
  areAllVisible,
} from '../utils/math';

// Kettle overhead press criteria
const OVERHEAD_PRESS_CRITERIA = {
  minElbowAngle: 75,      // Full lockout at top
  maxElbowAngle: 160,     // Rack position at bottom
  torsoMaxDeviation: 12,  // Torso should stay vertical (no slouching)
  coreStability: 0.1,     // Max hip sway
  shoulderElevation: 0.15, // Don't shrug shoulders
};

export interface KettleOverheadPressState {
  repState: RepState;
  repCount: number;
  elbowAngle: number;
  torsoAngle: number;
  hipSway: number;
  isLockedOut: boolean;
}

export function analyzeKettleOverheadPress(pose: Pose): FormAnalysis {
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
  
  // Check torso (should be vertical - don't slouch)
  if (torsoAngle > OVERHEAD_PRESS_CRITERIA.torsoMaxDeviation) {
    feedback.push('Wyprostuj się! Nie garb się');
    details.torsoOk = false;
  } else {
    details.torsoOk = true;
  }
  
  // Check core stability
  if (hipSway > OVERHEAD_PRESS_CRITERIA.coreStability) {
    feedback.push('Napięty brzuch! Stabilizuj tułów');
    details.coreOk = false;
  } else {
    details.coreOk = true;
  }
  
  // Check elbow lockout at top
  if (workingElbow > OVERHEAD_PRESS_CRITERIA.maxElbowAngle) {
    feedback.push('Zablokuj łokieć na górze');
    details.lockoutOk = false;
  } else if (workingElbow < OVERHEAD_PRESS_CRITERIA.minElbowAngle) {
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

export function detectKettleOverheadPressRep(
  currentState: KettleOverheadPressState,
  pose: Pose
): { newState: KettleOverheadPressState; repCompleted: boolean } {
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
  
  const newState: KettleOverheadPressState = {
    ...currentState,
    elbowAngle: workingElbow,
    torsoAngle,
    hipSway,
  };
  
  // Rep detection: rack -> overhead -> rack
  const isLockedOut = workingElbow < OVERHEAD_PRESS_CRITERIA.minElbowAngle;
  newState.isLockedOut = isLockedOut;
  
  const isInRack = workingElbow > OVERHEAD_PRESS_CRITERIA.maxElbowAngle;
  
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

export function getInitialKettleOverheadPressState(): KettleOverheadPressState {
  return {
    repState: 'down',
    repCount: 0,
    elbowAngle: 180,
    torsoAngle: 0,
    hipSway: 0,
    isLockedOut: false,
  };
}
