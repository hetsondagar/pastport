import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html, Billboard, Sparkles, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: string;
  date: string;
  position: { x: number; y: number; z: number };
  dayOfMonth: number;
  isCapsule: boolean;
}

interface StarFieldProps {
  entries: JournalEntry[];
  onEntryClick: (entry: JournalEntry) => void;
  onCameraFocus: (position: [number, number, number]) => void;
}

// Separate Star component to properly use hooks
interface StarProps {
  entry: JournalEntry;
  isHovered: boolean;
  onEntryClick: (entry: JournalEntry) => void;
  onCameraFocus: (position: [number, number, number]) => void;
  onHoverChange: (id: string | null) => void;
  getMoodColor: (mood: string) => string;
}

const Star = ({ entry, isHovered, onEntryClick, onCameraFocus, onHoverChange, getMoodColor }: StarProps) => {
  const starRef = useRef<THREE.Group>(null);
  
  // Early return if entry is null or undefined
  if (!entry) {
    return null;
  }
  
  const getMoodEmoji = (mood: string) => {
    const moodEmojis: { [key: string]: string } = {
      happy: '🌞',
      sad: '😢',
      excited: '🎉',
      angry: '😡',
      calm: '🌙',
      anxious: '😰',
      grateful: '🙏',
      neutral: '😐'
    };
    return moodEmojis[mood] || '😐';
  };
  
  // Buttery-smooth star pulsing and rotation animation
  useFrame((state) => {
    if (starRef.current) {
      // Gentler, slower pulse for smooth breathing effect
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.0 + entry.dayOfMonth) * 0.08;
      starRef.current.scale.setScalar(pulse);
      
      // Slower, more graceful rotation
      const rotation = state.clock.elapsedTime * 0.2 + entry.dayOfMonth;
      starRef.current.rotation.y = rotation;
      
      // Subtle wobble for organic feel
      starRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15 + entry.dayOfMonth) * 0.05;
      starRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.1 + entry.dayOfMonth) * 0.03;
    }
  });

  const baseSize = Math.max(0.5, 0.6 + ((entry?.dayOfMonth || 1) % 7) * 0.08);
  const size = isHovered ? baseSize * 1.8 : baseSize;
  const colorHex = getMoodColor(entry?.mood || 'neutral');
  const color = new THREE.Color(colorHex);
  const emissiveColor = color.clone();

  return (
    <group ref={starRef} position={[entry.position.x, entry.position.y, entry.position.z]}>
      {/* Sparkle particles around star */}
      <Sparkles
        count={isHovered ? 30 : 15}
        scale={size * 6}
        size={isHovered ? 3 : 1.5}
        speed={0.3}
        color={colorHex}
        opacity={isHovered ? 0.9 : 0.6}
      />

      {/* Beautiful mood-colored glow rings */}
      <mesh>
        <ringGeometry args={[size * 2.0, size * 2.8, 64]} />
        <meshBasicMaterial
          color={colorHex}
          transparent
          opacity={isHovered ? 0.8 : 0.5}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh>
        <ringGeometry args={[size * 3.2, size * 4.5, 64]} />
        <meshBasicMaterial
          color={colorHex}
          transparent
          opacity={isHovered ? 0.5 : 0.3}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      <mesh>
        <ringGeometry args={[size * 5.0, size * 6.5, 48]} />
        <meshBasicMaterial
          color={colorHex}
          transparent
          opacity={isHovered ? 0.3 : 0.15}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Main star core with mood-based color */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          console.log('Star mesh clicked:', entry.title);
          onEntryClick(entry);
          onCameraFocus([entry.position.x, entry.position.y, entry.position.z + 5]);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHoverChange(entry.id);
          if (document?.body) document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHoverChange(null);
          if (document?.body) document.body.style.cursor = 'auto';
        }}
        scale={isHovered ? 1.3 : 1}
      >
        <icosahedronGeometry args={[size, 3]} />
        <meshStandardMaterial
          color={color}
          emissive={emissiveColor}
          emissiveIntensity={isHovered ? 2.0 : 1.2}
          roughness={0.1}
          metalness={0.5}
          toneMapped={false}
        />
      </mesh>

      {/* Bright white hot inner core */}
      <mesh>
        <sphereGeometry args={[size * 0.4, 32, 32]} />
        <meshBasicMaterial
          color={0xffffff}
          transparent={false}
          toneMapped={false}
        />
      </mesh>
      
      {/* Colored glow layer */}
      <mesh>
        <sphereGeometry args={[size * 1.2, 32, 32]} />
        <meshBasicMaterial
          color={colorHex}
          transparent
          opacity={isHovered ? 0.9 : 0.7}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Mood-colored corona effect */}
      <mesh>
        <sphereGeometry args={[size * 4.0, 32, 32]} />
        <meshBasicMaterial
          color={colorHex}
          transparent
          opacity={isHovered ? 0.4 : 0.25}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Mood-colored energy field with glow */}
      <mesh>
        <sphereGeometry args={[size * 6.5, 32, 32]} />
        <meshBasicMaterial
          color={colorHex}
          transparent
          opacity={isHovered ? 0.25 : 0.12}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Outer atmospheric glow */}
      <mesh>
        <sphereGeometry args={[size * 9, 24, 24]} />
        <meshBasicMaterial
          color={colorHex}
          transparent
          opacity={isHovered ? 0.12 : 0.06}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Mood-colored point lights for realistic glow */}
      <pointLight 
        position={[0, 0, 0]} 
        intensity={isHovered ? 4.0 : 2.5} 
        distance={15} 
        color={colorHex}
        decay={1.5}
      />
      
      <pointLight 
        position={[size * 0.5, size * 0.5, size * 0.5]} 
        intensity={isHovered ? 2.5 : 1.5} 
        distance={10} 
        color={colorHex}
        decay={1.8}
      />
      
      <pointLight 
        position={[-size * 0.3, size * 0.4, -size * 0.2]} 
        intensity={isHovered ? 2.0 : 1.0} 
        distance={8} 
        color={colorHex}
        decay={2.0}
      />

      <Billboard>
        <Text
          position={[0, size * 1.8 + 0.5, 0]}
          fontSize={Math.max(0.3, size * 0.6)}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.04}
          outlineColor="#000000"
          outlineOpacity={0.8}
          fontWeight="bold"
        >
          {entry.title}
        </Text>
      </Billboard>

      {isHovered && (
        <Html center distanceFactor={10} style={{ pointerEvents: 'none' }}>
          <div 
            className="px-4 py-2 rounded-lg text-sm text-white bg-black/80 backdrop-blur-sm border border-white/20 shadow-xl transition-all duration-300 ease-out"
            style={{
              animation: 'fadeIn 0.3s ease-out'
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{getMoodEmoji(entry.mood)}</span>
              <div>
                <div className="font-semibold capitalize">{entry.mood}</div>
                <div className="text-xs text-gray-400">
                  Day {entry.dayOfMonth} • {new Date(entry.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

const StarField = ({ entries, onEntryClick, onCameraFocus }: StarFieldProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Mood color mapping
  const getMoodColor = (mood: string): string => {
    const moodColors: { [key: string]: string } = {
      happy: '#10B981',
      sad: '#3B82F6',
      excited: '#F59E0B',
      calm: '#8B5CF6',
      anxious: '#EF4444',
      grateful: '#F97316',
      neutral: '#6B7280'
    };
    return moodColors[mood] || '#6B7280';
  };

  // Realistic planet colors and materials
  const getPlanetData = (mood: string) => {
    switch (mood) {
      case 'happy': 
        return {
          color: '#4A90E2', // Earth blue
          emissive: '#2E5B8A',
          roughness: 0.8,
          metalness: 0.1,
          name: 'Earth-like'
        };
      case 'sad': 
        return {
          color: '#8B4513', // Mars red-brown
          emissive: '#5D2E0A',
          roughness: 0.9,
          metalness: 0.05,
          name: 'Mars-like'
        };
      case 'excited': 
        return {
          color: '#FF6B35', // Venus orange
          emissive: '#CC4A1A',
          roughness: 0.7,
          metalness: 0.2,
          name: 'Venus-like'
        };
      case 'calm': 
        return {
          color: '#E6E6FA', // Neptune blue
          emissive: '#B0B0D6',
          roughness: 0.6,
          metalness: 0.3,
          name: 'Neptune-like'
        };
      case 'anxious': 
        return {
          color: '#FF4500', // Jupiter orange
          emissive: '#CC3600',
          roughness: 0.5,
          metalness: 0.4,
          name: 'Jupiter-like'
        };
      case 'grateful': 
        return {
          color: '#FFD700', // Saturn gold
          emissive: '#CCAA00',
          roughness: 0.4,
          metalness: 0.6,
          name: 'Saturn-like'
        };
      default: 
        return {
          color: '#C0C0C0', // Mercury silver
          emissive: '#999999',
          roughness: 0.3,
          metalness: 0.8,
          name: 'Mercury-like'
        };
    }
  };

  // Removed constellation lines - showing only individual stars

  // Ultra-smooth constellation gentle sway
  useFrame((state) => {
    if (groupRef.current) {
      // Gentle breathing motion for the whole constellation
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.03;
      groupRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.03) * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Ambient particles in deep space */}
      <Sparkles
        count={100}
        scale={80}
        size={0.3}
        speed={0.05}
        color={0xffffff}
        opacity={0.3}
      />

      {/* Individual Stars - Each Journal Entry */}
      {entries.filter(entry => entry && entry.id && entry.title).map((entry) => (
        <Star
          key={entry.id}
          entry={entry}
          isHovered={hoveredId === entry.id}
          onEntryClick={onEntryClick}
          onCameraFocus={onCameraFocus}
          onHoverChange={(id) => {
            if (id) {
              setHoveredId(id);
            } else {
              setHoveredId((current) => (current === entry.id ? null : current));
            }
          }}
          getMoodColor={getMoodColor}
        />
      ))}
    </group>
  );
};

export default StarField;