/**
 * Asset Model 3D Loader Component
 * 
 * Loads and renders GLB/GLTF 3D models from Supabase Storage
 */

import React, { Suspense } from 'react';
import { useGLTF } from '@react-three/drei';
import { Text } from '@react-three/drei';

interface AssetModel3DLoaderProps {
  modelUrl: string;
  position: [number, number, number];
  scale?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  status: 'operational' | 'maintenance' | 'critical' | 'offline';
  name: string;
  isSelected: boolean;
  onClick?: () => void;
}

function Model3DContent({ 
  modelUrl, 
  position, 
  scale = { x: 1, y: 1, z: 1 },
  rotation = { x: 0, y: 0, z: 0 },
  status,
  name,
  isSelected,
  onClick 
}: AssetModel3DLoaderProps) {
  const { scene } = useGLTF(modelUrl);
  
  // Clone scene to avoid reusing the same geometry
  const clonedScene = scene.clone();
  
  // Apply status-based color tint
  const statusColors = {
    operational: '#10b981',
    maintenance: '#f59e0b',
    critical: '#ef4444',
    offline: '#6b7280'
  };

  // Apply color tint to materials
  clonedScene.traverse((child: any) => {
    if (child.isMesh) {
      if (child.material) {
        child.material = child.material.clone();
        child.material.emissive?.setStyle(statusColors[status]);
        child.material.emissiveIntensity = 0.2;
      }
    }
  });

  return (
    <group
      position={position}
      scale={[scale.x, scale.y, scale.z]}
      rotation={[rotation.x, rotation.y, rotation.z]}
      onClick={onClick}
    >
      <primitive object={clonedScene} />
      
      {/* Asset name label */}
      <Text
        position={[0, 2, 0]}
        fontSize={0.25}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>

      {/* Selection indicator */}
      {isSelected && (
        <Text
          position={[0, 2.5, 0]}
          fontSize={0.4}
          color="#10b981"
          anchorX="center"
          anchorY="middle"
        >
          ▼ SELECTED
        </Text>
      )}
    </group>
  );
}

function LoadingFallback({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#666666" wireframe />
    </mesh>
  );
}

function ErrorFallback({ 
  position, 
  name, 
  status 
}: { 
  position: [number, number, number];
  name: string;
  status: string;
}) {
  const statusColors = {
    operational: '#10b981',
    maintenance: '#f59e0b',
    critical: '#ef4444',
    offline: '#6b7280'
  };

  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1, 1.5, 1]} />
        <meshStandardMaterial
          color={statusColors[status as keyof typeof statusColors] || '#6b7280'}
          metalness={0.5}
          roughness={0.5}
        />
      </mesh>
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.25}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
    </group>
  );
}

export function AssetModel3DLoader(props: AssetModel3DLoaderProps) {
  return (
    <Suspense fallback={<LoadingFallback position={props.position} />}>
      <ErrorBoundary fallback={<ErrorFallback position={props.position} name={props.name} status={props.status} />}>
        <Model3DContent {...props} />
      </ErrorBoundary>
    </Suspense>
  );
}

// Simple error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('3D Model loading error:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Preload models for better performance
useGLTF.preload = (url: string) => {
  useGLTF(url);
};
