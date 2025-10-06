import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import Navigation from '@/components/Navigation';

const StarTest = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl app-name-bold text-gradient mb-4">
              Star Test
            </h1>
            <p className="text-muted-foreground text-lg">
              Simple test to verify stars are visible
            </p>
          </div>

          <div className="h-96 border border-white/10 rounded-lg overflow-hidden">
            <ErrorBoundary>
              <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
                <Suspense fallback={null}>
                  <ambientLight intensity={0.5} />
                  <pointLight position={[10, 10, 10]} intensity={1} />
                  
                  {/* Simple test star */}
                  <mesh position={[0, 0, 0]}>
                    <sphereGeometry args={[0.5, 16, 16]} />
                    <meshStandardMaterial color="#3B82F6" emissive="#1E40AF" emissiveIntensity={0.5} />
                  </mesh>
                  
                  {/* Another test star */}
                  <mesh position={[2, 0, 0]}>
                    <sphereGeometry args={[0.3, 16, 16]} />
                    <meshStandardMaterial color="#10B981" emissive="#059669" emissiveIntensity={0.5} />
                  </mesh>
                  
                  {/* Third test star */}
                  <mesh position={[-2, 0, 0]}>
                    <sphereGeometry args={[0.4, 16, 16]} />
                    <meshStandardMaterial color="#F59E0B" emissive="#D97706" emissiveIntensity={0.5} />
                  </mesh>
                </Suspense>
                
                <OrbitControls enablePan enableZoom enableRotate />
              </Canvas>
            </ErrorBoundary>
          </div>

          <div className="mt-4 p-4 glass-card-enhanced">
            <h3 className="text-white font-bold mb-2">Test Results:</h3>
            <p className="text-sm text-muted-foreground">
              You should see 3 colored spheres above. If you can see them, the Three.js rendering is working!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StarTest;
