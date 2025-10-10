/**
 * Animated Camera Component
 * 
 * Smoothly animates camera position and target for navigation transitions
 */

import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface AnimatedCameraProps {
  targetPosition: [number, number, number];
  lookAt: [number, number, number];
  duration?: number;
  children?: React.ReactNode;
}

export function AnimatedCamera({
  targetPosition,
  lookAt,
  duration = 1500,
}: AnimatedCameraProps) {
  const { camera } = useThree();
  const controlsRef = useRef<any>();
  
  const startPosition = useRef(new THREE.Vector3());
  const endPosition = useRef(new THREE.Vector3(...targetPosition));
  const startTarget = useRef(new THREE.Vector3());
  const endTarget = useRef(new THREE.Vector3(...lookAt));
  const animationProgress = useRef(0);
  const isAnimating = useRef(false);

  useEffect(() => {
    // Start animation when target changes
    startPosition.current.copy(camera.position);
    endPosition.current.set(...targetPosition);
    
    if (controlsRef.current) {
      startTarget.current.copy(controlsRef.current.target);
    }
    endTarget.current.set(...lookAt);
    
    animationProgress.current = 0;
    isAnimating.current = true;
  }, [targetPosition, lookAt, camera]);

  useFrame((_, delta) => {
    if (!isAnimating.current) return;
    
    // Update progress (delta is in seconds, duration is in milliseconds)
    animationProgress.current += (delta * 1000) / duration;
    
    if (animationProgress.current >= 1) {
      animationProgress.current = 1;
      isAnimating.current = false;
    }
    
    // Ease-in-out cubic function
    const t = animationProgress.current;
    const eased = t < 0.5 
      ? 4 * t * t * t 
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
    
    // Interpolate camera position
    camera.position.lerpVectors(
      startPosition.current,
      endPosition.current,
      eased
    );
    
    // Interpolate orbit controls target
    if (controlsRef.current) {
      controlsRef.current.target.lerpVectors(
        startTarget.current,
        endTarget.current,
        eased
      );
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan
      enableZoom
      enableRotate
      maxPolarAngle={Math.PI / 2}
      minDistance={5}
      maxDistance={150}
    />
  );
}
