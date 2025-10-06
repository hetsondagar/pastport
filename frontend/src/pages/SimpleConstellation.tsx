import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import Navigation from '@/components/Navigation';

const SimpleConstellation = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl app-name-bold text-gradient mb-4">
              Simple Constellation
            </h1>
            <p className="text-muted-foreground text-lg">
              Ultra-simple constellation test
            </p>
          </div>

          <div className="h-96 border-2 border-red-500 rounded-lg overflow-hidden bg-black">
            <ErrorBoundary>
              <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
                <Suspense fallback={null}>
                  {/* Strong lighting */}
                  <ambientLight intensity={1} />
                  <pointLight position={[10, 10, 10]} intensity={2} />
                  <pointLight position={[-10, -10, -10]} intensity={1} />
                  
                  {/* Big bright star 1 */}
                  <mesh position={[0, 0, 0]}>
                    <sphereGeometry args={[1, 16, 16]} />
                    <meshStandardMaterial 
                      color="#FF0000" 
                      emissive="#FF0000" 
                      emissiveIntensity={1}
                    />
                  </mesh>
                  
                  {/* Big bright star 2 */}
                  <mesh position={[3, 0, 0]}>
                    <sphereGeometry args={[0.8, 16, 16]} />
                    <meshStandardMaterial 
                      color="#00FF00" 
                      emissive="#00FF00" 
                      emissiveIntensity={1}
                    />
                  </mesh>
                  
                  {/* Big bright star 3 */}
                  <mesh position={[-3, 0, 0]}>
                    <sphereGeometry args={[0.6, 16, 16]} />
                    <meshStandardMaterial 
                      color="#0000FF" 
                      emissive="#0000FF" 
                      emissiveIntensity={1}
                    />
                  </mesh>
                  
                  {/* Big bright star 4 */}
                  <mesh position={[0, 3, 0]}>
                    <sphereGeometry args={[0.7, 16, 16]} />
                    <meshStandardMaterial 
                      color="#FFFF00" 
                      emissive="#FFFF00" 
                      emissiveIntensity={1}
                    />
                  </mesh>
                </Suspense>
                
                <OrbitControls enablePan enableZoom enableRotate />
              </Canvas>
            </ErrorBoundary>
          </div>

          <div className="mt-4 p-4 glass-card-enhanced">
            <h3 className="text-white font-bold mb-2">Ultra-Simple Test:</h3>
            <p className="text-sm text-muted-foreground">
              You should see 4 LARGE, BRIGHT colored spheres above (red, green, blue, yellow).
              If you can't see them, there's a fundamental Three.js issue.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleConstellation;
