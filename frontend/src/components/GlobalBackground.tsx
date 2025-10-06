import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Environment } from '@react-three/drei';

const Rotator = () => {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime;
      ref.current.rotation.y = t * 0.02;
      ref.current.rotation.x = Math.sin(t * 0.1) * 0.05;
    }
  });
  return (
    <group ref={ref}>
      <ambientLight intensity={0.2} />
      <Stars radius={150} depth={80} count={6000} factor={3} saturation={0} fade speed={1} />
      <Environment preset="night" />
    </group>
  );
};

const GlobalBackground = () => {
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 20], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <Rotator />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default GlobalBackground;


