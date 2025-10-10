/**
 * Circuit Breaker 3D Component
 * 
 * 3D model of circuit breaker with status indicator
 */

import { useState } from 'react';
import { Text } from '@react-three/drei';
import type { SubstationEquipment } from '../../mock-data/mockEquipmentData';
import { getStatusColor } from '../../mock-data/mockGridData';

interface CircuitBreaker3DProps {
  equipment: SubstationEquipment;
  onClick?: () => void;
  isSelected?: boolean;
}

export function CircuitBreaker3D({ equipment, onClick, isSelected }: CircuitBreaker3DProps) {
  const [hovered, setHovered] = useState(false);
  const statusColor = getStatusColor(equipment.status);

  return (
    <group position={equipment.position}>
      {/* Main breaker body */}
      <mesh
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <cylinderGeometry args={[1, 1, 3, 8]} />
        <meshStandardMaterial 
          color={statusColor}
          emissive={hovered || isSelected ? '#ffffff' : '#000000'}
          emissiveIntensity={hovered ? 0.3 : isSelected ? 0.2 : 0}
        />
      </mesh>
      
      {/* Top insulator */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 1, 8]} />
        <meshStandardMaterial color="#E5E7EB" />
      </mesh>
      
      {/* Base */}
      <mesh position={[0, -2, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 0.5, 8]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
      
      {/* Equipment name label */}
      <Text position={[0, 3, 0]} fontSize={0.35} color="#ffffff" anchorX="center">
        {equipment.name}
      </Text>
      
      {/* Voltage label */}
      {equipment.voltage_in && (
        <Text position={[0, -2.7, 0]} fontSize={0.25} color="#9CA3AF" anchorX="center">
          {equipment.voltage_in}
        </Text>
      )}
      
      {/* Selection indicator */}
      {isSelected && (
        <mesh>
          <cylinderGeometry args={[1.2, 1.2, 3.2, 8]} />
          <meshBasicMaterial color="#ffffff" wireframe opacity={0.5} transparent />
        </mesh>
      )}
      
      {/* Status light */}
      {equipment.status === 'operational' && (
        <pointLight position={[0, 3, 0]} color="#10B981" intensity={2} distance={4} />
      )}
    </group>
  );
}
