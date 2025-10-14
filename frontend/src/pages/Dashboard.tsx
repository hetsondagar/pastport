import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Calendar, Grid, List, Loader2, BookOpen, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/api';
import CapsuleCard from '@/components/CapsuleCard';
import CapsuleModal from '@/components/CapsuleModal';
import Navigation from '@/components/Navigation';
import AnimatedCounter from '@/components/AnimatedCounter';
import PageTitle from '@/components/ui/PageTitle';
import DailyInsight from '@/components/DailyInsight';

const Dashboard = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [capsules, setCapsules] = useState([]);
  const [stats, setStats] = useState({
    totalCapsules: 0,
    lockedCapsules: 0,
    unlockedCapsules: 0,
    sharedCapsules: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<'all' | 'locked' | 'unlocked'>('all');
  const [selectedCapsule, setSelectedCapsule] = useState<any>(null);
  const [showCapsuleModal, setShowCapsuleModal] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Load data only when filter/search changes (not on initial mount)
  useEffect(() => {
    if (isAuthenticated) {
      // Only reload when filter/search changes, not on initial mount
      if (filterStatus !== 'all' || searchTerm !== '') {
        loadCapsules();
      }
    }
  }, [isAuthenticated, filterStatus, searchTerm]);

  // Load initial data once on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      // Make only essential API calls in parallel
      const [capsulesResponse, statsResponse] = await Promise.all([
        apiClient.getCapsules({
          status: 'all',
          search: '',
          page: 1,
          limit: 20 // Reduced from 50 for faster loading
        }).catch(err => {
          console.error('Failed to load capsules:', err);
          return { success: false, data: { capsules: [] } };
        }),
        apiClient.getCapsuleStats().catch(err => {
          console.error('Failed to load stats:', err);
          return { success: false, data: { stats: { totalCapsules: 0, lockedCapsules: 0, unlockedCapsules: 0, sharedCapsules: 0 } } };
        })
      ]);

      // Update states
      if (capsulesResponse.success) {
        setCapsules(capsulesResponse.data.capsules);
      }
      if (statsResponse.success) {
        setStats(statsResponse.data.stats);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load some data. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Legacy functions for compatibility
  const loadCapsules = async () => {
    try {
      const response = await apiClient.getCapsules({
        status: filterStatus,
        search: searchTerm,
        page: 1,
        limit: 50
      });
      
      if (response.success) {
        setCapsules(response.data.capsules);
      }
    } catch (error) {
      console.error('Failed to load capsules:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiClient.getCapsuleStats();
      if (response.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };


  const handleCapsuleUnlock = async () => {
    // Refresh capsules after unlock (no page reload)
    await loadCapsules();
    await loadStats(); // Also refresh stats
    
    // If a capsule is currently open in the modal, refresh it to show media
    if (selectedCapsule && selectedCapsule._id) {
      try {
        const response = await apiClient.getCapsule(selectedCapsule._id);
        if (response.success) {
          setSelectedCapsule(response.data.capsule);
        }
      } catch (error) {
        console.error('Failed to refresh capsule after unlock:', error);
      }
    }
  };

  const handleCapsuleClick = async (id: string) => {
    try {
      // Fetch the full capsule data
      const response = await apiClient.getCapsule(id);
      if (response.success) {
        setSelectedCapsule(response.data.capsule);
        setShowCapsuleModal(true);
      }
    } catch (error) {
      console.error('Failed to load capsule:', error);
      toast({
        title: "Error",
        description: "Failed to load capsule details.",
        variant: "destructive"
      });
    }
  };

  // Filter capsules locally for better UX
  const filteredCapsules = capsules.filter(capsule => {
    // Ensure capsule and title exist before filtering
    if (!capsule || !capsule.title) return false;
    const matchesSearch = capsule.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Show quick loading only on initial page load
  if (authLoading || (loading && capsules.length === 0 && stats.totalCapsules === 0)) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 pt-32">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <PageTitle
            title="Your Time Capsules"
            subtitle="Manage your memories and discover what awaits you in the future"
          />

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="glass-card-enhanced p-4 text-center">
              <AnimatedCounter 
                value={stats.totalCapsules} 
                className="text-2xl font-bold text-primary"
              />
              <div className="text-sm text-muted-foreground">Total Capsules</div>
            </div>
            <div className="glass-card-enhanced p-4 text-center">
              <AnimatedCounter 
                value={stats.lockedCapsules} 
                className="text-2xl font-bold text-accent"
              />
              <div className="text-sm text-muted-foreground">Locked</div>
            </div>
            <div className="glass-card-enhanced p-4 text-center">
              <AnimatedCounter 
                value={stats.unlockedCapsules} 
                className="text-2xl font-bold text-secondary"
              />
              <div className="text-sm text-muted-foreground">Unlocked</div>
            </div>
          </div>

          {/* Quick Actions - Removed heavy widgets for faster loading */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Streak Card */}
            <Card className="glass-card border-white/10 bg-background/90 backdrop-blur-xl hover:bg-background/95 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500">
                      <Flame className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Your Streak</h3>
                      <p className="text-sm text-gray-300">Keep it going!</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-orange-400">🔥</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Journal Quick Access */}
            <Card className="glass-card border-white/10 bg-background/90 backdrop-blur-xl hover:bg-background/95 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-blue-500">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Daily Journal</h3>
                      <p className="text-sm text-gray-300">Write your thoughts</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => navigate('/journal')}
                    className="btn-glow"
                    size="sm"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Write
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search your capsules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 glass-card border-white/10"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'ghost'}
                onClick={() => setFilterStatus('all')}
                className={filterStatus === 'all' ? 'btn-glow' : 'btn-glass'}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={filterStatus === 'locked' ? 'default' : 'ghost'}
                onClick={() => setFilterStatus('locked')}
                className={filterStatus === 'locked' ? 'btn-glow' : 'btn-glass'}
                size="sm"
              >
                Locked
              </Button>
              <Button
                variant={filterStatus === 'unlocked' ? 'default' : 'ghost'}
                onClick={() => setFilterStatus('unlocked')}
                className={filterStatus === 'unlocked' ? 'btn-glow' : 'btn-glass'}
                size="sm"
              >
                Unlocked
              </Button>
            </div>

            {/* View Toggle */}
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode('grid')}
                className={`btn-glass ${viewMode === 'grid' ? 'bg-primary/20' : ''}`}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode('list')}
                className={`btn-glass ${viewMode === 'list' ? 'bg-primary/20' : ''}`}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {/* Create Button */}
            <Link to="/create">
              <Button className="btn-glow">
                <Plus className="w-4 h-4 mr-2" />
                New Capsule
              </Button>
            </Link>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary mr-3" />
              <p className="text-muted-foreground">Loading your capsules...</p>
            </div>
          )}

          {/* Capsules Grid */}
          {!loading && (
            <div className={`grid ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
              {filteredCapsules.map((capsule) => (
              <CapsuleCard
                key={capsule._id}
                id={capsule._id}
                title={capsule.title}
                emoji={capsule.emoji}
                mood={capsule.mood}
                unlockDate={new Date(capsule.unlockDate)}
                isLocked={!capsule.isUnlocked}
                lockType={capsule.lockType}
                riddleQuestion={capsule.riddleQuestion}
                preview={capsule.isUnlocked ? capsule.message : 'This capsule is locked until the unlock date...'}
                onClick={() => handleCapsuleClick(capsule._id)}
                failedAttempts={capsule.failedAttempts}
                lockoutUntil={capsule.lockoutUntil ? new Date(capsule.lockoutUntil) : undefined}
                onUnlock={handleCapsuleUnlock}
                media={capsule.media}
              />
              ))}
            </div>
          )}

          {!loading && filteredCapsules.length === 0 && (
            <div className="text-center py-12">
              <div className="glass-card p-8 max-w-md mx-auto">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No capsules found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? 'Try adjusting your search terms' : 'Create your first time capsule to get started'}
                </p>
                <Link to="/create">
                  <Button className="btn-glow">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Capsule
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Daily Insight Widget */}
          <div className="mt-12 max-w-3xl mx-auto">
            <DailyInsight />
          </div>
        </div>
      </div>

      {/* Capsule Modal */}
      <CapsuleModal
        capsule={selectedCapsule}
        isOpen={showCapsuleModal}
        onClose={() => {
          setShowCapsuleModal(false);
          setSelectedCapsule(null);
          loadCapsules(); // Refresh capsules after viewing
        }}
      />
    </div>
  );
};

export default Dashboard;