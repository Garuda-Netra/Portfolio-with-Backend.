import { Request, Response } from 'express';
import Certification from '../models/Certification';
import { logAction } from '../utils/logger';
import { uploadBufferToCloudinary } from '../config/cloudinary';

export async function getAllCertifications(_req: Request, res: Response): Promise<void> {
  try {
    const certifications = await Certification.find({ isVisible: true }).sort({ order: 1, _id: 1 });
    res.json({ certifications });
  } catch {
    res.status(500).json({ error: 'Failed to fetch certifications' });
  }
}

export async function getAllCertificationsAdmin(_req: Request, res: Response): Promise<void> {
  try {
    const certifications = await Certification.find({}).sort({ order: 1, _id: 1 });
    res.json({ certifications });
  } catch {
    res.status(500).json({ error: 'Failed to fetch certifications' });
  }
}

export async function addCertification(req: Request, res: Response): Promise<void> {
  try {
    const body = req.body as Record<string, unknown>;
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const organization = typeof body.organization === 'string' ? body.organization.trim() : '';
    const category = typeof body.category === 'string' ? body.category.trim() : '';
    const dateEarned = typeof body.dateEarned === 'string' ? body.dateEarned.trim() : '';
    const credentialLink = typeof body.credentialLink === 'string' ? body.credentialLink.trim() : '';
    const accentColor = typeof body.accentColor === 'string' ? body.accentColor.trim() : '#00E5FF';

    if (!name || !organization || !category) {
      res.status(400).json({ error: 'Name, organization and category are required' });
      return;
    }

    if (name.length > 120 || organization.length > 160 || category.length > 80 || credentialLink.length > 2048) {
      res.status(400).json({ error: 'One or more fields exceed allowed length' });
      return;
    }

    const uploadFile = req.file as Express.Multer.File | undefined;
    console.log('addCertification: file received', {
      hasFile: !!uploadFile,
      size: uploadFile?.size,
      mime: uploadFile?.mimetype
    });

    let imageUrl = '';
    if (uploadFile?.buffer) {
      const uploadResult = await uploadBufferToCloudinary(uploadFile.buffer, 'portfolio/certifications');
      imageUrl = (uploadResult.secure_url ?? '').trim();
    }
    const order = Date.now();

    const certification = await Certification.create({
      name,
      organization,
      category,
      dateEarned,
      credentialLink,
      imageUrl,
      accentColor,
      order,
      isVisible: true
    });

    void logAction('Certification created', 'success', req, { name: certification.name }).catch((logError) => {
      console.error('logAction failed (create certification):', logError);
    });

    res.status(201).json({ message: 'Certification created', certification });
  } catch (error) {
    console.error('❌ addCertification error:', error);
    res.status(500).json({ error: 'Failed to add certification' });
  }
}

export async function updateCertification(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const body = req.body as Record<string, unknown>;
    const name = typeof body.name === 'string' ? body.name.trim() : undefined;
    const organization = typeof body.organization === 'string' ? body.organization.trim() : undefined;
    const category = typeof body.category === 'string' ? body.category.trim() : undefined;
    const dateEarned = typeof body.dateEarned === 'string' ? body.dateEarned.trim() : undefined;
    const credentialLink = typeof body.credentialLink === 'string' ? body.credentialLink.trim() : undefined;
    const accentColor = typeof body.accentColor === 'string' ? body.accentColor.trim() : undefined;

    const uploadFile = req.file as Express.Multer.File | undefined;
    console.log('updateCertification: file received', {
      hasFile: !!uploadFile,
      size: uploadFile?.size,
      mime: uploadFile?.mimetype
    });

    const payload: Record<string, unknown> = {};
    if (typeof name === 'string') payload.name = name;
    if (typeof organization === 'string') payload.organization = organization;
    if (typeof category === 'string') payload.category = category;
    if (typeof dateEarned === 'string') payload.dateEarned = dateEarned;
    if (typeof credentialLink === 'string') payload.credentialLink = credentialLink;
    if (typeof accentColor === 'string') payload.accentColor = accentColor;
    if (uploadFile?.buffer) {
      const uploadResult = await uploadBufferToCloudinary(uploadFile.buffer, 'portfolio/certifications');
      if (uploadResult.secure_url) {
        payload.imageUrl = uploadResult.secure_url;
      }
    }

    const certification = await Certification.findByIdAndUpdate(id, payload, { new: true });
    if (!certification) {
      res.status(404).json({ error: 'Certification not found' });
      return;
    }

    void logAction('Certification updated', 'success', req, { id }).catch((logError) => {
      console.error('logAction failed (update certification):', logError);
    });
    res.json({ message: 'Certification updated', certification });
  } catch (error) {
    console.error('❌ updateCertification error:', error);
    res.status(500).json({ error: 'Failed to update certification' });
  }
}

export async function deleteCertification(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const deleted = await Certification.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({ error: 'Certification not found' });
      return;
    }

    void logAction('Certification deleted', 'success', req, { id }).catch((logError) => {
      console.error('logAction failed (delete certification):', logError);
    });
    res.json({ message: 'Certification deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete certification' });
  }
}

export async function reorderCertifications(req: Request, res: Response): Promise<void> {
  try {
    const { ids } = req.body as { ids?: string[] };
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ error: 'ids array is required' });
      return;
    }

    await Promise.all(
      ids.map((id, index) => Certification.findByIdAndUpdate(id, { order: index }))
    );

    const certifications = await Certification.find({}).sort({ order: 1, _id: 1 });
    res.json({ message: 'Certifications reordered', certifications });
  } catch {
    res.status(500).json({ error: 'Failed to reorder certifications' });
  }
}

export async function toggleVisibility(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const certification = await Certification.findById(id);
    if (!certification) {
      res.status(404).json({ error: 'Certification not found' });
      return;
    }

    certification.isVisible = !certification.isVisible;
    await certification.save();

    res.json({ message: 'Visibility updated', isVisible: certification.isVisible, certification });
  } catch {
    res.status(500).json({ error: 'Failed to toggle visibility' });
  }
}

export async function deleteAllCertifications(req: Request, res: Response): Promise<void> {
  try {
    const result = await Certification.deleteMany({});
    console.log('deleteAllCertifications: deletedCount =', result.deletedCount ?? 0);
    void logAction('All certifications deleted', 'success', req, { deletedCount: result.deletedCount }).catch((logError) => {
      console.error('logAction failed (delete all certifications):', logError);
    });
    res.json({ message: 'All certifications deleted', deletedCount: result.deletedCount });
  } catch (error) {
    console.error('❌ deleteAllCertifications error:', error);
    res.status(500).json({ error: 'Failed to delete all certifications' });
  }
}
