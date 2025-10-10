/**
 * Compact Sensor Badge Component
 * 
 * Small, stacked sensor reading badge for 3D visualization
 * Inspired by demo design with color-coded status
 */

import { Html } from '@react-three/drei';
import { cn } from '@/lib/utils';
import { getSensorIcon } from '@/lib/sensorColors';
import * as Icons from 'lucide-react';

interface CompactSensorBadgeProps {
  position: [number, number, number];
  sensorType: string;
  value: number;
  unit: string;
  label?: string;
  isAlert: boolean;
  isLive: boolean;
  isFiltered?: boolean;
  onClick?: () => void;
  isSelected?: boolean;
  stackIndex?: number; // For vertical stacking
}

export function CompactSensorBadge({
  position,
  sensorType,
  value,
  unit,
  label,
  isAlert,
  isLive,
  isFiltered = false,
  onClick,
  isSelected = false,
  stackIndex = 0,
}: CompactSensorBadgeProps) {
  // Adjust position for stacking
  const stackedPosition: [number, number, number] = [
    position[0],
    position[1] + (stackIndex * 0.3), // Stack vertically with 0.3 offset
    position[2],
  ];

  // Get status color
  const statusColor = isAlert 
    ? 'bg-destructive/90 border-destructive text-destructive-foreground' 
    : 'bg-card/90 border-border text-foreground';

  // Get icon
  const iconName = getSensorIcon(sensorType);
  const IconComponent = (Icons as any)[iconName] || Icons.Activity;

  return (
    <Html position={stackedPosition} center>
      <div 
        className={cn(
          "transition-all duration-200 cursor-pointer",
          isFiltered && "opacity-20 scale-90",
          isSelected && "ring-2 ring-primary ring-offset-2"
        )}
        onClick={onClick}
      >
        <div className={cn(
          "px-2.5 py-1.5 rounded-md shadow-md backdrop-blur-sm border",
          "hover:scale-105 hover:shadow-lg transition-all",
          "flex items-center gap-2 min-w-[140px]",
          statusColor
        )}>
          {/* Icon */}
          <IconComponent className="w-3.5 h-3.5 flex-shrink-0" />
          
          {/* Value */}
          <div className="flex items-baseline gap-1 font-semibold text-sm">
            <span>{value.toFixed(1)}</span>
            <span className="text-xs font-normal opacity-80">{unit}</span>
          </div>

          {/* Live indicator */}
          {isLive && !isAlert && (
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse ml-auto" />
          )}
        </div>
        
        {/* Label tooltip on hover */}
        {label && (
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-6 opacity-0 hover:opacity-100 transition-opacity">
            <div className="px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md whitespace-nowrap border">
              {label}
            </div>
          </div>
        )}
      </div>
    </Html>
  );
}
