import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import StarField from '@/components/StarField';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

const TestConstellation = () => {
  const [memories, setMemories] = useState([
    {
      id: '1',
      title: 'Trip to Paris',
      content: 'Amazing vacation in Paris with beautiful architecture and delicious food.',
      category: 'Travel' as const,
      importance: 8,
      date: new Date().toISOString(),
      relatedIds: ['2'],
      position: { x: 0, y: 0, z: 0 },
      tags: ['vacation', 'paris'],
      media: []
    },
    {
      id: '2',
      title: 'Learning React',
      content: 'Started learning React and built my first component.',
      category: 'Learning' as const,
      importance: 6,
      date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      relatedIds: ['1'],
      position: { x: 2, y: 0, z: 0 },
      tags: ['coding', 'react'],
      media: []
    },
    {
      id: '3',
      title: 'Personal Growth',
      content: 'Reflected on my goals and made important life decisions.',
      category: 'Growth' as const,
      importance: 9,
      date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      relatedIds: [],
      position: { x: 0, y: 2, z: 0 },
      tags: ['reflection', 'goals'],
      media: []
    }
  ]);

  const handleMemoryClick = (memory: any) => {
    console.log('Memory clicked:', memory.title);
    alert(`Clicked on: ${memory.title}\nCategory: ${memory.category}\nImportance: ${memory.importance}/10`);
  };

  const handleCameraFocus = (position: [number, number, number]) => {
    console.log('Camera focus:', position);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="fixed top-4 left-4 right-4 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Test Constellation</h1>
            <p className="text-gray-300">Simple 3D memory visualization</p>
          </div>
          <Button
            onClick={() => window.location.href = '/dashboard'}
            className="glass-card border-white/10 hover:bg-white/10"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="fixed inset-0">
        <Canvas
          camera={{ position: [0, 0, 10], fov: 75 }}
          style={{ background: 'transparent' }}
        >
          <Environment preset="night" />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          
          <StarField
            memories={memories}
            onMemoryClick={handleMemoryClick}
            onCameraFocus={handleCameraFocus}
          />
          
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={50}
          />
        </Canvas>
      </div>

      {/* Instructions */}
      <div className="fixed bottom-4 left-4 z-10">
        <div className="glass-card border-white/10 bg-background/90 backdrop-blur-xl p-4">
          <h3 className="text-white font-bold mb-2">Instructions:</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Click on stars to view memory details</li>
            <li>• Use mouse to rotate the view</li>
            <li>• Scroll to zoom in/out</li>
            <li>• Drag to pan around</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestConstellation;
