import JournalEntry from '../models/JournalEntry.js';
import User from '../models/User.js';

// @desc    Get journal entries for a specific month
// @route   GET /api/journal/:userId/month/:year/:month
// @access  Private
export const getMonthEntries = async (req, res, next) => {
  try {
    const { userId, year, month } = req.params;
    const currentUserId = req.user._id;

    // Check if user is requesting their own entries
    if (userId !== currentUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own journal entries'
      });
    }

    const entries = await JournalEntry.getMonthEntries(userId, parseInt(year), parseInt(month));
    
    // Create a map of entries by date for easy lookup
    const entriesMap = {};
    entries.forEach(entry => {
      const dateKey = entry.date.toISOString().split('T')[0];
      entriesMap[dateKey] = entry;
    });

    res.json({
      success: true,
      data: {
        entries: entriesMap,
        month: parseInt(month),
        year: parseInt(year),
        totalEntries: entries.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new journal entry
// @route   POST /api/journal
// @access  Private
export const createJournalEntry = async (req, res, next) => {
  try {
    const {
      content,
      mood = 'neutral',
      date,
      isCapsule = false,
      lockType = 'none',
      unlockDate,
      riddleQuestion,
      riddleAnswer,
      tags = [],
      isPublic = false
    } = req.body;

    const userId = req.user._id;
    const entryDate = date ? new Date(date) : new Date();

    // Validate unlock date if it's a time capsule
    if (isCapsule && lockType === 'time' && unlockDate) {
      const unlockDateObj = new Date(unlockDate);
      if (unlockDateObj <= entryDate) {
        return res.status(400).json({
          success: false,
          message: 'Unlock date must be in the future'
        });
      }
    }

    // Check if entry already exists for this date
    const existingEntry = await JournalEntry.findOne({
      userId,
      date: {
        $gte: new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate()),
        $lt: new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate() + 1)
      }
    });

    if (existingEntry) {
      return res.status(400).json({
        success: false,
        message: 'Journal entry already exists for this date'
      });
    }

    const journalEntry = await JournalEntry.create({
      userId,
      content,
      mood,
      date: entryDate,
      isCapsule,
      lockType,
      unlockDate: isCapsule && lockType === 'time' ? new Date(unlockDate) : null,
      riddleQuestion: isCapsule && lockType === 'riddle' ? riddleQuestion : null,
      riddleAnswer: isCapsule && lockType === 'riddle' ? riddleAnswer : null,
      tags,
      isPublic
    });

    // Update user streak
    await updateUserStreak(userId);

    res.status(201).json({
      success: true,
      message: 'Journal entry created successfully',
      data: journalEntry
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a journal entry
// @route   PUT /api/journal/:id
// @access  Private
export const updateJournalEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { content, mood, tags, isPublic } = req.body;

    const journalEntry = await JournalEntry.findOne({
      _id: id,
      userId
    });

    if (!journalEntry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    if (journalEntry.isCapsule && journalEntry.isUnlocked) {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit unlocked capsule entries'
      });
    }

    journalEntry.content = content || journalEntry.content;
    journalEntry.mood = mood || journalEntry.mood;
    journalEntry.tags = tags || journalEntry.tags;
    journalEntry.isPublic = isPublic !== undefined ? isPublic : journalEntry.isPublic;

    await journalEntry.save();

    res.json({
      success: true,
      message: 'Journal entry updated successfully',
      data: journalEntry
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a journal entry
// @route   DELETE /api/journal/:id
// @access  Private
export const deleteJournalEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const journalEntry = await JournalEntry.findOne({
      _id: id,
      userId
    });

    if (!journalEntry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    await JournalEntry.findByIdAndDelete(id);

    // Update user streak
    await updateUserStreak(userId);

    res.json({
      success: true,
      message: 'Journal entry deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unlock a journal entry (capsule)
// @route   PATCH /api/journal/:id/unlock
// @access  Private
export const unlockJournalEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { answer } = req.body;
    const userId = req.user._id;

    const journalEntry = await JournalEntry.findOne({
      _id: id,
      userId
    });

    if (!journalEntry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    if (!journalEntry.isCapsule) {
      return res.status(400).json({
        success: false,
        message: 'This entry is not a capsule'
      });
    }

    if (journalEntry.isUnlocked) {
      return res.status(400).json({
        success: false,
        message: 'Entry already unlocked'
      });
    }

    // Check if it's time to unlock
    if (journalEntry.lockType === 'time' && !journalEntry.canUnlock()) {
      return res.status(400).json({
        success: false,
        message: 'Entry not ready to unlock yet',
        unlockDate: journalEntry.unlockDate
      });
    }

    // Check riddle answer if it's a riddle capsule
    if (journalEntry.lockType === 'riddle' && journalEntry.riddleAnswer) {
      const userAnswer = answer ? answer.toLowerCase().trim() : '';
      const correctAnswer = journalEntry.riddleAnswer.toLowerCase().trim();
      
      if (userAnswer !== correctAnswer) {
        return res.status(400).json({
          success: false,
          message: 'Incorrect answer. Try again!'
        });
      }
    }

    // Unlock the entry
    await journalEntry.unlock();

    // Update user stats
    await User.findByIdAndUpdate(userId, {
      $inc: { 'stats.journalEntriesUnlocked': 1 }
    });

    res.json({
      success: true,
      message: 'Journal entry unlocked successfully!',
      data: journalEntry
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get journal streak data
// @route   GET /api/journal/streak
// @access  Private
export const getJournalStreak = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const streakData = await JournalEntry.getStreakData(userId);

    res.json({
      success: true,
      data: streakData
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to update user streak
const updateUserStreak = async (userId) => {
  const streakData = await JournalEntry.getStreakData(userId);
  
  await User.findByIdAndUpdate(userId, {
    journalStreakCount: streakData.streakCount,
    lastJournalDate: streakData.lastEntryDate
  });
};
