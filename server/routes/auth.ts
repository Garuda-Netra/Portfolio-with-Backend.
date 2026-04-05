import { Router } from 'express';
import { setup, resetAdmin, login, verify, logout, changePassword, changeUsername } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import rateLimit from 'express-rate-limit';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts. Please wait 15 minutes.' }
});

router.post('/setup', setup);
router.post('/reset-admin', resetAdmin);

router.post('/login', loginLimiter, login);
router.get('/verify', protect, verify);
router.post('/logout', protect, logout);
router.put('/change-username', protect, changeUsername);
router.put('/change-password', protect, changePassword);

export default router;
