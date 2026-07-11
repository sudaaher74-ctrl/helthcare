import multer from 'multer';
import { Request } from 'express';
import cloudinary from '../config/cloudinary';

// Use MemoryStorage: Files are stored in memory as buffers instead of saving to disk
const storage = multer.memoryStorage();

// Multer upload configuration with file size limits (5MB)
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'));
    }
  },
});

/**
 * Uploads a buffer directly to Cloudinary using upload_stream.
 * This is the modern, official approach replacing multer-storage-cloudinary.
 */
export const uploadToCloudinary = async (fileBuffer: Buffer, folder: string = 'uploads'): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Upload Error:', error);
          return reject(error);
        }
        if (result && result.secure_url) {
          resolve(result.secure_url);
        } else {
          reject(new Error('Upload succeeded but no URL was returned.'));
        }
      }
    );

    // Write the buffer to the upload stream
    uploadStream.end(fileBuffer);
  });
};
