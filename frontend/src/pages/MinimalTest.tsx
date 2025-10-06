import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Suspense } from 'react';
import StarField from '@/components/StarField';
import ErrorBoundary from '@/components/ErrorBoundary';

const MinimalTest = () => {
  const testMemories = [
    {
      id: '1',
      title: 'Test Memory',
      content: 'This is a test',
      category: 'Travel' as const,
      importance: 5,
      date: new Date().toISOString(),
      relatedIds: [],
      position: { x: 0, y: 0, z: 0 },
      tags: [],
      media: []
    }
  ];

  const handleMemoryClick = (memory: any) => {
    console.log('Memory clicked:', memory.title);
  };

  const handleCameraFocus = (position: [number, number, number]) => {
    console.log('Camera focus:', position);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'black' }}>
      <ErrorBoundary>
        <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Suspense fallback={null}>
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            
            <StarField
              memories={testMemories}
              onMemoryClick={handleMemoryClick}
              onCameraFocus={handleCameraFocus}
            />
          </Suspense>
          
          <OrbitControls enablePan enableZoom enableRotate />
        </Canvas>
      </ErrorBoundary>
    </div>
  );
};

export default MinimalTest;
