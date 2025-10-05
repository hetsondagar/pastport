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

    // Check if capsule is locked due to failed attempts
    if (capsule.isLockedDueToAttempts()) {
      const lockoutTimeRemaining = capsule.getLockoutTimeRemaining();
      const hoursRemaining = Math.ceil(lockoutTimeRemaining / (1000 * 60 * 60));
      
      return res.status(400).json({
        success: false,
        message: `Capsule is locked due to too many failed attempts. Try again in ${hoursRemaining} hours.`
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
      // Wrong answer - increment failed attempts
      capsule.failedAttempts += 1;
      
      // Check if we need to lock the capsule
      if (capsule.failedAttempts >= 5) {
        // Lock the capsule for 24 hours
        const lockoutUntil = new Date();
        lockoutUntil.setHours(lockoutUntil.getHours() + 24);
        capsule.lockoutUntil = lockoutUntil;
        capsule.failedAttempts = 0; // Reset counter
        
        await capsule.save();
        
        return res.status(400).json({
          success: false,
          message: 'Too many failed attempts! Capsule is now locked for 24 hours.',
          attempts: 5,
          locked: true
        });
      }
      
      await capsule.save();
      
      res.json({
        success: false,
        message: `Incorrect answer. ${5 - capsule.failedAttempts} attempts remaining.`,
        attempts: capsule.failedAttempts,
        remaining: 5 - capsule.failedAttempts
      });
    }
  } catch (error) {
    next(error);
  }
};
