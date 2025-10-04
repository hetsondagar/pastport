import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Trophy, Star, Zap } from 'lucide-react';

interface StreakCelebrationProps {
  streakCount: number;
  isVisible: boolean;
  onComplete?: () => void;
}

const StreakCelebration = ({ streakCount, isVisible, onComplete }: StreakCelebrationProps) => {
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'celebrate' | 'exit'>('enter');

  useEffect(() => {
    if (isVisible) {
      setAnimationPhase('enter');
      
      const timer1 = setTimeout(() => setAnimationPhase('celebrate'), 300);
      const timer2 = setTimeout(() => setAnimationPhase('exit'), 2000);
      const timer3 = setTimeout(() => onComplete?.(), 3000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  const getStreakMessage = (count: number) => {
    if (count === 1) return { message: "First Entry!", icon: "🌟", color: "text-yellow-400" };
    if (count === 3) return { message: "Getting Started!", icon: "🔥", color: "text-orange-400" };
    if (count === 7) return { message: "Week Warrior!", icon: "⚡", color: "text-blue-400" };
    if (count === 14) return { message: "Two Week Champion!", icon: "🏆", color: "text-purple-400" };
    if (count === 30) return { message: "Monthly Master!", icon: "💎", color: "text-green-400" };
    if (count === 100) return { message: "Century Club!", icon: "👑", color: "text-pink-400" };
    if (count % 7 === 0) return { message: "Streak Milestone!", icon: "⭐", color: "text-cyan-400" };
    return { message: "Keep Going!", icon: "🔥", color: "text-orange-400" };
  };

  const celebration = getStreakMessage(streakCount);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <Card 
        className={`glass-card border-white/10 bg-background/90 backdrop-blur-xl transition-all duration-500 ${
          animationPhase === 'enter' ? 'scale-0 opacity-0' : 
          animationPhase === 'celebrate' ? 'scale-110 opacity-100' : 
          'scale-0 opacity-0'
        }`}
      >
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className={`text-6xl animate-bounce ${celebration.color}`}>
              {celebration.icon}
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">
                {celebration.message}
              </h3>
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-400" />
                <span className="text-orange-400 font-semibold text-lg">
                  {streakCount} day streak!
                </span>
              </div>
            </div>

            <Badge className={`${celebration.color} bg-opacity-20 border-current`}>
              <Trophy className="w-4 h-4 mr-1" />
              Milestone Reached
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StreakCelebration;
