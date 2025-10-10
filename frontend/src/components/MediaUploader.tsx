import { useState, useRef } from 'react';
import { Upload, X, Image, Video, Music, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

interface MediaFile {
  file: File;
  preview: string;
  type: 'image' | 'video' | 'audio';
  caption: string;
  uploading: boolean;
  uploaded: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

interface MediaUploaderProps {
  entryId?: string;
  entryType?: 'capsule' | 'journal' | 'memory';
  onMediaUploaded?: (media: any) => void;
  maxFiles?: number;
}

const MediaUploader = ({ entryId, entryType, onMediaUploaded, maxFiles = 5 }: MediaUploaderProps) => {
  const { toast } = useToast();
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getMediaType = (file: File): 'image' | 'video' | 'audio' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'image';
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (mediaFiles.length + files.length > maxFiles) {
      toast({
        title: "Too Many Files",
        description: `You can only upload up to ${maxFiles} files.`,
        variant: "destructive"
      });
      return;
    }

    files.forEach(file => {
      // Validate file size (20MB)
      if (file.size > 20 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: `${file.name} exceeds 20MB limit.`,
          variant: "destructive"
        });
        return;
      }

      // Validate file type
      const allowedTypes = ['image/', 'video/', 'audio/'];
      if (!allowedTypes.some(type => file.type.startsWith(type))) {
        toast({
          title: "Invalid File Type",
          description: `${file.name} is not a supported media type.`,
          variant: "destructive"
        });
        return;
      }

      const mediaType = getMediaType(file);
      const preview = URL.createObjectURL(file);

      setMediaFiles(prev => [...prev, {
        file,
        preview,
        type: mediaType,
        caption: '',
        uploading: false,
        uploaded: false
      }]);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async (index: number) => {
    const mediaFile = mediaFiles[index];
    
    setMediaFiles(prev => prev.map((m, i) => 
      i === index ? { ...m, uploading: true, error: undefined } : m
    ));

    try {
      const formData = new FormData();
      formData.append('file', mediaFile.file);
      if (entryId) formData.append('entryId', entryId);
      if (entryType) formData.append('entryType', entryType);
      if (mediaFile.caption) formData.append('caption', mediaFile.caption);

      const response = await apiClient.uploadMedia(formData);

      if (response.success) {
        setMediaFiles(prev => prev.map((m, i) => 
          i === index ? { 
            ...m, 
            uploading: false, 
            uploaded: true,
            url: response.data.cloudinaryUrl,
            publicId: response.data.media.publicId
          } : m
        ));

        toast({
          title: "✅ Upload Successful",
          description: `${mediaFile.file.name} uploaded successfully!`
        });

        if (onMediaUploaded) {
          onMediaUploaded(response.data.media);
        }
      }
    } catch (error: any) {
      setMediaFiles(prev => prev.map((m, i) => 
        i === index ? { 
          ...m, 
          uploading: false, 
          error: error.message || 'Upload failed'
        } : m
      ));

      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload file. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRemove = (index: number) => {
    setMediaFiles(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleCaptionChange = (index: number, caption: string) => {
    setMediaFiles(prev => prev.map((m, i) => 
      i === index ? { ...m, caption } : m
    ));
  };

  const uploadAll = async () => {
    for (let i = 0; i < mediaFiles.length; i++) {
      if (!mediaFiles[i].uploaded && !mediaFiles[i].uploading) {
        await handleUpload(i);
      }
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'audio': return <Music className="w-5 h-5" />;
      default: return <Upload className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div>
        <Label className="text-white font-medium mb-2 block">Media Attachments</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={mediaFiles.length >= maxFiles}
            className="glass-card border-white/10"
          >
            <Upload className="w-4 h-4 mr-2" />
            Select Files
          </Button>
          {mediaFiles.length > 0 && mediaFiles.some(m => !m.uploaded) && (
            <Button
              type="button"
              onClick={uploadAll}
              className="btn-glow"
              disabled={mediaFiles.some(m => m.uploading)}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload All ({mediaFiles.filter(m => !m.uploaded).length})
            </Button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,audio/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <p className="text-xs text-gray-400 mt-1">
          Supports images, videos, and audio (max 20MB each, up to {maxFiles} files)
        </p>
      </div>

      {/* Media Previews */}
      <AnimatePresence>
        {mediaFiles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mediaFiles.map((media, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="glass-card border-white/10 overflow-hidden">
                  <CardContent className="p-3">
                    <div className="relative">
                      {/* Remove Button */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(index)}
                        className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70"
                        disabled={media.uploading}
                      >
                        <X className="w-4 h-4" />
                      </Button>

                      {/* Preview */}
                      <div className="relative rounded-lg overflow-hidden bg-black/20 mb-3">
                        {media.type === 'image' && (
                          <img 
                            src={media.preview} 
                            alt="Preview" 
                            className="w-full h-48 object-cover"
                          />
                        )}
                        {media.type === 'video' && (
                          <video 
                            src={media.preview} 
                            className="w-full h-48 object-cover"
                            controls
                          />
                        )}
                        {media.type === 'audio' && (
                          <div className="flex items-center justify-center h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                            <Music className="w-12 h-12 text-purple-400" />
                          </div>
                        )}

                        {/* Status Overlay */}
                        {media.uploading && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          </div>
                        )}
                        {media.uploaded && (
                          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Uploaded
                          </div>
                        )}
                      </div>

                      {/* File Info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          {getIcon(media.type)}
                          <span className="truncate flex-1">{media.file.name}</span>
                          <span className="text-xs text-gray-500">
                            {(media.file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>

                        {/* Caption Input */}
                        <Input
                          type="text"
                          placeholder="Add caption (optional)"
                          value={media.caption}
                          onChange={(e) => handleCaptionChange(index, e.target.value)}
                          disabled={media.uploading || media.uploaded}
                          className="glass-card border-white/10 text-sm"
                        />

                        {/* Error Message */}
                        {media.error && (
                          <p className="text-xs text-red-400">{media.error}</p>
                        )}

                        {/* Upload Button */}
                        {!media.uploaded && !media.uploading && (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleUpload(index)}
                            className="w-full btn-glow"
                          >
                            <Upload className="w-3 h-3 mr-1" />
                            Upload
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MediaUploader;

