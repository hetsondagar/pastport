import mongoose from 'mongoose';
import { getCurrentIST, canUnlockInIST } from '../utils/timezone.js';

const journalEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true,
    maxlength: [5000, 'Content cannot exceed 5000 characters']
  },
  mood: {
    type: String,
    enum: ['happy', 'sad', 'excited', 'angry', 'calm', 'neutral'],
    default: 'neutral'
  },
  isCapsule: {
    type: Boolean,
    default: false
  },
  lockType: {
    type: String,
    enum: ['time', 'riddle', 'none'],
    default: 'none'
  },
  unlockDate: {
    type: Date,
    default: null
  },
  riddleQuestion: {
    type: String,
    default: null
  },
  riddleAnswer: {
    type: String,
    default: null
  },
  isUnlocked: {
    type: Boolean,
    default: false
  },
  unlockedAt: {
    type: Date,
    default: null
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 30
  }],
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
      enum: ['image', 'video', 'audio'],
      required: true
    },
    format: String,
    resourceType: String,
    width: Number,
    height: Number,
    size: Number,
    duration: Number,
    caption: {
      type: String,
      maxlength: 500,
      default: ''
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
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
journalEntrySchema.index({ userId: 1, date: 1 });
journalEntrySchema.index({ userId: 1, isCapsule: 1 });
journalEntrySchema.index({ userId: 1, isUnlocked: 1 });

// Virtual for formatted date
journalEntrySchema.virtual('formattedDate').get(function() {
  return this.date.toISOString().split('T')[0];
});

// Method to check if entry can be unlocked (using IST)
journalEntrySchema.methods.canUnlock = function() {
  if (!this.isCapsule || this.isUnlocked) return false;
  
  if (this.lockType === 'time') {
    return canUnlockInIST(this.unlockDate);
  }
  
  return true; // For riddle type, can be unlocked anytime if answer is correct
};

// Method to unlock entry (using IST)
journalEntrySchema.methods.unlock = async function() {
  if (!this.canUnlock()) {
    throw new Error('Entry cannot be unlocked yet (IST)');
  }
  
  this.isUnlocked = true;
  this.unlockedAt = getCurrentIST();
  return this.save();
};

// Static method to get entries for a month
journalEntrySchema.statics.getMonthEntries = async function(userId, year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  
  return this.find({
    userId,
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: 1 });
};

// Static method to get streak data
journalEntrySchema.statics.getStreakData = async function(userId) {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  // Get all entries from the last 30 days
  const thirtyDaysAgo = new Date(startOfToday);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const entries = await this.find({
    userId,
    date: { $gte: thirtyDaysAgo, $lte: startOfToday }
  }).sort({ date: -1 });
  
  let streakCount = 0;
  let lastEntryDate = null;
  
  if (entries.length > 0) {
    lastEntryDate = entries[0].date;
    const lastEntryStart = new Date(lastEntryDate.getFullYear(), lastEntryDate.getMonth(), lastEntryDate.getDate());
    
    // Calculate streak
    let currentDate = new Date(startOfToday);
    let foundEntry = false;
    
    for (let i = 0; i < 30; i++) {
      const dayStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      
      const hasEntry = entries.some(entry => {
        const entryStart = new Date(entry.date.getFullYear(), entry.date.getMonth(), entry.date.getDate());
        return entryStart.getTime() === dayStart.getTime();
      });
      
      if (hasEntry) {
        if (!foundEntry) {
          foundEntry = true;
        }
        streakCount++;
      } else if (foundEntry) {
        break;
      }
      
      currentDate.setDate(currentDate.getDate() - 1);
    }
  }
  
  return {
    streakCount,
    lastEntryDate,
    totalEntries: entries.length
  };
};

// Update the updatedAt field before saving
journalEntrySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('JournalEntry', journalEntrySchema);
