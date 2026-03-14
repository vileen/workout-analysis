import { Pose, FormAnalysis, RepState, POSE_LANDMARKS } from '../types/pose';
import { 
  calculateJointAngle,
  calculateTorsoAngle, 
  areAllVisible,
} from '../utils/math';

// Kettle swing criteria
const SWING_CRITERIA = {
  minHipHinge: 45,        // Hip hinge minimum (torso forward)
  maxHipHinge: 15,        // Hip hinge at top (torso upright)
  armExtension: 160,      // Arms should be straight
  minKneeBend: 120,       // "Soft knees" - not too bent
  maxKneeBend: 160,       // But not locked
};

export interface KettleSwingState {
  repState: RepState;
  repCount: number;
  hipAngle: number;
  torsoAngle: number;
  armAngle: number;
  kneeAngle: number;
  isAtTop: boolean;
}

export function analyzeKettleSwing(pose: Pose): FormAnalysis {
  const { landmarks } = pose;
  const feedback: string[] = [];
  const details: Record<string, number | boolean> = {};
  
  // Check visibility
  const requiredIndices = [
    POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.RIGHT_HIP,
    POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER,
    POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.RIGHT_ELBOW,
    POSE_LANDMARKS.LEFT_WRIST, POSE_LANDMARKS.RIGHT_WRIST,
    POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.RIGHT_KNEE,
    POSE_LANDMARKS.LEFT_ANKLE, POSE_LANDMARKS.RIGHT_ANKLE,
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
  
  // Hip hinge (shoulder-hip-knee)
  const shoulderHipKnee = calculateJointAngle(
    landmarks,
    POSE_LANDMARKS.LEFT_SHOULDER,
    POSE_LANDMARKS.LEFT_HIP,
    POSE_LANDMARKS.LEFT_KNEE
  );
  
  // Arm angle (shoulder-elbow-wrist)
  const armAngle = calculateJointAngle(
    landmarks,
    POSE_LANDMARKS.LEFT_SHOULDER,
    POSE_LANDMARKS.LEFT_ELBOW,
    POSE_LANDMARKS.LEFT_WRIST
  );
  
  // Knee angle
  const kneeAngle = calculateJointAngle(
    landmarks,
    POSE_LANDMARKS.LEFT_HIP,
    POSE_LANDMARKS.LEFT_KNEE,
    POSE_LANDMARKS.LEFT_ANKLE
  );
  
  details.torsoAngle = Math.round(torsoAngle);
  details.hipHinge = Math.round(shoulderHipKnee);
  details.armAngle = Math.round(armAngle);
  details.kneeAngle = Math.round(kneeAngle);
  
  // Check hip hinge (power comes from hips)
  if (shoulderHipKnee < SWING_CRITERIA.minHipHinge) {
    feedback.push('Większy hinge z bioder!');
    details.hingeOk = false;
  } else {
    details.hingeOk = true;
  }
  
  // Check arm extension (arms are ropes)
  if (armAngle < SWING_CRITERIA.armExtension) {
    feedback.push('Proste ramiona! Nie ciągnij kettle');
    details.armsOk = false;
  } else {
    details.armsOk = true;
  }
  
  // Check knee bend (soft knees, not squat)
  if (kneeAngle < SWING_CRITERIA.minKneeBend) {
    feedback.push('Za dużo kolan - to nie przysiad!');
    details.kneesOk = false;
  } else if (kneeAngle > SWING_CRITERIA.maxKneeBend) {
    feedback.push('Lekko ugnij kolana');
    details.kneesOk = false;
  } else {
    details.kneesOk = true;
  }
  
  // Calculate score
  let score = 100;
  if (!details.hingeOk) score -= 30;
  if (!details.armsOk) score -= 30;
  if (!details.kneesOk) score -= 25;
  
  if (feedback.length === 0) {
    feedback.push('Mocny wymach!');
  }
  
  return {
    isValid: score >= 70,
    score: Math.max(0, score),
    feedback,
    details,
  };
}

export function detectKettleSwingRep(
  currentState: KettleSwingState,
  pose: Pose
): { newState: KettleSwingState; repCompleted: boolean } {
  const { landmarks } = pose;
  
  const torsoAngle = calculateTorsoAngle(landmarks);
  const shoulderHipKnee = calculateJointAngle(
    landmarks,
    POSE_LANDMARKS.LEFT_SHOULDER,
    POSE_LANDMARKS.LEFT_HIP,
    POSE_LANDMARKS.LEFT_KNEE
  );
  const armAngle = calculateJointAngle(
    landmarks,
    POSE_LANDMARKS.LEFT_SHOULDER,
    POSE_LANDMARKS.LEFT_ELBOW,
    POSE_LANDMARKS.LEFT_WRIST
  );
  const kneeAngle = calculateJointAngle(
    landmarks,
    POSE_LANDMARKS.LEFT_HIP,
    POSE_LANDMARKS.LEFT_KNEE,
    POSE_LANDMARKS.LEFT_ANKLE
  );
  
  const newState: KettleSwingState = {
    ...currentState,
    torsoAngle,
    hipAngle: shoulderHipKnee,
    armAngle,
    kneeAngle,
  };
  
  // At top: torso upright (small angle), arms extended
  const isAtTop = torsoAngle < SWING_CRITERIA.maxHipHinge && armAngle > 150;
  newState.isAtTop = isAtTop;
  
  // At bottom: big hip hinge, arms reaching between legs
  const isAtBottom = shoulderHipKnee > SWING_CRITERIA.minHipHinge;
  
  // State machine for swing
  switch (currentState.repState) {
    case 'up':
      if (isAtBottom) {
        newState.repState = 'down';
      }
      break;
      
    case 'down':
      if (isAtTop) {
        newState.repState = 'up';
        newState.repCount = currentState.repCount + 1;
        return { newState, repCompleted: true };
      }
      break;
      
    case 'transition':
      if (isAtBottom) {
        newState.repState = 'down';
      } else if (isAtTop) {
        newState.repState = 'up';
      }
      break;
  }
  
  return { newState, repCompleted: false };
}

export function getInitialKettleSwingState(): KettleSwingState {
  return {
    repState: 'up',
    repCount: 0,
    hipAngle: 0,
    torsoAngle: 0,
    armAngle: 180,
    kneeAngle: 160,
    isAtTop: true,
  };
}
