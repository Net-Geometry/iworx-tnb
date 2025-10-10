/**
 * Power Line 3D Component
 * 
 * Renders electrical power lines with animated flow
 */

import { Line } from '@react-three/drei';
import { getVoltageColor, getLoadPercentageColor, type GridPowerLine } from '../mock-data/mockGridData';

interface PowerLine3DProps {
  line: GridPowerLine;
  onClick?: () => void;
  isSelected?: boolean;
}

export function PowerLine3D({ line, onClick, isSelected }: PowerLine3DProps) {
  const loadPercent = (line.current_load_mva / line.capacity_mva) * 100;
  const voltageColor = getVoltageColor(line.voltageLevel);
  const loadColor = getLoadPercentageColor(loadPercent);
  
  // Line thickness based on voltage level
  const getLineWidth = (voltage: string): number => {
    const widths: Record<string, number> = {
      '500kV': 0.8,
      '275kV': 0.6,
      '132kV': 0.4,
      '33kV': 0.25,
      '11kV': 0.15,
    };
    return widths[voltage] || 0.3;
  };

  const lineWidth = getLineWidth(line.voltageLevel);
  const opacity = line.status === 'energized' ? 1 : 0.3;

  return (
    <group>
      {/* Main power line */}
      <Line
        points={line.line_path}
        color={line.status === 'energized' ? voltageColor : '#6B7280'}
        lineWidth={lineWidth}
        opacity={opacity}
        transparent
        onClick={onClick}
      />
      
      {/* Load indicator line (thinner, colored by load) */}
      {line.status === 'energized' && (
        <Line
          points={line.line_path}
          color={loadColor}
          lineWidth={lineWidth * 0.5}
          opacity={0.6}
          transparent
        />
      )}
      
      {/* Selection indicator */}
      {isSelected && (
        <Line
          points={line.line_path}
          color="#ffffff"
          lineWidth={lineWidth * 1.5}
          opacity={0.5}
          transparent
        />
      )}
    </group>
  );
}
