import express from 'express';
import multer from 'multer';
import {
  uploadMedia,
  getEntryMedia,
  deleteMedia,
  getUserMedia
} from '../controllers/mediaController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for memory storage (files stored in buffer)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images, videos, and audio
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|webm|mov|avi|mp3|wav|ogg|m4a/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, videos, and audio files are allowed.'));
    }
  }
});

// All routes are protected
router.use(protect);

// Media routes
router.post('/upload', upload.single('file'), uploadMedia);
router.get('/:entryType/:entryId', getEntryMedia);
router.get('/user/:userId', getUserMedia);
router.delete('/:id', deleteMedia);

export default router;

