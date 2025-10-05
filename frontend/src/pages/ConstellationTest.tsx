import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import StarField from '@/components/StarField';

const ConstellationTest = () => {
  const testMemories = [
    {
      id: '1',
      title: 'Test Memory 1',
      content: 'This is a test memory',
      category: 'Travel' as const,
      importance: 8,
      date: new Date().toISOString(),
      relatedIds: [],
      position: { x: 0, y: 0, z: 0 },
      tags: [],
      media: []
    },
    {
      id: '2',
      title: 'Test Memory 2',
      content: 'This is another test memory',
      category: 'Learning' as const,
      importance: 6,
      date: new Date().toISOString(),
      relatedIds: [],
      position: { x: 2, y: 0, z: 0 },
      tags: [],
      media: []
    }
  ];

  const handleMemoryClick = (memory: any) => {
    console.log('Memory clicked:', memory.title);
    alert(`Clicked: ${memory.title}\nCategory: ${memory.category}`);
  };

  const handleCameraFocus = (position: [number, number, number]) => {
    console.log('Camera focus:', position);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'black' }}>
      <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10, color: 'white' }}>
        <h1>Constellation Test</h1>
        <p>Click on the stars to test interactions</p>
      </div>
      
      <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
        <Environment preset="night" />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <StarField
          memories={testMemories}
          onMemoryClick={handleMemoryClick}
          onCameraFocus={handleCameraFocus}
        />
        
        <OrbitControls enablePan enableZoom enableRotate />
      </Canvas>
    </div>
  );
};

export default ConstellationTest;
