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
  const [zoom, setZoom] = useState(1);
  const poseRef = useRef<any>(null);

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + 0.2, 3);
    setZoom(newZoom);
    applyCameraZoom(newZoom);
  };
  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 0.2, 1);
    setZoom(newZoom);
    applyCameraZoom(newZoom);
  };
  const handleResetZoom = () => {
    setZoom(1);
    applyCameraZoom(1);
  };

  const applyCameraZoom = async (zoomLevel: number) => {
    const video = videoRef.current;
    if (!video || !video.srcObject) return;
    
    const stream = video.srcObject as MediaStream;
    const track = stream.getVideoTracks()[0];
    if (!track) return;

    const capabilities = track.getCapabilities() as any;
    if (capabilities.zoom) {
      try {
        const constraints: any = {
          advanced: [{ zoom: zoomLevel }]
        };
        await track.applyConstraints(constraints);
      } catch (err) {
        console.log('Hardware zoom not supported');
      }
    }
  };

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
    
    // Start camera with getUserMedia for zoom support
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        
        // Start pose detection loop
        const detectPose = async () => {
          if (poseRef.current && videoRef.current && videoRef.current.readyState >= 2) {
            await poseRef.current.send({ image: videoRef.current });
          }
          requestAnimationFrame(detectPose);
        };
        detectPose();
        
      } catch (err) {
        console.error('Camera error:', err);
        setError(t.cameraAccessError || 'Brak dostępu do kamery. Sprawdź uprawnienia.');
      }
    };
    
    startCamera();
    
    return () => {
      pose.close();
      // Stop all tracks
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
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
      
      {/* Video - real camera zoom, no CSS scaling */}
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
      
      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 bg-black/70 text-white rounded-full flex items-center justify-center hover:bg-black/90 transition-colors"
          title="Przybliż"
        >
          +
        </button>
        <button
          onClick={handleResetZoom}
          className="w-10 h-10 bg-black/70 text-white rounded-full flex items-center justify-center hover:bg-black/90 transition-colors text-xs"
          title="Reset zoom"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 bg-black/70 text-white rounded-full flex items-center justify-center hover:bg-black/90 transition-colors"
          title="Oddal"
        >
          −
        </button>
      </div>
      
      {/* Overlay instructions */}
      <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-2 rounded text-sm">
        Ustaw się tak, by być widocznym w całości
      </div>
    </div>
  );
}
