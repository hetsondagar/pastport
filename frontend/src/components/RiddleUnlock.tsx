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
        onSuccess(response.data.capsule);
      } else {
        setAttempts(prev => prev + 1);
        toast({
          title: "❌ Incorrect Answer",
          description: response.message || "That's not the right answer. Try again!",
          variant: "destructive"
        });
        setAnswer('');
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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md glass-card border-white/10 bg-background/90 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Puzzle className="w-5 h-5 text-purple-400" />
            Solve the Riddle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
              <p className="text-white font-medium mb-2">Riddle:</p>
              <p className="text-white/90">{riddleQuestion}</p>
            </div>

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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiddleUnlock;
