import express from 'express';
import {
  getLotteryCapsule,
  unlockLotteryCapsule,
  getLotteryHistory
} from '../controllers/lotteryController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Lottery routes
router.get('/', getLotteryCapsule);
router.get('/history', getLotteryHistory);
router.patch('/:id/unlock', unlockLotteryCapsule);

export default router;
