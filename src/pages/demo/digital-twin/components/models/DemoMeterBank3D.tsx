/**
 * 3D Model Component for Meter Bank
 * Group of small meter boxes
 */

import { Text } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';

interface DemoMeterBank3DProps {
  position: [number, number, number];
  status: 'operational' | 'maintenance' | 'critical' | 'offline';
  name: string;
  onClick?: () => void;
  editMode?: boolean;
  onPositionClick?: (position: [number, number, number]) => void;
}

export function DemoMeterBank3D({ position, status, name, onClick, editMode, onPositionClick }: DemoMeterBank3DProps) {
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
      {/* Row of meter boxes */}
      {[-1, 0, 1].map((xOffset, idx) => (
        <group key={idx} position={[xOffset * 0.8, 0, 0]}>
          {/* Meter box */}
          <mesh 
            castShadow
            onClick={handleClick}
            onPointerOver={() => editMode && (document.body.style.cursor = 'crosshair')}
            onPointerOut={() => (document.body.style.cursor = 'default')}
          >
            <boxGeometry args={[0.6, 1.5, 0.4]} />
            <meshStandardMaterial color={color} metalness={0.4} roughness={0.6} />
          </mesh>

          {/* Display screen */}
          <mesh position={[0, 0.3, 0.21]}>
            <boxGeometry args={[0.4, 0.6, 0.02]} />
            <meshStandardMaterial color="#1e3a8a" emissive="#1e3a8a" emissiveIntensity={0.3} />
          </mesh>

          {/* Reading indicator */}
          <mesh position={[0, -0.3, 0.21]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={1} />
          </mesh>
        </group>
      ))}

      {/* Label */}
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
    </group>
  );
}
