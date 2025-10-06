import { Suspense } from 'react';

interface ThreeJSLoaderProps {
  children: React.ReactNode;
}

const ThreeJSLoader = ({ children }: ThreeJSLoaderProps) => {
  return (
    <Suspense fallback={
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: 'white',
        textAlign: 'center',
        zIndex: 1000
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(255,255,255,0.3)',
          borderTop: '3px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 10px'
        }} />
        <div>Loading 3D scene...</div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    }>
      {children}
    </Suspense>
  );
};

export default ThreeJSLoader;
