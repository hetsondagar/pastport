import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { X, Calendar, Lock, Save, Trash2, Clock, HelpCircle, Image as ImageIcon } from 'lucide-react';
import apiClient from '@/lib/api';
import MediaUploader from '@/components/MediaUploader';
import MediaDisplay from '@/components/MediaDisplay';

interface JournalEntry {
  _id: string;
  content: string;
  mood: string;
  isCapsule: boolean;
  lockType: string;
  isUnlocked: boolean;
  unlockDate?: string;
  riddleQuestion?: string;
  riddleAnswer?: string;
  date: string;
}

interface CreateEditJournalModalProps {
  entry: JournalEntry | null;
  date: Date;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const CreateEditJournalModal = ({ entry, date, isOpen, onClose, onSave }: CreateEditJournalModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [savedEntryId, setSavedEntryId] = useState<string | null>(null);
  const [attachedMedia, setAttachedMedia] = useState<any[]>([]);
  const [existingMedia, setExistingMedia] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    content: '',
    mood: 'neutral',
    isCapsule: false,
    lockType: 'none',
    unlockDate: '',
    riddleQuestion: '',
    riddleAnswer: ''
  });

  useEffect(() => {
    if (entry) {
      setFormData({
        content: entry.content || '',
        mood: entry.mood || 'neutral',
        isCapsule: entry.isCapsule || false,
        lockType: entry.lockType || 'none',
        unlockDate: entry.unlockDate ? new Date(entry.unlockDate).toISOString().split('T')[0] : '',
        riddleQuestion: entry.riddleQuestion || '',
        riddleAnswer: entry.riddleAnswer || ''
      });
      setSavedEntryId(entry._id);
      // Load existing media for this entry
      loadEntryMedia(entry._id);
    } else {
      setFormData({
        content: '',
        mood: 'neutral',
        isCapsule: false,
        lockType: 'none',
        unlockDate: '',
        riddleQuestion: '',
        riddleAnswer: ''
      });
      setSavedEntryId(null);
      setExistingMedia([]);
      setAttachedMedia([]);
    }
  }, [entry, isOpen]);

  const loadEntryMedia = async (entryId: string) => {
    try {
      const response = await apiClient.getEntryMedia('journal', entryId);
      if (response.success && response.data) {
        setExistingMedia(response.data);
      }
    } catch (error) {
      console.error('Failed to load media:', error);
    }
  };

  const handleMediaUploaded = (media: any) => {
    setAttachedMedia(prev => [...prev, media]);
  };

  const handleDeleteMedia = async (mediaId: string) => {
    try {
      await apiClient.deleteMedia(mediaId);
      setExistingMedia(prev => prev.filter(m => m._id !== mediaId));
      toast({
        title: "Success",
        description: "Media deleted successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete media.",
        variant: "destructive"
      });
    }
  };

  const moods = [
    { value: 'happy', label: '😊 Happy', color: 'bg-green-500' },
    { value: 'sad', label: '😢 Sad', color: 'bg-blue-500' },
    { value: 'excited', label: '🎉 Excited', color: 'bg-yellow-500' },
    { value: 'angry', label: '😡 Angry', color: 'bg-red-500' },
    { value: 'calm', label: '🌙 Calm', color: 'bg-purple-500' },
    { value: 'anxious', label: '😰 Anxious', color: 'bg-orange-500' },
    { value: 'grateful', label: '🙏 Grateful', color: 'bg-pink-500' },
    { value: 'neutral', label: '😐 Neutral', color: 'bg-gray-500' }
  ];

  const handleSave = async () => {
    if (!formData.content.trim()) {
      toast({
        title: "Error",
        description: "Please write something in your journal entry.",
        variant: "destructive"
      });
      return;
    }

    if (formData.isCapsule) {
      if (formData.lockType === 'none') {
        toast({
          title: "Error",
          description: "Please select a lock type for your time capsule.",
          variant: "destructive"
        });
        return;
      }

      if (formData.lockType === 'time' && !formData.unlockDate) {
        toast({
          title: "Error",
          description: "Please select an unlock date.",
          variant: "destructive"
        });
        return;
      }

      if (formData.lockType === 'riddle' && (!formData.riddleQuestion || !formData.riddleAnswer)) {
        toast({
          title: "Error",
          description: "Please provide both riddle question and answer.",
          variant: "destructive"
        });
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        userId: user._id,
        content: formData.content,
        mood: formData.mood,
        date: date.toISOString(),
        isCapsule: formData.isCapsule,
        ...(formData.isCapsule && {
          lockType: formData.lockType,
          ...(formData.lockType === 'time' && { unlockDate: new Date(formData.unlockDate).toISOString() }),
          ...(formData.lockType === 'riddle' && {
            riddleQuestion: formData.riddleQuestion,
            riddleAnswer: formData.riddleAnswer
          })
        })
      };

      if (entry) {
        await apiClient.updateJournalEntry(entry._id, payload);
        toast({
          title: "Success! ✨",
          description: attachedMedia.length > 0 
            ? `Journal entry updated with ${attachedMedia.length} media attachment(s)!`
            : "Journal entry updated successfully!",
        });
        // Close modal and refresh for edits
        onSave();
        onClose();
      } else {
        const response = await apiClient.createJournalEntry(payload);
        // Save the entry ID for media uploads
        if (response.success && response.data) {
          setSavedEntryId(response.data._id);
          toast({
            title: "Success! 🌟",
            description: "Entry created! You can now add media attachments below, or close to see it in your constellation.",
            duration: 5000,
          });
          // Don't close modal - let user add media
          onSave(); // Refresh the calendar
        } else {
          throw new Error('Failed to create entry');
        }
      }
    } catch (error: any) {
      console.error('Failed to save journal entry:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save journal entry.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!entry) return;

    if (!confirm('Are you sure you want to delete this journal entry?')) {
      return;
    }

    setLoading(true);
    try {
      await apiClient.deleteJournalEntry(entry._id);
      toast({
        title: "Success",
        description: "Journal entry deleted successfully!",
      });
      onSave();
      onClose();
    } catch (error: any) {
      console.error('Failed to delete journal entry:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete journal entry.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <Card className="glass-card-enhanced border-white/20">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl text-white mb-2">
                    {entry ? 'Edit Journal Entry' : 'Create Journal Entry'}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {formatDate(date)}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onClose}
                  className="text-muted-foreground hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Content */}
              <div>
                <Label htmlFor="content" className="text-white mb-2">What's on your mind?</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your thoughts, feelings, or experiences..."
                  className="min-h-[150px] bg-background/20 border-white/10 text-white resize-none"
                  disabled={loading}
                />
              </div>

              {/* Mood Selection */}
              <div>
                <Label className="text-white mb-2">How are you feeling?</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {moods.map((mood) => (
                    <Button
                      key={mood.value}
                      type="button"
                      variant={formData.mood === mood.value ? "default" : "outline"}
                      className={`${
                        formData.mood === mood.value
                          ? `${mood.color} hover:opacity-90`
                          : 'glass-card border-white/10'
                      }`}
                      onClick={() => setFormData({ ...formData, mood: mood.value })}
                      disabled={loading}
                    >
                      {mood.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Existing Media Display */}
              {existingMedia.length > 0 && (
                <div>
                  <Label className="text-white mb-2">Attached Media</Label>
                  <div className="glass-card p-4 rounded-lg">
                    <MediaDisplay 
                      media={existingMedia} 
                      onDelete={handleDeleteMedia}
                      showDelete={!loading}
                    />
                  </div>
                </div>
              )}

              {/* Media Uploader */}
              {(savedEntryId || entry) && (
                <div>
                  <MediaUploader
                    entryId={savedEntryId || entry?._id}
                    entryType="journal"
                    onMediaUploaded={handleMediaUploaded}
                    maxFiles={5}
                  />
                  {attachedMedia.length > 0 && (
                    <p className="text-xs text-green-400 mt-2">
                      ✓ {attachedMedia.length} media file(s) attached successfully
                    </p>
                  )}
                </div>
              )}

              {!savedEntryId && !entry && (
                <div className="glass-card p-4 rounded-lg border-2 border-dashed border-white/20">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <ImageIcon className="w-5 h-5" />
                    <div>
                      <p className="text-sm font-medium text-white">Media Attachments</p>
                      <p className="text-xs">Save your entry first to attach images, videos, or audio</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Time Capsule Option */}
              <div className="glass-card p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-primary" />
                    <Label className="text-white cursor-pointer">Make this a Time Capsule</Label>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isCapsule}
                    onChange={(e) => setFormData({ ...formData, isCapsule: e.target.checked, lockType: e.target.checked ? 'time' : 'none' })}
                    className="w-5 h-5 rounded border-white/20 bg-background/20"
                    disabled={loading}
                  />
                </div>

                {formData.isCapsule && (
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    {/* Lock Type */}
                    <div>
                      <Label className="text-white mb-2">Lock Type</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <Button
                          type="button"
                          variant={formData.lockType === 'time' ? "default" : "outline"}
                          onClick={() => setFormData({ ...formData, lockType: 'time' })}
                          disabled={loading}
                          className="glass-card border-white/10"
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          Time Lock
                        </Button>
                        <Button
                          type="button"
                          variant={formData.lockType === 'riddle' ? "default" : "outline"}
                          onClick={() => setFormData({ ...formData, lockType: 'riddle' })}
                          disabled={loading}
                          className="glass-card border-white/10"
                        >
                          <HelpCircle className="w-4 h-4 mr-2" />
                          Riddle Lock
                        </Button>
                      </div>
                    </div>

                    {/* Time Lock Options */}
                    {formData.lockType === 'time' && (
                      <div>
                        <Label htmlFor="unlockDate" className="text-white mb-2">Unlock Date</Label>
                        <Input
                          id="unlockDate"
                          type="date"
                          value={formData.unlockDate}
                          onChange={(e) => setFormData({ ...formData, unlockDate: e.target.value })}
                          min={new Date().toISOString().split('T')[0]}
                          className="bg-background/20 border-white/10 text-white"
                          disabled={loading}
                        />
                      </div>
                    )}

                    {/* Riddle Lock Options */}
                    {formData.lockType === 'riddle' && (
                      <>
                        <div>
                          <Label htmlFor="riddleQuestion" className="text-white mb-2">Riddle Question</Label>
                          <Input
                            id="riddleQuestion"
                            value={formData.riddleQuestion}
                            onChange={(e) => setFormData({ ...formData, riddleQuestion: e.target.value })}
                            placeholder="e.g., What was my favorite food this day?"
                            className="bg-background/20 border-white/10 text-white"
                            disabled={loading}
                          />
                        </div>
                        <div>
                          <Label htmlFor="riddleAnswer" className="text-white mb-2">Answer</Label>
                          <Input
                            id="riddleAnswer"
                            value={formData.riddleAnswer}
                            onChange={(e) => setFormData({ ...formData, riddleAnswer: e.target.value })}
                            placeholder="The answer to unlock this capsule"
                            className="bg-background/20 border-white/10 text-white"
                            disabled={loading}
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div>
                  {entry && (
                    <Button
                      variant="outline"
                      onClick={handleDelete}
                      disabled={loading}
                      className="border-red-500/20 hover:bg-red-500/10 text-red-400"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={loading}
                    className="glass-card border-white/10"
                  >
                    {savedEntryId && !entry ? 'Done' : 'Cancel'}
                  </Button>
                  {!savedEntryId && !entry && (
                    <Button
                      onClick={handleSave}
                      disabled={loading}
                      className="btn-glow"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? 'Saving...' : 'Save Entry'}
                    </Button>
                  )}
                  {(savedEntryId || entry) && (
                    <Button
                      onClick={handleSave}
                      disabled={loading}
                      className="btn-glow"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? 'Updating...' : 'Update Entry'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateEditJournalModal;

