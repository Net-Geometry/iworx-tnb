/**
 * Interactive Sensor Badge Component
 * 
 * Enhanced sensor reading badge with interactions, alerts, and mini trends
 */

import { Html } from '@react-three/drei';
import { useState } from 'react';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InteractiveSensorBadgeProps {
  position: [number, number, number];
  sensorType: string;
  value: number;
  unit: string;
  label: string;
  isAlert: boolean;
  isLive: boolean;
  isFiltered?: boolean;
  onClick?: () => void;
  isSelected?: boolean;
}

export function InteractiveSensorBadge({
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
}: InteractiveSensorBadgeProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    setIsExpanded(!isExpanded);
    onClick?.();
  };

  return (
    <Html position={position} center>
      <div 
        className={cn(
          "transition-all duration-300 cursor-pointer",
          isFiltered && "opacity-30 scale-90",
          isSelected && "scale-110"
        )}
        onClick={handleClick}
      >
        <div className={cn(
          "px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm border transition-all",
          "hover:scale-105 hover:shadow-xl",
          isAlert 
            ? "bg-destructive/90 text-destructive-foreground border-destructive animate-pulse" 
            : "bg-card/90 border-border",
          isExpanded && "min-w-[180px]"
        )}>
          <div className="flex items-center gap-2">
            {isLive && !isAlert && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            )}
            {isAlert && (
              <AlertTriangle className="w-4 h-4 text-destructive-foreground" />
            )}
            <div className="flex-1">
              <div className="text-xs text-muted-foreground truncate">
                {label}
              </div>
              <div className="text-lg font-bold flex items-baseline gap-1">
                {value.toFixed(1)} 
                <span className="text-xs font-normal">{unit}</span>
              </div>
            </div>
            {isExpanded && (
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          
          {isExpanded && (
            <div className="mt-2 pt-2 border-t border-border/50 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Type:</span>
                <span className="font-medium capitalize">{sensorType}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Status:</span>
                <span className={cn(
                  "font-medium",
                  isAlert ? "text-destructive-foreground" : "text-green-500"
                )}>
                  {isAlert ? "Alert" : "Normal"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Html>
  );
}
