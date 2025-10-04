import LotteryCapsule from '../models/LotteryCapsule.js';
import User from '../models/User.js';

// @desc    Get active lottery capsule for user
// @route   GET /api/lottery
// @access  Private
export const getLotteryCapsule = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Check if user has an active lottery capsule
    let lotteryCapsule = await LotteryCapsule.getActiveLotteryCapsule(userId);

    // If no active lottery capsule, create one
    if (!lotteryCapsule) {
      // Check if it's a new week (Sunday or first login of week)
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 = Sunday
      
      // Create lottery capsule on Sunday or if user hasn't had one this week
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - dayOfWeek);
      startOfWeek.setHours(0, 0, 0, 0);

      const lastLotteryCapsule = await LotteryCapsule.findOne({
        userId,
        createdAt: { $gte: startOfWeek }
      });

      if (!lastLotteryCapsule) {
        // Create new lottery capsule
        const types = ['quote', 'surprise'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        lotteryCapsule = await LotteryCapsule.createLotteryCapsule(userId, randomType);
      }
    }

    if (!lotteryCapsule) {
      return res.status(404).json({
        success: false,
        message: 'No lottery capsule available'
      });
    }

    res.json({
      success: true,
      data: {
        id: lotteryCapsule._id,
        content: lotteryCapsule.isUnlocked ? lotteryCapsule.content : null,
        unlockDate: lotteryCapsule.unlockDate,
        isUnlocked: lotteryCapsule.isUnlocked,
        type: lotteryCapsule.type,
        timeUntilUnlock: lotteryCapsule.unlockDate - new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unlock lottery capsule
// @route   PATCH /api/lottery/:id/unlock
// @access  Private
export const unlockLotteryCapsule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const lotteryCapsule = await LotteryCapsule.findOne({
      _id: id,
      userId
    });

    if (!lotteryCapsule) {
      return res.status(404).json({
        success: false,
        message: 'Lottery capsule not found'
      });
    }

    if (lotteryCapsule.isUnlocked) {
      return res.status(400).json({
        success: false,
        message: 'Capsule already unlocked'
      });
    }

    // Check if it's time to unlock
    if (new Date() < lotteryCapsule.unlockDate) {
      return res.status(400).json({
        success: false,
        message: 'Capsule not ready to unlock yet',
        unlockDate: lotteryCapsule.unlockDate
      });
    }

    // Unlock the capsule
    await lotteryCapsule.unlock();

    // Update user stats
    await User.findByIdAndUpdate(userId, {
      $inc: { 'stats.lotteryCapsulesUnlocked': 1 }
    });

    res.json({
      success: true,
      message: 'Lottery capsule unlocked!',
      data: {
        content: lotteryCapsule.content,
        type: lotteryCapsule.type,
        unlockedAt: lotteryCapsule.unlockedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get lottery history for user
// @route   GET /api/lottery/history
// @access  Private
export const getLotteryHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const lotteryCapsules = await LotteryCapsule.find({
      userId,
      isUnlocked: true
    })
    .sort({ unlockedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .select('content type unlockedAt');

    const total = await LotteryCapsule.countDocuments({
      userId,
      isUnlocked: true
    });

    res.json({
      success: true,
      data: {
        lotteryCapsules,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          hasNext: skip + lotteryCapsules.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
