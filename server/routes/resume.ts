import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { uploadResumePDF } from '../middleware/upload';
import {
  getResumeInfo,
  uploadResume,
  deleteResume,
  incrementDownloadCount
} from '../controllers/resumeController';

const router = Router();

router.get('/', getResumeInfo);
router.post('/upload', protect, uploadResumePDF.single('resume'), uploadResume);
router.delete('/:id', protect, deleteResume);
router.post('/downloaded', incrementDownloadCount);

export default router;
