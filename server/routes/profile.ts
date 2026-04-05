import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  uploadProfileImage as uploadProfileImageHandler
} from '../controllers/profileController';
import { protect } from '../middleware/authMiddleware';
import { uploadProfileImage, wrapMulterRoute } from '../middleware/cloudinaryUpload';

const router = Router();

router.get('/', getProfile);
router.put('/', protect, updateProfile);
router.post('/upload-image', protect, uploadProfileImage.single('image'), wrapMulterRoute(async (req, res) => {
  await uploadProfileImageHandler(req, res);
}));

export default router;
