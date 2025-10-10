/**
 * Transformer 3D Component
 * 
 * 3D model of electrical transformer with load indicators
 */

import { useState } from 'react';
import { Text } from '@react-three/drei';
import type { SubstationEquipment } from '../../mock-data/mockEquipmentData';
import { getStatusColor, getLoadPercentageColor } from '../../mock-data/mockGridData';

interface Transformer3DProps {
  equipment: SubstationEquipment;
  onClick?: () => void;
  isSelected?: boolean;
}

export function Transformer3D({ equipment, onClick, isSelected }: Transformer3DProps) {
  const [hovered, setHovered] = useState(false);
  
  const statusColor = getStatusColor(equipment.status);
  const loadPercent = equipment.capacity_mva && equipment.current_load_mva
    ? (equipment.current_load_mva / equipment.capacity_mva) * 100
    : 0;
  const loadColor = getLoadPercentageColor(loadPercent);

  return (
    <group position={equipment.position}>
      {/* Main transformer body */}
      <mesh
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[3, 4, 2]} />
        <meshStandardMaterial 
          color={statusColor}
          emissive={hovered || isSelected ? '#ffffff' : '#000000'}
          emissiveIntensity={hovered ? 0.3 : isSelected ? 0.2 : 0}
        />
      </mesh>
      
      {/* Cooling radiators */}
      <mesh position={[1.8, 0, 0]}>
        <boxGeometry args={[0.4, 3.5, 1.8]} />
        <meshStandardMaterial color="#4B5563" />
      </mesh>
      <mesh position={[-1.8, 0, 0]}>
        <boxGeometry args={[0.4, 3.5, 1.8]} />
        <meshStandardMaterial color="#4B5563" />
      </mesh>
      
      {/* Base platform */}
      <mesh position={[0, -2.5, 0]}>
        <boxGeometry args={[4, 0.5, 3]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
      
      {/* Equipment name label */}
      <Text position={[0, 3, 0]} fontSize={0.4} color="#ffffff" anchorX="center">
        {equipment.name}
      </Text>
      
      {/* Voltage labels */}
      {equipment.voltage_in && equipment.voltage_out && (
        <Text position={[0, -3.2, 0]} fontSize={0.25} color="#9CA3AF" anchorX="center">
          {equipment.voltage_in} → {equipment.voltage_out}
        </Text>
      )}
      
      {/* Load indicator */}
      {equipment.current_load_mva && equipment.capacity_mva && (
        <Text position={[0, -3.7, 0]} fontSize={0.3} color={loadColor} anchorX="center">
          {Math.round(equipment.current_load_mva)} / {equipment.capacity_mva} MVA
        </Text>
      )}
      
      {/* Selection indicator */}
      {isSelected && (
        <mesh>
          <boxGeometry args={[3.2, 4.2, 2.2]} />
          <meshBasicMaterial color="#ffffff" wireframe opacity={0.5} transparent />
        </mesh>
      )}
      
      {/* Status light */}
      {equipment.status === 'operational' && (
        <pointLight position={[0, 4, 0]} color="#10B981" intensity={2} distance={5} />
      )}
    </group>
  );
}
