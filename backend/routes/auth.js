import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  updatePreferences,
  changePassword,
  deactivateAccount,
  searchUsers
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validateUser, validateLogin } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/register', validateUser, register);
router.post('/login', validateLogin, login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/preferences', protect, updatePreferences);
router.put('/change-password', protect, changePassword);
router.put('/deactivate', protect, deactivateAccount);
router.get('/search', protect, searchUsers);

export default router;
