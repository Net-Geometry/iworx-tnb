/**
 * Grid Navigation Hook
 * 
 * Manages hierarchical navigation state for the grid visualization
 */

import { useState } from 'react';

export interface NavigationNode {
  id: string;
  name: string;
  type: 'grid' | 'substation' | 'equipment' | 'component';
  level: number;
  position?: [number, number, number];
}

export const useGridNavigation = () => {
  const [navigationStack, setNavigationStack] = useState<NavigationNode[]>([
    { id: 'root', name: 'Grid Overview', type: 'grid', level: 0 }
  ]);
  
  const currentLevel = navigationStack[navigationStack.length - 1];
  const isAtRoot = navigationStack.length === 1;
  
  const drillDown = (node: NavigationNode) => {
    setNavigationStack([...navigationStack, node]);
  };
  
  const navigateUp = () => {
    if (!isAtRoot) {
      setNavigationStack(navigationStack.slice(0, -1));
    }
  };
  
  const navigateToLevel = (levelIndex: number) => {
    setNavigationStack(navigationStack.slice(0, levelIndex + 1));
  };
  
  return {
    navigationStack,
    currentLevel,
    isAtRoot,
    drillDown,
    navigateUp,
    navigateToLevel,
  };
};
