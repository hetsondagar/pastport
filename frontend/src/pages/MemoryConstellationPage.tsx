import { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment, PerspectiveCamera } from '@react-three/drei';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { Button } from '@/components/ui/button';
// Removed Badge and Card imports after UI simplification
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/api';
import Navigation from '@/components/Navigation';
import StarField from '@/components/StarField';
import MemoryModal from '@/components/MemoryModal';
import ErrorBoundary from '@/components/ErrorBoundary';
import ThreeJSLoading from '@/components/ThreeJSLoading';
import WebGLContextManager from '@/components/WebGLContextManager';
import { Home, Sparkles, Calendar, BookOpen } from 'lucide-react';
import PageTitle from '@/components/ui/PageTitle';

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

const MemoryConstellationPage = () => {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const { toast } = useToast();
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [cameraPosition, setCameraPosition] = useState([0, 0, 35]);
  const [isCameraAnimating, setIsCameraAnimating] = useState(false);
  const cameraRef = useRef<any>(null);
  const [showDemo, setShowDemo] = useState(false);
  // Always use current month - constellation resets each month
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // 1-12

  const moodColors = {
    happy: '#10B981',
    sad: '#3B82F6', 
    excited: '#F59E0B',
    calm: '#8B5CF6',
    anxious: '#EF4444',
    grateful: '#F97316',
    neutral: '#6B7280'
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadMonthEntries();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterEntries();
  }, [journalEntries, showDemo]);

  const loadMonthEntries = async () => {
    try {
      setLoading(true);
      const userId = (user && (user.id || user._id)) as string | undefined;
      if (!userId) {
        setJournalEntries([]);
        return;
      }
      const response = await apiClient.getMonthEntries(userId, year, month);
      
      console.log('Raw API response:', response);
      
      // Handle different response formats
      let entriesData: any;
      
      // Check if response has success and data structure
      if (response?.success && response?.data) {
        entriesData = response.data.entries;
      } else if (response?.data) {
        entriesData = response.data;
      } else if (response?.entries) {
        entriesData = response.entries;
      } else {
        entriesData = response;
      }
      
      // Convert entries map/object to array if needed
      let entries: any[] = [];
      
      if (Array.isArray(entriesData)) {
        // Already an array
        entries = entriesData;
      } else if (typeof entriesData === 'object' && entriesData !== null) {
        // It's an object/map, convert to array
        entries = Object.values(entriesData);
      }
      
      console.log('Processed entries:', entries);
      
      if (entries.length > 0) {
        const daysInMonth = new Date(year, month, 0).getDate();
        const mapped = entries.map((e: any, index: number) => {
          const dateStr = e.date || e.createdAt || new Date(year, month - 1, index + 1).toISOString();
          const day = new Date(dateStr).getDate();
          
          // Create scattered constellation pattern with better spread
          const seed = day * 7 + month * 13; // Deterministic but varied
          const random = (seed: number) => {
            const x = Math.sin(seed) * 10000;
            return x - Math.floor(x);
          };
          
          // Create widespread, galaxy-like distribution
          const angle = (day / 31) * Math.PI * 2; // Circular distribution
          const radius = 15 + random(seed) * 10; // Variable radius 15-25 units
          
          // Spiral pattern with variation
          const spiralFactor = day / 5;
          const clusterX = Math.cos(angle + spiralFactor) * radius;
          const clusterY = Math.sin(angle + spiralFactor) * radius;
          const clusterZ = Math.sin(day * 0.5) * 8 - 4; // More depth variation
          
          // Add organic scatter for natural look
          const scatterX = (random(seed) - 0.5) * 8;
          const scatterY = (random(seed + 1) - 0.5) * 8;
          const scatterZ = (random(seed + 2) - 0.5) * 6;
          
          const x = clusterX + scatterX;
          const y = clusterY + scatterY;
          const z = clusterZ + scatterZ;
          
          return {
            id: e._id || e.id || `${year}-${month}-${day}`,
            title: e.title || `Day ${day}`,
            content: e.content || '',
            mood: e.mood || 'neutral',
            date: dateStr,
            position: { x, y, z },
            dayOfMonth: day,
            isCapsule: e.isCapsule || false
          } as JournalEntry;
        });
        setJournalEntries(mapped);
      } else {
        setJournalEntries([]);
      }
    } catch (error) {
      console.error('Error loading month entries:', error);
      setJournalEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const filterEntries = () => {
    let source = journalEntries;
    if (showDemo && journalEntries.length === 0) {
      // Create demo constellation for current month
      const daysInMonth = new Date(year, month, 0).getDate();
      source = Array.from({ length: Math.min(15, daysInMonth) }, (_, i) => {
        const day = i + 1;
        
        // Use same scattered positioning as real entries
        const seed = day * 7 + month * 13;
        const random = (seed: number) => {
          const x = Math.sin(seed) * 10000;
          return x - Math.floor(x);
        };
        
        // Create widespread, galaxy-like distribution
        const angle = (day / 31) * Math.PI * 2; // Circular distribution
        const radius = 15 + random(seed) * 10; // Variable radius 15-25 units
        
        // Spiral pattern with variation
        const spiralFactor = day / 5;
        const clusterX = Math.cos(angle + spiralFactor) * radius;
        const clusterY = Math.sin(angle + spiralFactor) * radius;
        const clusterZ = Math.sin(day * 0.5) * 8 - 4; // More depth variation
        
        // Add organic scatter for natural look
        const scatterX = (random(seed) - 0.5) * 8;
        const scatterY = (random(seed + 1) - 0.5) * 8;
        const scatterZ = (random(seed + 2) - 0.5) * 6;
        
        const x = clusterX + scatterX;
        const y = clusterY + scatterY;
        const z = clusterZ + scatterZ;
        
        return {
          id: `demo-${day}`,
          title: `Day ${day}`,
          content: `Demo entry for day ${day}`,
          mood: ['happy', 'calm', 'excited', 'grateful'][day % 4],
          date: new Date(year, month - 1, day).toISOString(),
          position: { x, y, z },
          dayOfMonth: day,
          isCapsule: day % 3 === 0
        };
      });
    }
    setFilteredEntries(source);
  };

  const handleEntryClick = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEntry(null);
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
    const defaultPosition: [number, number, number] = [0, 0, 35];
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

  const getMonthName = (monthNum: number) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return months[monthNum - 1];
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
            className="flex flex-col gap-4 items-start"
          >
            {/* Title */}
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-primary" />
              <PageTitle 
                title="Memory Constellation" 
                subtitle="This month's memories shine as stars - they reset each new month" 
              />
            </div>

            {/* Current Month Display Only */}
            <div className="flex items-center gap-2 glass-card-enhanced p-3 rounded-lg">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <span className="text-white font-semibold text-lg">
                  {getMonthName(month)} {year}
                </span>
                <p className="text-xs text-gray-400">Current month's memories</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-2">
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
              {journalEntries.length === 0 && (
                <Button
                  variant={showDemo ? 'default' : 'outline'}
                  onClick={() => setShowDemo((v) => !v)}
                  className="glass-card border-white/10 hover:bg-white/10"
                >
                  {showDemo ? 'Hide Demo Constellation' : 'Show Demo Constellation'}
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="fixed inset-0 top-20">
        <ErrorBoundary>
          <Canvas
            camera={{ position: cameraPosition, fov: 75 }}
            style={{ background: '#000000' }}
            gl={{ alpha: false, antialias: true }}
          >
            <PerspectiveCamera
              ref={cameraRef}
              position={cameraPosition}
              fov={75}
              makeDefault
            />
            <WebGLContextManager />
            <Suspense fallback={<ThreeJSLoading />}>
              {/* Subtle ambient lighting for deep space */}
              <ambientLight intensity={0.2} />
              <pointLight position={[20, 20, 20]} intensity={0.5} color="#ffffff" />
              <pointLight position={[-20, -20, -20]} intensity={0.3} color="#ffffff" />
              
              {/* Deep space environment */}
              <Environment preset="night" />
              <Stars radius={150} depth={80} count={8000} factor={5} saturation={0} fade speed={0.5} />
              
              {/* Journal Constellation */}
              <StarField
                entries={filteredEntries}
                onEntryClick={handleEntryClick}
                onCameraFocus={handleCameraFocus}
              />
            </Suspense>
            
            {/* Controls */}
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={10}
              maxDistance={80}
            />
          </Canvas>
        </ErrorBoundary>
      </div>

      {/* Empty state overlay */}
      {filteredEntries.length === 0 && !loading && (
        <div className="fixed inset-0 top-20 flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto glass-card-enhanced border-white/10 p-6 rounded-lg text-center max-w-md">
            <Sparkles className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
            <h3 className="text-white font-semibold text-xl mb-2">No Stars Yet for {getMonthName(month)} {year}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Each day you write a journal entry becomes a star in your constellation. 
              <br />
              <strong className="text-white">Start journaling to light up the sky!</strong>
            </p>
            <div className="flex flex-col gap-2 justify-center">
              <Button className="btn-glow" onClick={() => window.location.href = '/journal'}>
                <BookOpen className="w-4 h-4 mr-2" />
                Go to Journal
              </Button>
              {journalEntries.length === 0 && (
                <Button variant="outline" className="glass-card border-white/10" onClick={() => setShowDemo(true)}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Show Demo Constellation
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats Overlay removed for a cleaner constellation view */}

      {/* Entry Modal */}
      {showModal && selectedEntry && (
        <MemoryModal
          memory={selectedEntry}
          onClose={handleCloseModal}
          onUpdate={loadMonthEntries}
        />
      )}
    </div>
  );
};

export default MemoryConstellationPage;
