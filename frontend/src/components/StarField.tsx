import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';

interface Memory {
  id: string;
  title: string;
  content: string;
  category: 'Travel' | 'Learning' | 'Growth' | 'Fun';
  importance: number;
  date: string;
  relatedIds: string[];
  position: { x: number; y: number; z: number };
  tags: string[];
  media: string[];
}

interface StarFieldProps {
  memories: Memory[];
  onMemoryClick: (memory: Memory) => void;
  onCameraFocus: (position: [number, number, number]) => void;
}

const StarField = ({ memories, onMemoryClick, onCameraFocus }: StarFieldProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Simple category colors
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Travel': return '#3B82F6';
      case 'Learning': return '#10B981';
      case 'Growth': return '#F59E0B';
      case 'Fun': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  // Memoize geometry and materials to avoid recreation
  const sphereGeometry = useMemo(() => new THREE.SphereGeometry(0.5, 32, 32), []);
  
  // Simple rotation animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {memories.map((memory) => {
        const baseSize = Math.max(0.25, memory.importance * 0.12);
        const isHovered = hoveredId === memory.id;
        const size = isHovered ? baseSize * 1.35 : baseSize;
        const color = getCategoryColor(memory.category);

        return (
          <group key={memory.id} position={[memory.position.x, memory.position.y, memory.position.z]}>
            <mesh
              onClick={() => {
                onMemoryClick(memory);
                onCameraFocus([memory.position.x, memory.position.y, memory.position.z + 5]);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredId(memory.id);
                (e?.eventObject as any)?.parent?.parent?.parent;
                if (document?.body) document.body.style.cursor = 'pointer';
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                setHoveredId((current) => (current === memory.id ? null : current));
                if (document?.body) document.body.style.cursor = 'auto';
              }}
              scale={isHovered ? 1.1 : 1}
            >
              <sphereGeometry args={[size, 16, 16]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={isHovered ? 0.8 : 0.35}
                transparent={false}
                roughness={0.3}
                metalness={0.05}
              />
            </mesh>

            <Text
              position={[0, size + 0.5, 0]}
              fontSize={0.32}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {memory.title}
            </Text>

            {isHovered && (
              <Html center distanceFactor={8} style={{ pointerEvents: 'none' }}>
                <div className="px-2 py-1 rounded-md text-xs text-white bg-black/60 border border-white/10">
                  {memory.category} • {new Date(memory.date).toLocaleDateString()}
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
};

export default StarField;