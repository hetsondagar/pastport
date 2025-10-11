import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters'],
    default: ''
  },
  badges: [{
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    },
    earnedAt: {
      type: Date,
      default: Date.now
    },
    category: {
      type: String,
      enum: ['creation', 'challenge', 'milestone'],
      required: true
    }
  }],
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      unlockReminders: {
        type: Boolean,
        default: true
      }
    },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'private'
      },
      showBadges: {
        type: Boolean,
        default: true
      }
    }
  },
  stats: {
    capsulesCreated: {
      type: Number,
      default: 0
    },
    capsulesUnlocked: {
      type: Number,
      default: 0
    },
    riddlesSolved: {
      type: Number,
      default: 0
    },
    lotteryCapsulesUnlocked: {
      type: Number,
      default: 0
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  },
  streakCount: {
    type: Number,
    default: 0
  },
  lastCapsuleDate: {
    type: Date,
    default: null
  },
  journalStreakCount: {
    type: Number,
    default: 0
  },
  lastJournalDate: {
    type: Date,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  refreshTokens: [{
    token: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 604800 // 7 days
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better performance
// Remove duplicate email index; `unique: true` on the field already creates an index
userSchema.index({ 'stats.joinedAt': -1 });

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Add badge to user
userSchema.methods.addBadge = function(badgeData) {
  const existingBadge = this.badges.find(badge => badge.name === badgeData.name);
  if (!existingBadge) {
    this.badges.push(badgeData);
    return this.save();
  }
  return Promise.resolve(this);
};

// Check if user has badge
userSchema.methods.hasBadge = function(badgeName) {
  return this.badges.some(badge => badge.name === badgeName);
};

// Add refresh token
userSchema.methods.addRefreshToken = function(token) {
  this.refreshTokens.push({ token });
  return this.save();
};

// Remove refresh token
userSchema.methods.removeRefreshToken = function(token) {
  this.refreshTokens = this.refreshTokens.filter(rt => rt.token !== token);
  return this.save();
};

// Check if user is admin
userSchema.methods.isAdmin = function() {
  return this.role === 'admin';
};

// Get user's public profile (without sensitive data)
userSchema.methods.getPublicProfile = function() {
  return {
    _id: this._id,
    name: this.name,
    avatar: this.avatar,
    bio: this.bio,
    badges: this.badges,
    stats: {
      capsulesCreated: this.stats.capsulesCreated,
      capsulesUnlocked: this.stats.capsulesUnlocked,
      riddlesSolved: this.stats.riddlesSolved,
      joinedAt: this.stats.joinedAt
    },
    preferences: {
      privacy: this.preferences.privacy
    }
  };
};

export default mongoose.model('User', userSchema);
