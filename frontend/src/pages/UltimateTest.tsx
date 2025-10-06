import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import StarField from '@/components/StarField';
import ErrorBoundary from '@/components/ErrorBoundary';
import ThreeJSLoader from '@/components/ThreeJSLoader';

const UltimateTest = () => {
  const testMemories = [
    {
      id: '1',
      title: 'Test Star 1',
      content: 'This is a test star',
      category: 'Travel' as const,
      importance: 5,
      date: new Date().toISOString(),
      relatedIds: [],
      position: { x: 0, y: 0, z: 0 },
      tags: [],
      media: []
    },
    {
      id: '2',
      title: 'Test Star 2',
      content: 'This is another test star',
      category: 'Learning' as const,
      importance: 7,
      date: new Date().toISOString(),
      relatedIds: [],
      position: { x: 3, y: 0, z: 0 },
      tags: [],
      media: []
    }
  ];

  const handleMemoryClick = (memory: any) => {
    console.log('Memory clicked:', memory.title);
    alert(`Clicked: ${memory.title}`);
  };

  const handleCameraFocus = (position: [number, number, number]) => {
    console.log('Camera focus:', position);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'black' }}>
      <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10, color: 'white' }}>
        <h1>Ultimate Three.js Test</h1>
        <p>If you see this without the 'S' error, everything is fixed!</p>
      </div>
      
      <ErrorBoundary>
        <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
          <ThreeJSLoader>
            <Environment preset="night" />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            
            <StarField
              memories={testMemories}
              onMemoryClick={handleMemoryClick}
              onCameraFocus={handleCameraFocus}
            />
          </ThreeJSLoader>
          
          <OrbitControls enablePan enableZoom enableRotate />
        </Canvas>
      </ErrorBoundary>
    </div>
  );
};

export default UltimateTest;
