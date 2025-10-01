import express from 'express';
import {
  getUserProfile,
  sendFriendRequest,
  respondToFriendRequest,
  removeFriend,
  getFriendRequests,
  getUserFriends,
  getUserBadges,
  getUserCapsules
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// User profile routes
router.get('/:id', getUserProfile);
router.get('/:id/friends', getUserFriends);
router.get('/:id/badges', getUserBadges);
router.get('/:id/capsules', getUserCapsules);

// Friend management routes
router.post('/:id/friend-request', sendFriendRequest);
router.delete('/:id/friends', removeFriend);

// Friend request management
router.get('/friend-requests', getFriendRequests);
router.put('/friend-requests/:requestId', respondToFriendRequest);

export default router;
