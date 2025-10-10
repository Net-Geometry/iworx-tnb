/**
 * Sensor Position Marker Component
 * 
 * Visual marker on 3D model showing sensor location
 */

import { Sphere, Line } from '@react-three/drei';
import { useState } from 'react';
import * as THREE from 'three';

interface SensorPositionMarkerProps {
  position: [number, number, number];
  color: string;
  sensorType: string;
  isSelected?: boolean;
  isActive?: boolean;
  onClick?: () => void;
  badgePosition: [number, number, number];
}

export function SensorPositionMarker({
  position,
  color,
  sensorType,
  isSelected = false,
  isActive = true,
  onClick,
  badgePosition,
}: SensorPositionMarkerProps) {
  const [hovered, setHovered] = useState(false);

  // Create line points from marker to badge
  const linePoints = [
    new THREE.Vector3(position[0], position[1], position[2]),
    new THREE.Vector3(badgePosition[0], badgePosition[1], badgePosition[2]),
  ];

  return (
    <group>
      {/* Connection line to badge */}
      <Line
        points={linePoints}
        color={color}
        lineWidth={isSelected ? 2 : 1}
        opacity={isActive ? 0.4 : 0.2}
        transparent
        dashed
        dashSize={0.1}
        gapSize={0.05}
      />

      {/* Sensor marker sphere */}
      <Sphere
        position={position}
        args={[0.1, 16, 16]}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered || isSelected ? 0.8 : 0.3}
          transparent
          opacity={isActive ? 1 : 0.4}
        />
      </Sphere>

      {/* Outer glow ring when selected or hovered */}
      {(hovered || isSelected) && (
        <Sphere position={position} args={[0.15, 16, 16]}>
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.2}
            side={THREE.BackSide}
          />
        </Sphere>
      )}
    </group>
  );
}
