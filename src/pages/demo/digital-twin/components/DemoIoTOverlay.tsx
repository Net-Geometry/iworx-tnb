/**
 * IoT Data Overlay Demo Component
 * Shows real-time sensor data on 3D models
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lightbulb, Thermometer, Activity, Zap } from 'lucide-react';
import { DemoCanvas } from './DemoCanvas';
import { DemoTransformer3D } from './models/DemoTransformer3D';
import { Html } from '@react-three/drei';
import {
  generateAssetReadings,
  MockIoTReading,
} from '../mock-data/mockIoTReadings';
import { getAllAssets, mockPlantHierarchy } from '../mock-data/mockAssets';

function LiveDataBadge({ reading }: { reading: MockIoTReading }) {
  const statusColors = {
    normal: 'bg-green-500/20 border-green-500 text-green-300',
    warning: 'bg-yellow-500/20 border-yellow-500 text-yellow-300',
    critical: 'bg-red-500/20 border-red-500 text-red-300',
  };

  const icons = {
    temperature: Thermometer,
    vibration: Activity,
    voltage: Zap,
    current: Zap,
  };

  const Icon = icons[reading.sensorType];

  return (
    <div
      className={`${statusColors[reading.status]} border px-2 py-1 rounded text-xs font-mono backdrop-blur-sm`}
    >
      <div className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        <span>
          {reading.value} {reading.unit}
        </span>
      </div>
    </div>
  );
}

export function DemoIoTOverlay() {
  const [readings, setReadings] = useState<Record<string, MockIoTReading[]>>({});
  const [isLive, setIsLive] = useState(true);

  const equipment = getAllAssets(mockPlantHierarchy).filter((a) =>
    ['transformer', 'switchgear'].includes(a.type)
  );

  // Simulate real-time updates
  useEffect(() => {
    if (!isLive) return;

    const updateReadings = () => {
      const newReadings: Record<string, MockIoTReading[]> = {};
      equipment.forEach((asset) => {
        newReadings[asset.id] = generateAssetReadings(asset.id);
      });
      setReadings(newReadings);
    };

    updateReadings();
    const interval = setInterval(updateReadings, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <div className="space-y-6">
      {/* Info Alert */}
      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertDescription>
          Watch live sensor data update in real-time! Data points are color-coded: 🟢 Normal | 🟡
          Warning | 🔴 Critical. In production, this connects to your Supabase Realtime channel.
        </AlertDescription>
      </Alert>

      {/* Controls */}
      <div className="flex gap-2">
        <Badge variant={isLive ? 'default' : 'secondary'}>
          {isLive ? '🔴 LIVE' : '⏸️ PAUSED'}
        </Badge>
        <button
          onClick={() => setIsLive(!isLive)}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          {isLive ? 'Pause' : 'Resume'} Updates
        </button>
      </div>

      {/* 3D Scene with Data Overlays */}
      <DemoCanvas>
        {equipment.slice(0, 3).map((asset, idx) => {
          const assetReadings = readings[asset.id] || [];

          return (
            <group key={asset.id}>
              <DemoTransformer3D
                position={[idx * 10 - 10, 2, 0]}
                status={asset.status}
                name={asset.name}
              />

              {/* Floating data labels */}
              <Html position={[idx * 10 - 10, 5, 0]} center>
                <div className="space-y-1">
                  {assetReadings.map((reading, i) => (
                    <LiveDataBadge key={i} reading={reading} />
                  ))}
                </div>
              </Html>
            </group>
          );
        })}
      </DemoCanvas>

      {/* Legend */}
      <Card className="p-4">
        <h4 className="font-semibold mb-2">Sensor Types</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <Thermometer className="w-4 h-4 inline mr-1 text-orange-400" />
            <span>Temperature (°C)</span>
          </div>
          <div>
            <Activity className="w-4 h-4 inline mr-1 text-purple-400" />
            <span>Vibration (mm/s)</span>
          </div>
          <div>
            <Zap className="w-4 h-4 inline mr-1 text-yellow-400" />
            <span>Voltage (kV)</span>
          </div>
          <div>
            <Zap className="w-4 h-4 inline mr-1 text-blue-400" />
            <span>Current (A)</span>
          </div>
        </div>
      </Card>

      {/* Integration Example */}
      <Card className="p-4 bg-muted/50">
        <h4 className="font-semibold mb-2">Production Integration Example:</h4>
        <pre className="text-xs bg-background p-3 rounded overflow-x-auto">
          {`// Connect to real IoT data stream
useEffect(() => {
  const channel = supabase
    .channel('iot-readings')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'asset_sensor_readings',
      filter: \`asset_id=eq.\${assetId}\`
    }, (payload) => {
      updateVisualization(payload.new);
    })
    .subscribe();
  
  return () => supabase.removeChannel(channel);
}, [assetId]);`}
        </pre>
      </Card>
    </div>
  );
}
