import { useState } from 'react';
import { Clock, Lock, Unlock, Users, Puzzle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import RiddleUnlock from './RiddleUnlock';
import apiClient from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface CapsuleCardProps {
  id: string;
  title: string;
  emoji: string;
  mood?: string;
  unlockDate: Date;
  isLocked: boolean;
  lockType?: string;
  riddleQuestion?: string;
  isShared: boolean;
  preview?: string;
  onClick: () => void;
  failedAttempts?: number;
  lockoutUntil?: Date;
}

const CapsuleCard = ({
  id,
  title,
  emoji,
  mood,
  unlockDate,
  isLocked,
  lockType,
  riddleQuestion,
  isShared,
  preview,
  onClick,
  failedAttempts = 0,
  lockoutUntil
}: CapsuleCardProps) => {
  const [showRiddleUnlock, setShowRiddleUnlock] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const { toast } = useToast();

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

  const handleUnlockClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lockType === 'riddle' && riddleQuestion) {
      setShowRiddleUnlock(true);
    } else {
      // Unlock the capsule
      try {
        setUnlocking(true);
        const response = await apiClient.unlockCapsule(id);
        
        if (response.success) {
          toast({
            title: "🎉 Capsule Unlocked!",
            description: "Your time capsule has been unlocked successfully!",
          });
          // Refresh the page or update the capsule state
          window.location.reload();
        } else {
          toast({
            title: "Unlock Failed",
            description: response.message || "Failed to unlock capsule",
            variant: "destructive"
          });
        }
      } catch (error) {
        toast({
          title: "Unlock Failed",
          description: "Failed to unlock capsule. Please try again.",
          variant: "destructive"
        });
      } finally {
        setUnlocking(false);
      }
    }
  };

  const handleRiddleSuccess = (capsuleData: any) => {
    setShowRiddleUnlock(false);
    onClick();
  };
  const now = new Date();
  const timeUntilUnlock = unlockDate.getTime() - now.getTime();
  
  // Check if capsule is locked due to failed attempts
  const isLockedDueToAttempts = lockoutUntil && now < lockoutUntil;
  const daysUntilUnlock = Math.ceil(timeUntilUnlock / (1000 * 60 * 60 * 24));

  const formatCountdown = () => {
    if (timeUntilUnlock <= 0) return "Ready to unlock!";
    
    const days = Math.floor(timeUntilUnlock / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeUntilUnlock % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  return (
    <div className="capsule-card group" onClick={onClick}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">{emoji}</div>
          <div>
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
              {title}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              {isLocked ? (
                <Lock className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Unlock className="w-4 h-4 text-primary" />
              )}
              <span className="text-sm text-muted-foreground">
                {unlockDate.toLocaleDateString()}
              </span>
              {mood && (
                <span className="text-lg" title={`Mood: ${mood}`}>
                  {getMoodEmoji(mood)}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex space-x-1">
          {lockType === 'riddle' && (
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
              <Puzzle className="w-3 h-3 mr-1" />
              Riddle
            </Badge>
          )}
          {isShared && (
            <Badge variant="secondary" className="bg-secondary/20 text-secondary">
              <Users className="w-3 h-3 mr-1" />
              Shared
            </Badge>
          )}
        </div>
      </div>

      {/* Content Preview */}
      {preview && !isLocked && (
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {preview}
        </p>
      )}

      {isLocked && (
        <div className="glass-card p-3 mb-4 border border-primary/20">
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="w-4 h-4 text-primary animate-pulse-glow" />
            <span className="text-primary font-medium">
              {formatCountdown()}
            </span>
          </div>
        </div>
      )}

      {/* Action Button */}
      <Button 
        className={`w-full ${isLocked ? 'btn-glass' : 'btn-glow'}`}
        disabled={isLocked && (timeUntilUnlock > 0 && lockType !== 'riddle' || isLockedDueToAttempts) || unlocking}
        onClick={handleUnlockClick}
      >
        {unlocking ? (
          <>
            <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Unlocking...
          </>
        ) : isLocked ? (
          isLockedDueToAttempts ? (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Locked (Too Many Attempts)
            </>
          ) : timeUntilUnlock > 0 ? (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Locked
            </>
          ) : lockType === 'riddle' ? (
            <>
              <Puzzle className="w-4 h-4 mr-2" />
              Solve Riddle
            </>
          ) : (
            <>
              <Unlock className="w-4 h-4 mr-2" />
              Ready to Unlock!
            </>
          )
        ) : (
          <>
            <Unlock className="w-4 h-4 mr-2" />
            View Capsule
          </>
        )}
      </Button>

      {/* Riddle Unlock Modal */}
      {showRiddleUnlock && riddleQuestion && (
        <RiddleUnlock
          capsuleId={id}
          riddleQuestion={riddleQuestion}
          onSuccess={handleRiddleSuccess}
          onClose={() => setShowRiddleUnlock(false)}
        />
      )}
    </div>
  );
};

export default CapsuleCard;