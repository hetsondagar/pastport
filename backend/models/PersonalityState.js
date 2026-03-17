import mongoose from 'mongoose';

const personalityStateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  timestamp: {
    // Monthly snapshot anchor (e.g., first day of month UTC)
    type: Date,
    required: true,
    index: true,
  },
  optimismScore: { type: Number, required: true, min: 0, max: 1 },
  ambitionScore: { type: Number, required: true, min: 0, max: 1 },
  anxietyScore: { type: Number, required: true, min: 0, max: 1 },
  reflectionScore: { type: Number, required: true, min: 0, max: 1 },
  socialFocusScore: { type: Number, required: true, min: 0, max: 1 },
}, { timestamps: true });

personalityStateSchema.index({ userId: 1, timestamp: 1 }, { unique: true });

export default mongoose.model('PersonalityState', personalityStateSchema);


