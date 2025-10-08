/**
 * Mock Asset Data for Digital Twin Demo
 * Represents a hierarchical plant structure with buildings, floors, and equipment
 */

export interface MockAsset {
  id: string;
  name: string;
  type: 'plant' | 'building' | 'floor' | 'transformer' | 'switchgear' | 'meter_bank';
  position: [number, number, number];
  status: 'operational' | 'maintenance' | 'critical' | 'offline';
  health: number; // 0-100
  children?: MockAsset[];
}

export const mockPlantHierarchy: MockAsset = {
  id: 'demo-plant-1',
  name: 'Demo Power Plant',
  type: 'plant',
  position: [0, 0, 0],
  status: 'operational',
  health: 92,
  children: [
    {
      id: 'demo-building-1',
      name: 'Main Substation',
      type: 'building',
      position: [-20, 0, -20],
      status: 'operational',
      health: 95,
      children: [
        {
          id: 'demo-floor-1',
          name: 'Ground Floor',
          type: 'floor',
          position: [0, 0, 0],
          status: 'operational',
          health: 93,
          children: [
            {
              id: 'demo-transformer-1',
              name: 'Transformer T1',
              type: 'transformer',
              position: [-5, 2, -5],
              status: 'operational',
              health: 88,
            },
            {
              id: 'demo-switchgear-1',
              name: 'Switchgear S1',
              type: 'switchgear',
              position: [5, 1.5, -5],
              status: 'operational',
              health: 95,
            },
            {
              id: 'demo-meter-bank-1',
              name: 'Meter Bank MB1',
              type: 'meter_bank',
              position: [0, 1, -8],
              status: 'operational',
              health: 98,
            },
          ],
        },
        {
          id: 'demo-floor-2',
          name: 'Upper Level',
          type: 'floor',
          position: [0, 5, 0],
          status: 'operational',
          health: 90,
          children: [
            {
              id: 'demo-transformer-2',
              name: 'Transformer T2',
              type: 'transformer',
              position: [-5, 7, -5],
              status: 'maintenance',
              health: 75,
            },
            {
              id: 'demo-switchgear-2',
              name: 'Switchgear S2',
              type: 'switchgear',
              position: [5, 6.5, -5],
              status: 'operational',
              health: 92,
            },
          ],
        },
      ],
    },
    {
      id: 'demo-building-2',
      name: 'Distribution Center',
      type: 'building',
      position: [20, 0, -20],
      status: 'operational',
      health: 88,
      children: [
        {
          id: 'demo-floor-3',
          name: 'Main Floor',
          type: 'floor',
          position: [0, 0, 0],
          status: 'operational',
          health: 87,
          children: [
            {
              id: 'demo-transformer-3',
              name: 'Transformer T3',
              type: 'transformer',
              position: [-3, 2, -3],
              status: 'critical',
              health: 45,
            },
            {
              id: 'demo-switchgear-3',
              name: 'Switchgear S3',
              type: 'switchgear',
              position: [3, 1.5, -3],
              status: 'operational',
              health: 89,
            },
          ],
        },
      ],
    },
  ],
};

// Flatten hierarchy for easy lookup
export const getAllAssets = (asset: MockAsset, result: MockAsset[] = []): MockAsset[] => {
  result.push(asset);
  if (asset.children) {
    asset.children.forEach((child) => getAllAssets(child, result));
  }
  return result;
};

export const findAssetById = (id: string): MockAsset | undefined => {
  return getAllAssets(mockPlantHierarchy).find((asset) => asset.id === id);
};
