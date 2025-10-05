import { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment, PerspectiveCamera } from '@react-three/drei';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/api';
import Navigation from '@/components/Navigation';
import StarField from '@/components/StarField';
import MemoryModal from '@/components/MemoryModal';
import { Search, Filter, Home, Sparkles } from 'lucide-react';

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
  relatedMemories?: Memory[];
}

const MemoryConstellationPage = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [filteredMemories, setFilteredMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [cameraPosition, setCameraPosition] = useState([0, 0, 10]);
  const [isCameraAnimating, setIsCameraAnimating] = useState(false);
  const cameraRef = useRef<any>(null);

  const categories = ['All', 'Travel', 'Learning', 'Growth', 'Fun'];
  const categoryColors = {
    Travel: 'bg-blue-500',
    Learning: 'bg-green-500',
    Growth: 'bg-yellow-500',
    Fun: 'bg-purple-500'
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadMemories();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterMemories();
  }, [memories, searchTerm, selectedCategory]);

  const loadMemories = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getMemories();
      if (response.success) {
        setMemories(response.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load memories",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load memories",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterMemories = () => {
    let filtered = memories;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(memory => memory.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(memory =>
        memory.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        memory.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        memory.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredMemories(filtered);
  };

  const handleMemoryClick = (memory: Memory) => {
    setSelectedMemory(memory);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedMemory(null);
  };

  const handleCameraFocus = (position: [number, number, number]) => {
    if (isCameraAnimating) return;
    
    setIsCameraAnimating(true);
    setCameraPosition(position);
    
    // Animate camera to focus position
    if (cameraRef.current) {
      gsap.to(cameraRef.current.position, {
        duration: 2,
        x: position[0],
        y: position[1],
        z: position[2],
        ease: "power2.inOut",
        onComplete: () => {
          setIsCameraAnimating(false);
        }
      });
      
      // Animate camera look at the memory
      gsap.to(cameraRef.current.rotation, {
        duration: 2,
        x: 0,
        y: 0,
        z: 0,
        ease: "power2.inOut"
      });
    }
  };

  const resetCamera = () => {
    if (isCameraAnimating) return;
    
    setIsCameraAnimating(true);
    const defaultPosition: [number, number, number] = [0, 0, 10];
    setCameraPosition(defaultPosition);
    
    if (cameraRef.current) {
      gsap.to(cameraRef.current.position, {
        duration: 2,
        x: defaultPosition[0],
        y: defaultPosition[1],
        z: defaultPosition[2],
        ease: "power2.inOut",
        onComplete: () => {
          setIsCameraAnimating(false);
        }
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your memory constellation...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">Please log in to view your memory constellation</p>
          <Button onClick={() => window.location.href = '/'}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Header */}
      <div className="fixed top-20 left-4 right-4 z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between"
          >
            {/* Title */}
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-white">Memory Constellation</h1>
                <p className="text-muted-foreground">Explore your memories as stars in space</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search memories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 glass-card border-white/10 bg-background/50 text-white placeholder:text-gray-400"
                />
              </div>

              {/* Category Filter */}
              <div className="flex gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={`${
                      selectedCategory === category
                        ? 'bg-primary text-primary-foreground'
                        : 'glass-card border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {category}
                  </Button>
                ))}
              </div>

              {/* Camera Controls */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={resetCamera}
                  disabled={isCameraAnimating}
                  className="glass-card border-white/10 hover:bg-white/10"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Reset View
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/dashboard'}
                  className="glass-card border-white/10 hover:bg-white/10"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="fixed inset-0 top-20">
        <Canvas
          camera={{ position: cameraPosition, fov: 75 }}
          style={{ background: 'transparent' }}
        >
          <PerspectiveCamera
            ref={cameraRef}
            position={cameraPosition}
            fov={75}
            makeDefault
          />
          <Suspense fallback={null}>
            {/* Environment */}
            <Environment preset="night" />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            
            {/* Memory Constellation */}
            <StarField
              memories={filteredMemories}
              onMemoryClick={handleMemoryClick}
              onCameraFocus={handleCameraFocus}
            />
            
            {/* Controls */}
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={5}
              maxDistance={50}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Stats Overlay */}
      <div className="fixed bottom-4 left-4 z-10">
        <Card className="glass-card border-white/10 bg-background/90 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{memories.length}</div>
                <div className="text-xs text-muted-foreground">Total Memories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{filteredMemories.length}</div>
                <div className="text-xs text-muted-foreground">Visible</div>
              </div>
              <div className="flex gap-1">
                {categories.slice(1).map((category) => {
                  const count = memories.filter(m => m.category === category).length;
                  return (
                    <Badge
                      key={category}
                      variant="outline"
                      className={`${categoryColors[category as keyof typeof categoryColors]} text-white border-0`}
                    >
                      {count}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Memory Modal */}
      {showModal && selectedMemory && (
        <MemoryModal
          memory={selectedMemory}
          onClose={handleCloseModal}
          onUpdate={loadMemories}
        />
      )}
    </div>
  );
};

export default MemoryConstellationPage;
