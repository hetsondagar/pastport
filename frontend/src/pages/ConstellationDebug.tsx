import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import { Suspense } from 'react';
import StarField from '@/components/StarField';
import ErrorBoundary from '@/components/ErrorBoundary';
import ThreeJSLoading from '@/components/ThreeJSLoading';
import WebGLContextManager from '@/components/WebGLContextManager';
import Navigation from '@/components/Navigation';

const ConstellationDebug = () => {
  const [memories] = useState([
    {
      id: '1',
      title: 'Debug Memory 1',
      content: 'This is a debug memory',
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
      title: 'Debug Memory 2',
      content: 'This is another debug memory',
      category: 'Learning' as const,
      importance: 6,
      date: new Date().toISOString(),
      relatedIds: [],
      position: { x: 3, y: 0, z: 0 },
      tags: [],
      media: []
    },
    {
      id: '3',
      title: 'Debug Memory 3',
      content: 'This is a third debug memory',
      category: 'Growth' as const,
      importance: 9,
      date: new Date().toISOString(),
      relatedIds: [],
      position: { x: 0, y: 3, z: 0 },
      tags: [],
      media: []
    }
  ]);

  const handleMemoryClick = (memory: any) => {
    console.log('Memory clicked:', memory.title);
    alert(`Clicked: ${memory.title}`);
  };

  const handleCameraFocus = (position: [number, number, number]) => {
    console.log('Camera focus:', position);
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl app-name-bold text-gradient mb-4">
              Constellation Debug
            </h1>
            <p className="text-muted-foreground text-lg">
              Testing constellation page functionality
            </p>
          </div>

          <div className="h-96 border border-white/10 rounded-lg overflow-hidden">
            <ErrorBoundary>
              <Canvas camera={{ position: [0, 0, 15], fov: 75 }}>
                <WebGLContextManager />
                <Suspense fallback={<ThreeJSLoading />}>
                  <ambientLight intensity={0.3} />
                  <pointLight position={[10, 10, 10]} intensity={1} />
                  <pointLight position={[-10, -10, -10]} intensity={0.5} />
                  <Environment preset="night" />
                  <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                  
                  <StarField
                    memories={memories}
                    onMemoryClick={handleMemoryClick}
                    onCameraFocus={handleCameraFocus}
                  />
                </Suspense>
                
                <OrbitControls enablePan enableZoom enableRotate />
              </Canvas>
            </ErrorBoundary>
          </div>

          <div className="mt-4 p-4 glass-card-enhanced">
            <h3 className="text-white font-bold mb-2">Debug Info:</h3>
            <p className="text-sm text-muted-foreground">
              If you can see a star field above without errors, the constellation page is working!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConstellationDebug;
