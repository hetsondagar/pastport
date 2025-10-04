import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Flame, BookOpen, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import MonthlyCardView from '@/components/MonthlyCardView';
import JournalEntryModal from '@/components/JournalEntryModal';

interface JournalEntry {
  _id: string;
  content: string;
  mood: string;
  isCapsule: boolean;
  lockType: string;
  isUnlocked: boolean;
  unlockDate?: string;
  date: string;
}

const DailyJournal = () => {
  const { user } = useAuth();
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    // The MonthlyCardView will automatically refresh
  };

  const handleNewEntry = () => {
    setSelectedEntry(null);
    setSelectedDate(new Date());
    setIsModalOpen(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="glass-card border-white/10 bg-background/90 backdrop-blur-xl">
          <CardContent className="p-8 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Please log in</h2>
            <p className="text-gray-400">You need to be logged in to access your journal.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Daily Journal</h1>
            <p className="text-gray-300">Track your daily thoughts and create time capsules</p>
          </div>
          <Button
            onClick={handleNewEntry}
            className="btn-glow"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Entry
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="glass-card border-white/10 bg-background/90 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">0</p>
                  <p className="text-sm text-gray-300">Day Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10 bg-background/90 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">0</p>
                  <p className="text-sm text-gray-300">Total Entries</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10 bg-background/90 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">0</p>
                  <p className="text-sm text-gray-300">Time Capsules</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Calendar */}
        <Card className="glass-card border-white/10 bg-background/90 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Calendar className="w-5 h-5" />
              Monthly View
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyCardView onEntryClick={handleEntryClick} />
          </CardContent>
        </Card>

        {/* Journal Entry Modal */}
        <JournalEntryModal
          entry={selectedEntry}
          date={selectedDate}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};

export default DailyJournal;
