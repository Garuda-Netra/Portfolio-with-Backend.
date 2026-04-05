import { Router, Request, Response } from 'express';
import {
  getAllCertifications,
  getAllCertificationsAdmin,
  addCertification,
  updateCertification,
  deleteCertification,
  reorderCertifications,
  toggleVisibility,
  deleteAllCertifications
} from '../controllers/certificationController';
import { protect } from '../middleware/authMiddleware';
import { uploadCertificationImage, wrapMulterRoute } from '../middleware/cloudinaryUpload';
import Certification from '../models/Certification';
import { uploadBufferToCloudinary } from '../config/cloudinary';

const router = Router();

router.get('/', getAllCertifications);
router.get('/admin', protect, getAllCertificationsAdmin);
router.post('/', protect, uploadCertificationImage.single('image'), addCertification);
router.put('/:id', protect, uploadCertificationImage.single('image'), updateCertification);
router.delete('/clear-all', protect, deleteAllCertifications);
router.delete('/:id', protect, deleteCertification);
router.patch('/reorder', protect, reorderCertifications);
router.patch('/:id/visibility', protect, toggleVisibility);
router.post('/:id/upload-image', protect, uploadCertificationImage.single('image'), wrapMulterRoute(async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: 'No image uploaded' });
    return;
  }

  const uploadFile = req.file as Express.Multer.File;
  if (!uploadFile.buffer) {
    res.status(500).json({ error: 'Upload failed' });
    return;
  }

  const uploadResult = await uploadBufferToCloudinary(uploadFile.buffer, 'portfolio/certifications');
  const imageUrl = (uploadResult.secure_url ?? '').trim();
  if (!imageUrl) {
    res.status(500).json({ error: 'Upload failed' });
    return;
  }

  await Certification.findByIdAndUpdate(req.params.id, { imageUrl });
  res.json({ message: 'Image uploaded', imageUrl });
}));

export default router;
