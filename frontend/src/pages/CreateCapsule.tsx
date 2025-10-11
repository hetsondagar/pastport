import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Upload, Sparkles, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/api';
import Navigation from '@/components/Navigation';
import MoodPicker from '@/components/MoodPicker';
import LockTypeSelector from '@/components/LockTypeSelector';
import MediaUploader from '@/components/MediaUploader';

const CreateCapsule = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    emoji: '📝',
    mood: 'neutral',
    unlockDate: '',
    lockType: 'time',
    riddleQuestion: '',
    riddleAnswer: '',
    tags: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const [createMode, setCreateMode] = useState<'capsule' | 'journal'>('capsule');
  const [createdCapsuleId, setCreatedCapsuleId] = useState<string | null>(null);
  const [uploadedMedia, setUploadedMedia] = useState<any[]>([]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const emojiOptions = ['📝', '🎓', '🎂', '✈️', '❤️', '🎯', '🌟', '📸', '🎵', '🎮', '🏆', '🌈'];
  const tagOptions = ['Personal', 'Friends', 'Family', 'School', 'Travel', 'Goals', 'Memories'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.message || !formData.unlockDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (formData.lockType === 'riddle' && (!formData.riddleQuestion || !formData.riddleAnswer)) {
      toast({
        title: "Incomplete Riddle",
        description: "Please provide both riddle question and answer.",
        variant: "destructive"
      });
      return;
    }

    // Normalize unlock date to ISO string (start of selected day)
    const unlockISO = new Date(formData.unlockDate).toISOString();
    if (isNaN(new Date(unlockISO).getTime())) {
      toast({
        title: "Invalid date",
        description: "Please choose a valid unlock date.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        title: formData.title,
        message: formData.message,
        emoji: formData.emoji,
        mood: formData.mood,
        unlockDate: unlockISO,
        lockType: formData.lockType,
        tags: formData.tags,
        category: 'personal',
        isPublic: false
      };

      if (formData.lockType === 'riddle') {
        payload.riddleQuestion = formData.riddleQuestion;
        payload.riddleAnswer = formData.riddleAnswer;
      }

      const response = await apiClient.createCapsule(payload);

      if (response.success) {
        const capsuleId = response.data._id || response.data.id;
        setCreatedCapsuleId(capsuleId);
        
        toast({
          title: "Capsule Created! ✨",
          description: uploadedMedia.length > 0 
            ? "Capsule created with media attachments!"
            : "Your time capsule has been safely stored and will unlock on the specified date.",
        });

        // Navigate back to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to create capsule:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create capsule. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="btn-glass mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <h1 className="text-4xl app-name-bold text-gradient mb-4">
              Create Time Capsule
            </h1>
            <p className="text-muted-foreground text-lg">
              Capture this moment and send it to your future self
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info Card */}
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-primary" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Emoji Selection */}
                <div>
                  <Label htmlFor="emoji">Capsule Icon</Label>
                  <div className="grid grid-cols-6 gap-2 mt-2">
                    {emojiOptions.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, emoji }))}
                        className={`p-3 text-2xl rounded-lg transition-all hover:scale-110 ${
                          formData.emoji === emoji 
                            ? 'bg-primary/20 ring-2 ring-primary' 
                            : 'bg-muted/20 hover:bg-muted/30'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mood Selection */}
                <MoodPicker
                  selectedMood={formData.mood}
                  onMoodChange={(mood) => setFormData(prev => ({ ...prev, mood }))}
                />

                {/* Title */}
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Give your capsule a meaningful title..."
                    className="glass-card border-white/10 mt-2"
                    required
                  />
                </div>

                {/* Message */}
                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Write a message to your future self..."
                    className="glass-card border-white/10 mt-2 min-h-[120px]"
                    required
                  />
                </div>

                {/* Unlock Date */}
                <div>
                  <Label htmlFor="unlockDate">Unlock Date *</Label>
                  <div className="relative mt-2">
                    <Calendar className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="unlockDate"
                      type="date"
                      value={formData.unlockDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, unlockDate: e.target.value }))}
                      className="glass-card border-white/10 pl-10"
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>

                {/* Lock Type Selection */}
                <LockTypeSelector
                  lockType={formData.lockType}
                  onLockTypeChange={(lockType) => setFormData(prev => ({ ...prev, lockType }))}
                  riddleQuestion={formData.riddleQuestion}
                  onRiddleQuestionChange={(riddleQuestion) => setFormData(prev => ({ ...prev, riddleQuestion }))}
                  riddleAnswer={formData.riddleAnswer}
                  onRiddleAnswerChange={(riddleAnswer) => setFormData(prev => ({ ...prev, riddleAnswer }))}
                />
              </CardContent>
            </Card>

            {/* Tags */}
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tagOptions.map((tag) => (
                    <Badge
                      key={tag}
                      variant={formData.tags.includes(tag) ? "default" : "secondary"}
                      className={`cursor-pointer transition-all hover:scale-105 ${
                        formData.tags.includes(tag) 
                          ? 'bg-primary/20 text-primary border-primary' 
                          : 'bg-muted/20 hover:bg-muted/30'
                      }`}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Media Attachments */}
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Media Attachments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MediaUploader
                  entryId={createdCapsuleId || undefined}
                  entryType="capsule"
                  onMediaUploaded={(media) => setUploadedMedia(prev => [...prev, media])}
                  maxFiles={5}
                />
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="btn-glass flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="btn-glow flex-1"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create Capsule
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCapsule;