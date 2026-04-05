import { Request, Response } from 'express';
import SocialLinks from '../models/SocialLinks';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

const DEFAULT_LINKS = [
  {
    platform: 'GitHub',
    url: 'https://github.com/princekumar',
    displayText: 'github.com/princekumar',
    icon: 'github',
    isVisible: true,
    order: 0
  },
  {
    platform: 'LinkedIn',
    url: 'https://linkedin.com/in/princekumar',
    displayText: 'linkedin.com/in/princekumar',
    icon: 'linkedin',
    isVisible: true,
    order: 1
  },
  {
    platform: 'Email',
    url: 'mailto:princekumaarr2005@gmail.com',
    displayText: 'princekumaarr2005@gmail.com',
    icon: 'email',
    isVisible: true,
    order: 2
  }
];

async function seedDefaultsIfEmpty(): Promise<void> {
  const count = await SocialLinks.countDocuments({});
  if (count > 0) return;
  await SocialLinks.insertMany(DEFAULT_LINKS);
}

function normalizeSocialUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^mailto:/i.test(trimmed)) {
    const email = trimmed.replace(/^mailto:/i, '').trim();
    return EMAIL_PATTERN.test(email) ? `mailto:${email}` : null;
  }

  if (EMAIL_PATTERN.test(trimmed)) {
    return `mailto:${trimmed}`;
  }

  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return candidate;
  } catch {
    return null;
  }
}

export async function getSocialLinks(req: Request, res: Response): Promise<void> {
  try {
    await seedDefaultsIfEmpty();
    const includeHidden = Boolean(req.headers.authorization);
    const links = await SocialLinks.find(includeHidden ? {} : { isVisible: true }).sort({ order: 1, _id: 1 });
    res.json({ links });
  } catch {
    res.status(500).json({ error: 'Failed to fetch social links' });
  }
}

export async function addSocialLink(req: Request, res: Response): Promise<void> {
  try {
    const { platform, url, displayText, icon, isVisible } = req.body as {
      platform?: string;
      url?: string;
      displayText?: string;
      icon?: string;
      isVisible?: boolean;
    };

    const trimmedPlatform = (platform ?? '').trim();
    const normalizedUrl = typeof url === 'string' ? normalizeSocialUrl(url) : null;

    if (!trimmedPlatform || !normalizedUrl) {
      res.status(400).json({ error: 'Platform and URL are required' });
      return;
    }

    const last = await SocialLinks.findOne({}).sort({ order: -1 });
    const created = await SocialLinks.create({
      platform: trimmedPlatform,
      url: normalizedUrl,
      displayText: (displayText ?? '').trim(),
      icon: (icon ?? '').trim(),
      isVisible: typeof isVisible === 'boolean' ? isVisible : true,
      order: (last?.order ?? -1) + 1
    });

    res.status(201).json({ message: 'Social link added', link: created });
  } catch {
    res.status(500).json({ error: 'Failed to add social link' });
  }
}

export async function updateSocialLink(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { platform, url, displayText, icon, isVisible } = req.body as {
      platform?: string;
      url?: string;
      displayText?: string;
      icon?: string;
      isVisible?: boolean;
    };

    const payload: Record<string, unknown> = {};
    if (typeof platform === 'string') {
      const trimmedPlatform = platform.trim();
      if (!trimmedPlatform) {
        res.status(400).json({ error: 'Platform cannot be empty' });
        return;
      }
      payload.platform = trimmedPlatform;
    }

    if (typeof url === 'string') {
      const normalizedUrl = normalizeSocialUrl(url);
      if (!normalizedUrl) {
        res.status(400).json({ error: 'Invalid URL format' });
        return;
      }
      payload.url = normalizedUrl;
    }

    if (typeof displayText === 'string') payload.displayText = displayText.trim();
    if (typeof icon === 'string') payload.icon = icon.trim();
    if (typeof isVisible === 'boolean') payload.isVisible = isVisible;

    const link = await SocialLinks.findByIdAndUpdate(id, payload, { new: true });
    if (!link) {
      res.status(404).json({ error: 'Social link not found' });
      return;
    }

    res.json({ message: 'Social link updated', link });
  } catch {
    res.status(500).json({ error: 'Failed to update social link' });
  }
}

export async function deleteSocialLink(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const deleted = await SocialLinks.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({ error: 'Social link not found' });
      return;
    }

    res.json({ message: 'Social link deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete social link' });
  }
}

export async function reorderLinks(req: Request, res: Response): Promise<void> {
  try {
    const { ids } = req.body as { ids?: string[] };
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ error: 'ids array is required' });
      return;
    }

    await Promise.all(
      ids.map((id, index) =>
        SocialLinks.findByIdAndUpdate(id, { order: index })
      )
    );

    const links = await SocialLinks.find({}).sort({ order: 1, _id: 1 });
    res.json({ message: 'Links reordered', links });
  } catch {
    res.status(500).json({ error: 'Failed to reorder links' });
  }
}

export async function toggleVisibility(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const link = await SocialLinks.findById(id);
    if (!link) {
      res.status(404).json({ error: 'Social link not found' });
      return;
    }

    link.isVisible = !link.isVisible;
    await link.save();

    res.json({ message: 'Visibility updated', isVisible: link.isVisible, link });
  } catch {
    res.status(500).json({ error: 'Failed to toggle visibility' });
  }
}
