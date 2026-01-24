'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

function AnimatedSphere() {
  const meshRef = useRef<Mesh>(null);

  useFrame(state => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.5;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 100, 200]} scale={2.4}>
      <MeshDistortMaterial
        color='#10b981'
        attach='material'
        distort={0.3}
        speed={1.5}
        roughness={0}
      />
    </Sphere>
  );
}

function FloatingCube() {
  const meshRef = useRef<Mesh>(null);

  useFrame(state => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.1;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.3;
    }
  });

  return (
    <mesh ref={meshRef} position={[2, 0, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color='#3b82f6' wireframe />
    </mesh>
  );
}

export default function FloatingElements() {
  return (
    <div className='absolute inset-0 w-full h-full pointer-events-none'>
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <AnimatedSphere />
        <FloatingCube />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}
