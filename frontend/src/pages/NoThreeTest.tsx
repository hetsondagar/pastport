import { useState } from 'react';

const NoThreeTest = () => {
  const [count, setCount] = useState(0);

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'black', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1>No Three.js Test</h1>
      <p>This page doesn't use Three.js at all</p>
      <p>Count: {count}</p>
      <button 
        onClick={() => setCount(count + 1)}
        style={{ padding: '10px 20px', margin: '10px', background: 'blue', color: 'white', border: 'none', borderRadius: '5px' }}
      >
        Click me
      </button>
      <p>If you can see this without the 'S' error, the issue is specifically with Three.js</p>
    </div>
  );
};

export default NoThreeTest;
