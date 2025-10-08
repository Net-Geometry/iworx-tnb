/**
 * Digital Twin Navigation Hook
 * 
 * Manages camera zoom levels and hierarchy navigation
 */

import { useState } from 'react';

export interface NavigationLevel {
  hierarchyNodeId: string;
  nodeName: string;
  levelOrder: number;
}

export const useDigitalTwinNavigation = () => {
  const [breadcrumb, setBreadcrumb] = useState<NavigationLevel[]>([]);
  const [currentLevel, setCurrentLevel] = useState<NavigationLevel | null>(null);

  const zoomTo = (level: NavigationLevel) => {
    setCurrentLevel(level);
    
    // Update breadcrumb trail
    const existingIndex = breadcrumb.findIndex(l => l.hierarchyNodeId === level.hierarchyNodeId);
    
    if (existingIndex >= 0) {
      // Zoom back - truncate breadcrumb
      setBreadcrumb(breadcrumb.slice(0, existingIndex + 1));
    } else {
      // Zoom in - add to breadcrumb
      setBreadcrumb([...breadcrumb, level]);
    }
  };

  const zoomOut = () => {
    if (breadcrumb.length > 1) {
      const newBreadcrumb = breadcrumb.slice(0, -1);
      setBreadcrumb(newBreadcrumb);
      setCurrentLevel(newBreadcrumb[newBreadcrumb.length - 1]);
    }
  };

  const resetToRoot = () => {
    setBreadcrumb([]);
    setCurrentLevel(null);
  };

  return {
    zoomTo,
    zoomOut,
    resetToRoot,
    currentLevel,
    breadcrumb,
  };
};
