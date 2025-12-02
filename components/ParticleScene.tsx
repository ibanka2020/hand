import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ParticleMode } from '../types';

interface ParticleSceneProps {
  mode: ParticleMode;
  expansionFactor: number; // 0 to 1 target
  targetColor: string;
}

const COUNT = 8000;

export const ParticleScene: React.FC<ParticleSceneProps> = ({ mode, expansionFactor, targetColor }) => {
  const meshRef = useRef<THREE.Points>(null);
  
  // We use references for animation smoothing (lerping)
  const currentExpansion = useRef(0);
  const currentModeTime = useRef(0);
  const hoverTime = useRef(0);

  // Generate initial random positions
  const { positions, randoms, colors } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const rnd = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);
    const colorObj = new THREE.Color(targetColor);

    for (let i = 0; i < COUNT; i++) {
      // Sphere distribution for init
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const r = Math.pow(Math.random(), 1/3) * 2; // Bias towards surface

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      rnd[i * 3] = Math.random(); // speed factor
      rnd[i * 3 + 1] = Math.random(); // offset factor
      rnd[i * 3 + 2] = Math.random(); // noise factor

      col[i * 3] = colorObj.r;
      col[i * 3 + 1] = colorObj.g;
      col[i * 3 + 2] = colorObj.b;
    }
    return { positions: pos, randoms: rnd, colors: col };
  }, [targetColor]);

  // Create a buffer geometry
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [positions, randoms, colors]);

  // Update color dynamically when prop changes
  useEffect(() => {
    if (!meshRef.current) return;
    const colorObj = new THREE.Color(targetColor);
    const colorsAttr = meshRef.current.geometry.attributes.color;
    for (let i = 0; i < COUNT; i++) {
        // slight randomization for depth
        const variance = (Math.random() - 0.5) * 0.1;
        colorsAttr.setXYZ(i, colorObj.r + variance, colorObj.g + variance, colorObj.b + variance);
    }
    colorsAttr.needsUpdate = true;
  }, [targetColor]);


  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Smoothly interpolate expansion factor (hand movement)
    // If hand is closed (0), we might want a minimum "breathing" size of 0.2
    // If hand is open (1), we go to 1.0 or higher
    const target = 0.2 + (expansionFactor * 2.5); 
    currentExpansion.current = THREE.MathUtils.lerp(currentExpansion.current, target, delta * 5);
    
    currentModeTime.current += delta;
    hoverTime.current += delta * 0.2;

    const positionsAttr = meshRef.current.geometry.attributes.position;
    const randomsAttr = meshRef.current.geometry.attributes.aRandom;
    
    const count = positionsAttr.count;
    const time = state.clock.getElapsedTime();
    const exp = currentExpansion.current;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      
      // Original random seed values
      const rndX = randomsAttr.array[idx];
      const rndY = randomsAttr.array[idx + 1];
      const rndZ = randomsAttr.array[idx + 2];

      // Base oscillation for "alive" feel
      const oscillation = Math.sin(time * (0.5 + rndX) + rndY * 10) * 0.1;

      let x = 0, y = 0, z = 0;

      // Mode Logic - Calculates Target Position
      if (mode === ParticleMode.SPHERE) {
        // Base Sphere Shape
        const theta = rndX * Math.PI * 2;
        const phi = Math.acos((2 * rndY) - 1);
        const radius = 2 * exp + oscillation;

        x = radius * Math.sin(phi) * Math.cos(theta);
        y = radius * Math.sin(phi) * Math.sin(theta);
        z = radius * Math.cos(phi);

      } else if (mode === ParticleMode.CUBE) {
        // Cubic Lattice / Cloud
        const size = 3 * exp;
        x = (rndX - 0.5) * size * 2 + Math.sin(time + i) * 0.1;
        y = (rndY - 0.5) * size * 2 + Math.cos(time + i) * 0.1;
        z = (rndZ - 0.5) * size * 2;

      } else if (mode === ParticleMode.VORTEX) {
        // Spiral Vortex
        const angle = rndX * Math.PI * 2 + (time * 0.5 * (1 + rndY));
        const radius = (rndZ * 4) * exp;
        const height = (rndY - 0.5) * 5 * exp;

        x = radius * Math.cos(angle);
        z = radius * Math.sin(angle);
        y = height + Math.sin(time + radius) * 0.2;
        
      } else if (mode === ParticleMode.WAVE) {
        // Sine Wave Plane
        const spread = 8 * exp;
        x = (rndX - 0.5) * spread;
        z = (rndY - 0.5) * spread;
        // Wave height based on X position and time
        y = Math.sin(x * 0.5 + time * 2) * Math.cos(z * 0.5 + time) * exp * 1.5;
      }

      // Apply updates
      positionsAttr.array[idx] = x;
      positionsAttr.array[idx + 1] = y;
      positionsAttr.array[idx + 2] = z;
    }

    positionsAttr.needsUpdate = true;
    
    // Rotate entire mesh slightly
    meshRef.current.rotation.y = time * 0.05;
  });

  return (
    <points ref={meshRef} geometry={geometry}>
      <pointsMaterial
        size={0.06}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};