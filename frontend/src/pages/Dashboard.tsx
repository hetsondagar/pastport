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
import Navigation from '@/components/Navigation';
import StreakWidget from '@/components/StreakWidget';
import LotteryWidget from '@/components/LotteryWidget';
import AnimatedCounter from '@/components/AnimatedCounter';

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
  const [journalStats, setJournalStats] = useState({
    streakCount: 0,
    totalEntries: 0,
    lastEntryDate: null
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<'all' | 'locked' | 'unlocked'>('all');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Load capsules and stats
  useEffect(() => {
    if (isAuthenticated) {
      loadCapsules();
      loadStats();
      loadJournalStats();
    }
  }, [isAuthenticated, filterStatus, searchTerm]);

  const loadCapsules = async () => {
    try {
      setLoading(true);
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
      toast({
        title: "Error",
        description: "Failed to load capsules. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCapsuleUnlock = () => {
    // Refresh capsules after unlock
    loadCapsules();
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

  const loadJournalStats = async () => {
    try {
      const response = await apiClient.getJournalStreak();
      if (response.success) {
        setJournalStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load journal stats:', error);
    }
  };

  const handleCapsuleClick = (id: string) => {
    // TODO: Navigate to capsule detail view
    console.log('Opening capsule:', id);
  };

  // Filter capsules locally for better UX
  const filteredCapsules = capsules.filter(capsule => {
    const matchesSearch = capsule.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your capsules...</p>
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
          <div className="mb-8">
            <h1 className="text-4xl app-name-bold text-gradient mb-4">
              Your Time Capsules
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your memories and discover what awaits you in the future
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
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
            <div className="glass-card-enhanced p-4 text-center">
              <AnimatedCounter 
                value={stats.sharedCapsules} 
                className="text-2xl font-bold text-gradient"
              />
              <div className="text-sm text-muted-foreground">Shared</div>
            </div>
          </div>

          {/* Fun Features Widgets */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <StreakWidget />
            <LotteryWidget />
            
            {/* Mini Journal Summary */}
            <Card className="glass-card border-white/10 bg-background/90 backdrop-blur-xl hover:bg-background/95 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-gradient-to-r from-green-500 to-blue-500">
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Journal Streak</h3>
                      <p className="text-sm text-gray-300">Daily writing</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">
                      {journalStats.streakCount}
                    </div>
                    <div className="text-xs text-gray-400">days</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Total Entries</span>
                    <span className="text-white font-medium">{journalStats.totalEntries}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Last Entry</span>
                    <span className="text-white font-medium">
                      {journalStats.lastEntryDate 
                        ? new Date(journalStats.lastEntryDate).toLocaleDateString()
                        : 'Never'
                      }
                    </span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => navigate('/journal')}
                  className="w-full mt-3 btn-glow"
                  size="sm"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  View Journal
                </Button>
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

          {/* Capsules Grid */}
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
                isShared={capsule.sharedWith && capsule.sharedWith.length > 0}
                preview={capsule.isUnlocked ? capsule.message : 'This capsule is locked until the unlock date...'}
                onClick={() => handleCapsuleClick(capsule._id)}
                failedAttempts={capsule.failedAttempts}
                lockoutUntil={capsule.lockoutUntil ? new Date(capsule.lockoutUntil) : undefined}
                onUnlock={handleCapsuleUnlock}
              />
            ))}
          </div>

          {filteredCapsules.length === 0 && (
            <div className="text-center py-12">
              <div className="glass-card p-8 max-w-md mx-auto">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No capsules found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? 'Try adjusting your search terms' : 'Create your first time capsule to get started'}
                </p>
                <Button className="btn-glow">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Capsule
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;