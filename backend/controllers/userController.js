import User from '../models/User.js';
import Capsule from '../models/Capsule.js';
import Notification from '../models/Notification.js';

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const currentUserId = req.user._id;

    const user = await User.findById(userId)
      .select('-password -email');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isOwnProfile = userId === currentUserId.toString();

    let profileData;
    if (isOwnProfile) {
      // Return full profile for own profile
      profileData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        badges: user.badges,
        stats: user.stats,
        preferences: user.preferences,
        createdAt: user.createdAt
      };
    } else if (user.preferences.privacy.profileVisibility === 'public') {
      // Return public profile
      profileData = user.getPublicProfile();
    } else {
      // Return limited profile for private users
      profileData = {
        _id: user._id,
        name: user.name,
        avatar: user.avatar,
        stats: {
          joinedAt: user.stats.joinedAt
        }
      };
    }

    res.json({
      success: true,
      data: { user: profileData }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's badges
// @route   GET /api/users/:id/badges
// @access  Private
export const getUserBadges = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const currentUserId = req.user._id;

    const user = await User.findById(userId).select('badges preferences.privacy');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user can view badges
    const isOwnProfile = userId === currentUserId.toString();

    if (!isOwnProfile && 
        user.preferences.privacy.profileVisibility === 'private' &&
        !user.preferences.privacy.showBadges) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this user\'s badges'
      });
    }

    // Group badges by category
    const badgesByCategory = user.badges.reduce((acc, badge) => {
      if (!acc[badge.category]) {
        acc[badge.category] = [];
      }
      acc[badge.category].push(badge);
      return acc;
    }, {});

    res.json({
      success: true,
      data: { 
        badges: user.badges,
        badgesByCategory,
        totalBadges: user.badges.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's public capsules
// @route   GET /api/users/:id/capsules
// @access  Private
export const getUserCapsules = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const currentUserId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Check if user can view this user's capsules
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isOwnProfile = userId === currentUserId.toString();

    let query = {
      creator: userId,
      isArchived: false
    };

    // If not own profile, only show public capsules
    if (!isOwnProfile) {
      query.isPublic = true;
    }

    const capsules = await Capsule.find(query)
      .populate('creator', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Capsule.countDocuments(query);

    // Format capsules (only show preview for locked capsules)
    const formattedCapsules = capsules.map(capsule => {
      if (capsule.isUnlocked || isOwnProfile) {
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
