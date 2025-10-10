/**
 * Control Panel 3D Component
 * 
 * 3D model of control room/panel
 */

import { useState } from 'react';
import { Text } from '@react-three/drei';
import type { SubstationEquipment } from '../../mock-data/mockEquipmentData';
import { getStatusColor } from '../../mock-data/mockGridData';

interface ControlPanel3DProps {
  equipment: SubstationEquipment;
  onClick?: () => void;
  isSelected?: boolean;
}

export function ControlPanel3D({ equipment, onClick, isSelected }: ControlPanel3DProps) {
  const [hovered, setHovered] = useState(false);
  const statusColor = getStatusColor(equipment.status);

  return (
    <group position={equipment.position}>
      {/* Main building */}
      <mesh
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[5, 3, 4]} />
        <meshStandardMaterial 
          color={statusColor}
          emissive={hovered || isSelected ? '#ffffff' : '#000000'}
          emissiveIntensity={hovered ? 0.3 : isSelected ? 0.2 : 0}
        />
      </mesh>
      
      {/* Roof */}
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[5.5, 0.5, 4.5]} />
        <meshStandardMaterial color="#1F2937" />
      </mesh>
      
      {/* Door */}
      <mesh position={[0, -0.5, 2.1]}>
        <boxGeometry args={[1, 2, 0.1]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
      
      {/* Windows */}
      <mesh position={[-1.5, 0.5, 2.1]}>
        <boxGeometry args={[1, 1, 0.1]} />
        <meshStandardMaterial color="#60A5FA" emissive="#60A5FA" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[1.5, 0.5, 2.1]}>
        <boxGeometry args={[1, 1, 0.1]} />
        <meshStandardMaterial color="#60A5FA" emissive="#60A5FA" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Base platform */}
      <mesh position={[0, -1.8, 0]}>
        <boxGeometry args={[6, 0.3, 5]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
      
      {/* Equipment name label */}
      <Text position={[0, 3, 0]} fontSize={0.4} color="#ffffff" anchorX="center">
        {equipment.name}
      </Text>
      
      {/* Selection indicator */}
      {isSelected && (
        <mesh>
          <boxGeometry args={[5.2, 3.2, 4.2]} />
          <meshBasicMaterial color="#ffffff" wireframe opacity={0.5} transparent />
        </mesh>
      )}
      
      {/* Interior lights */}
      {equipment.status === 'operational' && (
        <>
          <pointLight position={[-1.5, 0.5, 2]} color="#60A5FA" intensity={3} distance={4} />
          <pointLight position={[1.5, 0.5, 2]} color="#60A5FA" intensity={3} distance={4} />
        </>
      )}
    </group>
  );
}
