/**
 * Live Data Badge Component
 * 
 * Individual sensor reading badge in 3D space
 */

import { Html } from '@react-three/drei';

interface LiveDataBadgeProps {
  position: [number, number, number];
  sensorType: string;
  value: number;
  unit: string;
  isAlert: boolean;
  isLive: boolean;
}

export function LiveDataBadge({
  position,
  sensorType,
  value,
  unit,
  isAlert,
  isLive,
}: LiveDataBadgeProps) {
  return (
    <Html position={position} center>
      <div className={`
        px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm
        ${isAlert ? 'bg-destructive/90 text-destructive-foreground' : 'bg-card/90'}
        border ${isAlert ? 'border-destructive' : 'border-border'}
        min-w-[120px]
      `}>
        <div className="flex items-center gap-2">
          {isLive && (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          )}
          <div>
            <div className="text-xs text-muted-foreground">{sensorType}</div>
            <div className="text-lg font-bold">
              {value.toFixed(1)} {unit}
            </div>
          </div>
        </div>
      </div>
    </Html>
  );
}
