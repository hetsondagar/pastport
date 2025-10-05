import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/api';
import { X, Calendar, Tag, Star, Edit, Trash2, Save, XCircle } from 'lucide-react';

interface Memory {
  id: string;
  title: string;
  content: string;
  category: 'Travel' | 'Learning' | 'Growth' | 'Fun';
  importance: number;
  date: string;
  relatedIds: string[];
  position: { x: number; y: number; z: number };
  tags: string[];
  media: string[];
  relatedMemories?: Memory[];
}

interface MemoryModalProps {
  memory: Memory;
  onClose: () => void;
  onUpdate: () => void;
}

const MemoryModal = ({ memory, onClose, onUpdate }: MemoryModalProps) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: memory.title,
    content: memory.content,
    category: memory.category,
    importance: memory.importance,
    tags: memory.tags.join(', '),
    isPublic: false
  });

  const categoryColors = {
    Travel: 'bg-blue-500',
    Learning: 'bg-green-500',
    Growth: 'bg-yellow-500',
    Fun: 'bg-purple-500'
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const response = await apiClient.updateMemory(memory.id, {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        importance: formData.importance,
        tags
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Memory updated successfully"
        });
        setIsEditing(false);
        onUpdate();
      } else {
        toast({
          title: "Error",
          description: "Failed to update memory",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update memory",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this memory? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.deleteMemory(memory.id);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Memory deleted successfully"
        });
        onUpdate();
        onClose();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete memory",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete memory",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="glass-card border-white/10 bg-background/95 backdrop-blur-xl shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${categoryColors[memory.category]}`} />
                <CardTitle className="text-white">
                  {isEditing ? 'Edit Memory' : memory.title}
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={loading}
                      className="btn-glow"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      className="glass-card border-white/10"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      className="glass-card border-white/10"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDelete}
                      disabled={loading}
                      className="glass-card border-white/10 hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onClose}
                  className="glass-card border-white/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Title */}
              {isEditing ? (
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="glass-card border-white/10 bg-background/50 text-white"
                    placeholder="Enter memory title..."
                  />
                </div>
              ) : (
                <h2 className="text-2xl font-bold text-white">{memory.title}</h2>
              )}

              {/* Content */}
              {isEditing ? (
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Content</label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="glass-card border-white/10 bg-background/50 text-white min-h-[120px]"
                    placeholder="Enter memory content..."
                  />
                </div>
              ) : (
                <p className="text-white/90 leading-relaxed">{memory.content}</p>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Category</label>
                  {isEditing ? (
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value as any })}
                    >
                      <SelectTrigger className="glass-card border-white/10 bg-background/50 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Travel">Travel</SelectItem>
                        <SelectItem value="Learning">Learning</SelectItem>
                        <SelectItem value="Growth">Growth</SelectItem>
                        <SelectItem value="Fun">Fun</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge className={`${categoryColors[memory.category]} text-white border-0`}>
                      {memory.category}
                    </Badge>
                  )}
                </div>

                {/* Importance */}
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Importance</label>
                  {isEditing ? (
                    <Select
                      value={formData.importance.toString()}
                      onValueChange={(value) => setFormData({ ...formData, importance: parseInt(value) })}
                    >
                      <SelectTrigger className="glass-card border-white/10 bg-background/50 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 10 ? '(Highest)' : num === 1 ? '(Lowest)' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-white">{memory.importance}/10</span>
                    </div>
                  )}
                </div>

                {/* Date */}
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Date</label>
                  <div className="flex items-center gap-2 text-white/80">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(memory.date)}</span>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Tags</label>
                  {isEditing ? (
                    <Input
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="glass-card border-white/10 bg-background/50 text-white"
                      placeholder="Enter tags separated by commas..."
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {memory.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="border-white/20 text-white/80">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Media */}
              {memory.media.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Media</label>
                  <div className="grid grid-cols-2 gap-2">
                    {memory.media.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`Memory media ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Memories */}
              {memory.relatedMemories && memory.relatedMemories.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Related Memories</label>
                  <div className="space-y-2">
                    {memory.relatedMemories.map((related) => (
                      <div key={related.id} className="p-3 glass-card border-white/10 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${categoryColors[related.category]}`} />
                          <span className="text-white font-medium">{related.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MemoryModal;
