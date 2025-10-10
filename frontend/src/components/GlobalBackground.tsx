import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Environment } from '@react-three/drei';

const Rotator = ({ enableEnv }: { enableEnv: boolean }) => {
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
      <ambientLight intensity={0.22} />
      <Stars radius={240} depth={160} count={20000} factor={4.5} saturation={0} fade speed={0.4} />
      {enableEnv ? <Environment preset="night" /> : null}
    </group>
  );
};

const GlobalBackground = () => {
  const enableEnv = useMemo(() => {
    if (typeof navigator === 'undefined') return true;
    return navigator.onLine; // avoid HDR fetch when offline
  }, []);

  const canUseWebGL = useMemo(() => {
    try {
      const canvas = document.createElement('canvas');
      return !!(
        canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl')
      );
    } catch {
      return false;
    }
  }, []);

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
      {canUseWebGL ? (
      <Canvas
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 20], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        <Rotator enableEnv={enableEnv} />
      </Canvas>
      ) : (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'transparent',
            backgroundImage:
              'radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)',
            backgroundSize: '3px 3px, 2px 2px',
            backgroundPosition: '0 0, 1px 1px',
            opacity: 0.6,
          }}
        />
      )}
    </div>
  );
};

export default GlobalBackground;


