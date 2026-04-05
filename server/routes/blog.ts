import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  getAllPosts,
  getAllPostsAdmin,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  togglePublish,
  toggleFeatured,
  uploadThumbnail
} from '../controllers/blogController';
import { uploadBlogThumbnail } from '../middleware/cloudinaryUpload';

const router = Router();

router.get('/', getAllPosts);
router.get('/admin', protect, getAllPostsAdmin);
router.get('/:slug', getPostBySlug);
router.post('/', protect, createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.patch('/:id/publish', protect, togglePublish);
router.patch('/:id/featured', protect, toggleFeatured);
router.post('/:id/thumbnail', protect, uploadBlogThumbnail.single('thumbnail'), uploadThumbnail);

export default router;
