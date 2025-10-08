/**
 * IoT Data Overlay Component
 * 
 * Displays live sensor readings as floating labels in 3D space
 */

import { useRealtimeIoTData } from '@/hooks/useRealtimeIoTData';
import { useAsset3DPositions } from '@/hooks/useAsset3DPositions';
import { LiveDataBadge } from './LiveDataBadge';

interface IoTDataOverlayProps {
  selectedAssetId?: string | null;
}

export function IoTDataOverlay({ selectedAssetId }: IoTDataOverlayProps) {
  const { assets3D } = useAsset3DPositions();
  const assetIds = assets3D.map(a => a.id);
  const { readings, isConnected } = useRealtimeIoTData(assetIds);

  return (
    <group>
      {assets3D.map((asset) => {
        const assetReadings = readings[asset.id] || [];
        const latestReading = assetReadings[0];

        if (!latestReading) return null;

        return (
          <LiveDataBadge
            key={asset.id}
            position={[asset.position[0], asset.position[1] + 2, asset.position[2]]}
            sensorType={latestReading.sensor_type}
            value={latestReading.reading_value}
            unit={latestReading.unit}
            isAlert={latestReading.alert_threshold_exceeded}
            isLive={isConnected}
          />
        );
      })}
    </group>
  );
}
