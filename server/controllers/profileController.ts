import { Request, Response } from 'express';
import Profile from '../models/Profile';
import { logAction } from '../utils/logger';
import { AuthRequest } from '../middleware/authMiddleware';
import { uploadBufferToCloudinary } from '../config/cloudinary';

const DEFAULT_PROFILE = {
  name: 'Prince Kumar',
  title: 'Cybersecurity Enthusiast | Digital Forensics Learner',
  tagline: 'Exploring the digital frontier, one vulnerability at a time.',
  email: 'princekumaarr2005@gmail.com',
  bio: 'I am Prince Kumar, a B.Tech student with a burning passion for cybersecurity and digital forensics. I love building, breaking, and defending systems with a security-first mindset.',
  profileImageUrl: '',
  githubUrl: 'https://github.com/princekumar',
  linkedinUrl: 'https://linkedin.com/in/princekumar',
  typingTitles: ['Cybersecurity Enthusiast', 'Digital Forensics Learner', 'Red Teamer & Blue Teamer']
};

export async function getProfile(_req: Request, res: Response): Promise<void> {
  try {
    const profile = await Profile.findOne({}).lean();
    if (!profile) {
      res.json({ profile: { ...DEFAULT_PROFILE, lastUpdated: new Date().toISOString() } });
      return;
    }

    res.json({ profile });
  } catch {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  try {
    const {
      name,
      title,
      tagline,
      email,
      bio,
      profileImageUrl,
      githubUrl,
      linkedinUrl,
      typingTitles
    } = req.body as {
      name?: string;
      title?: string;
      tagline?: string;
      email?: string;
      bio?: string;
      profileImageUrl?: string;
      githubUrl?: string;
      linkedinUrl?: string;
      typingTitles?: string[];
    };

    const payload: Record<string, unknown> = {
      lastUpdated: new Date()
    };

    if (typeof name === 'string') payload.name = name.trim();
    if (typeof title === 'string') payload.title = title.trim();
    if (typeof tagline === 'string') payload.tagline = tagline.trim();
    if (typeof email === 'string') payload.email = email.trim();
    if (typeof bio === 'string') payload.bio = bio.trim();
    if (typeof profileImageUrl === 'string') payload.profileImageUrl = profileImageUrl.trim();
    if (typeof githubUrl === 'string') payload.githubUrl = githubUrl.trim();
    if (typeof linkedinUrl === 'string') payload.linkedinUrl = linkedinUrl.trim();

    if (Array.isArray(typingTitles)) {
      const safeTitles = typingTitles
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
        .slice(0, 12);
      if (safeTitles.length > 0) {
        payload.typingTitles = safeTitles;
      }
    }

    const profile = await Profile.findOneAndUpdate({}, payload, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    });

    await logAction('Profile updated', 'success', req);

    res.json({ message: 'Profile updated successfully', profile });
  } catch {
    res.status(500).json({ error: 'Failed to update profile' });
  }
}

export async function uploadProfileImage(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No image uploaded' });
      return;
    }

    const uploadFile = req.file as Express.Multer.File & { path?: string };
    let imageUrl = '';

    if (uploadFile.buffer) {
      const uploadResult = await uploadBufferToCloudinary(uploadFile.buffer, 'portfolio/profile');
      imageUrl = (uploadResult.secure_url ?? '').trim();
    } else if (uploadFile.path) {
      // Backward compatibility if storage middleware provides remote path.
      imageUrl = uploadFile.path;
    }

    if (!imageUrl) {
      res.status(500).json({ error: 'Upload failed' });
      return;
    }

    const profile = await Profile.findOneAndUpdate(
      {},
      { profileImageUrl: imageUrl, lastUpdated: new Date() },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    void logAction('Profile image uploaded', 'success', req, { filename: uploadFile.filename }).catch((logError) => {
      console.error('logAction failed (profile image upload):', logError);
    });

    res.json({
      message: 'Profile image uploaded successfully',
      imageUrl,
      profileImageUrl: imageUrl,
      profile
    });
  } catch {
    res.status(500).json({ error: 'Upload failed' });
  }
}
