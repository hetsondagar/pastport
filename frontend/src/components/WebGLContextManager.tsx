import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';

const WebGLContextManager = () => {
  const { gl } = useThree();
  const contextLostRef = useRef(false);

  useEffect(() => {
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      contextLostRef.current = true;
      console.warn('WebGL context lost, attempting to restore...');
    };

    const handleContextRestored = () => {
      contextLostRef.current = false;
      console.log('WebGL context restored');
      // Force a re-render by updating the scene
      if (gl) {
        gl.forceContextRestore();
      }
    };

    const canvas = gl.domElement;
    
    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, [gl]);

  return null;
};

export default WebGLContextManager;
