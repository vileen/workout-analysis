import { useRef, useEffect, useState } from 'react';
import type { Pose as AppPose } from '../../types/pose';
import { useTranslation } from '../../i18n';

// MediaPipe globals
declare global {
  interface Window {
    Pose: any;
    Camera: any;
    drawConnectors: any;
    drawLandmarks: any;
    POSE_CONNECTIONS: any;
  }
}

interface CameraFeedProps {
  onPoseDetected: (pose: AppPose) => void;
  isActive?: boolean; // Kept for API compatibility, but camera always runs
  showSkeleton?: boolean;
}

export function CameraFeed({ onPoseDetected, showSkeleton = true }: CameraFeedProps) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const poseRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);

  // Load MediaPipe scripts
  useEffect(() => {
    const loadScripts = async () => {
      const scripts = [
        'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js',
        'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
        'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
      ];
      
      for (const src of scripts) {
        if (!document.querySelector(`script[src="${src}"]`)) {
          const script = document.createElement('script');
          script.src = src;
          script.crossOrigin = 'anonymous';
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }
      }
      
      setIsLoading(false);
    };
    
    loadScripts().catch(() => {
      setError(t.cameraAccessError);
      setIsLoading(false);
    });
  }, []);

  // Initialize pose detection
  useEffect(() => {
    if (isLoading || !window.Pose || !videoRef.current) return;
    
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
        const appPose: AppPose = {
          landmarks: results.poseLandmarks.map((lm: any) => ({
            x: lm.x,
            y: lm.y,
            z: lm.z,
            visibility: lm.visibility,
          })),
        };
        
        onPoseDetected(appPose);
        
        // Draw skeleton
        if (showSkeleton && canvasRef.current && window.drawConnectors) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (ctx && videoRef.current) {
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            
            ctx.save();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.scale(-1, 1);
            ctx.translate(-canvas.width, 0);
            
            window.drawConnectors(ctx, results.poseLandmarks, window.POSE_CONNECTIONS, {
              color: '#00FF00',
              lineWidth: 2,
            });
            window.drawLandmarks(ctx, results.poseLandmarks, {
              color: '#00FF00',
              lineWidth: 1,
              radius: 3,
            });
            
            ctx.restore();
          }
        }
      }
    });
    
    poseRef.current = pose;
    
    // Start camera immediately - don't wait for isActive
    if (window.Camera) {
      const camera = new window.Camera(videoRef.current, {
        onFrame: async () => {
          // Always process frames, let parent component decide if active
          if (poseRef.current && videoRef.current) {
            await poseRef.current.send({ image: videoRef.current });
          }
        },
        width: 1280,
        height: 720,
      });
      
      cameraRef.current = camera;
      camera.start().catch((err: any) => {
        console.error('Camera error:', err);
        setError(t.cameraAccessError || 'Brak dostępu do kamery. Sprawdź uprawnienia.');
      });
    }
    
    return () => {
      pose.close();
      cameraRef.current?.stop();
    };
  }, [isLoading, onPoseDetected, showSkeleton, t]);

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
        style={{ transform: 'scaleX(-1)' }}
        playsInline
      />
      
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: 'scaleX(-1)' }}
      />
      
      {/* Overlay instructions */}
      <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-2 rounded text-sm">
        Ustaw się tak, by być widocznym w całości
      </div>
    </div>
  );
}
