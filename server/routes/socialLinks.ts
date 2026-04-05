import { Router } from 'express';
import {
  getSocialLinks,
  addSocialLink,
  updateSocialLink,
  deleteSocialLink,
  reorderLinks,
  toggleVisibility
} from '../controllers/socialLinksController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getSocialLinks);
router.post('/', protect, addSocialLink);
router.put('/:id', protect, updateSocialLink);
router.delete('/:id', protect, deleteSocialLink);
router.patch('/reorder', protect, reorderLinks);
router.patch('/:id/visibility', protect, toggleVisibility);

export default router;
