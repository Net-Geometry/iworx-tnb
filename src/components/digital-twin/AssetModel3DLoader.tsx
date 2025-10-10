/**
 * Asset Model 3D Loader Component
 * 
 * Loads and renders GLB/GLTF 3D models from Supabase Storage
 */

import React, { Suspense, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Box3, Vector3 } from 'three';

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
  const ringRef = useRef<any>();
  
  // Clone scene to avoid reusing the same geometry
  const clonedScene = scene.clone();
  
  // Calculate bounding box for dynamic positioning
  const boundingBox = new Box3().setFromObject(clonedScene);
  const size = new Vector3();
  boundingBox.getSize(size);
  
  // Get center point of the model
  const center = new Vector3();
  boundingBox.getCenter(center);
  
  const modelWidth = size.x || 1;
  const modelHeight = size.y || 1;
  const modelDepth = size.z || 1;
  
  // Get actual min/max Y positions (handles any pivot point)
  const minY = boundingBox.min.y;
  const maxY = boundingBox.max.y;
  
  // Dynamic dimensions using actual bounding box edges
  const projectionRadius = Math.max(modelWidth, modelDepth) * 0.7;
  const projectionYPosition = minY - 0.05;  // Just below the model
  const textYPosition = maxY + 0.5;   // Above actual top
  const textFontSize = Math.max(0.2, Math.min(0.5, modelWidth * 0.15));
  const selectionYPosition = maxY + 1.0;  // Above text
  
  // Status colors for ring indicator
  const statusColors = {
    operational: '#10b981',
    maintenance: '#f59e0b',
    critical: '#ef4444',
    offline: '#6b7280'
  };

  // Animate pulsing effect
  useFrame((state) => {
    if (ringRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 0.9;
      ringRef.current.material.opacity = pulse * 0.4;
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
      
      {/* Ground projection circle indicator */}
      <mesh ref={ringRef} position={[center.x, projectionYPosition, center.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[projectionRadius, 64]} />
        <meshBasicMaterial 
          color={statusColors[status]} 
          transparent
          opacity={0.3}
          depthWrite={false}
        />
      </mesh>
      
      {/* Asset name label */}
      <Text
        position={[center.x, textYPosition, center.z]}
        fontSize={textFontSize}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>

      {/* Selection indicator */}
      {isSelected && (
        <Text
          position={[center.x, selectionYPosition, center.z]}
          fontSize={textFontSize * 1.6}
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
