/**
 * Substation 3D Component
 * 
 * Renders electrical substations as 3D buildings
 */

import { useRef, useState } from 'react';
import { Text } from '@react-three/drei';
import { getStatusColor, type GridSubstation } from '../mock-data/mockGridData';
import type { Mesh } from 'three';

interface Substation3DProps {
  substation: GridSubstation;
  onClick?: () => void;
  isSelected?: boolean;
}

export function Substation3D({ substation, onClick, isSelected }: Substation3DProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Size based on voltage level
  const getSize = (voltage: string): [number, number, number] => {
    const sizes: Record<string, [number, number, number]> = {
      '500kV': [6, 8, 6],
      '275kV': [5, 6, 5],
      '132kV': [4, 5, 4],
      '33kV': [3, 4, 3],
      '11kV': [2, 3, 2],
    };
    return sizes[voltage] || [3, 4, 3];
  };

  const [width, height, depth] = getSize(substation.voltageLevel);
  const statusColor = getStatusColor(substation.status);
  const loadPercent = (substation.current_load_mva / substation.capacity_mva) * 100;

  return (
    <group position={substation.position}>
      {/* Main building */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        position={[0, height / 2, 0]}
      >
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={statusColor}
          emissive={statusColor}
          emissiveIntensity={substation.status === 'energized' ? 0.3 : 0.1}
          opacity={0.8}
          transparent
        />
      </mesh>

      {/* Selection/Hover indicator */}
      {(isSelected || hovered) && (
        <mesh position={[0, height / 2, 0]}>
          <boxGeometry args={[width * 1.1, height * 1.05, depth * 1.1]} />
          <meshBasicMaterial
            color="#ffffff"
            opacity={0.2}
            transparent
            wireframe
          />
        </mesh>
      )}

      {/* Base platform */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[width * 0.8, width * 0.9, 0.2, 16]} />
        <meshStandardMaterial color="#4B5563" />
      </mesh>

      {/* Status indicator light on top */}
      {substation.status === 'energized' && (
        <pointLight
          position={[0, height + 1, 0]}
          color={statusColor}
          intensity={2}
          distance={width * 2}
        />
      )}

      {/* Name label */}
      <Text
        position={[0, height + 2, 0]}
        fontSize={1.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.1}
        outlineColor="#000000"
      >
        {substation.name}
      </Text>

      {/* Voltage level label */}
      <Text
        position={[0, height + 3.5, 0]}
        fontSize={0.8}
        color="#F59E0B"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        {substation.voltageLevel}
      </Text>

      {/* Load percentage indicator */}
      {substation.status === 'energized' && (
        <Text
          position={[0, height + 4.5, 0]}
          fontSize={0.7}
          color={loadPercent > 80 ? '#EF4444' : loadPercent > 60 ? '#F59E0B' : '#10B981'}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="#000000"
        >
          {`${Math.round(loadPercent)}% Load`}
        </Text>
      )}
    </group>
  );
}
