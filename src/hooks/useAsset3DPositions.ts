/**
 * Asset 3D Positions Hook
 * 
 * Maps real assets to 3D coordinates for Digital Twin visualization
 */

import { useAssets } from './useAssets';

interface Asset3D {
  id: string;
  name: string;
  asset_number: string;
  type: string;
  category?: string;
  status: 'operational' | 'maintenance' | 'critical' | 'offline';
  health_score?: number;
  criticality?: string;
  hierarchy_node_id?: string;
  position: [number, number, number];
  model_3d_url?: string;
  model_3d_scale?: { x: number; y: number; z: number };
  model_3d_rotation?: { x: number; y: number; z: number };
}

export const useAsset3DPositions = (hierarchyNodeId?: string | null) => {
  const { assets, loading, error } = useAssets();

  // Transform assets to 3D positions
  const assets3D: Asset3D[] = (assets || [])
    .filter(asset => {
      // If no filter, show all assets
      if (!hierarchyNodeId) return true;
      
      // Show assets that match the selected hierarchy node
      return asset.hierarchy_node_id === hierarchyNodeId;
    })
    .map((asset, index) => {
    // Distribute assets in a grid pattern
    // TODO: Use actual GPS/PostGIS data from asset_location_history
    const gridSize = Math.ceil(Math.sqrt(assets.length));
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const spacing = 5;

    // Map status to standard values
    let status: 'operational' | 'maintenance' | 'critical' | 'offline' = 'operational';
    if (asset.status === 'out_of_service') {
      status = 'offline';
    } else if (asset.status === 'maintenance') {
      status = 'maintenance';
    } else if (asset.health_score && asset.health_score < 50) {
      status = 'critical';
    } else if (asset.status === 'operational') {
      status = 'operational';
    }

    return {
      id: asset.id,
      name: asset.name,
      asset_number: asset.asset_number || '',
      type: asset.type || 'generic',
      category: asset.category,
      status,
      health_score: asset.health_score,
      criticality: asset.criticality,
      hierarchy_node_id: asset.hierarchy_node_id,
      position: [
        (col - gridSize / 2) * spacing,
        0,
        (row - gridSize / 2) * spacing,
      ] as [number, number, number],
      model_3d_url: asset.model_3d_url,
      model_3d_scale: asset.model_3d_scale || { x: 1, y: 1, z: 1 },
      model_3d_rotation: asset.model_3d_rotation || { x: 0, y: 0, z: 0 },
    };
  });

  return {
    assets3D,
    isLoading: loading,
    error,
  };
};
