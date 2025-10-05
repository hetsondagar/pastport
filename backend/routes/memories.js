import express from 'express';
import {
  getMemories,
  getMemory,
  createMemory,
  updateMemory,
  deleteMemory,
  getRelatedMemories,
  getMemoriesByCategory
} from '../controllers/memoryController.js';
import { protect } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validation.js';
import { createMemorySchema, updateMemorySchema } from '../validators/memory.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Routes
router.get('/', getMemories);
router.get('/category/:category', getMemoriesByCategory);
router.get('/:id', validateParams({ id: 'string' }), getMemory);
router.get('/:id/related', validateParams({ id: 'string' }), getRelatedMemories);
router.post('/', validateBody(createMemorySchema), createMemory);
router.put('/:id', validateParams({ id: 'string' }), validateBody(updateMemorySchema), updateMemory);
router.delete('/:id', validateParams({ id: 'string' }), deleteMemory);

export default router;
