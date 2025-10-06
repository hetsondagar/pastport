import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';

const SimpleSphere = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', background: 'black' }}>
      <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10, color: 'white' }}>
        <h1>Simple Sphere Test</h1>
        <p>If you see a red sphere without errors, Three.js is working!</p>
      </div>
      
      <ErrorBoundary>
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <Suspense fallback={<div style={{ color: 'white', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>Loading...</div>}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            
            <mesh>
              <sphereGeometry args={[1, 32, 32]} />
              <meshStandardMaterial color="red" />
            </mesh>
          </Suspense>
          
          <OrbitControls enablePan enableZoom enableRotate />
        </Canvas>
      </ErrorBoundary>
    </div>
  );
};

export default SimpleSphere;
