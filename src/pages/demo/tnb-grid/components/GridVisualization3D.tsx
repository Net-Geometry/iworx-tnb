/**
 * Grid Visualization 3D Component
 * 
 * Main 3D scene for electrical grid visualization
 */

import { Canvas } from '@react-three/fiber';
import { Grid, PerspectiveCamera } from '@react-three/drei';
import { Substation3D } from './Substation3D';
import { PowerLine3D } from './PowerLine3D';
import { LoadFlowParticles } from './LoadFlowParticles';
import { useMockGridData } from '../hooks/useMockGridData';
import { AnimatedCamera } from './AnimatedCamera';
import { SubstationInterior } from './SubstationInterior';
import { EquipmentRenderer } from './equipment/EquipmentRenderer';
import type { NavigationNode } from '../hooks/useGridNavigation';

interface GridVisualization3DProps {
  selectedSubstationId?: string | null;
  selectedLineId?: string | null;
  onSubstationClick?: (id: string) => void;
  onLineClick?: (id: string) => void;
  showLoadFlow?: boolean;
  currentLevel: NavigationNode;
  onItemClick?: (item: any) => void;
}

export function GridVisualization3D({
  selectedSubstationId,
  selectedLineId,
  onSubstationClick,
  onLineClick,
  showLoadFlow = true,
  currentLevel,
  onItemClick,
}: GridVisualization3DProps) {
  const { substations, powerLines } = useMockGridData();

  // Calculate camera position based on current level
  const getCameraConfig = () => {
    switch (currentLevel.type) {
      case 'grid':
        return { position: [60, 50, 60] as [number, number, number], target: [0, 0, 0] as [number, number, number] };
      
      case 'substation':
        const substationPos = currentLevel.position || [0, 0, 0];
        return { 
          position: [substationPos[0] + 15, 20, substationPos[2] + 15] as [number, number, number],
          target: substationPos as [number, number, number]
        };
      
      case 'equipment':
        const equipmentPos = currentLevel.position || [0, 0, 0];
        return {
          position: [equipmentPos[0] + 5, 8, equipmentPos[2] + 5] as [number, number, number],
          target: equipmentPos as [number, number, number]
        };
      
      default:
        return { position: [60, 50, 60] as [number, number, number], target: [0, 0, 0] as [number, number, number] };
    }
  };

  const cameraConfig = getCameraConfig();

  // Render content based on current level
  const renderContent = () => {
    switch (currentLevel.type) {
      case 'grid':
        // Grid overview: show all substations and power lines
        return (
          <>
            {powerLines.map((line) => (
              <PowerLine3D
                key={line.id}
                line={line}
                onClick={() => onLineClick?.(line.id)}
                isSelected={selectedLineId === line.id}
              />
            ))}

            {showLoadFlow && powerLines.map((line) => (
              <LoadFlowParticles key={`particles-${line.id}`} line={line} />
            ))}

            {substations.map((substation) => (
              <Substation3D
                key={substation.id}
                substation={substation}
                onClick={() => {
                  onSubstationClick?.(substation.id);
                  onItemClick?.({
                    id: substation.id,
                    name: substation.name,
                    type: 'substation',
                    position: substation.position,
                  });
                }}
                isSelected={selectedSubstationId === substation.id}
              />
            ))}
          </>
        );
      
      case 'substation':
        // Substation interior: show equipment
        const substation = substations.find(s => s.id === currentLevel.id);
        return (
          <>
            <SubstationInterior />
            
            {substation?.children?.map((equipment) => (
              <EquipmentRenderer
                key={equipment.id}
                equipment={equipment}
                onClick={() => {
                  onItemClick?.({
                    id: equipment.id,
                    name: equipment.name,
                    type: 'equipment',
                    position: equipment.position,
                    equipment,
                  });
                }}
                isSelected={selectedSubstationId === equipment.id}
              />
            ))}
          </>
        );
      
      case 'equipment':
        // Equipment detail: show components (if any)
        const parentSubstation = substations.find(s => 
          s.children?.some(e => e.id === currentLevel.id)
        );
        const equipment = parentSubstation?.children?.find(e => e.id === currentLevel.id);
        
        return (
          <>
            <SubstationInterior />
            
            {equipment && (
              <EquipmentRenderer
                equipment={equipment}
                isSelected={true}
              />
            )}
            
            {equipment?.children?.map((component) => (
              <EquipmentRenderer
                key={component.id}
                equipment={component}
                onClick={() => {
                  onItemClick?.({
                    id: component.id,
                    name: component.name,
                    type: 'component',
                    position: component.position,
                  });
                }}
              />
            ))}
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border border-border bg-black">
      <Canvas>
        <PerspectiveCamera makeDefault position={cameraConfig.position} fov={60} />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[50, 50, 25]} intensity={1} castShadow />
        <directionalLight position={[-50, 30, -25]} intensity={0.5} />
        <pointLight position={[0, 50, 0]} intensity={0.5} />

        {/* Grid floor - only show at grid level */}
        {currentLevel.type === 'grid' && (
          <Grid
            args={[100, 100]}
            cellSize={5}
            cellThickness={0.5}
            cellColor="#4B5563"
            sectionSize={20}
            sectionThickness={1}
            sectionColor="#6B7280"
            fadeDistance={150}
            fadeStrength={1}
            position={[0, -0.5, 0]}
          />
        )}

        {/* Render content based on navigation level */}
        {renderContent()}

        {/* Animated camera controls */}
        <AnimatedCamera
          targetPosition={cameraConfig.position}
          lookAt={cameraConfig.target}
        />
      </Canvas>
    </div>
  );
}
