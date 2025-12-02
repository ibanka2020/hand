import React, { useEffect, useRef, useState } from 'react';
import { initializeHandDetection, calculateHandOpenness } from '../services/visionService';

interface WebcamControllerProps {
  onUpdate: (presence: boolean, expansion: number) => void;
  onReady: () => void;
}

export const WebcamController: React.FC<WebcamControllerProps> = ({ onUpdate, onReady }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef<number>();
  const lastVideoTime = useRef<number>(-1);

  useEffect(() => {
    let isMounted = true;

    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: 320, 
            height: 240,
            facingMode: 'user'
          } 
        });
        
        if (videoRef.current && isMounted) {
          videoRef.current.srcObject = stream;
          await new Promise((resolve) => {
            if (videoRef.current) {
              videoRef.current.onloadeddata = resolve;
            }
          });
          videoRef.current.play();
          startDetection();
        }
      } catch (err) {
        console.error(err);
        setError("Camera access denied or unavailable.");
      }
    };

    const startDetection = async () => {
      const handLandmarker = await initializeHandDetection();
      onReady();

      const predict = () => {
        if (videoRef.current && videoRef.current.currentTime !== lastVideoTime.current) {
          lastVideoTime.current = videoRef.current.currentTime;
          const startTimeMs = performance.now();
          
          const result = handLandmarker.detectForVideo(videoRef.current, startTimeMs);

          if (result.landmarks && result.landmarks.length > 0) {
            const openness = calculateHandOpenness(result.landmarks[0]);
            onUpdate(true, openness);
          } else {
            onUpdate(false, 0);
          }
        }
        requestRef.current = requestAnimationFrame(predict);
      };

      requestRef.current = requestAnimationFrame(predict);
    };

    setupCamera();

    return () => {
      isMounted = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return <div className="text-red-500 text-xs p-2">{error}</div>;
  }

  return (
    <div className="relative overflow-hidden rounded-lg border border-white/20 shadow-lg bg-black/50 backdrop-blur-sm">
      <video
        ref={videoRef}
        className="w-32 h-24 object-cover transform -scale-x-100"
        playsInline
        muted
      />
      <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/60 rounded text-[10px] text-white/80 font-mono">
        VISION
      </div>
    </div>
  );
};