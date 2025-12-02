import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import { ParticleScene } from './components/ParticleScene';
import { Controls } from './components/Controls';
import { ParticleMode } from './types';

// Visual config for different modes
const MODE_COLORS = {
  [ParticleMode.SPHERE]: '#60a5fa', // Blue
  [ParticleMode.CUBE]: '#c084fc',   // Purple
  [ParticleMode.VORTEX]: '#fb923c', // Orange
  [ParticleMode.WAVE]: '#2dd4bf',   // Teal
};

const App: React.FC = () => {
  const [currentMode, setMode] = useState<ParticleMode>(ParticleMode.SPHERE);
  const [expansionFactor, setExpansionFactor] = useState(0.5);
  const [handPresent, setHandPresent] = useState(false);
  const [isSystemReady, setIsSystemReady] = useState(false);

  const handleHandUpdate = (present: boolean, expansion: number) => {
    setHandPresent(present);
    if (present) {
      setExpansionFactor(expansion);
    } else {
      // Default breathing idle animation target
      setExpansionFactor(0.3); 
    }
  };

  return (
    <div className="w-full h-screen bg-black relative">
      {/* 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 2]}>
          <Suspense fallback={null}>
            <color attach="background" args={['#050505']} />
            
            {/* Ambient Lighting */}
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            
            {/* Interactive Particles */}
            <ParticleScene 
              mode={currentMode} 
              expansionFactor={expansionFactor} 
              targetColor={MODE_COLORS[currentMode]}
            />
            
            {/* Background elements */}
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <Environment preset="city" /> 

            <OrbitControls 
              enableZoom={true} 
              enablePan={false} 
              autoRotate={!handPresent} 
              autoRotateSpeed={0.5}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* UI Overlay */}
      <Controls 
        currentMode={currentMode}
        setMode={setMode}
        onHandUpdate={handleHandUpdate}
        handPresent={handPresent}
        onSystemReady={() => setIsSystemReady(true)}
        isSystemReady={isSystemReady}
      />
      
      {/* Loading Overlay */}
      {!isSystemReady && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-blue-400 font-mono text-sm animate-pulse">INITIALIZING VISION ENGINE...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;