import type { Pose, FormAnalysis, RepState } from '../types/pose';
import { POSE_LANDMARKS } from '../types/pose';
import { 
  calculateJointAngle,
  calculateTorsoAngle, 
  areAllVisible,
  getAverage,
} from '../utils/math';

// Triceps extension criteria
const TRICEPS_EXTENSION_CRITERIA = {
  minElbowAngle: 35,      // Full bend at bottom
  maxElbowAngle: 165,     // Full extension at top
  torsoMaxDeviation: 15,  // Keep torso stable
  elbowDriftMax: 0.12,    // Don't let elbows drift outward
  coreStability: 0.1,     // Max hip sway
};

export interface TricepsExtensionState {
  repState: RepState;
  repCount: number;
  elbowAngle: number;
  torsoAngle: number;
  elbowDrift: number;
  isExtended: boolean;
}

export function analyzeTricepsExtension(pose: Pose): FormAnalysis {
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
  
  // Use the more bent elbow for triceps extension
  const workingElbow = Math.min(leftElbow, rightElbow);
  
  // Check elbow drift (how far elbows move from shoulder line)
  const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
  const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
  const leftElbowLandmark = landmarks[POSE_LANDMARKS.LEFT_ELBOW];
  const rightElbowLandmark = landmarks[POSE_LANDMARKS.RIGHT_ELBOW];
  
  const shoulderX = getAverage(leftShoulder.x, rightShoulder.x);
  const elbowX = getAverage(leftElbowLandmark.x, rightElbowLandmark.x);
  const elbowDrift = Math.abs(elbowX - shoulderX);
  
  // Check core stability
  const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
  const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
  const hipSway = Math.abs(leftHip.x - rightHip.x);
  
  details.torsoAngle = Math.round(torsoAngle);
  details.elbowAngle = Math.round(workingElbow);
  details.elbowDrift = Math.round(elbowDrift * 100);
  details.hipSway = Math.round(hipSway * 100);
  
  // Check torso stability
  if (torsoAngle > TRICEPS_EXTENSION_CRITERIA.torsoMaxDeviation) {
    feedback.push('Stabilny tułów! Napięty brzuch');
    details.torsoOk = false;
  } else {
    details.torsoOk = true;
  }
  
  // Check core stability
  if (hipSway > TRICEPS_EXTENSION_CRITERIA.coreStability) {
    feedback.push('Stabilizuj biodra - napięty core');
    details.coreOk = false;
  } else {
    details.coreOk = true;
  }
  
  // Check elbow drift (don't let elbows drift outward)
  if (elbowDrift > TRICEPS_EXTENSION_CRITERIA.elbowDriftMax) {
    feedback.push('Łokcie w miejscu! Nie rozchylaj na zewnątrz');
    details.elbowDriftOk = false;
  } else {
    details.elbowDriftOk = true;
  }
  
  // Check full extension at top
  if (workingElbow > 120 && workingElbow < TRICEPS_EXTENSION_CRITERIA.maxElbowAngle - 10) {
    feedback.push('Pełne wyprostowanie na górze');
    details.extensionOk = false;
  } else {
    details.extensionOk = true;
  }
  
  // Calculate score
  let score = 100;
  if (!details.torsoOk) score -= 20;
  if (!details.coreOk) score -= 20;
  if (!details.elbowDriftOk) score -= 30;
  if (!details.extensionOk) score -= 15;
  
  if (feedback.length === 0) {
    if (workingElbow > 150) {
      feedback.push('Mocne wyprostowanie!');
    } else if (workingElbow < 50) {
      feedback.push('Głębokie zgięcie!');
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

export function detectTricepsExtensionRep(
  currentState: TricepsExtensionState,
  pose: Pose
): { newState: TricepsExtensionState; repCompleted: boolean } {
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
  
  // Check elbow drift
  const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
  const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
  const leftElbowLandmark = landmarks[POSE_LANDMARKS.LEFT_ELBOW];
  const rightElbowLandmark = landmarks[POSE_LANDMARKS.RIGHT_ELBOW];
  const shoulderX = getAverage(leftShoulder.x, rightShoulder.x);
  const elbowX = getAverage(leftElbowLandmark.x, rightElbowLandmark.x);
  const elbowDrift = Math.abs(elbowX - shoulderX);
  
  const newState: TricepsExtensionState = {
    ...currentState,
    elbowAngle: workingElbow,
    torsoAngle,
    elbowDrift,
  };
  
  // Rep detection: extended -> bent -> extended
  const isExtended = workingElbow > TRICEPS_EXTENSION_CRITERIA.maxElbowAngle - 15;
  newState.isExtended = isExtended;
  
  const isBent = workingElbow < TRICEPS_EXTENSION_CRITERIA.minElbowAngle + 20;
  
  switch (currentState.repState) {
    case 'up': // Extended position (arms straight)
      if (isBent) {
        newState.repState = 'down';
      }
      break;
      
    case 'down': // Bent position (elbows bent)
      if (isExtended) {
        newState.repState = 'up';
        newState.repCount = currentState.repCount + 1;
        return { newState, repCompleted: true };
      }
      break;
      
    case 'transition':
      if (isBent) {
        newState.repState = 'down';
      } else if (isExtended) {
        newState.repState = 'up';
      }
      break;
  }
  
  return { newState, repCompleted: false };
}

export function getInitialTricepsExtensionState(): TricepsExtensionState {
  return {
    repState: 'up',
    repCount: 0,
    elbowAngle: 180,
    torsoAngle: 0,
    elbowDrift: 0,
    isExtended: true,
  };
}
