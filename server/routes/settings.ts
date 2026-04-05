import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { getAllSettings, resetAllSettings, updateSetting } from '../controllers/settingsController';

const router = Router();

router.get('/', getAllSettings);
router.put('/:key', protect, updateSetting);
router.post('/reset', protect, resetAllSettings);

export default router;
