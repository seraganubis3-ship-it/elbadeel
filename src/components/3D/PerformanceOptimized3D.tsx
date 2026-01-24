'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Performance optimization hook
function usePerformanceMode() {
  const [isLowPerformance, setIsLowPerformance] = useState(false);

  useEffect(() => {
    // Check for mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Check for low-end devices (basic heuristic)
    const isLowEnd = navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 2 : false;

    setIsLowPerformance(isMobile || prefersReducedMotion || isLowEnd);
  }, []);

  return isLowPerformance;
}

// Dynamic import for 3D components to avoid SSR issues
const DynamicCanvas = dynamic(
  () => import('@react-three/fiber').then(mod => ({ default: mod.Canvas })),
  {
    ssr: false,
    loading: () => (
      <div className='absolute inset-0 w-full h-full pointer-events-none'>
        <div className='w-full h-full bg-gradient-to-br from-green-500/10 to-blue-500/10 animate-pulse'></div>
      </div>
    ),
  }
);

const DynamicSphere = dynamic(
  () => import('@react-three/drei').then(mod => ({ default: mod.Sphere })),
  {
    ssr: false,
  }
);

const DynamicMeshDistortMaterial = dynamic(
  () => import('@react-three/drei').then(mod => ({ default: mod.MeshDistortMaterial })),
  {
    ssr: false,
  }
);

const DynamicOrbitControls = dynamic(
  () => import('@react-three/drei').then(mod => ({ default: mod.OrbitControls })),
  {
    ssr: false,
  }
);

// Simple 3D Scene Component
function Simple3DScene() {
  return (
    <DynamicCanvas
      camera={{ position: [0, 0, 5], fov: 75 }}
      dpr={[1, 2]}
      performance={{ min: 0.5 }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <DynamicSphere args={[1, 32, 32]} scale={2.4}>
        <DynamicMeshDistortMaterial
          color='#10b981'
          attach='material'
          distort={0.2}
          speed={1}
          roughness={0}
        />
      </DynamicSphere>
      <DynamicOrbitControls enableZoom={false} enablePan={false} />
    </DynamicCanvas>
  );
}

export default function PerformanceOptimized3D() {
  const isLowPerformance = usePerformanceMode();

  // Don't render 3D on low-performance devices
  if (isLowPerformance) {
    return (
      <div className='absolute inset-0 w-full h-full pointer-events-none'>
        <div className='w-full h-full bg-gradient-to-br from-green-500/10 to-blue-500/10 animate-pulse'></div>
      </div>
    );
  }

  return (
    <div className='absolute inset-0 w-full h-full pointer-events-none'>
      <Simple3DScene />
    </div>
  );
}
