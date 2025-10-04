import Capsule from '../models/Capsule.js';
import User from '../models/User.js';

// @desc    Attempt to solve riddle capsule
// @route   POST /api/capsules/:id/attempt
// @access  Private
export const attemptRiddle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { answer } = req.body;
    const userId = req.user._id;

    const capsule = await Capsule.findOne({
      _id: id,
      $or: [
        { creator: userId },
        { 'sharedWith.user': userId }
      ]
    });

    if (!capsule) {
      return res.status(404).json({
        success: false,
        message: 'Capsule not found'
      });
    }

    if (capsule.lockType !== 'riddle') {
      return res.status(400).json({
        success: false,
        message: 'This capsule is not a riddle capsule'
      });
    }

    if (capsule.isUnlocked) {
      return res.status(400).json({
        success: false,
        message: 'Capsule already unlocked'
      });
    }

    // Check if answer is correct
    const userAnswer = answer.toLowerCase().trim();
    const correctAnswer = capsule.riddleAnswer.toLowerCase().trim();

    if (userAnswer === correctAnswer) {
      // Correct answer - unlock the capsule
      capsule.isUnlocked = true;
      capsule.unlockedAt = new Date();
      await capsule.save();

      // Update user stats
      await User.findByIdAndUpdate(userId, {
        $inc: { 'stats.riddlesSolved': 1 }
      });

      res.json({
        success: true,
        message: 'Correct! Capsule unlocked!',
        data: {
          capsule: {
            id: capsule._id,
            title: capsule.title,
            message: capsule.message,
            emoji: capsule.emoji,
            mood: capsule.mood,
            unlockedAt: capsule.unlockedAt
          }
        }
      });
    } else {
      // Wrong answer
      res.json({
        success: false,
        message: 'Incorrect answer. Try again!',
        attempts: capsule.attempts || 0
      });
    }
  } catch (error) {
    next(error);
  }
};
