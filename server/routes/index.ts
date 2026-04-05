import { Router } from 'express';
import authRoutes from './auth';
import messageRoutes from './messages';
import profileRoutes from './profile';
import certRoutes from './certifications';
import contentRoutes from './content';
import socialRoutes from './socialLinks';
import blogRoutes from './blog';
import settingsRoutes from './settings';
import resumeRoutes from './resume';
import projectRoutes from './projects';
import themeRoutes from './theme';
import analyticsRoutes from './analytics';

const router = Router();

router.use('/auth', authRoutes);
router.use('/messages', messageRoutes);
router.use('/profile', profileRoutes);
router.use('/certifications', certRoutes);
router.use('/content', contentRoutes);
router.use('/social-links', socialRoutes);
router.use('/blog', blogRoutes);
router.use('/settings', settingsRoutes);
router.use('/resume', resumeRoutes);
router.use('/projects', projectRoutes);
router.use('/theme', themeRoutes);
router.use('/analytics', analyticsRoutes);

export default router;