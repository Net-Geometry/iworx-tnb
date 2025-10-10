/**
 * Switchgear 3D Component
 * 
 * 3D model of switchgear panel
 */

import { useState } from 'react';
import { Text } from '@react-three/drei';
import type { SubstationEquipment } from '../../mock-data/mockEquipmentData';
import { getStatusColor } from '../../mock-data/mockGridData';

interface Switchgear3DProps {
  equipment: SubstationEquipment;
  onClick?: () => void;
  isSelected?: boolean;
}

export function Switchgear3D({ equipment, onClick, isSelected }: Switchgear3DProps) {
  const [hovered, setHovered] = useState(false);
  const statusColor = getStatusColor(equipment.status);

  return (
    <group position={equipment.position}>
      {/* Main panel */}
      <mesh
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[4, 3, 1]} />
        <meshStandardMaterial 
          color={statusColor}
          emissive={hovered || isSelected ? '#ffffff' : '#000000'}
          emissiveIntensity={hovered ? 0.3 : isSelected ? 0.2 : 0}
        />
      </mesh>
      
      {/* Panel sections (3 vertical sections) */}
      {[-1.2, 0, 1.2].map((x, i) => (
        <mesh key={i} position={[x, 0, 0.6]}>
          <boxGeometry args={[1, 2.5, 0.2]} />
          <meshStandardMaterial color="#1F2937" />
        </mesh>
      ))}
      
      {/* Base */}
      <mesh position={[0, -2, 0]}>
        <boxGeometry args={[4.5, 0.5, 1.5]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
      
      {/* Equipment name label */}
      <Text position={[0, 2.2, 0]} fontSize={0.35} color="#ffffff" anchorX="center">
        {equipment.name}
      </Text>
      
      {/* Voltage label */}
      {equipment.voltage_in && (
        <Text position={[0, -2.6, 0]} fontSize={0.25} color="#9CA3AF" anchorX="center">
          {equipment.voltage_in}
        </Text>
      )}
      
      {/* Selection indicator */}
      {isSelected && (
        <mesh>
          <boxGeometry args={[4.2, 3.2, 1.2]} />
          <meshBasicMaterial color="#ffffff" wireframe opacity={0.5} transparent />
        </mesh>
      )}
      
      {/* Status lights on panel */}
      {equipment.status === 'operational' && (
        <>
          <pointLight position={[-1.2, 0, 1]} color="#10B981" intensity={1} distance={2} />
          <pointLight position={[0, 0, 1]} color="#10B981" intensity={1} distance={2} />
          <pointLight position={[1.2, 0, 1]} color="#10B981" intensity={1} distance={2} />
        </>
      )}
    </group>
  );
}
