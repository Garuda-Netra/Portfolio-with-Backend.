import { Request, Response } from 'express';
import Project from '../models/Project';
import { logAction } from '../utils/logger';
import { uploadBufferToCloudinary } from '../config/cloudinary';

export async function getAllProjects(_req: Request, res: Response): Promise<void> {
  try {
    const projects = await Project.find({ isVisible: true }).sort({ order: 1, _id: 1 });
    res.json({ projects });
  } catch {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
}

export async function getAllProjectsAdmin(_req: Request, res: Response): Promise<void> {
  try {
    const projects = await Project.find({}).sort({ order: 1, _id: 1 });
    res.json({ projects });
  } catch {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
}

export async function addProject(req: Request, res: Response): Promise<void> {
  try {
    const body = req.body as Record<string, unknown>;
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const description = typeof body.description === 'string' ? body.description.trim() : '';
    const tags = Array.isArray(body.tags) ? body.tags.map((tag: unknown) => typeof tag === 'string' ? tag.trim() : '').filter(Boolean) : [];
    const link = typeof body.link === 'string' ? body.link.trim() : '';
    const github = typeof body.github === 'string' ? body.github.trim() : '';
    const accentColor = typeof body.accentColor === 'string' ? body.accentColor.trim() : '#00E5FF';

    if (!title || !description) {
      res.status(400).json({ error: 'Title and description are required' });
      return;
    }

    if (title.length > 200 || description.length > 2000 || link.length > 2048 || github.length > 2048) {
      res.status(400).json({ error: 'One or more fields exceed allowed length' });
      return;
    }

    const uploadFile = req.file as Express.Multer.File | undefined;
    console.log('addProject: file received', {
      hasFile: !!uploadFile,
      size: uploadFile?.size,
      mime: uploadFile?.mimetype
    });

    let imageUrl = '';
    if (uploadFile?.buffer) {
      const uploadResult = await uploadBufferToCloudinary(uploadFile.buffer, 'portfolio/projects');
      imageUrl = (uploadResult.secure_url ?? '').trim();
    }
    const order = Date.now();

    const project = await Project.create({
      title,
      description,
      tags,
      link,
      github,
      imageUrl,
      accentColor,
      order,
      isVisible: true
    });

    void logAction('Project created', 'success', req, { title: project.title }).catch((logError) => {
      console.error('logAction failed (create project):', logError);
    });

    res.status(201).json({ message: 'Project created', project });
  } catch (error) {
    console.error('❌ addProject error:', error);
    res.status(500).json({ error: 'Failed to add project' });
  }
}

export async function updateProject(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const body = req.body as Record<string, unknown>;
    const title = typeof body.title === 'string' ? body.title.trim() : undefined;
    const description = typeof body.description === 'string' ? body.description.trim() : undefined;
    const tags = Array.isArray(body.tags) ? body.tags.map((tag: unknown) => typeof tag === 'string' ? tag.trim() : '').filter(Boolean) : undefined;
    const link = typeof body.link === 'string' ? body.link.trim() : undefined;
    const github = typeof body.github === 'string' ? body.github.trim() : undefined;
    const accentColor = typeof body.accentColor === 'string' ? body.accentColor.trim() : undefined;

    const uploadFile = req.file as Express.Multer.File | undefined;
    console.log('updateProject: file received', {
      hasFile: !!uploadFile,
      size: uploadFile?.size,
      mime: uploadFile?.mimetype
    });

    const payload: Record<string, unknown> = {};
    if (typeof title === 'string') payload.title = title;
    if (typeof description === 'string') payload.description = description;
    if (Array.isArray(tags)) payload.tags = tags;
    if (typeof link === 'string') payload.link = link;
    if (typeof github === 'string') payload.github = github;
    if (typeof accentColor === 'string') payload.accentColor = accentColor;
    if (uploadFile?.buffer) {
      const uploadResult = await uploadBufferToCloudinary(uploadFile.buffer, 'portfolio/projects');
      if (uploadResult.secure_url) {
        payload.imageUrl = uploadResult.secure_url;
      }
    }

    const project = await Project.findByIdAndUpdate(id, payload, { new: true });
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    void logAction('Project updated', 'success', req, { id }).catch((logError) => {
      console.error('logAction failed (update project):', logError);
    });
    res.json({ message: 'Project updated', project });
  } catch (error) {
    console.error('❌ updateProject error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
}

export async function deleteProject(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const deleted = await Project.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    void logAction('Project deleted', 'success', req, { id }).catch((logError) => {
      console.error('logAction failed (delete project):', logError);
    });
    res.json({ message: 'Project deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete project' });
  }
}

export async function reorderProjects(req: Request, res: Response): Promise<void> {
  try {
    const { ids } = req.body as { ids?: string[] };
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ error: 'ids array is required' });
      return;
    }

    await Promise.all(
      ids.map((id, index) => Project.findByIdAndUpdate(id, { order: index }))
    );

    const projects = await Project.find({}).sort({ order: 1, _id: 1 });
    res.json({ message: 'Projects reordered', projects });
  } catch {
    res.status(500).json({ error: 'Failed to reorder projects' });
  }
}

export async function toggleVisibility(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    project.isVisible = !project.isVisible;
    await project.save();

    res.json({ message: 'Visibility updated', isVisible: project.isVisible, project });
  } catch {
    res.status(500).json({ error: 'Failed to toggle visibility' });
  }
}

export async function deleteAllProjects(req: Request, res: Response): Promise<void> {
  try {
    const result = await Project.deleteMany({});
    console.log('deleteAllProjects: deletedCount =', result.deletedCount ?? 0);
    void logAction('All projects deleted', 'success', req, { deletedCount: result.deletedCount }).catch((logError) => {
      console.error('logAction failed (delete all projects):', logError);
    });
    res.json({ message: 'All projects deleted', deletedCount: result.deletedCount });
  } catch (error) {
    console.error('❌ deleteAllProjects error:', error);
    res.status(500).json({ error: 'Failed to delete all projects' });
  }
}
