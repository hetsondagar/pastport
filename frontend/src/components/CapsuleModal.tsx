import { X, Calendar, Lock, Unlock, Heart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import MediaDisplay from '@/components/MediaDisplay';

interface CapsuleModalProps {
  capsule: any;
  isOpen: boolean;
  onClose: () => void;
}

const CapsuleModal = ({ capsule, isOpen, onClose }: CapsuleModalProps) => {
  if (!isOpen || !capsule) return null;

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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="glass-card-enhanced border-white/20 bg-background/95 backdrop-blur-xl shadow-2xl">
              <CardContent className="p-0">
                {/* Header */}
                <div className="relative p-6 border-b border-white/10">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="absolute top-4 right-4 hover:bg-white/10"
                  >
                    <X className="w-5 h-5" />
                  </Button>

                  <div className="flex items-start gap-4">
                    <div className="text-6xl">{capsule.emoji}</div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-white mb-2">{capsule.title}</h2>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                          {getMoodEmoji(capsule.mood)} {capsule.mood}
                        </Badge>
                        {capsule.isUnlocked ? (
                          <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                            <Unlock className="w-3 h-3 mr-1" />
                            Unlocked
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                            <Lock className="w-3 h-3 mr-1" />
                            Locked
                          </Badge>
                        )}
                        {capsule.lockType && (
                          <Badge variant="outline" className="border-white/20">
                            {capsule.lockType === 'riddle' ? '🧩 Riddle' : '⏰ Time'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Capsule Content */}
                <div className="p-6 space-y-6">
                  {/* Message */}
                  {capsule.isUnlocked ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
                        <h3 className="text-sm font-semibold text-primary mb-2">Message from the Past</h3>
                        <p className="text-white whitespace-pre-wrap leading-relaxed">
                          {capsule.message}
                        </p>
                      </div>

                      {/* Media Attachments */}
                      {capsule.media && capsule.media.length > 0 && (
                        <div className="mt-4">
                          <h3 className="text-sm font-semibold text-white mb-3">Media Attachments</h3>
                          <MediaDisplay media={capsule.media} layout="grid" showCaptions={true} />
                        </div>
                      )}

                      {/* Unlock Info */}
                      {capsule.unlockedAt && (
                        <div className="flex items-center gap-2 text-sm text-gray-400 mt-4">
                          <Unlock className="w-4 h-4" />
                          <span>Unlocked on {formatDate(capsule.unlockedAt)}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 rounded-lg bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 text-center">
                      <Lock className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-white mb-2">This Capsule is Locked</h3>
                      <p className="text-gray-300">
                        {lockType === 'riddle' 
                          ? 'Solve the riddle to unlock this capsule'
                          : `This capsule will unlock on ${formatDate(capsule.unlockDate)}`
                        }
                      </p>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Created</div>
                      <div className="text-sm text-white">{formatDate(capsule.createdAt)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Unlock Date</div>
                      <div className="text-sm text-white">{formatDate(capsule.unlockDate)}</div>
                    </div>
                  </div>

                  {/* Tags */}
                  {capsule.tags && capsule.tags.length > 0 && (
                    <div>
                      <div className="text-xs text-gray-400 mb-2">Tags</div>
                      <div className="flex flex-wrap gap-2">
                        {capsule.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="outline" className="border-white/20">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Social Info */}
                  {capsule.isUnlocked && (capsule.reactions?.length > 0 || capsule.comments?.length > 0) && (
                    <div className="flex items-center gap-4 text-sm text-gray-400 pt-4 border-t border-white/10">
                      {capsule.reactions && capsule.reactions.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          <span>{capsule.reactions.length} reactions</span>
                        </div>
                      )}
                      {capsule.comments && capsule.comments.length > 0 && (
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>{capsule.comments.length} comments</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CapsuleModal;

