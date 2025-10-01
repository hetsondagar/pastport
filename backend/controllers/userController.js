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
      .populate('friends', 'name avatar')
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

    // Check privacy settings
    const isFriend = user.friends.some(friend => 
      friend._id.toString() === currentUserId.toString()
    );
    const isOwnProfile = userId === currentUserId;

    let profileData;
    if (isOwnProfile) {
      // Return full profile for own profile
      profileData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        friends: user.friends,
        friendRequests: user.friendRequests,
        badges: user.badges,
        stats: user.stats,
        preferences: user.preferences,
        createdAt: user.createdAt
      };
    } else if (user.preferences.privacy.profileVisibility === 'public' || isFriend) {
      // Return public profile
      profileData = user.getPublicProfile();
    } else {
      // Return limited profile
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

// @desc    Send friend request
// @route   POST /api/users/:id/friend-request
// @access  Private
export const sendFriendRequest = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    if (targetUserId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send friend request to yourself'
      });
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(targetUserId)
    ]);

    if (!targetUser || !targetUser.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already friends
    if (currentUser.friends.includes(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: 'You are already friends with this user'
      });
    }

    // Check if friend request already exists
    const existingRequest = targetUser.friendRequests.find(request => 
      request.user.toString() === currentUserId.toString()
    );

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'Friend request already sent'
      });
    }

    // Add friend request
    targetUser.friendRequests.push({
      user: currentUserId,
      status: 'pending'
    });

    await targetUser.save();

    // Create notification
    await Notification.createNotification(
      targetUserId,
      'friend_request',
      'New Friend Request',
      `${currentUser.name} sent you a friend request`,
      { fromUser: currentUserId }
    );

    res.json({
      success: true,
      message: 'Friend request sent successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Respond to friend request
// @route   PUT /api/users/friend-requests/:requestId
// @access  Private
export const respondToFriendRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body; // 'accept' or 'decline'
    const currentUserId = req.user._id;

    const user = await User.findById(currentUserId);
    const friendRequest = user.friendRequests.id(requestId);

    if (!friendRequest) {
      return res.status(404).json({
        success: false,
        message: 'Friend request not found'
      });
    }

    if (friendRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Friend request has already been processed'
      });
    }

    if (action === 'accept') {
      // Add to friends list for both users
      const [currentUser, requesterUser] = await Promise.all([
        User.findById(currentUserId),
        User.findById(friendRequest.user)
      ]);

      if (!currentUser.friends.includes(friendRequest.user)) {
        currentUser.friends.push(friendRequest.user);
      }
      if (!requesterUser.friends.includes(currentUserId)) {
        requesterUser.friends.push(currentUserId);
      }

      // Update friend request status
      friendRequest.status = 'accepted';

      await Promise.all([currentUser.save(), requesterUser.save()]);

      // Create notification for requester
      await Notification.createNotification(
        friendRequest.user,
        'friend_accepted',
        'Friend Request Accepted',
        `${user.name} accepted your friend request`,
        { fromUser: currentUserId }
      );

      res.json({
        success: true,
        message: 'Friend request accepted'
      });
    } else if (action === 'decline') {
      // Update friend request status
      friendRequest.status = 'declined';

      await user.save();

      res.json({
        success: true,
        message: 'Friend request declined'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Use "accept" or "decline"'
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Remove friend
// @route   DELETE /api/users/:id/friends
// @access  Private
export const removeFriend = async (req, res, next) => {
  try {
    const friendId = req.params.id;
    const currentUserId = req.user._id;

    const [currentUser, friendUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(friendId)
    ]);

    if (!friendUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove from both friends lists
    currentUser.friends = currentUser.friends.filter(
      id => id.toString() !== friendId
    );
    friendUser.friends = friendUser.friends.filter(
      id => id.toString() !== currentUserId
    );

    await Promise.all([currentUser.save(), friendUser.save()]);

    res.json({
      success: true,
      message: 'Friend removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get friend requests
// @route   GET /api/users/friend-requests
// @access  Private
export const getFriendRequests = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friendRequests.user', 'name avatar')
      .select('friendRequests');

    const pendingRequests = user.friendRequests.filter(
      request => request.status === 'pending'
    );

    res.json({
      success: true,
      data: { friendRequests: pendingRequests }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's friends
// @route   GET /api/users/:id/friends
// @access  Private
export const getUserFriends = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const currentUserId = req.user._id;

    const user = await User.findById(userId)
      .populate('friends', 'name avatar bio stats.joinedAt')
      .select('friends preferences.privacy');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user can view friends list
    const isOwnProfile = userId === currentUserId;
    const isFriend = user.friends.some(friend => 
      friend._id.toString() === currentUserId.toString()
    );

    if (!isOwnProfile && 
        user.preferences.privacy.profileVisibility === 'private' && 
        !isFriend) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this user\'s friends'
      });
    }

    const friendsData = user.friends.map(friend => friend.getPublicProfile());

    res.json({
      success: true,
      data: { friends: friendsData }
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
    const isOwnProfile = userId === currentUserId;
    const isFriend = await User.findById(currentUserId).then(u => 
      u.friends.includes(userId)
    );

    if (!isOwnProfile && 
        user.preferences.privacy.profileVisibility === 'private' && 
        !isFriend &&
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

    const isOwnProfile = userId === currentUserId;
    const isFriend = targetUser.friends.includes(currentUserId);

    let query = {
      creator: userId,
      isArchived: false
    };

    // If not own profile and not friend, only show public capsules
    if (!isOwnProfile && !isFriend) {
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
