/**
 * Hierarchy Scene Component
 * 
 * Loads and renders real assets from database in 3D space
 */

import { useAsset3DPositions } from '@/hooks/useAsset3DPositions';
import { AssetModel3D } from './AssetModel3D';

interface HierarchySceneProps {
  onAssetSelect?: (assetId: string) => void;
  selectedAssetId?: string | null;
  historicalMode?: boolean;
  historicalTime?: Date;
}

export function HierarchyScene({
  onAssetSelect,
  selectedAssetId,
  historicalMode = false,
}: HierarchySceneProps) {
  const { assets3D, isLoading } = useAsset3DPositions();

  if (isLoading) {
    return null;
  }

  return (
    <group>
      {assets3D.map((asset) => (
        <AssetModel3D
          key={asset.id}
          asset={asset}
          position={asset.position}
          isSelected={selectedAssetId === asset.id}
          onClick={() => onAssetSelect?.(asset.id)}
        />
      ))}
    </group>
  );
}
