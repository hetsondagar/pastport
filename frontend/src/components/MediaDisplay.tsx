import { useState } from 'react';
import { Image, Video, Music, X, ZoomIn, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

interface MediaItem {
  url: string;
  type: 'image' | 'video' | 'audio';
  caption?: string;
  format?: string;
  size?: number;
  duration?: number;
  width?: number;
  height?: number;
}

interface MediaDisplayProps {
  media: MediaItem[];
  layout?: 'grid' | 'carousel';
  showCaptions?: boolean;
}

const MediaDisplay = ({ media, layout = 'grid', showCaptions = true }: MediaDisplayProps) => {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!media || media.length === 0) return null;

  const openLightbox = (item: MediaItem) => {
    setSelectedMedia(item);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setSelectedMedia(null);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'audio': return <Music className="w-4 h-4" />;
      default: return null;
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className={`${layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'flex gap-4 overflow-x-auto'}`}>
        {media.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card border-white/10 overflow-hidden hover:border-primary/30 transition-all duration-300">
              <CardContent className="p-0">
                {/* Media Content */}
                <div className="relative group">
                  {item.type === 'image' && (
                    <div className="relative">
                      <img
                        src={item.url}
                        alt={item.caption || 'Capsule media'}
                        className="w-full h-64 object-cover cursor-pointer"
                        onClick={() => openLightbox(item)}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/50 hover:bg-black/70"
                          onClick={() => openLightbox(item)}
                        >
                          <ZoomIn className="w-6 h-6" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {item.type === 'video' && (
                    <div className="relative bg-black">
                      <video
                        src={item.url}
                        controls
                        className="w-full h-64 object-contain"
                        poster={item.url.replace(/\.[^/.]+$/, '.jpg')}
                      />
                      {item.duration && (
                        <Badge className="absolute bottom-2 right-2 bg-black/70 text-white">
                          {formatDuration(item.duration)}
                        </Badge>
                      )}
                    </div>
                  )}

                  {item.type === 'audio' && (
                    <div className="p-6 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20">
                      <div className="flex items-center justify-center mb-4">
                        <div className="p-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                          <Music className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <audio
                        src={item.url}
                        controls
                        className="w-full"
                        style={{ filter: 'hue-rotate(270deg)' }}
                      />
                      {item.duration && (
                        <p className="text-center text-sm text-gray-400 mt-2">
                          Duration: {formatDuration(item.duration)}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Type Badge */}
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-black/70 text-white flex items-center gap-1">
                      {getIcon(item.type)}
                      <span className="capitalize">{item.type}</span>
                    </Badge>
                  </div>
                </div>

                {/* Caption */}
                {showCaptions && item.caption && (
                  <div className="p-3 bg-background/50">
                    <p className="text-sm text-white">{item.caption}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Lightbox for Images */}
      <AnimatePresence>
        {lightboxOpen && selectedMedia && selectedMedia.type === 'image' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/10"
              onClick={closeLightbox}
            >
              <X className="w-6 h-6" />
            </Button>

            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={selectedMedia.url}
              alt={selectedMedia.caption || 'Media'}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            {selectedMedia.caption && (
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm px-6 py-3 rounded-lg max-w-2xl">
                <p className="text-white text-center">{selectedMedia.caption}</p>
              </div>
            )}

            <a
              href={selectedMedia.url}
              download
              className="absolute bottom-4 right-4"
              onClick={(e) => e.stopPropagation()}
            >
              <Button variant="outline" className="glass-card border-white/20">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MediaDisplay;

