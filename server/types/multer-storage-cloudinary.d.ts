declare module 'multer-storage-cloudinary' {
  import type { StorageEngine } from 'multer';

  export class CloudinaryStorage implements StorageEngine {
    constructor(options: unknown);
    _handleFile(req: unknown, file: unknown, callback: (error?: unknown, info?: Partial<Express.Multer.File>) => void): void;
    _removeFile(req: unknown, file: unknown, callback: (error: Error | null) => void): void;
  }
}
