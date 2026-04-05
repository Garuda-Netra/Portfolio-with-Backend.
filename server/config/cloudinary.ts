import { v2 as cloudinary } from 'cloudinary';

type UploadConfig = {
  resourceType?: 'image' | 'raw' | 'video' | 'auto';
  publicId?: string;
};

export function initCloudinary(): void {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    console.warn('⚠️ Cloudinary credentials not found. Image upload will be disabled.');
    return;
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  console.log('✅ Cloudinary configured successfully');
}

export async function uploadBufferToCloudinary(
  fileBuffer: Buffer,
  folder: string,
  timeoutMs = 30000
): Promise<{ secure_url?: string; public_id?: string }> {
  return await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Cloudinary upload timed out'));
    }, timeoutMs);

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image'
      },
      (error, result) => {
        clearTimeout(timeout);
        if (error) {
          reject(error);
          return;
        }
        resolve(result ?? {});
      }
    );

    stream.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    stream.end(fileBuffer);
  });
}

function sanitizePublicId(name: string): string {
  return name
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80) || 'file';
}

async function uploadBufferWithConfig(
  fileBuffer: Buffer,
  folder: string,
  config: UploadConfig,
  timeoutMs = 30000
): Promise<{ secure_url?: string; public_id?: string }> {
  return await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Cloudinary upload timed out'));
    }, timeoutMs);

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: config.resourceType ?? 'image',
        public_id: config.publicId
      },
      (error, result) => {
        clearTimeout(timeout);
        if (error) {
          reject(error);
          return;
        }
        resolve(result ?? {});
      }
    );

    stream.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    stream.end(fileBuffer);
  });
}

export async function uploadRawBufferToCloudinary(
  fileBuffer: Buffer,
  folder: string,
  originalName: string,
  timeoutMs = 30000
): Promise<{ secure_url?: string; public_id?: string }> {
  const timestamp = Date.now();
  const baseName = sanitizePublicId(originalName || 'resume');
  return await uploadBufferWithConfig(
    fileBuffer,
    folder,
    {
      resourceType: 'raw',
      publicId: `${baseName}_${timestamp}`
    },
    timeoutMs
  );
}

export default cloudinary;
