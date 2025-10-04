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
import { validateBody, validateParams } from '../middleware/validation.js';
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

// Routes
router.get('/', getCapsules);
router.get('/stats', getCapsuleStats);
router.get('/:id', validateParams({ id: 'string' }), getCapsule);
router.post('/', uploadSingle, handleUploadError, validateBody(createCapsuleSchema), createCapsule);
router.put('/:id', validateParams({ id: 'string' }), validateBody(updateCapsuleSchema), updateCapsule);
router.delete('/:id', validateParams({ id: 'string' }), deleteCapsule);
router.post('/:id/unlock', validateParams({ id: 'string' }), validateBody(solveRiddleSchema), unlockCapsule);
router.post('/:id/attempt', validateParams({ id: 'string' }), attemptRiddle);
router.post('/:id/reactions', validateParams({ id: 'string' }), addReaction);
router.post('/:id/comments', validateParams({ id: 'string' }), validateBody(addCommentSchema), addComment);

export default router;
