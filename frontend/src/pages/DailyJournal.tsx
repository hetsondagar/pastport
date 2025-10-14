import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Flame, BookOpen, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import MonthlyCardView from '@/components/MonthlyCardView';
import CreateEditJournalModal from '@/components/CreateEditJournalModal';
import AnimatedCounter from '@/components/AnimatedCounter';
import PageTitle from '@/components/ui/PageTitle';

interface JournalEntry {
  _id: string;
  content: string;
  mood: string;
  isCapsule: boolean;
  lockType: string;
  isUnlocked: boolean;
  unlockDate?: string;
  date: string;
  media?: Array<{
    url: string;
    type: 'image' | 'video' | 'audio';
    caption?: string;
    format?: string;
    size?: number;
    duration?: number;
  }>;
}

const DailyJournal = () => {
  const { user } = useAuth();
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEntryClick = (entry: JournalEntry | null, date: Date) => {
    setSelectedEntry(entry);
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedEntry(null);
  };

  const handleSave = () => {
    setIsModalOpen(false);
    setSelectedEntry(null);
    // Force MonthlyCardView to refresh by updating a key
    setRefreshKey(prev => prev + 1);
  };

  const handleNewEntry = () => {
    setSelectedEntry(null);
    setSelectedDate(new Date());
    setIsModalOpen(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="glass-card border-white/10 bg-background/90 backdrop-blur-xl">
          <CardContent className="p-8 text-center">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Please log in</h2>
            <p className="text-muted-foreground">You need to be logged in to access your journal.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <PageTitle
              title="Daily Journal"
              subtitle="Track your daily thoughts and create time capsules"
            />
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid md:grid-cols-4 gap-4 mb-8"
          >
            <div className="glass-card-enhanced p-4 text-center">
              <AnimatedCounter 
                value={0} 
                className="text-2xl font-bold text-primary"
              />
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </div>
            <div className="glass-card-enhanced p-4 text-center">
              <AnimatedCounter 
                value={0} 
                className="text-2xl font-bold text-accent"
              />
              <div className="text-sm text-muted-foreground">Total Entries</div>
            </div>
            <div className="glass-card-enhanced p-4 text-center">
              <AnimatedCounter 
                value={0} 
                className="text-2xl font-bold text-secondary"
              />
              <div className="text-sm text-muted-foreground">Time Capsules</div>
            </div>
            <div className="glass-card-enhanced p-4 text-center">
              <Button
                onClick={handleNewEntry}
                className="w-full btn-glow"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Entry
              </Button>
            </div>
          </motion.div>

          {/* Monthly Calendar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-card border-white/10 bg-background/90 backdrop-blur-xl shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Calendar className="w-5 h-5" />
                  Monthly View
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MonthlyCardView key={refreshKey} onEntryClick={handleEntryClick} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Journal Entry Modal */}
          <CreateEditJournalModal
            entry={selectedEntry}
            date={selectedDate}
            isOpen={isModalOpen}
            onClose={handleModalClose}
            onSave={handleSave}
          />
        </div>
      </div>
    </div>
  );
};

export default DailyJournal;