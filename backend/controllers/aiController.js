import JournalEntry from '../models/JournalEntry.js';
import Capsule from '../models/Capsule.js';
import JournalEmbedding from '../models/JournalEmbedding.js';
import CapsuleEmbedding from '../models/CapsuleEmbedding.js';
import {
  processJournalEntryEmbedding,
  processCapsuleEmbedding,
  chatWithTemporalSelf,
  getAiAnalytics,
} from '../services/aiService.js';

export const processEntry = async (req, res, next) => {
  try {
    const { sourceType, sourceId } = req.body;
    const userId = req.user._id;

    if (sourceType === 'journal') {
      const entry = await JournalEntry.findOne({ _id: sourceId, userId });
      if (!entry) {
        return res.status(404).json({ success: false, message: 'Journal entry not found' });
      }
      const embedDoc = await processJournalEntryEmbedding(entry);
      return res.json({ success: true, data: embedDoc });
    }

    if (sourceType === 'capsule') {
      const capsule = await Capsule.findOne({ _id: sourceId, creator: userId });
      if (!capsule) {
        return res.status(404).json({ success: false, message: 'Capsule not found' });
      }
      const embedDoc = await processCapsuleEmbedding(capsule);
      return res.json({ success: true, data: embedDoc });
    }

    return res.status(400).json({ success: false, message: 'Invalid sourceType' });
  } catch (err) {
    next(err);
  }
};

export const chat = async (req, res, next) => {
  try {
    const { userId, mode, timestamp, message } = req.body;

    // Enforce: users can only chat with themselves
    if (userId !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only chat with your own data' });
    }

    const out = await chatWithTemporalSelf({ userId, mode, timestamp, message });
    res.json({ success: true, data: out });
  } catch (err) {
    next(err);
  }
};

export const analytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const out = await getAiAnalytics(userId);
    res.json({ success: true, data: out });
  } catch (err) {
    next(err);
  }
};

// Optional debugging endpoints (admin/dev only). Kept private behind auth.
export const embeddingsCount = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const [j, c] = await Promise.all([
      JournalEmbedding.countDocuments({ userId }),
      CapsuleEmbedding.countDocuments({ userId }),
    ]);
    res.json({ success: true, data: { journalEmbeddings: j, capsuleEmbeddings: c } });
  } catch (err) {
    next(err);
  }
};


