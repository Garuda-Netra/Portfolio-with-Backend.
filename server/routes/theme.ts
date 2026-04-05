import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { getActiveTheme, resetTheme, updateTheme } from '../controllers/themeController';

const router = Router();

router.get('/', getActiveTheme);
router.put('/', protect, updateTheme);
router.post('/reset', protect, resetTheme);

export default router;
