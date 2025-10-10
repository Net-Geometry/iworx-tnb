/**
 * Mock Grid Data Hook
 * 
 * Simulates real-time load changes for demo purposes
 */

import { useState, useEffect } from 'react';
import { mockSubstations, mockPowerLines, type GridSubstation, type GridPowerLine } from '../mock-data/mockGridData';

export const useMockGridData = () => {
  const [substations, setSubstations] = useState<GridSubstation[]>(mockSubstations);
  const [powerLines, setPowerLines] = useState<GridPowerLine[]>(mockPowerLines);

  useEffect(() => {
    // Simulate real-time load changes every 3 seconds
    const interval = setInterval(() => {
      setSubstations(prev =>
        prev.map(sub => {
          // Skip if de-energized or in maintenance
          if (sub.status !== 'energized') return sub;

          // Random load variation ±10%
          const variation = (Math.random() - 0.5) * 0.2;
          const newLoad = sub.current_load_mva * (1 + variation);
          
          // Keep within 50% to 95% of capacity
          const clampedLoad = Math.max(
            sub.capacity_mva * 0.5,
            Math.min(sub.capacity_mva * 0.95, newLoad)
          );

          return {
            ...sub,
            current_load_mva: Math.round(clampedLoad * 10) / 10,
          };
        })
      );

      setPowerLines(prev =>
        prev.map(line => {
          // Skip if de-energized
          if (line.status !== 'energized') return line;

          // Random load variation ±8%
          const variation = (Math.random() - 0.5) * 0.16;
          const newLoad = line.current_load_mva * (1 + variation);
          
          // Keep within 60% to 90% of capacity
          const clampedLoad = Math.max(
            line.capacity_mva * 0.6,
            Math.min(line.capacity_mva * 0.9, newLoad)
          );

          return {
            ...line,
            current_load_mva: Math.round(clampedLoad * 10) / 10,
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return {
    substations,
    powerLines,
  };
};
