import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  clearAnalytics,
  getAnalyticsByDateRange,
  getAnalyticsSummary,
  getRecentActivity,
  trackEvent
} from '../controllers/analyticsController';

const router = Router();

router.post('/track', trackEvent);
router.get('/summary', protect, getAnalyticsSummary);
router.get('/recent', protect, getRecentActivity);
router.get('/range', protect, getAnalyticsByDateRange);
router.delete('/clear', protect, clearAnalytics);

export default router;
