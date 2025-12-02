import React from 'react';
import { ParticleMode } from '../types';
import { WebcamController } from './WebcamController';

interface ControlsProps {
  currentMode: ParticleMode;
  setMode: (mode: ParticleMode) => void;
  onHandUpdate: (present: boolean, expansion: number) => void;
  handPresent: boolean;
  onSystemReady: () => void;
  isSystemReady: boolean;
}

const MODES = [
  { id: ParticleMode.SPHERE, label: 'Sphere', color: 'bg-blue-500' },
  { id: ParticleMode.CUBE, label: 'Cube', color: 'bg-purple-500' },
  { id: ParticleMode.VORTEX, label: 'Vortex', color: 'bg-orange-500' },
  { id: ParticleMode.WAVE, label: 'Wave', color: 'bg-teal-500' },
];

export const Controls: React.FC<ControlsProps> = ({ 
  currentMode, 
  setMode, 
  onHandUpdate,
  handPresent,
  onSystemReady,
  isSystemReady
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-10">
      {/* Header */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10 max-w-sm">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Particle Void
          </h1>
          <p className="text-sm text-gray-300 mt-2 leading-relaxed">
            {isSystemReady 
              ? "Show your hand to the camera. Open palm to expand, closed fist to contract."
              : "Initializing computer vision..."}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${handPresent ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-xs font-mono text-gray-400">
              {handPresent ? "HAND DETECTED" : "NO HAND DETECTED"}
            </span>
          </div>
        </div>

        <div className="pointer-events-auto">
           <WebcamController onUpdate={onHandUpdate} onReady={onSystemReady} />
        </div>
      </div>

      {/* Footer Controls */}
      <div className="flex justify-center pb-8 pointer-events-auto">
        <div className="bg-black/40 backdrop-blur-md p-2 rounded-2xl border border-white/10 flex gap-2">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`
                px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300
                ${currentMode === m.id 
                  ? `${m.color} text-white shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105` 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}
              `}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};