import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Puzzle, Loader2, CheckCircle, XCircle } from 'lucide-react';
import apiClient from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface RiddleUnlockProps {
  capsuleId: string;
  riddleQuestion: string;
  onSuccess: (capsuleData: any) => void;
  onClose: () => void;
}

const RiddleUnlock = ({ capsuleId, riddleQuestion, onSuccess, onClose }: RiddleUnlockProps) => {
  const { toast } = useToast();
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutMessage, setLockoutMessage] = useState('');
  const [unlockedCapsule, setUnlockedCapsule] = useState<any>(null);
  const [showUnlockedContent, setShowUnlockedContent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!answer.trim()) {
      toast({
        title: "Answer Required",
        description: "Please enter your answer to the riddle.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.attemptRiddle(capsuleId, answer);
      
      if (response.success) {
        toast({
          title: "🎉 Correct Answer!",
          description: "Capsule unlocked successfully!",
        });
        // Store the unlocked capsule data and show it
        setUnlockedCapsule(response.data.capsule);
        setShowUnlockedContent(true);
        // Don't call onSuccess immediately, let user see the content first
      } else {
        setAttempts(prev => prev + 1);
        
        // Check if capsule is locked
        if (response.locked) {
          setIsLocked(true);
          setLockoutMessage(response.message);
          toast({
            title: "🔒 Capsule Locked",
            description: response.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "❌ Incorrect Answer",
            description: response.message || "That's not the right answer. Try again!",
            variant: "destructive"
          });
          setAnswer('');
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit answer. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewCapsule = () => {
    // Call onSuccess to close modal and refresh data
    onSuccess(unlockedCapsule);
  };

  const handleClose = () => {
    // If showing unlocked content, just close
    if (showUnlockedContent) {
      onSuccess(unlockedCapsule);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md glass-card border-white/10 bg-background/95 backdrop-blur-xl shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            {showUnlockedContent ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-400" />
                Capsule Unlocked!
              </>
            ) : (
              <>
                <Puzzle className="w-5 h-5 text-purple-400" />
                Solve the Riddle
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {showUnlockedContent ? (
              // Show unlocked capsule content
              <div className="space-y-6">
                <div className="p-4 bg-gradient-to-r from-green-500/40 to-emerald-500/40 rounded-lg border border-green-500/50 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 font-medium">Riddle Solved!</span>
                  </div>
                  <p className="text-white/90 text-sm">You successfully solved the riddle and unlocked the capsule!</p>
                </div>
                
                <div className="p-5 bg-gradient-to-r from-blue-500/40 to-purple-500/40 rounded-lg border border-blue-500/50 backdrop-blur-sm shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{unlockedCapsule?.emoji}</span>
                    <h3 className="text-white font-bold text-lg">{unlockedCapsule?.title}</h3>
                  </div>
                  <p className="text-white/95 text-base mb-4 leading-relaxed">{unlockedCapsule?.message}</p>
                  {unlockedCapsule?.mood && (
                    <div className="flex items-center gap-2 text-sm p-2 bg-white/10 rounded-md">
                      <span className="text-white/80 font-medium">Mood:</span>
                      <span className="text-white font-semibold">{unlockedCapsule.mood}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleViewCapsule}
                    className="flex-1 btn-glow"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    View Full Capsule
                  </Button>
                  <Button
                    onClick={handleClose}
                    variant="outline"
                    className="glass-card border-white/10"
                  >
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
                  <p className="text-white font-medium mb-2">Riddle:</p>
                  <p className="text-white/90">{riddleQuestion}</p>
                </div>

                {isLocked ? (
                  <div className="text-center space-y-4">
                    <div className="p-4 bg-red-500/20 rounded-lg border border-red-500/30">
                      <div className="flex items-center justify-center mb-2">
                        <XCircle className="w-8 h-8 text-red-400" />
                      </div>
                      <p className="text-red-400 font-medium mb-2">Capsule Locked</p>
                      <p className="text-red-300 text-sm">{lockoutMessage}</p>
                    </div>
                    <Button
                      type="button"
                      onClick={onClose}
                      className="w-full btn-glass"
                    >
                      Close
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="answer" className="text-white">
                        Your Answer
                      </Label>
                      <Input
                        id="answer"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Enter your answer here..."
                        className="glass-card border-white/10 bg-background/50 text-white placeholder:text-gray-400"
                        disabled={loading}
                      />
                    </div>

                    {attempts > 0 && (
                      <div className="flex items-center gap-2 text-sm text-yellow-400">
                        <XCircle className="w-4 h-4" />
                        <span>Attempts: {attempts}</span>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button
                        type="submit"
                        disabled={loading || !answer.trim()}
                        className="flex-1 btn-glow"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Checking...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Submit Answer
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="glass-card border-white/10"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiddleUnlock;
