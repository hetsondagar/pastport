import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  updatePreferences,
  changePassword,
  deactivateAccount,
  searchUsers,
  refreshToken,
  logout
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validation.js';
import { 
  registerSchema, 
  loginSchema, 
  updateProfileSchema, 
  updatePreferencesSchema, 
  changePasswordSchema, 
  refreshTokenSchema,
  searchUsersSchema 
} from '../validators/auth.js';

const router = express.Router();

// Public routes
router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/refresh', validateBody(refreshTokenSchema), refreshToken);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.put('/profile', protect, validateBody(updateProfileSchema), updateProfile);
router.put('/preferences', protect, validateBody(updatePreferencesSchema), updatePreferences);
router.put('/change-password', protect, validateBody(changePasswordSchema), changePassword);
router.put('/deactivate', protect, deactivateAccount);
router.get('/search', protect, validateQuery(searchUsersSchema), searchUsers);

export default router;
