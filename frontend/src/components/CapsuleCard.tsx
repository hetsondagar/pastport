import { Clock, Lock, Unlock, Users, Puzzle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CapsuleCardProps {
  id: string;
  title: string;
  emoji: string;
  unlockDate: Date;
  isLocked: boolean;
  hasRiddle: boolean;
  isShared: boolean;
  preview?: string;
  onClick: () => void;
}

const CapsuleCard = ({
  title,
  emoji,
  unlockDate,
  isLocked,
  hasRiddle,
  isShared,
  preview,
  onClick
}: CapsuleCardProps) => {
  const now = new Date();
  const timeUntilUnlock = unlockDate.getTime() - now.getTime();
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
            </div>
          </div>
        </div>
        
        <div className="flex space-x-1">
          {hasRiddle && (
            <Badge variant="secondary" className="bg-accent/20 text-accent">
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
        disabled={isLocked && timeUntilUnlock > 0}
      >
        {isLocked ? (
          timeUntilUnlock > 0 ? (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Locked
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
    </div>
  );
};

export default CapsuleCard;