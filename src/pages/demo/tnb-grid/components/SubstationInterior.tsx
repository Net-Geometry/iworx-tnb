/**
 * Substation Interior Component
 * 
 * Renders floor, walls, and ceiling of substation interior
 */

export function SubstationInterior() {
  return (
    <group>
      {/* Floor */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[30, 0.2, 30]} />
        <meshStandardMaterial color="#2D3748" roughness={0.8} />
      </mesh>
      
      {/* Floor grid lines */}
      <gridHelper args={[30, 15, '#4A5568', '#374151']} position={[0, 0, 0]} />
      
      {/* Walls (semi-transparent) */}
      <mesh position={[0, 5, -15]}>
        <boxGeometry args={[30, 10, 0.5]} />
        <meshStandardMaterial color="#1A202C" transparent opacity={0.3} />
      </mesh>
      <mesh position={[0, 5, 15]}>
        <boxGeometry args={[30, 10, 0.5]} />
        <meshStandardMaterial color="#1A202C" transparent opacity={0.3} />
      </mesh>
      <mesh position={[-15, 5, 0]}>
        <boxGeometry args={[0.5, 10, 30]} />
        <meshStandardMaterial color="#1A202C" transparent opacity={0.3} />
      </mesh>
      <mesh position={[15, 5, 0]}>
        <boxGeometry args={[0.5, 10, 30]} />
        <meshStandardMaterial color="#1A202C" transparent opacity={0.3} />
      </mesh>
      
      {/* Ceiling structure */}
      <mesh position={[0, 10, 0]}>
        <boxGeometry args={[30, 0.3, 30]} />
        <meshStandardMaterial color="#1A202C" transparent opacity={0.2} />
      </mesh>
      
      {/* Overhead lighting */}
      <pointLight position={[-8, 8, -8]} intensity={20} distance={20} color="#F3F4F6" />
      <pointLight position={[8, 8, -8]} intensity={20} distance={20} color="#F3F4F6" />
      <pointLight position={[-8, 8, 8]} intensity={20} distance={20} color="#F3F4F6" />
      <pointLight position={[8, 8, 8]} intensity={20} distance={20} color="#F3F4F6" />
    </group>
  );
}
