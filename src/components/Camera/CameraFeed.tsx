import { useRef, useEffect, useState, useCallback } from 'react';
import { useMediaPipe } from '../../hooks/useMediaPipe';
import { Pose } from '../../types/pose';
import { PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';

interface CameraFeedProps {
  onPoseDetected: (pose: Pose) => void;
  isActive: boolean;
  showSkeleton?: boolean;
}

export function CameraFeed({ onPoseDetected, isActive, showSkeleton = true }: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const poseRef = useRef<PoseLandmarker | null>(null);
  const animationRef = useRef<number>();
  const lastVideoTimeRef = useRef(-1);

  // Initialize MediaPipe
  useEffect(() => {
    const initializePose = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
        );
        
        const pose = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
        });
        
        poseRef.current = pose;
        setIsLoading(false);
      } catch (err) {
        setError('Nie udało się załadować MediaPipe. Spróbuj odświeżyć stronę.');
        setIsLoading(false);
      }
    };

    initializePose();

    return () => {
      poseRef.current?.close();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Start camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError('Brak dostępu do kamery. Upewnij się, że dałeś pozwolenie.');
      }
    };

    startCamera();

    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  // Process frames
  const processFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const pose = poseRef.current;
    
    if (!video || !canvas || !pose || video.paused || video.ended) {
      animationRef.current = requestAnimationFrame(processFrame);
      return;
    }

    if (video.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = video.currentTime;
      
      const results = pose.detectForVideo(video, performance.now());
      
      if (results.landmarks && results.landmarks.length > 0) {
        const landmarks = results.landmarks[0];
        
        onPoseDetected({
          landmarks,
          worldLandmarks: results.worldLandmarks?.[0],
        });
        
        // Draw skeleton
        if (showSkeleton) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const drawingUtils = new DrawingUtils(ctx);
            drawingUtils.drawLandmarks(landmarks, {
              radius: 4,
              color: '#00FF00',
            });
            drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, {
              color: '#00FF00',
              lineWidth: 2,
            });
          }
        }
      }
    }
    
    animationRef.current = requestAnimationFrame(processFrame);
  }, [onPoseDetected, showSkeleton]);

  // Start/stop frame processing
  useEffect(() => {
    if (isActive && !isLoading) {
      animationRef.current = requestAnimationFrame(processFrame);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, isLoading, processFrame]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-red-900/20 rounded-lg p-8">
        <p className="text-red-400 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <p className="text-white">Ładowanie modelu AI...</p>
        </div>
      )}
      
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        playsInline
        muted
      />
      
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: 'scaleX(-1)' }} // Mirror effect
      />
      
      {/* Overlay instructions */}
      <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-2 rounded text-sm">
        Ustaw się tak, by być widocznym w całości
      </div>
    </div>
  );
}
