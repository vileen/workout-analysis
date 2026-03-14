import { useEffect, useRef, useState, useCallback } from 'react';
import { Pose, Landmark } from '../types/pose';

// MediaPipe types (will be imported dynamically)
type PoseLandmarker = {
  setOptions: (options: unknown) => void;
  detectForVideo: (video: HTMLVideoElement, timestamp: number) => {
    landmarks: Landmark[][];
    worldLandmarks: Landmark[][];
  };
  close: () => void;
};

type FilesetResolver = {
  forVisionTasks: (path: string) => Promise<unknown>;
};

type PoseLandmarkerClass = {
  createFromOptions: (
    filesetResolver: unknown,
    options: unknown
  ) => Promise<PoseLandmarker>;
};

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
  
  const poseRef = useRef<PoseLandmarker | null>(null);
  const lastVideoTimeRef = useRef(-1);

  const initialize = useCallback(async () => {
    try {
      setError(null);
      
      // Dynamic import for MediaPipe (browser-only)
      const vision = await import('@mediapipe/tasks-vision');
      const { PoseLandmarker, FilesetResolver } = vision as {
        PoseLandmarker: PoseLandmarkerClass;
        FilesetResolver: FilesetResolver;
      };
      
      const filesetResolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
      );
      
      const pose = await PoseLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
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
    if (!poseRef.current || video.currentTime === lastVideoTimeRef.current) {
      return;
    }
    
    lastVideoTimeRef.current = video.currentTime;
    setIsProcessing(true);
    
    try {
      const results = poseRef.current.detectForVideo(video, performance.now());
      
      if (results.landmarks && results.landmarks.length > 0) {
        const pose: Pose = {
          landmarks: results.landmarks[0],
          worldLandmarks: results.worldLandmarks?.[0],
        };
        options.onResults(pose);
      }
    } catch (err) {
      console.error('Error processing frame:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [options]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      poseRef.current?.close();
      poseRef.current = null;
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
