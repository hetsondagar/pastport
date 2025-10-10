import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

/**
 * Upload media to Cloudinary
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {string} fileType - Type: image, video, or audio
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<object>} Upload result with URL and metadata
 */
export const uploadToCloudinary = (fileBuffer, fileType, folder = 'pastport') => {
  return new Promise((resolve, reject) => {
    // Determine resource type based on file type
    let resourceType = 'auto';
    if (fileType.startsWith('image')) resourceType = 'image';
    else if (fileType.startsWith('video')) resourceType = 'video';
    else if (fileType.startsWith('audio')) resourceType = 'video'; // Cloudinary uses 'video' for audio

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder: folder,
        transformation: fileType.startsWith('image') 
          ? [
              { quality: 'auto', fetch_format: 'auto' },
              { width: 1920, height: 1080, crop: 'limit' }
            ]
          : undefined
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            resourceType: result.resource_type,
            width: result.width,
            height: result.height,
            size: result.bytes,
            duration: result.duration, // For video/audio
            createdAt: result.created_at
          });
        }
      }
    );

    // Convert buffer to stream and pipe to Cloudinary
    const readableStream = Readable.from(fileBuffer);
    readableStream.pipe(uploadStream);
  });
};

/**
 * Delete media from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @param {string} resourceType - Type: image, video, or raw
 * @returns {Promise<object>} Delete result
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    throw new Error(`Failed to delete from Cloudinary: ${error.message}`);
  }
};

/**
 * Get media type from mimetype
 * @param {string} mimetype - File mimetype
 * @returns {string} Media type: image, video, audio, or document
 */
export const getMediaType = (mimetype) => {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('audio/')) return 'audio';
  return 'document';
};

/**
 * Validate file size
 * @param {number} size - File size in bytes
 * @param {number} maxSize - Max size in MB
 * @returns {boolean} Is valid
 */
export const validateFileSize = (size, maxSize = 20) => {
  const maxBytes = maxSize * 1024 * 1024;
  return size <= maxBytes;
};

/**
 * Validate file type
 * @param {string} mimetype - File mimetype
 * @returns {boolean} Is valid
 */
export const validateFileType = (mimetype) => {
  const allowedTypes = [
    // Images
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    // Videos
    'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo',
    // Audio
    'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm'
  ];
  
  return allowedTypes.includes(mimetype);
};

export default {
  uploadToCloudinary,
  deleteFromCloudinary,
  getMediaType,
  validateFileSize,
  validateFileType
};

