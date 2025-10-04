import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Ticket, Clock, Gift, Sparkles } from 'lucide-react';
import apiClient from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface LotteryCapsule {
  id: string;
  content: string | null;
  unlockDate: string;
  isUnlocked: boolean;
  type: string;
  timeUntilUnlock: number;
}

const LotteryWidget = () => {
  const { toast } = useToast();
  const [lotteryCapsule, setLotteryCapsule] = useState<LotteryCapsule | null>(null);
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    loadLotteryCapsule();
  }, []);

  useEffect(() => {
    if (lotteryCapsule && !lotteryCapsule.isUnlocked) {
      setTimeLeft(lotteryCapsule.timeUntilUnlock);
      
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1000) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [lotteryCapsule]);

  const loadLotteryCapsule = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getLotteryCapsule();
      if (response.success) {
        setLotteryCapsule(response.data);
      }
    } catch (error) {
      console.error('Failed to load lottery capsule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
    if (!lotteryCapsule) return;

    try {
      setUnlocking(true);
      const response = await apiClient.unlockLotteryCapsule(lotteryCapsule.id);
      
      if (response.success) {
        // Show confetti effect
        toast({
          title: "🎉 Lottery Capsule Unlocked!",
          description: response.data.content,
        });
        
        // Update the capsule state
        setLotteryCapsule(prev => prev ? {
          ...prev,
          isUnlocked: true,
          content: response.data.content
        } : null);
      } else {
        toast({
          title: "Not Ready Yet",
          description: response.message || "Capsule not ready to unlock",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Unlock Failed",
        description: "Failed to unlock lottery capsule",
        variant: "destructive"
      });
    } finally {
      setUnlocking(false);
    }
  };

  const formatTimeLeft = (milliseconds: number) => {
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'quote': return '💭';
      case 'surprise': return '🎁';
      default: return '🎟️';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'quote': return 'bg-blue-500';
      case 'surprise': return 'bg-purple-500';
      default: return 'bg-yellow-500';
    }
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

  if (!lotteryCapsule) {
    return (
      <Card className="glass-card border-white/10 bg-background/90 backdrop-blur-xl">
        <CardContent className="p-4 text-center">
          <Ticket className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-400">No lottery capsule available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-white/10 bg-background/90 backdrop-blur-xl hover:bg-background/95 transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500">
              <Ticket className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Lottery Capsule</h3>
              <p className="text-sm text-gray-300">Weekly surprise!</p>
            </div>
          </div>
          <Badge className={`${getTypeColor(lotteryCapsule.type)} text-white`}>
            <span className="mr-1">{getTypeIcon(lotteryCapsule.type)}</span>
            {lotteryCapsule.type}
          </Badge>
        </div>

        {lotteryCapsule.isUnlocked ? (
          <div className="space-y-3">
            <div className="p-3 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg border border-green-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-medium">Unlocked!</span>
              </div>
              <p className="text-white text-sm">{lotteryCapsule.content}</p>
            </div>
            <Button 
              onClick={loadLotteryCapsule}
              variant="outline" 
              size="sm" 
              className="w-full glass-card border-white/10"
            >
              <Gift className="w-4 h-4 mr-2" />
              Get New Capsule
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 font-medium">
                  {timeLeft > 0 ? 'Unlocks in' : 'Ready to unlock!'}
                </span>
              </div>
              {timeLeft > 0 ? (
                <p className="text-white text-sm">
                  {formatTimeLeft(timeLeft)} remaining
                </p>
              ) : (
                <p className="text-white text-sm">Your surprise is ready!</p>
              )}
            </div>
            
            <Button 
              onClick={handleUnlock}
              disabled={timeLeft > 0 || unlocking}
              className="w-full btn-glow"
            >
              {unlocking ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Unlocking...
                </>
              ) : timeLeft > 0 ? (
                <>
                  <Clock className="w-4 h-4 mr-2" />
                  Wait {formatTimeLeft(timeLeft)}
                </>
              ) : (
                <>
                  <Gift className="w-4 h-4 mr-2" />
                  Unlock Surprise!
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LotteryWidget;
