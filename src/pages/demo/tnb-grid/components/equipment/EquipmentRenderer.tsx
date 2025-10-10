/**
 * Equipment Renderer Component
 * 
 * Generic renderer that picks the correct 3D component based on equipment type
 */

import type { SubstationEquipment } from '../../mock-data/mockEquipmentData';
import { Transformer3D } from './Transformer3D';
import { CircuitBreaker3D } from './CircuitBreaker3D';
import { Switchgear3D } from './Switchgear3D';
import { ControlPanel3D } from './ControlPanel3D';
import { Text } from '@react-three/drei';

interface EquipmentRendererProps {
  equipment: SubstationEquipment;
  onClick?: () => void;
  isSelected?: boolean;
}

export function EquipmentRenderer({ equipment, onClick, isSelected }: EquipmentRendererProps) {
  switch (equipment.type) {
    case 'transformer':
      return <Transformer3D equipment={equipment} onClick={onClick} isSelected={isSelected} />;
    
    case 'circuit_breaker':
      return <CircuitBreaker3D equipment={equipment} onClick={onClick} isSelected={isSelected} />;
    
    case 'switchgear':
      return <Switchgear3D equipment={equipment} onClick={onClick} isSelected={isSelected} />;
    
    case 'control_panel':
      return <ControlPanel3D equipment={equipment} onClick={onClick} isSelected={isSelected} />;
    
    case 'meter_bank':
      // Simple representation for meter bank
      return (
        <group position={equipment.position}>
          <mesh onClick={onClick}>
            <boxGeometry args={[2, 2.5, 1]} />
            <meshStandardMaterial color="#4B5563" />
          </mesh>
          <Text position={[0, 2, 0]} fontSize={0.35} color="#ffffff" anchorX="center">
            {equipment.name}
          </Text>
          {isSelected && (
            <mesh>
              <boxGeometry args={[2.2, 2.7, 1.2]} />
              <meshBasicMaterial color="#ffffff" wireframe opacity={0.5} transparent />
            </mesh>
          )}
        </group>
      );
    
    default:
      return null;
  }
}
