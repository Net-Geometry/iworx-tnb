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
  editMode?: boolean;
  onPositionClick?: (position: [number, number, number]) => void;
}

export function HierarchyScene({
  onAssetSelect,
  selectedAssetId,
  historicalMode = false,
  editMode = false,
  onPositionClick,
}: HierarchySceneProps) {
  // Only fetch assets when one is selected
  const { assets3D, isLoading } = useAsset3DPositions(!!selectedAssetId);

  // Don't load any models until an asset is selected
  if (!selectedAssetId) {
    return null;
  }

  if (isLoading) {
    return null;
  }

  // Show only the selected asset
  const displayedAssets = assets3D.filter(asset => asset.id === selectedAssetId);

  return (
    <group>
      {displayedAssets.map((asset) => (
        <AssetModel3D
          key={asset.id}
          asset={asset}
          position={asset.position}
          isSelected={selectedAssetId === asset.id}
          onClick={() => onAssetSelect?.(asset.id)}
          editMode={editMode}
          onPositionClick={onPositionClick}
        />
      ))}
    </group>
  );
}
