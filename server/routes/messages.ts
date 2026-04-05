import { Router } from 'express';
import {
  submitMessage,
  getAllMessages,
  getMessageById,
  toggleStar,
  markAsRead,
  deleteMessage,
  getUnreadCount
} from '../controllers/messageController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/', submitMessage);
router.get('/', protect, getAllMessages);
router.get('/unread-count', protect, getUnreadCount);
router.get('/:id', protect, getMessageById);
router.patch('/:id/read', protect, markAsRead);
router.patch('/:id/star', protect, toggleStar);
router.delete('/:id', protect, deleteMessage);

export default router;
