import { Request, Response } from 'express';
import Resume from '../models/Resume';
import { logAction } from '../utils/logger';
import cloudinary, { uploadRawBufferToCloudinary } from '../config/cloudinary';

export async function getResumeInfo(_req: Request, res: Response): Promise<void> {
  try {
    const resume = await Resume.findOne({ isActive: true }).sort({ uploadDate: -1 });
    if (!resume) {
      res.status(404).json({ error: 'No active resume found' });
      return;
    }

    res.json({ resume });
  } catch {
    res.status(500).json({ error: 'Failed to fetch resume info' });
  }
}

export async function uploadResume(req: Request, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No resume file uploaded' });
      return;
    }

    if (!req.file.buffer) {
      res.status(400).json({ error: 'Invalid upload buffer' });
      return;
    }

    const uploaded = await uploadRawBufferToCloudinary(
      req.file.buffer,
      'portfolio/resume',
      req.file.originalname || 'resume.pdf'
    );

    const cloudUrl = (uploaded.secure_url ?? '').trim();
    const cloudinaryPublicId = (uploaded.public_id ?? '').trim();
    if (!cloudUrl || !cloudinaryPublicId) {
      res.status(500).json({ error: 'Cloud upload failed' });
      return;
    }

    const generatedName = `${cloudinaryPublicId.split('/').pop() ?? `resume_${Date.now()}`}.pdf`;

    await Resume.updateMany({ isActive: true }, { isActive: false });

    const resume = await Resume.create({
      filename: generatedName,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      filePath: cloudUrl,
      cloudinaryPublicId,
      isActive: true
    });

    await logAction('Resume uploaded', 'success', req, {
      filename: req.file.filename,
      fileSize: req.file.size
    });

    res.status(201).json({ message: 'Resume uploaded successfully', resume });
  } catch {
    res.status(500).json({ error: 'Failed to upload resume' });
  }
}

export async function deleteResume(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const resume = await Resume.findById(id);

    if (!resume) {
      res.status(404).json({ error: 'Resume not found' });
      return;
    }

    if (resume.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(resume.cloudinaryPublicId, { resource_type: 'raw' });
    }

    await resume.deleteOne();
    await logAction('Resume deleted', 'success', req);

    res.json({ message: 'Resume deleted successfully' });
  } catch {
    res.status(500).json({ error: 'Failed to delete resume' });
  }
}

export async function incrementDownloadCount(_req: Request, res: Response): Promise<void> {
  try {
    const resume = await Resume.findOneAndUpdate(
      { isActive: true },
      { $inc: { downloadCount: 1 } },
      { new: true }
    );

    if (!resume) {
      res.status(404).json({ error: 'No active resume found' });
      return;
    }

    res.json({ message: 'Download count updated', downloadCount: resume.downloadCount, resume });
  } catch {
    res.status(500).json({ error: 'Failed to update download count' });
  }
}
