import mongoose from 'mongoose';

const lotteryCapsuleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  unlockDate: {
    type: Date,
    required: true
  },
  isUnlocked: {
    type: Boolean,
    default: false
  },
  unlockedAt: {
    type: Date,
    default: null
  },
  type: {
    type: String,
    enum: ['quote', 'memory', 'surprise'],
    default: 'quote'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
lotteryCapsuleSchema.index({ userId: 1, isUnlocked: 1 });
lotteryCapsuleSchema.index({ unlockDate: 1 });

// Static method to create a lottery capsule
lotteryCapsuleSchema.statics.createLotteryCapsule = async function(userId, type = 'quote') {
  const motivationalQuotes = [
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
    "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Life is what happens to you while you're busy making other plans. - John Lennon",
    "The way to get started is to quit talking and begin doing. - Walt Disney",
    "Your time is limited, don't waste it living someone else's life. - Steve Jobs",
    "If life were predictable it would cease to be life, and be without flavor. - Eleanor Roosevelt",
    "The future depends on what you do today. - Mahatma Gandhi",
    "It is during our darkest moments that we must focus to see the light. - Aristotle",
    "The only impossible journey is the one you never begin. - Tony Robbins"
  ];

  const surpriseMessages = [
    "🎉 Surprise! You've been selected for a special memory boost!",
    "✨ Today's lottery capsule brings you a moment of joy!",
    "🌟 You've won the daily happiness lottery!",
    "🎁 A special surprise awaits you in this capsule!",
    "💫 The universe has a special message for you today!"
  ];

  let content;
  if (type === 'quote') {
    content = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  } else if (type === 'surprise') {
    content = surpriseMessages[Math.floor(Math.random() * surpriseMessages.length)];
  } else {
    content = "A special memory capsule just for you!";
  }

  // Set unlock date to 1-3 days from now (reduced for better user experience)
  const unlockDate = new Date();
  const randomDays = Math.floor(Math.random() * 3) + 1; // 1-3 days
  unlockDate.setDate(unlockDate.getDate() + randomDays);

  return this.create({
    userId,
    content,
    unlockDate,
    type
  });
};

// Method to check if user has an active lottery capsule
lotteryCapsuleSchema.statics.getActiveLotteryCapsule = async function(userId) {
  return this.findOne({
    userId,
    isUnlocked: false,
    unlockDate: { $gt: new Date() }
  }).sort({ createdAt: -1 });
};

// Method to unlock lottery capsule
lotteryCapsuleSchema.methods.unlock = async function() {
  if (this.isUnlocked) {
    throw new Error('Capsule already unlocked');
  }
  
  if (new Date() < this.unlockDate) {
    throw new Error('Capsule not ready to unlock yet');
  }

  this.isUnlocked = true;
  this.unlockedAt = new Date();
  return this.save();
};

export default mongoose.model('LotteryCapsule', lotteryCapsuleSchema);
