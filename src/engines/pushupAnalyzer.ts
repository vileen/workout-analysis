import type { Pose, FormAnalysis, RepState } from '../types/pose';
import { POSE_LANDMARKS } from '../types/pose';
import { 
  calculateJointAngle,
  areAllVisible,
  getAverage,
  checkSymmetry,
} from '../utils/math';

// Push-up criteria
const PUSHUP_CRITERIA = {
  minElbowAngle: 80,      // Bottom position (elbows bent)
  maxElbowAngle: 165,     // Top position (elbows extended)
  maxTorsoDeviation: 20,  // Body should be in straight line
  minElbowTuck: 30,       // Elbows should stay close to body
  maxElbowFlare: 75,      // Don't flare elbows too wide
  symmetryThreshold: 15,  // Max difference between left/right
};

export interface PushupState {
  repState: RepState;
  repCount: number;
  elbowAngle: number;
  torsoAngle: number;
  bodyLineDeviation: number;
  symmetryScore: number;
  isAtBottom: boolean;
}

export function analyzePushup(pose: Pose): FormAnalysis {
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
  const avgElbow = getAverage(leftElbow, rightElbow);
  const symmetry = checkSymmetry(leftElbow, rightElbow);
  
  // Calculate body line (shoulder-hip-ankle should be straight)
  const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
  const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
  const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
  const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
  const leftAnkle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];
  const rightAnkle = landmarks[POSE_LANDMARKS.RIGHT_ANKLE];
  
  const shoulderY = getAverage(leftShoulder.y, rightShoulder.y);
  const hipY = getAverage(leftHip.y, rightHip.y);
  const ankleY = getAverage(leftAnkle.y, rightAnkle.y);
  
  // Check if body is in a straight line (deviation from straight line)
  const expectedHipY = getAverage(shoulderY, ankleY);
  const bodyLineDeviation = Math.abs(hipY - expectedHipY);
  
  // Check elbow tuck (using shoulder-elbow angle relative to body)
  const elbowFlare = Math.abs(leftElbow - rightElbow) / 2;
  
  details.elbowAngle = Math.round(avgElbow);
  details.symmetry = Math.round(symmetry);
  details.bodyLine = Math.round(bodyLineDeviation * 100);
  details.elbowFlare = Math.round(elbowFlare);
  
  // Check body line (keep straight)
  if (bodyLineDeviation > 0.08) {
    if (hipY < expectedHipY) {
      feedback.push('Nie wypinaj bioder! Ciało w linii');
    } else {
      feedback.push('Nie opadaj w biodrach! Ciało w linii');
    }
    details.bodyLineOk = false;
  } else {
    details.bodyLineOk = true;
  }
  
  // Check elbow position (close to torso)
  if (avgElbow > PUSHUP_CRITERIA.maxElbowFlare) {
    feedback.push('Łokcie przy tułowiu! Nie rozchylaj');
    details.elbowTuckOk = false;
  } else {
    details.elbowTuckOk = true;
  }
  
  // Check symmetry
  if (symmetry > PUSHUP_CRITERIA.symmetryThreshold) {
    feedback.push('Nierówno! Lewa i prawa strona');
    details.symmetryOk = false;
  } else {
    details.symmetryOk = true;
  }
  
  // Check depth
  if (avgElbow < PUSHUP_CRITERIA.minElbowAngle + 10 && avgElbow > PUSHUP_CRITERIA.minElbowAngle) {
    feedback.push('Głębiej! Pełne powtórzenie');
    details.depthOk = false;
  } else {
    details.depthOk = true;
  }
  
  // Calculate score
  let score = 100;
  if (!details.bodyLineOk) score -= 30;
  if (!details.elbowTuckOk) score -= 20;
  if (!details.symmetryOk) score -= 20;
  if (!details.depthOk) score -= 15;
  
  if (feedback.length === 0) {
    if (avgElbow < 100) {
      feedback.push('Świetna forma!');
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

export function detectPushupRep(
  currentState: PushupState,
  pose: Pose
): { newState: PushupState; repCompleted: boolean } {
  const { landmarks } = pose;
  
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
  const avgElbow = getAverage(leftElbow, rightElbow);
  const symmetry = checkSymmetry(leftElbow, rightElbow);
  
  // Calculate body line deviation
  const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
  const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
  const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
  const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
  const leftAnkle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];
  const rightAnkle = landmarks[POSE_LANDMARKS.RIGHT_ANKLE];
  
  const shoulderY = getAverage(leftShoulder.y, rightShoulder.y);
  const hipY = getAverage(leftHip.y, rightHip.y);
  const ankleY = getAverage(leftAnkle.y, rightAnkle.y);
  const expectedHipY = getAverage(shoulderY, ankleY);
  const bodyLineDeviation = Math.abs(hipY - expectedHipY);
  
  const newState: PushupState = {
    ...currentState,
    elbowAngle: avgElbow,
    bodyLineDeviation,
    symmetryScore: 100 - symmetry,
  };
  
  // Rep detection: top -> bottom -> top
  const isAtBottom = avgElbow < PUSHUP_CRITERIA.minElbowAngle + 10;
  newState.isAtBottom = isAtBottom;
  
  const isAtTop = avgElbow > PUSHUP_CRITERIA.maxElbowAngle - 10;
  
  switch (currentState.repState) {
    case 'up': // Top position
      if (isAtBottom) {
        newState.repState = 'down';
      }
      break;
      
    case 'down': // Bottom position
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

export function getInitialPushupState(): PushupState {
  return {
    repState: 'up',
    repCount: 0,
    elbowAngle: 180,
    torsoAngle: 0,
    bodyLineDeviation: 0,
    symmetryScore: 100,
    isAtBottom: false,
  };
}
