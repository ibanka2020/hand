export enum ParticleMode {
  SPHERE = 'SPHERE',
  CUBE = 'CUBE',
  VORTEX = 'VORTEX',
  WAVE = 'WAVE'
}

export interface HandTrackingState {
  isTracking: boolean;
  handPresent: boolean;
  expansionFactor: number; // 0 (closed) to 1 (open)
}

export interface VisualizationConfig {
  particleCount: number;
  color: string;
  size: number;
}