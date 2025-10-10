/**
 * 3D Model Component for Switchgear
 * Uses basic Three.js box geometry
 */

import { useRef } from 'react';
import { Mesh } from 'three';
import { Text } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';

interface DemoSwitchgear3DProps {
  position: [number, number, number];
  status: 'operational' | 'maintenance' | 'critical' | 'offline';
  name: string;
  onClick?: () => void;
  editMode?: boolean;
  onPositionClick?: (position: [number, number, number]) => void;
}

export function DemoSwitchgear3D({ position, status, name, onClick, editMode, onPositionClick }: DemoSwitchgear3DProps) {
  const meshRef = useRef<Mesh>(null);

  const statusColors = {
    operational: '#10b981',
    maintenance: '#f59e0b',
    critical: '#ef4444',
    offline: '#6b7280',
  };

  const color = statusColors[status];

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (editMode && onPositionClick) {
      const point = event.point;
      onPositionClick([point.x, point.y, point.z]);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <group position={position}>
      {/* Main cabinet body */}
      <mesh 
        ref={meshRef} 
        castShadow
        onClick={handleClick}
        onPointerOver={() => editMode && (document.body.style.cursor = 'crosshair')}
        onPointerOut={() => (document.body.style.cursor = 'default')}
      >
        <boxGeometry args={[2, 3, 1]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Control panel (front) */}
      <mesh position={[0, 0.5, 0.51]} castShadow>
        <boxGeometry args={[1.6, 2, 0.1]} />
        <meshStandardMaterial color="#1e293b" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Status indicator lights */}
      <mesh position={[-0.6, 1.2, 0.56]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color={status === 'operational' ? '#10b981' : status === 'critical' ? '#ef4444' : '#f59e0b'}
          emissive={status === 'operational' ? '#10b981' : status === 'critical' ? '#ef4444' : '#f59e0b'}
          emissiveIntensity={1.5}
        />
      </mesh>

      {/* Label */}
      <Text
        position={[0, 2.2, 0]}
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
