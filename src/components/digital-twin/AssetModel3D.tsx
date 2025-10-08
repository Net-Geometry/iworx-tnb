/**
 * Asset Model 3D Component
 * 
 * Renders individual assets as 3D models based on type
 */

import { Text } from '@react-three/drei';
import { DemoTransformer3D } from '@/pages/demo/digital-twin/components/models/DemoTransformer3D';
import { DemoSwitchgear3D } from '@/pages/demo/digital-twin/components/models/DemoSwitchgear3D';
import { DemoMeterBank3D } from '@/pages/demo/digital-twin/components/models/DemoMeterBank3D';

interface Asset3D {
  id: string;
  name: string;
  type: string;
  status: 'operational' | 'maintenance' | 'critical' | 'offline';
  health_score?: number;
  position: [number, number, number];
}

interface AssetModel3DProps {
  asset: Asset3D;
  position: [number, number, number];
  isSelected: boolean;
  onClick?: () => void;
}

export function AssetModel3D({ asset, position, isSelected, onClick }: AssetModel3DProps) {
  // Map health score to status
  const status = asset.status === 'operational' && asset.health_score 
    ? asset.health_score < 50 ? 'critical' : asset.health_score < 75 ? 'maintenance' : 'operational'
    : asset.status;

  // Render appropriate model based on asset type
  if (asset.type === 'transformer' || asset.type?.toLowerCase().includes('transformer')) {
    return (
      <group>
        <DemoTransformer3D
          position={position}
          status={status}
          name={asset.name}
          onClick={onClick}
        />
        {isSelected && (
          <Text
            position={[position[0], position[1] + 3, position[2]]}
            fontSize={0.4}
            color="#10b981"
            anchorX="center"
            anchorY="middle"
          >
            ▼ SELECTED
          </Text>
        )}
      </group>
    );
  }

  if (asset.type === 'switchgear' || asset.type?.toLowerCase().includes('switchgear')) {
    return (
      <group>
        <DemoSwitchgear3D
          position={position}
          status={status}
          name={asset.name}
          onClick={onClick}
        />
        {isSelected && (
          <Text
            position={[position[0], position[1] + 2.5, position[2]]}
            fontSize={0.4}
            color="#10b981"
            anchorX="center"
            anchorY="middle"
          >
            ▼ SELECTED
          </Text>
        )}
      </group>
    );
  }

  if (asset.type?.toLowerCase().includes('meter')) {
    return (
      <group>
        <DemoMeterBank3D
          position={position}
          status={status}
          name={asset.name}
          onClick={onClick}
        />
        {isSelected && (
          <Text
            position={[position[0], position[1] + 2, position[2]]}
            fontSize={0.4}
            color="#10b981"
            anchorX="center"
            anchorY="middle"
          >
            ▼ SELECTED
          </Text>
        )}
      </group>
    );
  }

  // Default generic asset (box)
  return (
    <group position={position} onClick={onClick}>
      <mesh castShadow>
        <boxGeometry args={[1, 1.5, 1]} />
        <meshStandardMaterial
          color={status === 'operational' ? '#10b981' : status === 'critical' ? '#ef4444' : '#f59e0b'}
          metalness={0.5}
          roughness={0.5}
        />
      </mesh>
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.25}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {asset.name}
      </Text>
      {isSelected && (
        <Text
          position={[0, 2.5, 0]}
          fontSize={0.4}
          color="#10b981"
          anchorX="center"
          anchorY="middle"
        >
          ▼ SELECTED
        </Text>
      )}
    </group>
  );
}
