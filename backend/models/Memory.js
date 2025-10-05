import mongoose from 'mongoose';

const memorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Please add content'],
    trim: true,
    maxlength: [2000, 'Content cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: {
      values: ['Travel', 'Learning', 'Growth', 'Fun'],
      message: 'Category must be Travel, Learning, Growth, or Fun'
    }
  },
  importance: {
    type: Number,
    required: [true, 'Please set importance level'],
    min: [1, 'Importance must be at least 1'],
    max: [10, 'Importance cannot exceed 10'],
    default: 5
  },
  date: {
    type: Date,
    required: [true, 'Please add a date'],
    default: Date.now
  },
  relatedIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Memory'
  }],
  media: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|mp4|webm)$/i.test(v);
      },
      message: 'Media must be a valid image or video URL'
    }
  }],
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    z: { type: Number, default: 0 }
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tag cannot exceed 20 characters']
  }],
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
memorySchema.index({ userId: 1, date: -1 });
memorySchema.index({ userId: 1, category: 1 });
memorySchema.index({ userId: 1, importance: -1 });

// Virtual for constellation connections
memorySchema.virtual('constellationData').get(function() {
  return {
    id: this._id,
    title: this.title,
    category: this.category,
    importance: this.importance,
    date: this.date,
    relatedIds: this.relatedIds,
    position: this.position,
    tags: this.tags
  };
});

// Method to get related memories for constellation
memorySchema.methods.getRelatedMemories = async function() {
  return await this.constructor.find({
    _id: { $in: this.relatedIds },
    userId: this.userId
  }).select('title category importance date position');
};

// Method to calculate 3D position based on category and importance
memorySchema.methods.calculatePosition = function() {
  const categoryPositions = {
    Travel: { x: 0, y: 0, z: 0 },
    Learning: { x: 2, y: 0, z: 0 },
    Growth: { x: 0, y: 2, z: 0 },
    Fun: { x: 0, y: 0, z: 2 }
  };
  
  const basePos = categoryPositions[this.category] || { x: 0, y: 0, z: 0 };
  const importance = this.importance || 5;
  
  // Add some randomness based on importance
  const randomOffset = (Math.random() - 0.5) * 2;
  
  return {
    x: basePos.x + randomOffset + (importance - 5) * 0.2,
    y: basePos.y + randomOffset + (importance - 5) * 0.2,
    z: basePos.z + randomOffset + (importance - 5) * 0.2
  };
};

export default mongoose.model('Memory', memorySchema);
