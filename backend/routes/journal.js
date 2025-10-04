import express from 'express';
import {
  getMonthEntries,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  unlockJournalEntry,
  getJournalStreak
} from '../controllers/journalController.js';
import { protect } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validation.js';
import { 
  createJournalEntrySchema, 
  updateJournalEntrySchema,
  unlockJournalEntrySchema 
} from '../validators/journal.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Journal routes
router.get('/streak', getJournalStreak);
router.get('/:userId/month/:year/:month', getMonthEntries);
router.post('/', validateBody(createJournalEntrySchema), createJournalEntry);
router.put('/:id', validateParams({ id: 'string' }), validateBody(updateJournalEntrySchema), updateJournalEntry);
router.delete('/:id', validateParams({ id: 'string' }), deleteJournalEntry);
router.patch('/:id/unlock', validateParams({ id: 'string' }), validateBody(unlockJournalEntrySchema), unlockJournalEntry);

export default router;
