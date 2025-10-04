import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Calendar, Trophy } from 'lucide-react';
import apiClient from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface StreakData {
  streakCount: number;
  lastCapsuleDate: string | null;
  userName: string;
}

const StreakWidget = () => {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (user?._id) {
      loadStreakData();
    }
  }, [user]);

  const loadStreakData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getUserStreak(user._id);
      if (response.success) {
        setStreakData(response.data);
        
        // Check if streak was just updated (fire animation)
        if (response.data.streakCount > 0) {
          setIsAnimating(true);
          setTimeout(() => setIsAnimating(false), 2000);
        }
      }
    } catch (error) {
      console.error('Failed to load streak data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStreakMessage = (count: number) => {
    if (count === 0) return "Start your streak today!";
    if (count === 1) return "Great start! Keep it going!";
    if (count < 7) return "Building momentum! 🔥";
    if (count < 30) return "On fire! Week warrior! 🔥🔥";
    return "Legendary streak! 💎";
  };

  const getStreakBadge = (count: number) => {
    if (count >= 30) return { text: "Monthly Master", color: "bg-purple-500", icon: "💎" };
    if (count >= 7) return { text: "Week Warrior", color: "bg-orange-500", icon: "🔥" };
    if (count >= 3) return { text: "Getting Hot", color: "bg-red-500", icon: "🔥" };
    return null;
  };

  const formatLastCapsuleDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  if (loading) {
    return (
      <Card className="glass-card border-white/10 bg-background/90 backdrop-blur-xl">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-muted/20 rounded w-3/4 mb-2"></div>
            <div className="h-6 bg-muted/20 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const streakCount = streakData?.streakCount || 0;
  const badge = getStreakBadge(streakCount);

  return (
    <Card className="glass-card border-white/10 bg-background/90 backdrop-blur-xl hover:bg-background/95 transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 ${isAnimating ? 'animate-pulse' : ''}`}>
              <Flame className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Capsule Streak</h3>
              <p className="text-sm text-gray-300">{getStreakMessage(streakCount)}</p>
            </div>
          </div>
          {badge && (
            <Badge className={`${badge.color} text-white`}>
              <span className="mr-1">{badge.icon}</span>
              {badge.text}
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-orange-400">
              {streakCount} {streakCount === 1 ? 'day' : 'days'}
            </span>
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>{formatLastCapsuleDate(streakData?.lastCapsuleDate || null)}</span>
            </div>
          </div>

          {streakCount > 0 && (
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(streakCount, 10) }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < streakCount ? 'bg-orange-400' : 'bg-gray-600'
                  } ${isAnimating ? 'animate-pulse' : ''}`}
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
              {streakCount > 10 && (
                <span className="text-xs text-gray-400 ml-1">+{streakCount - 10}</span>
              )}
            </div>
          )}

          {streakCount === 0 && (
            <div className="text-center py-2">
              <p className="text-sm text-gray-400">
                Create your first capsule to start your streak! 🚀
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakWidget;
