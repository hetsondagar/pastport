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
import ErrorBoundary from '@/components/ErrorBoundary';
import ThreeJSLoading from '@/components/ThreeJSLoading';
import WebGLContextManager from '@/components/WebGLContextManager';
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
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const { toast } = useToast();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [filteredMemories, setFilteredMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [cameraPosition, setCameraPosition] = useState([0, 0, 15]);
  const [isCameraAnimating, setIsCameraAnimating] = useState(false);
  const cameraRef = useRef<any>(null);
  const [showDemo, setShowDemo] = useState(false);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1); // 1-12

  const categories = ['All', 'Travel', 'Learning', 'Growth', 'Fun'];
  const categoryColors = {
    Travel: 'bg-blue-500',
    Learning: 'bg-green-500',
    Growth: 'bg-yellow-500',
    Fun: 'bg-purple-500'
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadMonthEntries();
    }
  }, [isAuthenticated, year, month]);

  useEffect(() => {
    filterMemories();
  }, [memories, searchTerm, selectedCategory]);

  const loadMonthEntries = async () => {
    try {
      setLoading(true);
      const userId = (user && (user.id || user._id)) as string | undefined;
      if (!userId) {
        setMemories([]);
        return;
      }
      const response = await apiClient.getMonthEntries(userId, year, month);
      // Accept multiple shapes: {success,data:{entries:[]}}, {entries:[]}, or []
      const entries: any[] = Array.isArray(response)
        ? response
        : Array.isArray(response?.entries)
          ? response.entries
          : Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response?.data?.entries)
              ? response.data.entries
              : [];
      if (entries.length > 0) {
        const daysInMonth = new Date(year, month, 0).getDate();
        const radius = 6;
        const mapped = entries.map((e: any, index: number) => {
          const dateStr = e.date || e.createdAt || new Date(year, month - 1, index + 1).toISOString();
          const day = new Date(dateStr).getDate();
          const angle = (day / daysInMonth) * Math.PI * 2;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const importance = Math.min(10, Math.max(3, (e.moodScore ?? (e.content?.length || 100) % 10)));
          const mood = (e.mood || '').toLowerCase();
          const category: 'Travel' | 'Learning' | 'Growth' | 'Fun' =
            mood.includes('travel') ? 'Travel' :
            mood.includes('learn') ? 'Learning' :
            mood.includes('fun') || mood.includes('happy') ? 'Fun' : 'Growth';
          return {
            id: e.id || e._id || `${year}-${month}-${day}`,
            title: e.title || `Entry ${day}`,
            content: e.content || '',
            category,
            importance,
            date: dateStr,
            relatedIds: [],
            position: { x, y, z: 0 },
            tags: e.tags || [],
            media: [],
          } as Memory;
        });
        setMemories(mapped);
      } else {
        setMemories([]);
      }
    } catch (error) {
      console.error('Error loading month entries:', error);
      setMemories([]);
    } finally {
      setLoading(false);
    }
  };

  const filterMemories = () => {
    let source = memories;
    if (showDemo && memories.length === 0) {
      source = [
        { id: 'demo-1', title: 'Demo 1', content: '', category: 'Travel', importance: 7, date: new Date().toISOString(), relatedIds: [], position: { x: 0, y: 0, z: 0 }, tags: [], media: [] },
        { id: 'demo-2', title: 'Demo 2', content: '', category: 'Learning', importance: 5, date: new Date().toISOString(), relatedIds: [], position: { x: 3, y: 0, z: 0 }, tags: [], media: [] },
        { id: 'demo-3', title: 'Demo 3', content: '', category: 'Growth', importance: 8, date: new Date().toISOString(), relatedIds: [], position: { x: 0, y: 3, z: 0 }, tags: [], media: [] },
      ];
    }

    let filtered = source;

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
        duration: 1.2,
        x: position[0],
        y: position[1],
        z: position[2],
        ease: "power3.out",
        onComplete: () => {
          setIsCameraAnimating(false);
        }
      });
      
      // Animate camera look at the memory
      gsap.to(cameraRef.current.rotation, {
        duration: 1.2,
        x: 0,
        y: 0,
        z: 0,
        ease: "power3.out"
      });
    }
  };

  const resetCamera = () => {
    if (isCameraAnimating) return;
    
    setIsCameraAnimating(true);
    const defaultPosition: [number, number, number] = [0, 0, 12];
    setCameraPosition(defaultPosition);
    
    if (cameraRef.current) {
      gsap.to(cameraRef.current.position, {
        duration: 1.2,
        x: defaultPosition[0],
        y: defaultPosition[1],
        z: defaultPosition[2],
        ease: "power3.out",
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

              {/* Month / Year */}
              <div className="flex gap-2">
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="glass-card border-white/10 rounded-md bg-background/50 px-2 py-2"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                  ))}
                </select>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="glass-card border-white/10 rounded-md bg-background/50 px-2 py-2"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
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
                onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
                className="glass-card border-white/10 hover:bg-white/10"
              >
                Clear Filters
              </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/dashboard'}
                  className="glass-card border-white/10 hover:bg-white/10"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              {memories.length === 0 && (
                <Button
                  variant={showDemo ? 'default' : 'outline'}
                  onClick={() => setShowDemo((v) => !v)}
                  className="glass-card border-white/10 hover:bg-white/10"
                >
                  {showDemo ? 'Hide Demo Stars' : 'Show Demo Stars'}
                </Button>
              )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="fixed inset-0 top-20">
        <ErrorBoundary>
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
            <WebGLContextManager />
            <Suspense fallback={<ThreeJSLoading />}>
              {/* Super strong lighting */}
              <ambientLight intensity={1.0} />
              <pointLight position={[10, 10, 10]} intensity={3} />
              <pointLight position={[-10, -10, -10]} intensity={2} />
              <pointLight position={[0, 10, 0]} intensity={2} />
              
              {/* Environment */}
              <Environment preset="night" />
              <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
              
              {/* Memory Constellation */}
              <StarField
                memories={filteredMemories}
                onMemoryClick={handleMemoryClick}
                onCameraFocus={handleCameraFocus}
              />
            </Suspense>
            
            {/* Controls */}
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={5}
              maxDistance={50}
            />
          </Canvas>
        </ErrorBoundary>
      </div>

      {/* Empty state overlay */}
      {filteredMemories.length === 0 && !loading && (
        <div className="fixed inset-0 top-20 flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto glass-card-enhanced border-white/10 p-4 rounded-lg text-center">
            <h3 className="text-white font-semibold mb-1">No memories to display</h3>
            <p className="text-sm text-muted-foreground mb-3">Add a memory or adjust filters to see stars.</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" className="glass-card border-white/10" onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}>Clear Filters</Button>
              <Button className="btn-glow" onClick={() => window.location.href = '/create'}>Create Memory</Button>
              {memories.length === 0 && (
                <Button variant="outline" className="glass-card border-white/10" onClick={() => setShowDemo(true)}>Show Demo Stars</Button>
              )}
            </div>
          </div>
        </div>
      )}

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
          onUpdate={loadMonthEntries}
        />
      )}
    </div>
  );
};

export default MemoryConstellationPage;
