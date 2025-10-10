/**
 * IoT Data Overlay Component
 * 
 * Displays live sensor readings as floating labels in 3D space
 * Enhanced to support multiple positioned sensors per asset
 */

import { useRealtimeIoTData } from '@/hooks/useRealtimeIoTData';
import { useAssetSensorPositions } from '@/hooks/useAssetSensorPositions';
import { CompactSensorBadge } from './CompactSensorBadge';
import { SensorPositionMarker } from './SensorPositionMarker';
import { Box } from '@react-three/drei';

interface IoTDataOverlayProps {
  selectedAssetId?: string | null;
  selectedSensorTypes?: string[];
  onSensorClick?: (sensorId: string) => void;
  selectedSensorId?: string | null;
}

export function IoTDataOverlay({ 
  selectedAssetId,
  selectedSensorTypes = [],
  onSensorClick,
  selectedSensorId,
}: IoTDataOverlayProps) {
  const { data: sensorPositions = [], isLoading } = useAssetSensorPositions(selectedAssetId);
  const { readings, isConnected } = useRealtimeIoTData(selectedAssetId ? [selectedAssetId] : []);

  if (!selectedAssetId || isLoading) return null;

  const assetReadings = readings[selectedAssetId] || [];

  // Group sensors by position to stack them
  const sensorsByPosition = new Map<string, typeof sensorPositions>();
  sensorPositions.forEach(sensor => {
    const posKey = `${sensor.position[0]}_${sensor.position[1]}_${sensor.position[2]}`;
    const existing = sensorsByPosition.get(posKey) || [];
    sensorsByPosition.set(posKey, [...existing, sensor]);
  });

  return (
    <group>
      {Array.from(sensorsByPosition.entries()).map(([posKey, sensorsAtPos]) => (
        <group key={posKey}>
          {sensorsAtPos.map((sensor, stackIndex) => {
            // Find readings for this sensor
            const sensorReadings = sensor.deviceId
              ? assetReadings.filter(r => r.device_id === sensor.deviceId)
              : assetReadings.filter(r => r.sensor_type === sensor.sensorType);

            const latestReading = sensorReadings[0];
            const hasLiveData = !!latestReading;

            // Check if this sensor type is filtered
            const isFiltered = hasLiveData && selectedSensorTypes.length > 0 && 
                              !selectedSensorTypes.includes(latestReading.sensor_type);

            // Badge position slightly above the sensor marker
            const badgePosition: [number, number, number] = [
              sensor.position[0],
              sensor.position[1] + 0.5,
              sensor.position[2],
            ];

            const isSelected = selectedSensorId === (sensor.deviceId || latestReading?.id);

            return (
              <group key={sensor.id}>
                {/* DEBUG: Large red cube - only show for first sensor at position */}
                {stackIndex === 0 && (
                  <Box position={sensor.position} args={[0.5, 0.5, 0.5]}>
                    <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1} />
                  </Box>
                )}

                {/* Sensor position marker - always shown when configured */}
                <SensorPositionMarker
                  position={sensor.position}
                  color={sensor.color || '#64748b'}
                  sensorType={sensor.sensorType}
                  isSelected={isSelected}
                  isActive={sensor.isActive && !isFiltered}
                  onClick={() => onSensorClick?.(sensor.deviceId || latestReading?.id || sensor.id)}
                  badgePosition={badgePosition}
                />

                {/* Compact data badge - only shown when there's live data */}
                {hasLiveData && (
                  <CompactSensorBadge
                    position={badgePosition}
                    sensorType={latestReading.sensor_type}
                    value={latestReading.reading_value}
                    unit={latestReading.unit}
                    label={sensor.label}
                    isAlert={latestReading.alert_threshold_exceeded}
                    isLive={isConnected}
                    isFiltered={isFiltered}
                    onClick={() => onSensorClick?.(sensor.deviceId || latestReading.id)}
                    isSelected={isSelected}
                    stackIndex={stackIndex}
                  />
                )}
              </group>
            );
          })}
        </group>
      ))}
    </group>
  );
}
