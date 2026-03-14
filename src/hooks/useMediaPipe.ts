import { useEffect, useRef, useState, useCallback } from 'react';
import type { Pose } from '../types/pose';

// MediaPipe globals
declare global {
  interface Window {
    Pose: any;
  }
}

interface UseMediaPipeOptions {
  onResults: (pose: Pose) => void;
  onError?: (error: Error) => void;
}

interface UseMediaPipeReturn {
  isInitialized: boolean;
  isProcessing: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  processFrame: (video: HTMLVideoElement) => Promise<void>;
}

export function useMediaPipe(options: UseMediaPipeOptions): UseMediaPipeReturn {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const poseRef = useRef<any>(null);

  const initialize = useCallback(async () => {
    try {
      setError(null);
      
      // Wait for MediaPipe to load
      while (!window.Pose) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const pose = new window.Pose({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        }
      });
      
      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      
      pose.onResults((results: any) => {
        if (results.poseLandmarks) {
          const appPose: Pose = {
            landmarks: results.poseLandmarks.map((lm: any) => ({
              x: lm.x,
              y: lm.y,
              z: lm.z,
              visibility: lm.visibility,
            })),
          };
          options.onResults(appPose);
        }
      });
      
      poseRef.current = pose;
      setIsInitialized(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize MediaPipe';
      setError(errorMessage);
      options.onError?.(err as Error);
    }
  }, [options]);

  const processFrame = useCallback(async (video: HTMLVideoElement) => {
    if (!poseRef.current) return;
    
    setIsProcessing(true);
    try {
      await poseRef.current.send({ image: video });
    } catch (err) {
      console.error('Error processing frame:', err);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      poseRef.current?.close();
    };
  }, []);

  return {
    isInitialized,
    isProcessing,
    error,
    initialize,
    processFrame,
  };
}
