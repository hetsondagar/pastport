import mongoose from 'mongoose';

const journalEmbeddingSchema = new mongoose.Schema({
  journalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JournalEntry',
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  embedding: {
    type: [Number],
    required: true,
  },
  sentimentScore: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
  },
  sentimentLabel: {
    type: String,
    enum: ['positive', 'negative'],
    required: true,
  },
  emotionLabel: {
    type: String,
    enum: ['joy', 'sadness', 'anger', 'fear', 'surprise', 'neutral'],
    required: true,
  },
  emotionScore: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
  },
  topics: [{
    type: String,
    trim: true,
    maxlength: 40,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, { timestamps: false });

journalEmbeddingSchema.index({ userId: 1, createdAt: -1 });
journalEmbeddingSchema.index({ userId: 1, journalId: 1 }, { unique: true });

export default mongoose.model('JournalEmbedding', journalEmbeddingSchema);


