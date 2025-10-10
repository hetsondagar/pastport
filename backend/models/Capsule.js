import mongoose from 'mongoose';
import { getCurrentIST, canUnlockInIST } from '../utils/timezone.js';

const capsuleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Please add a message'],
    trim: true,
    maxlength: [5000, 'Message cannot be more than 5000 characters']
  },
  emoji: {
    type: String,
    default: '📝',
    maxlength: [10, 'Emoji cannot be more than 10 characters']
  },
  mood: {
    type: String,
    enum: ['happy', 'sad', 'excited', 'angry', 'calm', 'neutral'],
    default: 'neutral'
  },
  lockType: {
    type: String,
    enum: ['time', 'riddle'],
    default: 'time'
  },
  riddleQuestion: {
    type: String,
    default: null
  },
  riddleAnswer: {
    type: String,
    default: null
  },
  failedAttempts: {
    type: Number,
    default: 0
  },
  lockoutUntil: {
    type: Date,
    default: null
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sharedWith: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['view', 'edit', 'admin'],
      default: 'view'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  unlockDate: {
    type: Date,
    required: [true, 'Please add an unlock date'],
    validate: {
      validator: function(value) {
        // Only validate if capsule is not unlocked
        // This allows riddle capsules to have past unlock dates
        if (this.isUnlocked) {
          return true;
        }
        return value > new Date();
      },
      message: 'Unlock date must be in the future'
    }
  },
  isUnlocked: {
    type: Boolean,
    default: false
  },
  unlockedAt: {
    type: Date,
    default: null
  },
  unlockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  hasRiddle: {
    type: Boolean,
    default: false
  },
  riddle: {
    question: {
      type: String,
      maxlength: [500, 'Riddle question cannot be more than 500 characters']
    },
    answer: {
      type: String,
      maxlength: [100, 'Riddle answer cannot be more than 100 characters']
    },
    hints: [{
      type: String,
      maxlength: [200, 'Hint cannot be more than 200 characters']
    }],
    attempts: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      answer: String,
      attemptedAt: {
        type: Date,
        default: Date.now
      },
      isCorrect: Boolean
    }]
  },
  media: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['image', 'video', 'document'],
      required: true
    },
    filename: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tag cannot be more than 20 characters']
  }],
  category: {
    type: String,
    enum: ['personal', 'friends', 'family', 'school', 'travel', 'goals', 'memories', 'other'],
    default: 'personal'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  views: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: {
      type: String,
      required: true,
      maxlength: [500, 'Comment cannot be more than 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: Date
  }],
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: {
    type: Date,
    default: null
  },
  metadata: {
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      },
      address: String
    },
    weather: {
      temperature: Number,
      condition: String,
      location: String
    },
    device: {
      type: String,
      userAgent: String
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
capsuleSchema.index({ creator: 1, createdAt: -1 });
capsuleSchema.index({ unlockDate: 1 });
capsuleSchema.index({ isUnlocked: 1 });
capsuleSchema.index({ tags: 1 });
capsuleSchema.index({ category: 1 });
capsuleSchema.index({ 'sharedWith.user': 1 });
capsuleSchema.index({ 'metadata.location': '2dsphere' });

// Virtual for days until unlock
capsuleSchema.virtual('daysUntilUnlock').get(function() {
  if (this.isUnlocked) return 0;
  const now = new Date();
  const diffTime = this.unlockDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for view count
capsuleSchema.virtual('viewCount').get(function() {
  return this.views.length;
});

// Virtual for reaction count
capsuleSchema.virtual('reactionCount').get(function() {
  return this.reactions.length;
});

// Virtual for comment count
capsuleSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Check if user can view capsule
capsuleSchema.methods.canView = function(userId) {
  // Creator can always view
  if (this.creator.toString() === userId.toString()) {
    return true;
  }
  
  // Check if user is in sharedWith
  const sharedUser = this.sharedWith.find(share => 
    share.user.toString() === userId.toString()
  );
  
  return !!sharedUser;
};

// Check if user can edit capsule
capsuleSchema.methods.canEdit = function(userId) {
  // Creator can always edit
  if (this.creator.toString() === userId.toString()) {
    return true;
  }
  
  // Check if user has edit permission
  const sharedUser = this.sharedWith.find(share => 
    share.user.toString() === userId.toString() && 
    ['edit', 'admin'].includes(share.permission)
  );
  
  return !!sharedUser;
};

// Add view to capsule
capsuleSchema.methods.addView = function(userId) {
  const existingView = this.views.find(view => 
    view.user.toString() === userId.toString()
  );
  
  if (!existingView) {
    this.views.push({ user: userId });
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Add reaction to capsule
capsuleSchema.methods.addReaction = function(userId, emoji) {
  // Remove existing reaction from user
  this.reactions = this.reactions.filter(reaction => 
    reaction.user.toString() !== userId.toString()
  );
  
  // Add new reaction
  this.reactions.push({ user: userId, emoji });
  return this.save();
};

// Remove reaction from capsule
capsuleSchema.methods.removeReaction = function(userId) {
  this.reactions = this.reactions.filter(reaction => 
    reaction.user.toString() !== userId.toString()
  );
  return this.save();
};

// Add comment to capsule
capsuleSchema.methods.addComment = function(userId, text) {
  this.comments.push({ user: userId, text });
  return this.save();
};

// Check riddle answer
capsuleSchema.methods.checkRiddleAnswer = function(answer, userId) {
  if (!this.hasRiddle) {
    return { correct: false, message: 'This capsule does not have a riddle' };
  }
  
  const correctAnswer = this.riddle.answer.toLowerCase().trim();
  const userAnswer = answer.toLowerCase().trim();
  
  // Log attempt
  this.riddle.attempts.push({
    user: userId,
    answer: answer,
    isCorrect: correctAnswer === userAnswer
  });
  
  this.save();
  
  if (correctAnswer === userAnswer) {
    return { correct: true, message: 'Correct answer!' };
  } else {
    return { correct: false, message: 'Incorrect answer. Try again!' };
  }
};

// Unlock capsule (using IST timezone)
capsuleSchema.methods.unlock = function(userId) {
  if (this.isUnlocked) {
    return { success: false, message: 'Capsule is already unlocked' };
  }
  
  // Check unlock time in IST
  if (!canUnlockInIST(this.unlockDate)) {
    return { success: false, message: 'Capsule is not ready to be unlocked yet (IST)' };
  }
  
  const now = getCurrentIST();
  this.isUnlocked = true;
  this.unlockedAt = now;
  this.unlockedBy = userId;
  
  return this.save().then(() => ({
    success: true,
    message: 'Capsule unlocked successfully!'
  }));
};

// Check if capsule is locked due to failed attempts
capsuleSchema.methods.isLockedDueToAttempts = function() {
  if (this.lockoutUntil && new Date() < this.lockoutUntil) {
    return true;
  }
  return false;
};

// Get lockout time remaining
capsuleSchema.methods.getLockoutTimeRemaining = function() {
  if (this.lockoutUntil && new Date() < this.lockoutUntil) {
    return this.lockoutUntil - new Date();
  }
  return 0;
};

// Get capsule preview (for locked capsules)
capsuleSchema.methods.getPreview = function() {
  return {
    _id: this._id,
    title: this.title,
    emoji: this.emoji,
    mood: this.mood,
    unlockDate: this.unlockDate,
    isUnlocked: this.isUnlocked,
    lockType: this.lockType,
    riddleQuestion: this.riddleQuestion,
    hasRiddle: this.hasRiddle,
    tags: this.tags,
    category: this.category,
    daysUntilUnlock: this.daysUntilUnlock,
    creator: this.creator,
    sharedWith: this.sharedWith,
    createdAt: this.createdAt,
    failedAttempts: this.failedAttempts,
    lockoutUntil: this.lockoutUntil
  };
};

// Get full capsule data (for unlocked capsules)
capsuleSchema.methods.getFullData = function() {
  return {
    _id: this._id,
    title: this.title,
    message: this.message,
    emoji: this.emoji,
    unlockDate: this.unlockDate,
    isUnlocked: this.isUnlocked,
    unlockedAt: this.unlockedAt,
    hasRiddle: this.hasRiddle,
    riddle: this.hasRiddle ? {
      question: this.riddle.question,
      hints: this.riddle.hints
    } : null,
    media: this.media,
    tags: this.tags,
    category: this.category,
    creator: this.creator,
    sharedWith: this.sharedWith,
    viewCount: this.viewCount,
    reactionCount: this.reactionCount,
    commentCount: this.commentCount,
    reactions: this.reactions,
    comments: this.comments,
    metadata: this.metadata,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

export default mongoose.model('Capsule', capsuleSchema);
