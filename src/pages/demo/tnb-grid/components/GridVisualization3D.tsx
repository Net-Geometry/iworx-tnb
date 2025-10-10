/**
 * Grid Visualization 3D Component
 * 
 * Main 3D scene for electrical grid visualization
 */

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera } from '@react-three/drei';
import { Substation3D } from './Substation3D';
import { PowerLine3D } from './PowerLine3D';
import { LoadFlowParticles } from './LoadFlowParticles';
import { useMockGridData } from '../hooks/useMockGridData';

interface GridVisualization3DProps {
  selectedSubstationId?: string | null;
  selectedLineId?: string | null;
  onSubstationClick?: (id: string) => void;
  onLineClick?: (id: string) => void;
  showLoadFlow?: boolean;
}

export function GridVisualization3D({
  selectedSubstationId,
  selectedLineId,
  onSubstationClick,
  onLineClick,
  showLoadFlow = true,
}: GridVisualization3DProps) {
  const { substations, powerLines } = useMockGridData();

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border border-border bg-black">
      <Canvas>
        <PerspectiveCamera makeDefault position={[60, 50, 60]} fov={60} />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[50, 50, 25]} intensity={1} castShadow />
        <directionalLight position={[-50, 30, -25]} intensity={0.5} />
        <pointLight position={[0, 50, 0]} intensity={0.5} />

        {/* Grid floor */}
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

        {/* Power lines */}
        {powerLines.map((line) => (
          <PowerLine3D
            key={line.id}
            line={line}
            onClick={() => onLineClick?.(line.id)}
            isSelected={selectedLineId === line.id}
          />
        ))}

        {/* Load flow particles */}
        {showLoadFlow && powerLines.map((line) => (
          <LoadFlowParticles key={`particles-${line.id}`} line={line} />
        ))}

        {/* Substations */}
        {substations.map((substation) => (
          <Substation3D
            key={substation.id}
            substation={substation}
            onClick={() => onSubstationClick?.(substation.id)}
            isSelected={selectedSubstationId === substation.id}
          />
        ))}

        {/* Camera controls */}
        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          maxPolarAngle={Math.PI / 2}
          minDistance={20}
          maxDistance={150}
        />
      </Canvas>
    </div>
  );
}
