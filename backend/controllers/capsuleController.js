import Capsule from '../models/Capsule.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { getCurrentIST, getTimeUntilUnlockIST, formatIST } from '../utils/timezone.js';

// @desc    Get all capsules for user
// @route   GET /api/capsules
// @access  Private
export const getCapsules = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = 'all', // all, locked, unlocked
      category,
      tags,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const userId = req.user._id;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    let query = {
      creator: userId,
      isArchived: false
    };

    // Filter by status
    if (status === 'locked') {
      query.isUnlocked = false;
    } else if (status === 'unlocked') {
      query.isUnlocked = true;
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by tags
    if (tags) {
      const tagArray = tags.split(',');
      query.tags = { $in: tagArray };
    }

    // Search by title or message
    if (search) {
      query.$and = [
        {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { message: { $regex: search, $options: 'i' } }
          ]
        }
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const capsules = await Capsule.find(query)
      .populate('creator', 'name avatar')
      .populate('unlockedBy', 'name avatar')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Capsule.countDocuments(query);

    // Format response based on unlock status
    const formattedCapsules = capsules.map(capsule => {
      if (capsule.isUnlocked) {
        return capsule.getFullData();
      } else {
        return capsule.getPreview();
      }
    });

    res.json({
      success: true,
      data: {
        capsules: formattedCapsules,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalCapsules: total,
          hasNext: skip + parseInt(limit) < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single capsule
// @route   GET /api/capsules/:id
// @access  Private
export const getCapsule = async (req, res, next) => {
  try {
    console.log('getCapsule request:', {
      capsuleId: req.params.id,
      userId: req.user?._id,
      userEmail: req.user?.email
    });

    const capsule = await Capsule.findById(req.params.id)
      .populate('creator', 'name avatar')
      .populate('unlockedBy', 'name avatar')
      .populate('reactions.user', 'name avatar')
      .populate('comments.user', 'name avatar');

    if (!capsule) {
      return res.status(404).json({
        success: false,
        message: 'Capsule not found'
      });
    }

    // Check if user can view this capsule
    console.log('Capsule access check:', {
      capsuleId: req.params.id,
      userId: req.user._id,
      creatorId: capsule.creator,
      canView: capsule.canView(req.user._id)
    });
    
    if (!capsule.canView(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this capsule'
      });
    }

    // Add view
    await capsule.addView(req.user._id);

    // Return appropriate data based on unlock status
    const capsuleData = capsule.isUnlocked ? 
      capsule.getFullData() : 
      capsule.getPreview();

    res.json({
      success: true,
      data: { capsule: capsuleData }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new capsule
// @route   POST /api/capsules
// @access  Private
export const createCapsule = async (req, res, next) => {
  try {
    const {
      title,
      message,
      emoji = '📝',
      mood = 'neutral',
      unlockDate,
      lockType = 'time',
      riddleQuestion,
      riddleAnswer,
      tags = [],
      category = 'personal',
      isPublic = false
    } = req.body;

    const userId = req.user._id;

    // Validate unlock date
    const unlockDateObj = new Date(unlockDate);
    if (unlockDateObj <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Unlock date must be in the future'
      });
    }

    // Prepare capsule data
    const capsuleData = {
      title,
      message,
      emoji,
      mood,
      lockType,
      creator: userId,
      unlockDate: unlockDateObj,
      tags,
      category,
      isPublic
    };

    // Add riddle if lockType is riddle
    if (lockType === 'riddle' && riddleQuestion && riddleAnswer) {
      capsuleData.riddleQuestion = riddleQuestion;
      capsuleData.riddleAnswer = riddleAnswer.toLowerCase().trim();
    }

    // Add media if uploaded
    if (req.file) {
      capsuleData.media = [{
        url: req.file.path,
        publicId: req.file.filename,
        type: req.file.mimetype.startsWith('image/') ? 'image' : 
              req.file.mimetype.startsWith('video/') ? 'video' : 'document',
        filename: req.file.originalname,
        size: req.file.size
      }];
    }

    const capsule = await Capsule.create(capsuleData);

    // Update user stats
    await User.findByIdAndUpdate(userId, {
      $inc: { 'stats.capsulesCreated': 1 }
    });

    // Update streak logic
    const user = await User.findById(userId);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Reset time to start of day for comparison
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    
    if (user.lastCapsuleDate) {
      const lastCapsuleDate = new Date(user.lastCapsuleDate);
      const lastCapsuleStart = new Date(lastCapsuleDate.getFullYear(), lastCapsuleDate.getMonth(), lastCapsuleDate.getDate());
      
      if (lastCapsuleStart.getTime() === yesterdayStart.getTime()) {
        // Streak continues - increment streak
        user.streakCount += 1;
      } else if (lastCapsuleStart.getTime() === todayStart.getTime()) {
        // Already created a capsule today - do nothing
        // Keep current streak count
      } else {
        // Streak broken - reset to 1
        user.streakCount = 1;
      }
    } else {
      // First capsule - start streak
      user.streakCount = 1;
    }
    
    user.lastCapsuleDate = todayStart;
    await user.save();

    // Add creation badge if first capsule
    if (user.stats.capsulesCreated === 1) {
      await user.addBadge({
        name: 'First Capsule',
        description: 'Created your first time capsule!',
        icon: '🎯',
        category: 'creation'
      });
    }
    
    // Add streak badges
    if (user.streakCount === 7) {
      await user.addBadge({
        name: 'Week Warrior',
        description: '7-day capsule streak!',
        icon: '🔥',
        category: 'streak'
      });
    } else if (user.streakCount === 30) {
      await user.addBadge({
        name: 'Monthly Master',
        description: '30-day capsule streak!',
        icon: '💎',
        category: 'streak'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Capsule created successfully',
      data: { capsule: capsule.getPreview() }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update capsule
// @route   PUT /api/capsules/:id
// @access  Private
export const updateCapsule = async (req, res, next) => {
  try {
    const capsule = await Capsule.findById(req.params.id);

    if (!capsule) {
      return res.status(404).json({
        success: false,
        message: 'Capsule not found'
      });
    }

    // Check if user can edit this capsule
    if (!capsule.canEdit(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit this capsule'
      });
    }

    // Don't allow editing unlocked capsules
    if (capsule.isUnlocked) {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit unlocked capsules'
      });
    }

    const {
      title,
      message,
      emoji,
      tags,
      category,
      isPublic
    } = req.body;

    // Update fields
    if (title) capsule.title = title;
    if (message) capsule.message = message;
    if (emoji) capsule.emoji = emoji;
    if (tags) capsule.tags = tags;
    if (category) capsule.category = category;
    if (isPublic !== undefined) capsule.isPublic = isPublic;

    await capsule.save();

    res.json({
      success: true,
      message: 'Capsule updated successfully',
      data: { capsule: capsule.getPreview() }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete capsule
// @route   DELETE /api/capsules/:id
// @access  Private
export const deleteCapsule = async (req, res, next) => {
  try {
    const capsule = await Capsule.findById(req.params.id);

    if (!capsule) {
      return res.status(404).json({
        success: false,
        message: 'Capsule not found'
      });
    }

    // Only creator can delete
    const creatorId = capsule.creator._id 
      ? capsule.creator._id.toString() 
      : capsule.creator.toString();
    
    if (creatorId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own capsules'
      });
    }

    // Archive instead of delete
    capsule.isArchived = true;
    capsule.archivedAt = new Date();
    await capsule.save();

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'stats.capsulesCreated': -1 }
    });

    res.json({
      success: true,
      message: 'Capsule deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unlock capsule
// @route   POST /api/capsules/:id/unlock
// @access  Private
export const unlockCapsule = async (req, res, next) => {
  try {
    const capsule = await Capsule.findById(req.params.id);

    if (!capsule) {
      return res.status(404).json({
        success: false,
        message: 'Capsule not found'
      });
    }

    // Check if user can view this capsule
    if (!capsule.canView(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to unlock this capsule'
      });
    }

    // Check if capsule is already unlocked
    if (capsule.isUnlocked) {
      return res.json({
        success: true,
        message: 'Capsule is already unlocked',
        data: { capsule: capsule.getFullData() }
      });
    }

    // Check if riddle is required
    if (capsule.hasRiddle) {
      const { answer } = req.body;
      if (!answer) {
        return res.status(400).json({
          success: false,
          message: 'Riddle answer is required'
        });
      }

      const riddleResult = capsule.checkRiddleAnswer(answer, req.user._id);
      if (!riddleResult.correct) {
        return res.status(400).json({
          success: false,
          message: riddleResult.message
        });
      }
    }

    // Unlock the capsule
    const unlockResult = await capsule.unlock(req.user._id);
    if (!unlockResult.success) {
      return res.status(400).json({
        success: false,
        message: unlockResult.message
      });
    }

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 
        'stats.capsulesUnlocked': 1,
        ...(capsule.hasRiddle && { 'stats.riddlesSolved': 1 })
      }
    });

    // Add badges
    const user = await User.findById(req.user._id);
    
    // First unlock badge
    if (user.stats.capsulesUnlocked === 1) {
      await user.addBadge({
        name: 'First Unlock',
        description: 'Unlocked your first capsule!',
        icon: '🔓',
        category: 'milestone'
      });
    }

    // Riddle solver badge
    if (capsule.hasRiddle && user.stats.riddlesSolved === 1) {
      await user.addBadge({
        name: 'Riddle Master',
        description: 'Solved your first riddle!',
        icon: '🧩',
        category: 'challenge'
      });
    }

    // Create notification
    await Notification.createNotification(
      req.user._id,
      'capsule_unlocked',
      'Capsule Unlocked!',
      `You successfully unlocked "${capsule.title}"`,
      { capsuleId: capsule._id }
    );

    res.json({
      success: true,
      message: 'Capsule unlocked successfully!',
      data: { capsule: capsule.getFullData() }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add reaction to capsule
// @route   POST /api/capsules/:id/reactions
// @access  Private
export const addReaction = async (req, res, next) => {
  try {
    const { emoji } = req.body;
    const capsule = await Capsule.findById(req.params.id);

    if (!capsule) {
      return res.status(404).json({
        success: false,
        message: 'Capsule not found'
      });
    }

    // Check if user can view this capsule
    if (!capsule.canView(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to react to this capsule'
      });
    }

    // Check if capsule is unlocked
    if (!capsule.isUnlocked) {
      return res.status(400).json({
        success: false,
        message: 'Cannot react to locked capsules'
      });
    }

    await capsule.addReaction(req.user._id, emoji);

    res.json({
      success: true,
      message: 'Reaction added successfully',
      data: { reactions: capsule.reactions }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to capsule
// @route   POST /api/capsules/:id/comments
// @access  Private
export const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const capsule = await Capsule.findById(req.params.id);

    if (!capsule) {
      return res.status(404).json({
        success: false,
        message: 'Capsule not found'
      });
    }

    // Check if user can view this capsule
    if (!capsule.canView(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to comment on this capsule'
      });
    }

    // Check if capsule is unlocked
    if (!capsule.isUnlocked) {
      return res.status(400).json({
        success: false,
        message: 'Cannot comment on locked capsules'
      });
    }

    await capsule.addComment(req.user._id, text);

    // Create notification for capsule creator
    const creatorId = capsule.creator._id 
      ? capsule.creator._id.toString() 
      : capsule.creator.toString();
    
    if (creatorId !== req.user._id.toString()) {
      await Notification.createNotification(
        capsule.creator._id || capsule.creator,
        'comment_added',
        'New Comment',
        `${req.user.name} commented on your capsule "${capsule.title}"`,
        { capsuleId: capsule._id, fromUser: req.user._id }
      );
    }

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: { comments: capsule.comments }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get capsule statistics
// @route   GET /api/capsules/stats
// @access  Private
export const getCapsuleStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const stats = await Capsule.aggregate([
      {
        $match: {
          creator: userId,
          isArchived: false
        }
      },
      {
        $group: {
          _id: null,
          totalCapsules: { $sum: 1 },
          lockedCapsules: {
            $sum: { $cond: [{ $eq: ['$isUnlocked', false] }, 1, 0] }
          },
          unlockedCapsules: {
            $sum: { $cond: [{ $eq: ['$isUnlocked', true] }, 1, 0] }
          },
          riddleCapsules: {
            $sum: { $cond: [{ $eq: ['$hasRiddle', true] }, 1, 0] }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalCapsules: 0,
      lockedCapsules: 0,
      unlockedCapsules: 0,
      riddleCapsules: 0
    };

    res.json({
      success: true,
      data: { stats: result }
    });
  } catch (error) {
    next(error);
  }
};
