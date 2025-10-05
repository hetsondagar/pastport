import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Lock, Unlock, Calendar, Flame, Sparkles } from 'lucide-react';
import apiClient from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ConfettiAnimation from './ConfettiAnimation';
import StreakCelebration from './StreakCelebration';

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

interface MonthlyCardViewProps {
  onEntryClick: (entry: JournalEntry | null, date: Date) => void;
}

const MonthlyCardView = ({ onEntryClick }: MonthlyCardViewProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entries, setEntries] = useState<{ [key: string]: JournalEntry }>({});
  const [loading, setLoading] = useState(true);
  const [streakData, setStreakData] = useState({ streakCount: 0, lastEntryDate: null });
  const [showConfetti, setShowConfetti] = useState(false);
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);
  const [previousStreakCount, setPreviousStreakCount] = useState(0);

  useEffect(() => {
    if (user?._id) {
      loadMonthData();
      loadStreakData();
    }
  }, [user, currentDate]);

  const loadMonthData = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const response = await apiClient.getMonthEntries(user._id, year, month);
      
      if (response.success) {
        setEntries(response.data.entries);
      }
    } catch (error) {
      console.error('Failed to load month data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStreakData = async () => {
    try {
      const response = await apiClient.getJournalStreak();
      if (response.success) {
        const newStreakCount = response.data.streakCount;
        
        // Check if streak increased (new entry created)
        if (newStreakCount > previousStreakCount && previousStreakCount > 0) {
          setShowConfetti(true);
          
          // Show streak celebration for milestones
          if (newStreakCount === 3 || newStreakCount === 7 || newStreakCount === 14 || 
              newStreakCount === 30 || newStreakCount === 100 || newStreakCount % 7 === 0) {
            setShowStreakCelebration(true);
          }
        }
        
        setStreakData(response.data);
        setPreviousStreakCount(newStreakCount);
      }
    } catch (error) {
      console.error('Failed to load streak data:', error);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getMoodEmoji = (mood: string) => {
    const moodEmojis: { [key: string]: string } = {
      happy: '🌞',
      sad: '😢',
      excited: '🎉',
      angry: '😡',
      calm: '🌙',
      neutral: '😐'
    };
    return moodEmojis[mood] || '😐';
  };

  const getCardStatus = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0];
    const entry = entries[dateKey];
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const isPast = date < today;
    const isFuture = date > today;

    if (entry) {
      if (entry.isCapsule) {
        if (entry.isUnlocked) {
          return { type: 'unlocked-capsule', color: 'bg-green-500/20 border-green-500/50' };
        } else if (entry.lockType === 'time' && entry.unlockDate && new Date(entry.unlockDate) <= new Date()) {
          return { type: 'ready-to-unlock', color: 'bg-yellow-500/20 border-yellow-500/50' };
        } else {
          return { type: 'locked-capsule', color: 'bg-purple-500/20 border-purple-500/50' };
        }
      } else {
        return { type: 'journal-entry', color: 'bg-blue-500/20 border-blue-500/50' };
      }
    } else if (isPast && !isToday) {
      return { type: 'missed', color: 'bg-red-500/20 border-red-500/50 animate-pulse' };
    } else if (isFuture) {
      return { type: 'future', color: 'bg-gray-500/10 border-gray-500/30' };
    } else {
      return { type: 'today', color: 'bg-orange-500/20 border-orange-500/50' };
    }
  };

  const handleCardClick = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0];
    const entry = entries[dateKey] || null;
    onEntryClick(entry, date);
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const days = getDaysInMonth(currentDate);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-muted/20 rounded w-48 animate-pulse"></div>
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-muted/20 rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-muted/20 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }, (_, i) => (
            <div key={i} className="h-16 bg-muted/20 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white">{formatMonthYear(currentDate)}</h2>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            <span className="text-orange-400 font-semibold">{streakData.streakCount} day streak</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
            className="glass-card border-white/10"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
            className="glass-card border-white/10"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((date, index) => {
          if (!date) {
            return <div key={index} className="h-16"></div>;
          }

          const status = getCardStatus(date);
          const dateKey = date.toISOString().split('T')[0];
          const entry = entries[dateKey];

          return (
            <Card
              key={index}
              className={`h-16 cursor-pointer transition-all duration-200 hover:scale-105 ${status.color} ${
                status.type === 'missed' ? 'animate-bounce-once' : ''
              }`}
              onClick={() => handleCardClick(date)}
            >
              <CardContent className="p-2 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">
                    {date.getDate()}
                  </span>
                  {entry && (
                    <div className="flex items-center gap-1">
                      {entry.isCapsule ? (
                        entry.isUnlocked ? (
                          <Unlock className="w-3 h-3 text-green-400" />
                        ) : (
                          <Lock className="w-3 h-3 text-purple-400" />
                        )
                      ) : (
                        <span className="text-xs">{getMoodEmoji(entry.mood)}</span>
                      )}
                    </div>
                  )}
                </div>
                
                {entry && (
                  <div className="text-xs text-white/80 truncate">
                    {entry.content.substring(0, 20)}...
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500/20 border border-blue-500/50 rounded"></div>
          <span className="text-gray-300">Journal Entry</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-500/20 border border-purple-500/50 rounded"></div>
          <span className="text-gray-300">Locked Capsule</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500/20 border border-green-500/50 rounded"></div>
          <span className="text-gray-300">Unlocked Capsule</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500/20 border border-red-500/50 rounded"></div>
          <span className="text-gray-300">Missed Day</span>
        </div>
      </div>

      {/* Animations */}
      <ConfettiAnimation 
        isActive={showConfetti} 
        onComplete={() => setShowConfetti(false)} 
      />
      <StreakCelebration 
        streakCount={streakData.streakCount}
        isVisible={showStreakCelebration}
        onComplete={() => setShowStreakCelebration(false)}
      />
    </div>
  );
};

export default MonthlyCardView;
