import User from '../models/User.js';

// @desc    Get user streak
// @route   GET /api/users/:id/streak
// @access  Private
export const getUserStreak = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const currentUserId = req.user._id;

    // Check if user is requesting their own streak or is a friend
    if (userId !== currentUserId.toString()) {
      const user = await User.findById(currentUserId);
      const isFriend = user.friends.some(friend => friend.toString() === userId);
      
      if (!isFriend) {
        return res.status(403).json({
          success: false,
          message: 'You can only view your own streak or friends\' streaks'
        });
      }
    }

    const user = await User.findById(userId)
      .select('streakCount lastCapsuleDate name');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        streakCount: user.streakCount,
        lastCapsuleDate: user.lastCapsuleDate,
        userName: user.name
      }
    });
  } catch (error) {
    next(error);
  }
};
