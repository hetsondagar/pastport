import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  Lock, 
  Unlock, 
  Puzzle, 
  Save, 
  X, 
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import apiClient from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import MoodPicker from './MoodPicker';
import ConfettiAnimation from './ConfettiAnimation';

interface JournalEntry {
  _id: string;
  content: string;
  mood: string;
  isCapsule: boolean;
  lockType: string;
  isUnlocked: boolean;
  unlockDate?: string;
  riddleQuestion?: string;
  date: string;
}

interface JournalEntryModalProps {
  entry: JournalEntry | null;
  date: Date;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const JournalEntryModal = ({ entry, date, isOpen, onClose, onSave }: JournalEntryModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    content: '',
    mood: 'neutral',
    isCapsule: false,
    lockType: 'none',
    unlockDate: '',
    riddleQuestion: '',
    riddleAnswer: '',
    tags: [] as string[],
    isPublic: false
  });
  const [riddleAnswer, setRiddleAnswer] = useState('');
  const [showRiddleForm, setShowRiddleForm] = useState(false);
  const [showUnlockConfetti, setShowUnlockConfetti] = useState(false);

  useEffect(() => {
    if (entry) {
      setFormData({
        content: entry.content,
        mood: entry.mood,
        isCapsule: entry.isCapsule,
        lockType: entry.lockType,
        unlockDate: entry.unlockDate ? new Date(entry.unlockDate).toISOString().split('T')[0] : '',
        riddleQuestion: entry.riddleQuestion || '',
        riddleAnswer: '',
        tags: [],
        isPublic: false
      });
      setIsEditing(false);
    } else {
      setFormData({
        content: '',
        mood: 'neutral',
        isCapsule: false,
        lockType: 'none',
        unlockDate: '',
        riddleQuestion: '',
        riddleAnswer: '',
        tags: [],
        isPublic: false
      });
      setIsEditing(true);
    }
  }, [entry, date]);

  const handleSave = async () => {
    if (!formData.content.trim()) {
      toast({
        title: "Content Required",
        description: "Please enter some content for your journal entry.",
        variant: "destructive"
      });
      return;
    }

    if (formData.isCapsule && formData.lockType === 'riddle' && (!formData.riddleQuestion || !formData.riddleAnswer)) {
      toast({
        title: "Riddle Required",
        description: "Please provide both riddle question and answer.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      if (entry) {
        // Update existing entry
        const response = await apiClient.updateJournalEntry(entry._id, {
          content: formData.content,
          mood: formData.mood,
          tags: formData.tags,
          isPublic: formData.isPublic
        });

        if (response.success) {
          toast({
            title: "Entry Updated",
            description: "Your journal entry has been updated successfully.",
          });
          onSave();
        }
      } else {
        // Create new entry
        const response = await apiClient.createJournalEntry({
          content: formData.content,
          mood: formData.mood,
          date: date.toISOString().split('T')[0],
          isCapsule: formData.isCapsule,
          lockType: formData.lockType,
          unlockDate: formData.lockType === 'time' ? formData.unlockDate : undefined,
          riddleQuestion: formData.lockType === 'riddle' ? formData.riddleQuestion : undefined,
          riddleAnswer: formData.lockType === 'riddle' ? formData.riddleAnswer : undefined,
          tags: formData.tags,
          isPublic: formData.isPublic
        });

        if (response.success) {
          toast({
            title: "Entry Created",
            description: "Your journal entry has been created successfully.",
          });
          onSave();
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save journal entry. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
    if (!entry || !entry.isCapsule) return;

    setLoading(true);
    try {
      const response = await apiClient.unlockJournalEntry(entry._id, riddleAnswer);
      
      if (response.success) {
        setShowUnlockConfetti(true);
        toast({
          title: "🎉 Capsule Unlocked!",
          description: "Your time capsule has been unlocked successfully!",
        });
        onSave();
      } else {
        toast({
          title: "Unlock Failed",
          description: response.message || "Failed to unlock capsule.",
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
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!entry) return;

    setLoading(true);
    try {
      const response = await apiClient.deleteJournalEntry(entry._id);
      
      if (response.success) {
        toast({
          title: "Entry Deleted",
          description: "Your journal entry has been deleted successfully.",
        });
        onSave();
      }
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete journal entry. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const canUnlock = entry?.isCapsule && !entry.isUnlocked && 
    (entry.lockType === 'riddle' || (entry.lockType === 'time' && entry.unlockDate && new Date(entry.unlockDate) <= new Date()));

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-card border-white/10 bg-background/90 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {entry ? 'Journal Entry' : 'New Journal Entry'}
              <Badge variant="outline" className="text-xs">
                {date.toLocaleDateString()}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {entry && !isEditing && !canUnlock ? (
            // View mode
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                  <span className="text-white font-medium capitalize">{entry.mood}</span>
                  {entry.isCapsule && (
                    <Badge className="bg-purple-500/20 text-purple-400">
                      {entry.isUnlocked ? 'Unlocked Capsule' : 'Locked Capsule'}
                    </Badge>
                  )}
                </div>
                <p className="text-white/90 whitespace-pre-wrap">{entry.content}</p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setIsEditing(true)}
                  className="btn-glow"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Edit Entry
                </Button>
                <Button
                  onClick={handleDelete}
                  variant="destructive"
                  className="bg-red-500/20 text-red-400 border-red-500/50"
                >
                  Delete Entry
                </Button>
              </div>
            </div>
          ) : canUnlock ? (
            // Unlock mode
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-5 h-5 text-purple-400" />
                  <span className="text-white font-medium">Locked Time Capsule</span>
                </div>
                <p className="text-white/90 mb-4">{entry.content}</p>
                
                {entry.lockType === 'riddle' && entry.riddleQuestion && (
                  <div className="space-y-3">
                    <div className="p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30">
                      <p className="text-white font-medium mb-2">Riddle:</p>
                      <p className="text-white/90">{entry.riddleQuestion}</p>
                    </div>
                    <div>
                      <Label htmlFor="riddle-answer" className="text-white">Your Answer</Label>
                      <Input
                        id="riddle-answer"
                        value={riddleAnswer}
                        onChange={(e) => setRiddleAnswer(e.target.value)}
                        placeholder="Enter your answer here..."
                        className="glass-card border-white/10 bg-background/50 text-white placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={handleUnlock}
                disabled={loading || (entry.lockType === 'riddle' && !riddleAnswer.trim())}
                className="w-full btn-glow"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Unlocking...
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4 mr-2" />
                    Unlock Capsule
                  </>
                )}
              </Button>
            </div>
          ) : (
            // Edit/Create mode
            <div className="space-y-4">
              <MoodPicker
                selectedMood={formData.mood}
                onMoodChange={(mood) => setFormData(prev => ({ ...prev, mood }))}
              />

              <div>
                <Label htmlFor="content" className="text-white">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write about your day..."
                  className="glass-card border-white/10 bg-background/50 text-white placeholder:text-gray-400"
                  rows={6}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is-capsule"
                  checked={formData.isCapsule}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isCapsule: checked }))}
                />
                <Label htmlFor="is-capsule" className="text-white">Make this a time capsule</Label>
              </div>

              {formData.isCapsule && (
                <div className="space-y-4 p-4 glass-card border-white/10 bg-background/50 rounded-lg">
                  <div>
                    <Label htmlFor="lock-type" className="text-white">Lock Type</Label>
                    <Select
                      value={formData.lockType}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, lockType: value }))}
                    >
                      <SelectTrigger id="lock-type" className="glass-card border-white/10 bg-background/50 text-white">
                        <SelectValue placeholder="Select lock type" />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-white/10 bg-background/90 text-white">
                        <SelectItem value="none">No Lock</SelectItem>
                        <SelectItem value="time">Time Lock</SelectItem>
                        <SelectItem value="riddle">Riddle Lock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.lockType === 'time' && (
                    <div>
                      <Label htmlFor="unlock-date" className="text-white">Unlock Date</Label>
                      <Input
                        id="unlock-date"
                        type="date"
                        value={formData.unlockDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, unlockDate: e.target.value }))}
                        className="glass-card border-white/10 bg-background/50 text-white"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  )}

                  {formData.lockType === 'riddle' && (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="riddle-question" className="text-white">Riddle Question</Label>
                        <Textarea
                          id="riddle-question"
                          value={formData.riddleQuestion}
                          onChange={(e) => setFormData(prev => ({ ...prev, riddleQuestion: e.target.value }))}
                          placeholder="What's the riddle that needs to be answered?"
                          className="glass-card border-white/10 bg-background/50 text-white placeholder:text-gray-400"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="riddle-answer" className="text-white">Correct Answer</Label>
                        <Input
                          id="riddle-answer"
                          type="password"
                          value={formData.riddleAnswer}
                          onChange={(e) => setFormData(prev => ({ ...prev, riddleAnswer: e.target.value }))}
                          placeholder="The answer to unlock the capsule"
                          className="glass-card border-white/10 bg-background/50 text-white placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleSave}
                  disabled={loading || !formData.content.trim()}
                  className="flex-1 btn-glow"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {entry ? 'Update Entry' : 'Create Entry'}
                    </>
                  )}
                </Button>
                {entry && (
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    className="glass-card border-white/10"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unlock Confetti Animation */}
      <ConfettiAnimation 
        isActive={showUnlockConfetti} 
        onComplete={() => setShowUnlockConfetti(false)} 
      />
    </div>
  );
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

export default JournalEntryModal;
