import { Router, Request, Response } from 'express';
import {
  getAllProjects,
  getAllProjectsAdmin,
  addProject,
  updateProject,
  deleteProject,
  reorderProjects,
  toggleVisibility,
  deleteAllProjects
} from '../controllers/projectController';
import { protect } from '../middleware/authMiddleware';
import { uploadProjectImage, wrapMulterRoute } from '../middleware/cloudinaryUpload';
import Project from '../models/Project';
import { uploadBufferToCloudinary } from '../config/cloudinary';

const router = Router();

router.get('/', getAllProjects);
router.get('/admin', protect, getAllProjectsAdmin);
router.post('/', protect, uploadProjectImage.single('image'), addProject);
router.put('/:id', protect, uploadProjectImage.single('image'), updateProject);
router.delete('/clear-all', protect, deleteAllProjects);
router.delete('/:id', protect, deleteProject);
router.patch('/reorder', protect, reorderProjects);
router.patch('/:id/visibility', protect, toggleVisibility);
router.post('/:id/upload-image', protect, uploadProjectImage.single('image'), wrapMulterRoute(async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: 'No image uploaded' });
    return;
  }

  const uploadFile = req.file as Express.Multer.File;
  if (!uploadFile.buffer) {
    res.status(500).json({ error: 'Upload failed' });
    return;
  }

  const uploadResult = await uploadBufferToCloudinary(uploadFile.buffer, 'portfolio/projects');
  const imageUrl = (uploadResult.secure_url ?? '').trim();
  if (!imageUrl) {
    res.status(500).json({ error: 'Upload failed' });
    return;
  }

  await Project.findByIdAndUpdate(req.params.id, { imageUrl });
  res.json({ message: 'Image uploaded', imageUrl });
}));

export default router;
