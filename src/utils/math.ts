import type { Landmark } from '../types/pose';
import { POSE_LANDMARKS } from '../types/pose';

/**
 * Calculate angle between three points (in degrees)
 * @param a First point (vertex)
 * @param b Middle point
 * @param c Third point
 * @returns Angle in degrees (0-180)
 */
export function calculateAngle(a: Landmark, b: Landmark, c: Landmark): number {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs(radians * (180 / Math.PI));
  
  if (angle > 180) {
    angle = 360 - angle;
  }
  
  return angle;
}

/**
 * Calculate angle at a specific joint using landmark indices
 */
export function calculateJointAngle(
  landmarks: Landmark[],
  point1Idx: number,
  point2Idx: number, // The joint (vertex)
  point3Idx: number
): number {
  const p1 = landmarks[point1Idx];
  const p2 = landmarks[point2Idx];
  const p3 = landmarks[point3Idx];
  
  if (!p1 || !p2 || !p3) return 0;
  
  return calculateAngle(p1, p2, p3);
}

/**
 * Get midpoint between two landmarks
 */
export function getMidpoint(a: Landmark, b: Landmark): Landmark {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    z: (a.z + b.z) / 2,
    visibility: Math.min(a.visibility || 1, b.visibility || 1),
  };
}

/**
 * Calculate distance between two points
 */
export function calculateDistance(a: Landmark, b: Landmark): number {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
}

/**
 * Check if landmark is visible (has good confidence)
 */
export function isVisible(landmark: Landmark | undefined, threshold = 0.5): boolean {
  return landmark !== undefined && (landmark.visibility ?? 1) > threshold;
}

/**
 * Check if all required landmarks are visible
 */
export function areAllVisible(landmarks: Landmark[], indices: number[], threshold = 0.5): boolean {
  return indices.every(idx => isVisible(landmarks[idx], threshold));
}

/**
 * Calculate body angle relative to vertical
 * Uses shoulder and hip to determine torso angle
 */
export function calculateTorsoAngle(landmarks: Landmark[]): number {
  const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
  const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
  const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
  const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
  
  if (!isVisible(leftShoulder) || !isVisible(rightShoulder) || 
      !isVisible(leftHip) || !isVisible(rightHip)) {
    return 0;
  }
  
  const shoulderMid = getMidpoint(leftShoulder, rightShoulder);
  const hipMid = getMidpoint(leftHip, rightHip);
  
  // Vertical reference point (same x, different y)
  const verticalRef = { x: shoulderMid.x, y: shoulderMid.y + 1, z: shoulderMid.z, visibility: 1 };
  
  return calculateAngle(verticalRef, shoulderMid, hipMid);
}

/**
 * Calculate knee angle for squat/deadlift analysis
 * @param side 'left' or 'right'
 */
export function calculateKneeAngle(landmarks: Landmark[], side: 'left' | 'right'): number {
  const hip = side === 'left' ? POSE_LANDMARKS.LEFT_HIP : POSE_LANDMARKS.RIGHT_HIP;
  const knee = side === 'left' ? POSE_LANDMARKS.LEFT_KNEE : POSE_LANDMARKS.RIGHT_KNEE;
  const ankle = side === 'left' ? POSE_LANDMARKS.LEFT_ANKLE : POSE_LANDMARKS.RIGHT_ANKLE;
  
  return calculateJointAngle(landmarks, hip, knee, ankle);
}

/**
 * Calculate elbow angle for pushup analysis
 * @param side 'left' or 'right'
 */
export function calculateElbowAngle(landmarks: Landmark[], side: 'left' | 'right'): number {
  const shoulder = side === 'left' ? POSE_LANDMARKS.LEFT_SHOULDER : POSE_LANDMARKS.RIGHT_SHOULDER;
  const elbow = side === 'left' ? POSE_LANDMARKS.LEFT_ELBOW : POSE_LANDMARKS.RIGHT_ELBOW;
  const wrist = side === 'left' ? POSE_LANDMARKS.LEFT_WRIST : POSE_LANDMARKS.RIGHT_WRIST;
  
  return calculateJointAngle(landmarks, shoulder, elbow, wrist);
}

/**
 * Get average of left and right values
 */
export function getAverage(left: number, right: number): number {
  return (left + right) / 2;
}

/**
 * Check symmetry between left and right sides
 * @returns difference (0 = perfect symmetry)
 */
export function checkSymmetry(left: number, right: number): number {
  return Math.abs(left - right);
}
