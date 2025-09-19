import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Calendar, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import CapsuleCard from '@/components/CapsuleCard';
import Navigation from '@/components/Navigation';

// Sample data
const sampleCapsules = [
  {
    id: '1',
    title: 'College Memories',
    emoji: '🎓',
    unlockDate: new Date('2024-12-25'),
    isLocked: true,
    hasRiddle: false,
    isShared: true,
    preview: 'A collection of photos and memories from my freshman year...'
  },
  {
    id: '2',
    title: 'Birthday Wishes',
    emoji: '🎂',
    unlockDate: new Date('2024-06-15'),
    isLocked: false,
    hasRiddle: true,
    isShared: false,
    preview: 'Happy birthday to future me! Hope you achieved all your goals...'
  },
  {
    id: '3',
    title: 'Study Abroad Adventure',
    emoji: '✈️',
    unlockDate: new Date('2025-03-20'),
    isLocked: true,
    hasRiddle: true,
    isShared: true,
    preview: 'Photos and stories from my semester in Barcelona...'
  },
  {
    id: '4',
    title: 'New Year Resolutions',
    emoji: '🎯',
    unlockDate: new Date('2024-01-01'),
    isLocked: false,
    hasRiddle: false,
    isShared: false,
    preview: 'My goals for this year and thoughts about the future...'
  }
];

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<'all' | 'locked' | 'unlocked'>('all');

  const filteredCapsules = sampleCapsules.filter(capsule => {
    const matchesSearch = capsule.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filterStatus === 'all' || 
      (filterStatus === 'locked' && capsule.isLocked) || 
      (filterStatus === 'unlocked' && !capsule.isLocked);
    
    return matchesSearch && matchesFilter;
  });

  const handleCapsuleClick = (id: string) => {
    console.log('Opening capsule:', id);
    // TODO: Navigate to capsule detail view
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gradient mb-4">
              Your Time Capsules
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your memories and discover what awaits you in the future
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-primary">4</div>
              <div className="text-sm text-muted-foreground">Total Capsules</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-accent">2</div>
              <div className="text-sm text-muted-foreground">Locked</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-secondary">2</div>
              <div className="text-sm text-muted-foreground">Unlocked</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-gradient">2</div>
              <div className="text-sm text-muted-foreground">Shared</div>
            </div>
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
                key={capsule.id}
                {...capsule}
                onClick={() => handleCapsuleClick(capsule.id)}
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