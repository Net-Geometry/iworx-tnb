/**
 * 3D Canvas Component for Digital Twin Demo
 * Handles the Three.js scene setup
 */

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera } from '@react-three/drei';
import { ReactNode } from 'react';

interface DemoCanvasProps {
  children: ReactNode;
}

export function DemoCanvas({ children }: DemoCanvasProps) {
  return (
    <div className="w-full h-[600px] bg-gradient-to-b from-slate-900 to-slate-800 rounded-lg overflow-hidden">
      <Canvas shadows>
        {/* Camera setup */}
        <PerspectiveCamera makeDefault position={[30, 25, 30]} fov={50} />

        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, 10, -10]} intensity={0.5} />

        {/* Grid floor */}
        <Grid
          args={[100, 100]}
          cellSize={2}
          cellThickness={0.5}
          cellColor="#3b82f6"
          sectionSize={10}
          sectionThickness={1}
          sectionColor="#1e40af"
          fadeDistance={100}
          fadeStrength={1}
          followCamera={false}
        />

        {/* Scene content */}
        {children}

        {/* Camera controls */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={10}
          maxDistance={100}
          maxPolarAngle={Math.PI / 2.1}
        />
      </Canvas>
    </div>
  );
}
