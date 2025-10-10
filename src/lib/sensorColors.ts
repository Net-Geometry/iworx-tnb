/**
 * Sensor Type Color Mapping
 * 
 * Color scheme for different sensor types in 3D visualization
 */

export const SENSOR_COLORS: Record<string, string> = {
  temperature: '#ef4444',    // Red
  vibration: '#8b5cf6',      // Purple
  pressure: '#3b82f6',       // Blue
  humidity: '#10b981',       // Green
  voltage: '#f59e0b',        // Orange
  current: '#ec4899',        // Pink
  power: '#14b8a6',          // Teal
  flow: '#06b6d4',          // Cyan
  level: '#6366f1',         // Indigo
  speed: '#a855f7',         // Purple
  torque: '#f97316',        // Orange
  default: '#64748b',       // Slate
};

export function getSensorColor(sensorType: string): string {
  return SENSOR_COLORS[sensorType.toLowerCase()] || SENSOR_COLORS.default;
}

export function getSensorIcon(sensorType: string): string {
  const iconMap: Record<string, string> = {
    temperature: 'Thermometer',
    vibration: 'Activity',
    pressure: 'Gauge',
    humidity: 'Droplets',
    voltage: 'Zap',
    current: 'Zap',
    power: 'Battery',
    flow: 'ArrowRight',
    level: 'BarChart3',
    speed: 'Gauge',
    torque: 'CircleDot',
  };
  
  return iconMap[sensorType.toLowerCase()] || 'Sensor';
}
