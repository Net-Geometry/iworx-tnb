/**
 * Load Flow Particles Component
 * 
 * Animated particles showing electricity flow along power lines
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { type GridPowerLine, getLoadPercentageColor } from '../mock-data/mockGridData';
import * as THREE from 'three';

interface LoadFlowParticlesProps {
  line: GridPowerLine;
  particleCount?: number;
}

export function LoadFlowParticles({ line, particleCount = 8 }: LoadFlowParticlesProps) {
  const particlesRef = useRef<THREE.Group>(null);
  
  // Don't show particles for de-energized lines
  if (line.status !== 'energized') {
    return null;
  }

  const loadPercent = (line.current_load_mva / line.capacity_mva) * 100;
  const particleColor = getLoadPercentageColor(loadPercent);
  
  // Create curve from line path
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3(
      line.line_path.map(p => new THREE.Vector3(p[0], p[1], p[2]))
    );
  }, [line.line_path]);

  // Animation speed based on load
  const speed = loadPercent / 100 * 0.01;

  useFrame(({ clock }) => {
    if (!particlesRef.current) return;

    particlesRef.current.children.forEach((particle, index) => {
      const offset = index / particleCount;
      const t = ((clock.getElapsedTime() * speed + offset) % 1);
      const position = curve.getPoint(t);
      particle.position.copy(position);
    });
  });

  return (
    <group ref={particlesRef}>
      {Array.from({ length: particleCount }).map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshBasicMaterial
            color={particleColor}
            opacity={0.8}
            transparent
          />
        </mesh>
      ))}
    </group>
  );
}
