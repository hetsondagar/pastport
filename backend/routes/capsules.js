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
import { attemptRiddle } from '../controllers/riddleController.js';
import { protect } from '../middleware/auth.js';
import { validateBody, validateParams, validateFormData, validateObjectId } from '../middleware/validation.js';
import { 
  createCapsuleSchema, 
  updateCapsuleSchema, 
  solveRiddleSchema,
  addCommentSchema 
} from '../validators/capsule.js';
import { uploadSingle, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes - specific routes first
router.get('/', getCapsules);
router.get('/stats', getCapsuleStats);
router.post('/', uploadSingle, handleUploadError, validateFormData(createCapsuleSchema), createCapsule);
router.post('/:id/unlock', validateObjectId('id'), validateBody(solveRiddleSchema), unlockCapsule);
router.post('/:id/attempt', validateObjectId('id'), validateBody(solveRiddleSchema), attemptRiddle);
router.post('/:id/reactions', validateObjectId('id'), addReaction);
router.post('/:id/comments', validateObjectId('id'), validateBody(addCommentSchema), addComment);
router.get('/:id', validateObjectId('id'), getCapsule);
router.put('/:id', validateObjectId('id'), validateBody(updateCapsuleSchema), updateCapsule);
router.delete('/:id', validateObjectId('id'), deleteCapsule);

export default router;
