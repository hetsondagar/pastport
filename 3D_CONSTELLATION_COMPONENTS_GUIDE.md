# 3D Constellation Components & Camera Controls Guide

## 🎨 Overview
Your constellation feature uses **React Three Fiber** ecosystem to create an immersive 3D space visualization of journal entries as stars.

---

## 📦 Core 3D Libraries

### 1. **React Three Fiber** (`@react-three/fiber`)
React renderer for Three.js - turns Three.js into declarative React components.

**Main Components Used:**
- `Canvas` - Main wrapper for the 3D scene
- `useFrame` - Hook for animation loop
- `useThree` - Hook to access Three.js internals

### 2. **React Three Drei** (`@react-three/drei`)
Helper components and abstractions for React Three Fiber.

**Components Used:**
- `OrbitControls` - Camera controls (rotate, zoom, pan)
- `PerspectiveCamera` - 3D camera
- `Stars` - Background stars
- `Environment` - Lighting presets
- `Text` - 3D text rendering
- `Html` - Embed HTML in 3D space
- `Billboard` - Always face camera
- `Sparkles` - Particle effects
- `Sphere` - Basic 3D sphere

### 3. **Three.js** (`three`)
The underlying 3D engine.

**Used For:**
- Geometries (IcosahedronGeometry, RingGeometry, SphereGeometry)
- Materials (MeshStandardMaterial, MeshBasicMaterial)
- Colors and Blending modes
- Groups and positioning

---

## 🎮 Camera Controls Configuration

### OrbitControls Setup
Located in: `frontend/src/pages/MemoryConstellationPage.tsx` (lines 410-425)

```tsx
<OrbitControls
  enablePan={true}         // Allow panning (dragging to move)
  enableZoom={true}        // Allow zooming (scroll wheel)
  enableRotate={true}      // Allow rotation (drag to orbit)
  minDistance={5}          // Closest zoom distance
  maxDistance={120}        // Farthest zoom distance
  zoomSpeed={0.8}          // How fast to zoom (default: 1)
  panSpeed={0.8}           // How fast to pan (default: 1)
  rotateSpeed={0.5}        // How fast to rotate (default: 1)
  dampingFactor={0.05}     // Smoothing factor (lower = smoother)
  enableDamping={true}     // Enable smooth camera movement
  touches={{
    ONE: 1,                // 1 finger = rotate
    TWO: 2                 // 2 fingers = zoom/pan
  }}
/>
```

### Mouse/Touch Controls
- **Left Mouse / 1 Finger**: Rotate around the scene
- **Right Mouse / 2 Fingers**: Pan (move the camera)
- **Scroll Wheel / Pinch**: Zoom in/out
- **Middle Mouse**: Pan (alternative)

### Camera Setup
```tsx
<PerspectiveCamera
  ref={cameraRef}
  position={[0, 0, 35]}    // Starting position [x, y, z]
  fov={75}                 // Field of view (degrees)
  makeDefault              // Set as the main camera
/>
```

### Programmatic Camera Animation
Using GSAP for smooth camera transitions:

```tsx
// Animate to a specific position
gsap.to(cameraRef.current.position, {
  duration: 1.2,
  x: targetX,
  y: targetY,
  z: targetZ,
  ease: "power3.out",
  onComplete: () => {
    setIsCameraAnimating(false);
  }
});
```

---

## ⭐ Star Components Breakdown

### Individual Star Structure
Located in: `frontend/src/components/StarField.tsx`

```tsx
<group ref={starRef} position={[x, y, z]}>
  
  {/* 1. Sparkle Particles */}
  <Sparkles
    count={15-30}          // Number of particles
    scale={size * 6}       // Spread area
    size={1.5-3}          // Particle size
    speed={0.3}           // Animation speed
    color={moodColor}     // Mood-based color
    opacity={0.6-0.9}     // Transparency
  />

  {/* 2. Glow Rings (3 layers) */}
  <mesh>
    <ringGeometry args={[innerRadius, outerRadius, segments]} />
    <meshBasicMaterial
      color={moodColor}
      transparent
      opacity={0.5}
      blending={THREE.AdditiveBlending}  // Glowing effect
      side={THREE.DoubleSide}
    />
  </mesh>

  {/* 3. Main Star Core */}
  <mesh
    onClick={(e) => onEntryClick(entry)}
    onPointerOver={(e) => setHovered(true)}
    onPointerOut={(e) => setHovered(false)}
  >
    <icosahedronGeometry args={[size, 3]} />
    <meshStandardMaterial
      color={moodColor}
      emissive={moodColor}
      emissiveIntensity={1.2}
      roughness={0.1}
      metalness={0.5}
    />
  </mesh>

  {/* 4. White Inner Core */}
  <mesh>
    <sphereGeometry args={[size * 0.4, 32, 32]} />
    <meshBasicMaterial color={0xffffff} />
  </mesh>

  {/* 5. Multiple Glow Layers */}
  {/* 3 layers of spheres with increasing size and decreasing opacity */}

  {/* 6. Point Lights (3 lights) */}
  <pointLight 
    position={[0, 0, 0]} 
    intensity={2.5} 
    distance={15} 
    color={moodColor}
    decay={1.5}
  />

  {/* 7. 3D Text Label */}
  <Billboard>
    <Text
      position={[0, size * 1.8 + 0.5, 0]}
      fontSize={size * 0.6}
      color="white"
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.04}
      outlineColor="#000000"
      fontWeight="bold"
    >
      {entry.title}
    </Text>
  </Billboard>

  {/* 8. HTML Hover Card */}
  {isHovered && (
    <Html center distanceFactor={10}>
      <div className="hover-card">
        {/* Mood emoji, date, etc. */}
      </div>
    </Html>
  )}
</group>
```

---

## 🌌 Scene Setup

### Canvas Configuration
```tsx
<Canvas
  camera={{ 
    position: [0, 0, 35],  // Initial camera position
    fov: 75                // Field of view
  }}
  style={{ 
    background: '#000000',  // Black background
    width: '100%',
    height: '100%'
  }}
  gl={{ 
    alpha: false,          // No transparency
    antialias: true        // Smooth edges
  }}
>
  {/* Scene content */}
</Canvas>
```

### Lighting Setup
```tsx
{/* Ambient light - general scene illumination */}
<ambientLight intensity={0.2} />

{/* Point lights - localized light sources */}
<pointLight position={[20, 20, 20]} intensity={0.5} color="#ffffff" />
<pointLight position={[-20, -20, -20]} intensity={0.3} color="#ffffff" />
```

### Environment & Background
```tsx
{/* HDR Environment for realistic lighting */}
<Environment preset="night" />

{/* Background stars */}
<Stars 
  radius={150}      // How far stars spread
  depth={80}        // Depth range
  count={8000}      // Number of stars
  factor={5}        // Size variation
  saturation={0}    // Color saturation (0 = white)
  fade              // Fade with distance
  speed={0.5}       // Animation speed
/>
```

---

## 🎬 Animation System

### Animation Loop (useFrame)
Runs every frame (60 FPS):

```tsx
useFrame((state) => {
  if (starRef.current) {
    // Pulsing animation
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 2 + entry.dayOfMonth) * 0.15;
    starRef.current.scale.setScalar(pulse);
    
    // Rotation animation
    const rotation = state.clock.elapsedTime * 0.5 + entry.dayOfMonth;
    starRef.current.rotation.y = rotation;
    starRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3 + entry.dayOfMonth) * 0.1;
  }
});
```

### GSAP for Camera Transitions
Smooth programmatic camera movements:

```tsx
// Focus on a specific star
const handleCameraFocus = (position: [number, number, number]) => {
  gsap.to(cameraRef.current.position, {
    duration: 1.2,
    x: position[0],
    y: position[1],
    z: position[2],
    ease: "power3.out"
  });
};
```

---

## 🎨 Mood Color System

Each journal entry has a mood that determines its star color:

```tsx
const moodColors = {
  happy: '#10B981',     // Green
  sad: '#3B82F6',       // Blue
  excited: '#F59E0B',   // Orange
  calm: '#8B5CF6',      // Purple
  anxious: '#EF4444',   // Red
  grateful: '#F97316',  // Deep Orange
  neutral: '#6B7280'    // Gray
};
```

---

## 🔧 Performance Optimizations

### 1. **Suspense Boundary**
```tsx
<Suspense fallback={<ThreeJSLoading />}>
  {/* 3D content loads progressively */}
</Suspense>
```

### 2. **Error Boundary**
```tsx
<ErrorBoundary>
  {/* Catches WebGL errors gracefully */}
</ErrorBoundary>
```

### 3. **WebGL Context Manager**
Custom component to prevent context loss:
```tsx
<WebGLContextManager />
```

### 4. **Damping for Smooth Movement**
```tsx
enableDamping={true}
dampingFactor={0.05}  // Lower = smoother but less responsive
```

---

## 📍 Star Positioning Algorithm

Stars are positioned in a spiral galaxy pattern:

```tsx
// Circular distribution
const angle = (day / 31) * Math.PI * 2;
const radius = 15 + random(seed) * 10;  // 15-25 units from center

// Spiral pattern
const spiralFactor = day / 5;
const x = Math.cos(angle + spiralFactor) * radius;
const y = Math.sin(angle + spiralFactor) * radius;
const z = Math.sin(day * 0.5) * 8 - 4;  // Depth variation

// Add organic scatter
const scatterX = (random(seed) - 0.5) * 8;
const scatterY = (random(seed + 1) - 0.5) * 8;
const scatterZ = (random(seed + 2) - 0.5) * 6;

const finalPosition = {
  x: x + scatterX,
  y: y + scatterY,
  z: z + scatterZ
};
```

---

## 🎯 Interaction System

### Click Detection
```tsx
<mesh
  onClick={(e) => {
    e.stopPropagation();
    onEntryClick(entry);
    onCameraFocus([entry.position.x, entry.position.y, entry.position.z + 5]);
  }}
/>
```

### Hover Effects
```tsx
onPointerOver={(e) => {
  e.stopPropagation();
  setHoveredId(entry.id);
  document.body.style.cursor = 'pointer';
}}

onPointerOut={(e) => {
  e.stopPropagation();
  setHoveredId(null);
  document.body.style.cursor = 'auto';
}}
```

---

## 📦 Required Dependencies

```json
{
  "@react-three/fiber": "^8.x.x",
  "@react-three/drei": "^9.x.x",
  "three": "^0.160.x",
  "gsap": "^3.12.x",
  "framer-motion": "^10.x.x"
}
```

---

## 🚀 Key Features

1. **✨ Smooth Camera Controls** - OrbitControls with damping
2. **🎨 Mood-Based Coloring** - Each star reflects journal mood
3. **💫 Dynamic Animations** - Pulsing and rotating stars
4. **🎯 Interactive Clicks** - Click stars to view journal entries
5. **🌌 Galaxy Layout** - Spiral distribution pattern
6. **📱 Touch Support** - 1-finger rotate, 2-finger zoom/pan
7. **⚡ Performance Optimized** - Suspense, error boundaries, context management
8. **🎭 Hover Effects** - Glow, scale up, show details
9. **📍 Programmatic Focus** - GSAP animations to focus on stars
10. **🌟 Multi-Layer Glow** - Rings, spheres, and point lights for realistic glow

---

## 💡 Tips for Customization

### Change Camera Behavior
```tsx
// Faster zoom
zoomSpeed={1.5}

// Slower rotation
rotateSpeed={0.3}

// Closer zoom limit
minDistance={3}

// More damping (smoother)
dampingFactor={0.02}
```

### Change Star Appearance
```tsx
// Bigger stars
const baseSize = 1.2;

// More particles
<Sparkles count={50} />

// Brighter glow
emissiveIntensity={3.0}
```

### Change Layout
```tsx
// Tighter spiral
const radius = 10 + random(seed) * 5;

// More vertical spread
const z = Math.sin(day * 0.5) * 15;
```

This is your complete 3D constellation system! 🌟

