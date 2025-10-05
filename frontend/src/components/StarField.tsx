import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Sphere } from '@react-three/drei';

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
  const groupRef = useRef<any>(null);

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

  // Simple rotation animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {memories.map((memory) => {
        const size = Math.max(0.2, memory.importance * 0.1);
        const color = getCategoryColor(memory.category);

        return (
          <group key={memory.id} position={[memory.position.x, memory.position.y, memory.position.z]}>
            <mesh
              onClick={() => {
                onMemoryClick(memory);
                onCameraFocus([memory.position.x, memory.position.y, memory.position.z + 5]);
              }}
            >
              <Sphere args={[size, 32, 32]}>
                <meshStandardMaterial
                  color={color}
                  emissive={color}
                  emissiveIntensity={0.3}
                />
              </Sphere>
            </mesh>

            <Text
              position={[0, size + 0.5, 0]}
              fontSize={0.3}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {memory.title}
            </Text>
          </group>
        );
      })}
    </group>
  );
};

export default StarField;