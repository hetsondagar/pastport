import express from 'express';
import {
  getUserProfile,
  getUserBadges,
  getUserCapsules
} from '../controllers/userController.js';
import { getUserStreak } from '../controllers/streakController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// User profile routes
router.get('/:id', getUserProfile);
router.get('/:id/badges', getUserBadges);
router.get('/:id/capsules', getUserCapsules);
router.get('/:id/streak', getUserStreak);

export default router;
