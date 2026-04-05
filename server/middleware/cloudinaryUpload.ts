import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Request, Response, NextFunction } from 'express';

const cloudinaryStorageFactory = require('multer-storage-cloudinary');

function createCloudinaryStorage(folder: string) {
  console.log(`📤 Creating Cloudinary storage for folder: ${folder}`);
  return cloudinaryStorageFactory({
    cloudinary,
    params: async () => ({
      folder: `portfolio/${folder}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
    })
  });
}

const memoryStorage = multer.memoryStorage();

// Use memory storage for profile images and upload explicitly in controller
// to avoid middleware-level streaming timeouts.
export const uploadProfileImage = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

export const uploadCertificationImage = process.env.CLOUDINARY_CLOUD_NAME
  ? multer({ storage: memoryStorage, limits: { fileSize: 5 * 1024 * 1024 } })
  : multer({ storage: memoryStorage, limits: { fileSize: 5 * 1024 * 1024 } });

export const uploadProjectImage = process.env.CLOUDINARY_CLOUD_NAME
  ? multer({ storage: memoryStorage, limits: { fileSize: 5 * 1024 * 1024 } })
  : multer({ storage: memoryStorage, limits: { fileSize: 5 * 1024 * 1024 } });

export const uploadBlogThumbnail = process.env.CLOUDINARY_CLOUD_NAME
  ? multer({ storage: createCloudinaryStorage('blog'), limits: { fileSize: 5 * 1024 * 1024 } })
  : multer({ storage: memoryStorage, limits: { fileSize: 5 * 1024 * 1024 } });

/**
 * Wrapper to catch multer errors in route handlers
 */
export function wrapMulterRoute(
  handler: (req: Request, res: Response) => Promise<void>
): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('📋 Multer route handler executing with file:', req.file?.filename || 'no file');
      await handler(req, res);
    } catch (err) {
      // Check if it's an AbortError (client canceled the request)
      if (err instanceof Error && err.message.includes('aborted')) {
        console.log('ℹ️ Request was aborted by client - this is normal if user canceled upload');
        return; // Don't send response, connection already closed
      }
      console.error('❌ Multer/Upload error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'File upload failed. Please try again.' });
      }
    }
  };
}
