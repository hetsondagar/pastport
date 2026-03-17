import express from 'express';
import { protect } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import Joi from 'joi';

import { processEntry, chat, analytics, embeddingsCount } from '../controllers/aiController.js';

const router = express.Router();
router.use(protect);

const processEntrySchema = Joi.object({
  sourceType: Joi.string().valid('journal', 'capsule').required(),
  sourceId: Joi.string().required(),
});

const chatSchema = Joi.object({
  userId: Joi.string().required(),
  mode: Joi.string().valid('past', 'present', 'future').required(),
  timestamp: Joi.date().optional(),
  message: Joi.string().min(1).max(4000).required(),
});

router.post('/process-entry', validateBody(processEntrySchema), processEntry);
router.post('/chat', validateBody(chatSchema), chat);
router.get('/analytics', analytics);

// useful sanity check
router.get('/counts', embeddingsCount);

export default router;


