/**
 * 3D Visualization Demo Component
 * Shows hierarchical plant structure with interactive zoom
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lightbulb, Home, Building, Layers as LayersIcon } from 'lucide-react';
import { DemoCanvas } from './DemoCanvas';
import { DemoTransformer3D } from './models/DemoTransformer3D';
import { DemoSwitchgear3D } from './models/DemoSwitchgear3D';
import { DemoMeterBank3D } from './models/DemoMeterBank3D';
import { mockPlantHierarchy, MockAsset, getAllAssets } from '../mock-data/mockAssets';

export function Demo3DVisualization() {
  const [selectedAsset, setSelectedAsset] = useState<MockAsset | null>(null);
  const [viewLevel, setViewLevel] = useState<'plant' | 'building' | 'floor'>('plant');

  const allAssets = getAllAssets(mockPlantHierarchy);
  const equipment = allAssets.filter((a) =>
    ['transformer', 'switchgear', 'meter_bank'].includes(a.type)
  );

  const renderAsset = (asset: MockAsset) => {
    if (asset.type === 'transformer') {
      return (
        <DemoTransformer3D
          key={asset.id}
          position={asset.position}
          status={asset.status}
          name={asset.name}
          onClick={() => setSelectedAsset(asset)}
        />
      );
    }
    if (asset.type === 'switchgear') {
      return (
        <DemoSwitchgear3D
          key={asset.id}
          position={asset.position}
          status={asset.status}
          name={asset.name}
          onClick={() => setSelectedAsset(asset)}
        />
      );
    }
    if (asset.type === 'meter_bank') {
      return (
        <DemoMeterBank3D
          key={asset.id}
          position={asset.position}
          status={asset.status}
          name={asset.name}
          onClick={() => setSelectedAsset(asset)}
        />
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Info Alert */}
      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertDescription>
          This demonstrates hierarchical navigation from plant → building → floor → equipment.
          Click on any 3D object to inspect it. Use mouse to rotate, scroll to zoom.
        </AlertDescription>
      </Alert>

      {/* View Controls */}
      <div className="flex gap-2">
        <Button
          variant={viewLevel === 'plant' ? 'default' : 'outline'}
          onClick={() => setViewLevel('plant')}
        >
          <Home className="w-4 h-4 mr-2" />
          Plant View
        </Button>
        <Button
          variant={viewLevel === 'building' ? 'default' : 'outline'}
          onClick={() => setViewLevel('building')}
        >
          <Building className="w-4 h-4 mr-2" />
          Building View
        </Button>
        <Button
          variant={viewLevel === 'floor' ? 'default' : 'outline'}
          onClick={() => setViewLevel('floor')}
        >
          <LayersIcon className="w-4 h-4 mr-2" />
          Equipment View
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3D Canvas */}
        <div className="lg:col-span-2">
          <DemoCanvas>{equipment.map(renderAsset)}</DemoCanvas>
        </div>

        {/* Asset Inspector */}
        <Card className="p-4 space-y-4">
          <h3 className="text-lg font-semibold">Asset Inspector</h3>
          {selectedAsset ? (
            <>
              <div>
                <Badge variant="secondary" className="mb-2">
                  {selectedAsset.type}
                </Badge>
                <h4 className="font-semibold text-xl">{selectedAsset.name}</h4>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge
                    variant={
                      selectedAsset.status === 'operational'
                        ? 'default'
                        : selectedAsset.status === 'critical'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {selectedAsset.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Health Score:</span>
                  <span className="font-semibold">{selectedAsset.health}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID:</span>
                  <span className="text-sm font-mono">{selectedAsset.id}</span>
                </div>
              </div>

              <Alert>
                <AlertDescription className="text-sm">
                  💡 In production, clicking here would show real-time sensor data, maintenance
                  history, and work orders.
                </AlertDescription>
              </Alert>
            </>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Click on any 3D equipment to inspect it
            </div>
          )}
        </Card>
      </div>

      {/* Integration Example */}
      <Card className="p-4 bg-muted/50">
        <h4 className="font-semibold mb-2">Production Integration Example:</h4>
        <pre className="text-xs bg-background p-3 rounded overflow-x-auto">
          {`// Load real asset hierarchy from your database
const { data: assets } = useAssets();

// Map to 3D positions using PostGIS data
const positions = assets.map(asset => ({
  ...asset,
  position: [asset.gps_location.x, 0, asset.gps_location.y]
}));`}
        </pre>
      </Card>
    </div>
  );
}
