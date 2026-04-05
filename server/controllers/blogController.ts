import { Request, Response } from 'express';
import BlogPost from '../models/BlogPost';
import { logAction } from '../utils/logger';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

function calculateReadTime(content: string): number {
  return Math.ceil(content.split(/\s+/).filter(Boolean).length / 200) || 1;
}

async function ensureUniqueSlug(title: string, excludeId?: string): Promise<string> {
  const base = generateSlug(title);
  let slug = base || `post-${Date.now()}`;
  let suffix = 1;

  while (true) {
    const existing = await BlogPost.findOne({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) });
    if (!existing) return slug;
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
}

export async function getAllPosts(_req: Request, res: Response): Promise<void> {
  try {
    const featuredOnly = String(_req.query.featured ?? '').toLowerCase() === 'true';
    const criteria: Record<string, unknown> = { isPublished: true };

    if (featuredOnly) {
      criteria.isFeatured = true;
    }

    const posts = await BlogPost.find(criteria).sort({ publishedDate: -1, createdDate: -1 });
    res.json({ posts });
  } catch {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
}

export async function getAllPostsAdmin(_req: Request, res: Response): Promise<void> {
  try {
    const posts = await BlogPost.find({}).sort({ createdDate: -1 });
    res.json({ posts });
  } catch {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
}

export async function getPostBySlug(req: Request, res: Response): Promise<void> {
  try {
    const { slug } = req.params;
    const post = await BlogPost.findOneAndUpdate({ slug, isPublished: true }, { $inc: { views: 1 } }, { new: true });

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    res.json({ post });
  } catch {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
}

export async function createPost(req: Request, res: Response): Promise<void> {
  try {
    const { title, content, excerpt, tags, category, isPublished, isFeatured } = req.body as {
      title?: string;
      content?: string;
      excerpt?: string;
      tags?: string[];
      category?: string;
      isPublished?: boolean;
      isFeatured?: boolean;
    };

    if (!title?.trim()) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    const safeContent = (content ?? '').trim();
    const slug = await ensureUniqueSlug(title);
    const post = await BlogPost.create({
      title: title.trim(),
      slug,
      content: safeContent,
      excerpt: (excerpt ?? '').trim(),
      tags: Array.isArray(tags) ? tags.map((tag) => String(tag).trim()).filter(Boolean) : [],
      category: (category ?? 'Other').trim() || 'Other',
      isPublished: Boolean(isPublished),
      isFeatured: Boolean(isFeatured),
      publishedDate: isPublished ? new Date() : undefined,
      readTime: calculateReadTime(safeContent)
    });

    res.status(201).json({ message: 'Post created', post });
  } catch {
    res.status(500).json({ error: 'Failed to create post' });
  }
}

export async function updatePost(req: Request, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { title, content, excerpt, tags, category, isPublished, isFeatured } = req.body as {
      title?: string;
      content?: string;
      excerpt?: string;
      tags?: string[];
      category?: string;
      isPublished?: boolean;
      isFeatured?: boolean;
    };

    const payload: Record<string, unknown> = {};

    if (typeof title === 'string' && title.trim()) {
      payload.title = title.trim();
      payload.slug = await ensureUniqueSlug(title, id);
    }
    if (typeof content === 'string') {
      payload.content = content.trim();
      payload.readTime = calculateReadTime(content.trim());
    }
    if (typeof excerpt === 'string') payload.excerpt = excerpt.trim();
    if (Array.isArray(tags)) payload.tags = tags.map((tag) => String(tag).trim()).filter(Boolean);
    if (typeof category === 'string') payload.category = category.trim() || 'Other';
    if (typeof isPublished === 'boolean') {
      payload.isPublished = isPublished;
      payload.publishedDate = isPublished ? new Date() : undefined;
    }
    if (typeof isFeatured === 'boolean') {
      payload.isFeatured = isFeatured;
    }

    const post = await BlogPost.findByIdAndUpdate(id, payload, { new: true });
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    res.json({ message: 'Post updated', post });
  } catch {
    res.status(500).json({ error: 'Failed to update post' });
  }
}

export async function deletePost(req: Request, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const post = await BlogPost.findByIdAndDelete(id);

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    await logAction('Blog post deleted', 'success', req, { title: post.title });
    res.json({ message: 'Post deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete post' });
  }
}

export async function togglePublish(req: Request, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const post = await BlogPost.findById(id);

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    post.isPublished = !post.isPublished;
    post.publishedDate = post.isPublished ? new Date() : undefined;
    await post.save();

    if (post.isPublished) {
      await logAction('Blog post published', 'success', req, { title: post.title });
    }

    res.json({ message: 'Publish status updated', post });
  } catch {
    res.status(500).json({ error: 'Failed to update publish status' });
  }
}

export async function toggleFeatured(req: Request, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const post = await BlogPost.findById(id);

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    post.isFeatured = !post.isFeatured;
    await post.save();

    res.json({ message: 'Featured status updated', post });
  } catch {
    res.status(500).json({ error: 'Failed to update featured status' });
  }
}

export async function uploadThumbnail(req: Request, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const file = req.file as (Express.Multer.File & { path?: string }) | undefined;

    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const thumbnailUrl = file.path || '';
    if (!thumbnailUrl) {
      res.status(500).json({ error: 'Upload failed' });
      return;
    }

    const post = await BlogPost.findByIdAndUpdate(id, { thumbnailUrl }, { new: true });
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    await logAction('Blog thumbnail uploaded', 'success', req, { title: post.title });
    res.json({ message: 'Thumbnail uploaded', post });
  } catch {
    res.status(500).json({ error: 'Failed to upload thumbnail' });
  }
}
