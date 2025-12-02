import { FilesetResolver, HandLandmarker, DrawingUtils } from "@mediapipe/tasks-vision";

let handLandmarker: HandLandmarker | null = null;

export const initializeHandDetection = async (): Promise<HandLandmarker> => {
  if (handLandmarker) return handLandmarker;

  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );

  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
      delegate: "GPU"
    },
    runningMode: "VIDEO",
    numHands: 1
  });

  return handLandmarker;
};

// Calculate how "open" the hand is based on landmarks
// 0 = Fist, 1 = Flat Hand
export const calculateHandOpenness = (landmarks: any[]): number => {
  if (!landmarks || landmarks.length === 0) return 0;

  const wrist = landmarks[0];
  const tips = [4, 8, 12, 16, 20]; // Thumb, Index, Middle, Ring, Pinky tips
  const bases = [2, 5, 9, 13, 17]; // Corresponding bases/knuckles closest to palm

  let totalDistance = 0;
  let maxPossibleDistance = 0;

  tips.forEach((tipIdx, i) => {
    const tip = landmarks[tipIdx];
    const base = landmarks[bases[i]];
    
    // Calculate distance from tip to wrist
    const distToWrist = Math.sqrt(
      Math.pow(tip.x - wrist.x, 2) + 
      Math.pow(tip.y - wrist.y, 2)
    );

    totalDistance += distToWrist;
  });

  // Normalize: A heuristic value. 
  // Usually, in a closed fist, average dist to wrist is small (~0.1-0.2).
  // In an open hand, it's larger (~0.4-0.6).
  // We map roughly 0.2 -> 0.0 and 0.5 -> 1.0
  const minVal = 0.15;
  const maxVal = 0.55;
  
  // Average distance
  const avgDist = totalDistance / 5;
  
  let openness = (avgDist - minVal) / (maxVal - minVal);
  return Math.min(Math.max(openness, 0), 1);
};
