import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Reference to parent entry (can be capsule, journal entry, or memory)
  entryId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    index: true
  },
  entryType: {
    type: String,
    enum: ['capsule', 'journal', 'memory', 'profile'],
    required: true
  },
  // Cloudinary data
  url: {
    type: String,
    required: true
  },
  publicId: {
    type: String,
    required: true,
    index: true
  },
  // Media information
  type: {
    type: String,
    enum: ['image', 'video', 'audio'],
    required: true
  },
  format: {
    type: String,
    required: true
  },
  resourceType: {
    type: String,
    required: true
  },
  // Metadata
  width: {
    type: Number,
    default: null
  },
  height: {
    type: Number,
    default: null
  },
  size: {
    type: Number, // Bytes
    required: true
  },
  duration: {
    type: Number, // For video/audio in seconds
    default: null
  },
  caption: {
    type: String,
    maxlength: [500, 'Caption cannot exceed 500 characters'],
    default: ''
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient queries
mediaSchema.index({ userId: 1, entryType: 1 });
mediaSchema.index({ entryId: 1, entryType: 1 });
mediaSchema.index({ createdAt: -1 });

// Update updatedAt on save
mediaSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for formatted size
mediaSchema.virtual('formattedSize').get(function() {
  const kb = this.size / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
});

// Static method to get media for an entry
mediaSchema.statics.getEntryMedia = async function(entryId, entryType) {
  return this.find({ entryId, entryType }).sort({ createdAt: 1 });
};

// Static method to delete media and remove from Cloudinary
mediaSchema.statics.deleteMedia = async function(mediaId, cloudinaryHelper) {
  const media = await this.findById(mediaId);
  if (!media) {
    throw new Error('Media not found');
  }
  
  // Delete from Cloudinary
  if (cloudinaryHelper) {
    await cloudinaryHelper.deleteFromCloudinary(media.publicId, media.resourceType);
  }
  
  // Delete from database
  await this.findByIdAndDelete(mediaId);
  
  return { success: true, message: 'Media deleted successfully' };
};

export default mongoose.model('Media', mediaSchema);

