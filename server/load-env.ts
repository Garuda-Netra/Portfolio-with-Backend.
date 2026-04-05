import path from 'path';
import dotenv from 'dotenv';

// Resolve paths relative to this file's location (server directory)
// Go up one level to root, then find .env
const rootDir = path.resolve(__dirname, '..');
const rootEnv = path.resolve(rootDir, '.env');
const serverEnv = path.resolve(__dirname, '.env');
const envPath = rootEnv;

console.log('Loading env from:', envPath);
dotenv.config({ path: envPath });
dotenv.config({ path: serverEnv }); // Fallback for backwards compatibility

console.log('MONGO_URI loaded:', process.env.MONGO_URI ? 'YES' : 'NO');
console.log('JWT_SECRET loaded:', process.env.JWT_SECRET ? 'YES' : 'NO');
console.log('CLOUDINARY loaded:', process.env.CLOUDINARY_CLOUD_NAME ? 'YES' : 'NO');
