/**
 * 3D Model Component for Transformer
 * Uses basic Three.js geometries
 */

import { useRef } from 'react';
import { Mesh } from 'three';
import { Text } from '@react-three/drei';

interface DemoTransformer3DProps {
  position: [number, number, number];
  status: 'operational' | 'maintenance' | 'critical' | 'offline';
  name: string;
  onClick?: () => void;
}

export function DemoTransformer3D({ position, status, name, onClick }: DemoTransformer3DProps) {
  const meshRef = useRef<Mesh>(null);

  // Status color mapping
  const statusColors = {
    operational: '#10b981', // green
    maintenance: '#f59e0b', // yellow
    critical: '#ef4444', // red
    offline: '#6b7280', // gray
  };

  const color = statusColors[status];

  return (
    <group position={position} onClick={onClick}>
      {/* Main transformer body (cylinder) */}
      <mesh ref={meshRef} castShadow>
        <cylinderGeometry args={[1.5, 1.5, 3, 32]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Cooling fins (rings around cylinder) */}
      {[0, 0.8, -0.8].map((yOffset, idx) => (
        <mesh key={idx} position={[0, yOffset, 0]} castShadow>
          <torusGeometry args={[1.6, 0.1, 8, 32]} />
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
        </mesh>
      ))}

      {/* Label */}
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
    </group>
  );
}
