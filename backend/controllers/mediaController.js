import Media from '../models/Media.js';
import Capsule from '../models/Capsule.js';
import JournalEntry from '../models/JournalEntry.js';
import { 
  uploadToCloudinary, 
  deleteFromCloudinary, 
  getMediaType, 
  validateFileSize, 
  validateFileType 
} from '../utils/mediaUpload.js';

// @desc    Upload media to Cloudinary and save to DB
// @route   POST /api/media/upload
// @access  Private
export const uploadMedia = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { entryId, entryType, caption } = req.body;

    // Check if file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Validate file type
    if (!validateFileType(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only images, videos, and audio files are allowed.'
      });
    }

    // Validate file size (20MB limit)
    if (!validateFileSize(req.file.size, 20)) {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds 20MB limit'
      });
    }

    // Get media type
    const mediaType = getMediaType(req.file.mimetype);

    // Upload to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(
      req.file.buffer,
      req.file.mimetype,
      `pastport/${entryType || 'general'}`
    );

    // Create media document
    const media = await Media.create({
      userId,
      entryId: entryId || null,
      entryType: entryType || 'profile',
      url: cloudinaryResult.url,
      publicId: cloudinaryResult.publicId,
      type: mediaType,
      format: cloudinaryResult.format,
      resourceType: cloudinaryResult.resourceType,
      width: cloudinaryResult.width,
      height: cloudinaryResult.height,
      size: cloudinaryResult.size,
      duration: cloudinaryResult.duration,
      caption: caption || ''
    });

    // If entryId provided, add media to the entry
    if (entryId && entryType) {
      const mediaData = {
        url: cloudinaryResult.url,
        publicId: cloudinaryResult.publicId,
        type: mediaType,
        format: cloudinaryResult.format,
        resourceType: cloudinaryResult.resourceType,
        width: cloudinaryResult.width,
        height: cloudinaryResult.height,
        size: cloudinaryResult.size,
        duration: cloudinaryResult.duration,
        caption: caption || ''
      };

      if (entryType === 'capsule') {
        await Capsule.findByIdAndUpdate(entryId, {
          $push: { media: mediaData }
        });
      } else if (entryType === 'journal') {
        await JournalEntry.findByIdAndUpdate(entryId, {
          $push: { media: mediaData }
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Media uploaded successfully',
      data: {
        media,
        cloudinaryUrl: cloudinaryResult.url
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get media for an entry
// @route   GET /api/media/:entryType/:entryId
// @access  Private
export const getEntryMedia = async (req, res, next) => {
  try {
    const { entryType, entryId } = req.params;

    const media = await Media.getEntryMedia(entryId, entryType);

    res.json({
      success: true,
      data: {
        media,
        count: media.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete media
// @route   DELETE /api/media/:id
// @access  Private
export const deleteMedia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const media = await Media.findById(id);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    // Check ownership
    if (media.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this media'
      });
    }

    // Delete from Cloudinary
    await deleteFromCloudinary(media.publicId, media.resourceType);

    // Remove from parent entry if exists
    if (media.entryId) {
      if (media.entryType === 'capsule') {
        await Capsule.findByIdAndUpdate(media.entryId, {
          $pull: { media: { publicId: media.publicId } }
        });
      } else if (media.entryType === 'journal') {
        await JournalEntry.findByIdAndUpdate(media.entryId, {
          $pull: { media: { publicId: media.publicId } }
        });
      }
    }

    // Delete from database
    await Media.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Media deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all media for user
// @route   GET /api/media/user/:userId
// @access  Private
export const getUserMedia = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // Only allow users to get their own media
    if (userId !== currentUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this media'
      });
    }

    const media = await Media.find({ userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        media,
        count: media.length
      }
    });
  } catch (error) {
    next(error);
  }
};

export default {
  uploadMedia,
  getEntryMedia,
  deleteMedia,
  getUserMedia
};

