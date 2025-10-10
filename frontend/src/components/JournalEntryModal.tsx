import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { X, Calendar, Star, Edit, Trash2, Save, XCircle } from 'lucide-react';
import MediaDisplay from '@/components/MediaDisplay';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: string;
  date: string;
  position: { x: number; y: number; z: number };
  dayOfMonth: number;
  isCapsule: boolean;
}

interface JournalEntryModalProps {
  entry: JournalEntry;
  onClose: () => void;
  onUpdate: () => void;
}

const JournalEntryModal = ({ entry, onClose, onUpdate }: JournalEntryModalProps) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: entry.title,
    content: entry.content,
    mood: entry.mood
  });

  const moodColors = {
    happy: 'bg-green-500',
    sad: 'bg-blue-500',
    excited: 'bg-yellow-500',
    angry: 'bg-red-500',
    calm: 'bg-purple-500',
    anxious: 'bg-orange-500',
    grateful: 'bg-pink-500',
    neutral: 'bg-gray-500'
  };

  const moodEmojis = {
    happy: '😊',
    sad: '😢',
    excited: '🎉',
    angry: '😡',
    calm: '😌',
    anxious: '😰',
    grateful: '🙏',
    neutral: '😐'
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Here you would call your API to update the journal entry
      // await apiClient.updateJournalEntry(entry.id, formData);
      
      toast({
        title: "Success",
        description: "Journal entry updated successfully!",
      });
      
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update journal entry.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this journal entry?')) {
      return;
    }

    setLoading(true);
    try {
      // Here you would call your API to delete the journal entry
      // await apiClient.deleteJournalEntry(entry.id);
      
      toast({
        title: "Success",
        description: "Journal entry deleted successfully!",
      });
      
      onUpdate();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete journal entry.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center select-none"
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4 select-text"
        >
          <Card className="glass-card-enhanced border-white/20">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-primary" />
                  <Badge 
                    variant="secondary" 
                    className={`${moodColors[entry.mood as keyof typeof moodColors]} text-white`}
                  >
                    {moodEmojis[entry.mood as keyof typeof moodEmojis]} {entry.mood}
                  </Badge>
                  {entry.isCapsule && (
                    <Badge variant="outline" className="border-primary text-primary">
                      Time Capsule
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-2xl text-white mb-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-transparent border-b border-white/20 text-white text-2xl font-bold outline-none"
                    />
                  ) : (
                    entry.title
                  )}
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(entry.date)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    Day {entry.dayOfMonth}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={loading}
                      className="bg-primary hover:bg-primary/80"
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={loading}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      className="glass-card border-white/10 hover:bg-white/10"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDelete}
                      disabled={loading}
                      className="glass-card border-red-500/20 hover:bg-red-500/10 text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
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

            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Content</h4>
                {isEditing ? (
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full h-32 bg-background/20 border border-white/10 rounded-lg p-3 text-white resize-none outline-none focus:border-primary/50"
                    placeholder="Write your thoughts..."
                  />
                ) : (
                  <div className="glass-card p-4 rounded-lg min-h-[100px]">
                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {entry.content}
                    </p>
                  </div>
                )}
              </div>

            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default JournalEntryModal;