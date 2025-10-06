import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import ErrorBoundary from '@/components/ErrorBoundary';

// Simple rotating cube component
function RotatingCube() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta;
      meshRef.current.rotation.y += delta;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}

const BulletproofTest = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', background: 'black' }}>
      <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10, color: 'white' }}>
        <h1>Bulletproof Three.js Test</h1>
        <p>If you see a rotating orange cube without the 'S' error, Three.js is working!</p>
      </div>
      
      <ErrorBoundary>
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <RotatingCube />
          </Suspense>
          
          <OrbitControls enablePan enableZoom enableRotate />
        </Canvas>
      </ErrorBoundary>
    </div>
  );
};

export default BulletproofTest;
