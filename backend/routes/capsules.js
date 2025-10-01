import express from 'express';
import {
  getCapsules,
  getCapsule,
  createCapsule,
  updateCapsule,
  deleteCapsule,
  unlockCapsule,
  addReaction,
  addComment,
  getCapsuleStats
} from '../controllers/capsuleController.js';
import { protect } from '../middleware/auth.js';
import { validateCapsule, validateRiddleAnswer } from '../middleware/validation.js';
import { uploadSingle, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes
router.get('/', getCapsules);
router.get('/stats', getCapsuleStats);
router.get('/:id', getCapsule);
router.post('/', uploadSingle, handleUploadError, validateCapsule, createCapsule);
router.put('/:id', validateCapsule, updateCapsule);
router.delete('/:id', deleteCapsule);
router.post('/:id/unlock', validateRiddleAnswer, unlockCapsule);
router.post('/:id/reactions', addReaction);
router.post('/:id/comments', addComment);

export default router;
