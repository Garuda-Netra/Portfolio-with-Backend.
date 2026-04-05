import { Router } from 'express';
import {
  getAllContent,
  getContentBySection,
  updateContent,
  resetContent
} from '../controllers/contentController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.get('/', protect, getAllContent);
router.get('/:section', getContentBySection);
router.put('/:section', protect, updateContent);
router.delete('/:section', protect, resetContent);

export default router;
