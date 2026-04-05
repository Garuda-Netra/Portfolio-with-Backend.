import { Request, Response } from 'express';
import Content from '../models/Content';

export async function getAllContent(_req: Request, res: Response): Promise<void> {
  try {
    const entries = await Content.find({}).sort({ sectionName: 1 });
    res.json({ entries });
  } catch {
    res.status(500).json({ error: 'Failed to fetch content entries' });
  }
}

export async function getContentBySection(req: Request, res: Response): Promise<void> {
  try {
    const section = req.params.section;
    const entry = await Content.findOne({ sectionName: section });
    if (!entry) {
      res.json({ entry: null });
      return;
    }

    res.json({ entry });
  } catch {
    res.status(500).json({ error: 'Failed to fetch section content' });
  }
}

export async function updateContent(req: Request, res: Response): Promise<void> {
  try {
    const section = req.params.section;
    const payload = req.body as { content?: unknown };

    const entry = await Content.findOneAndUpdate(
      { sectionName: section },
      {
        sectionName: section,
        content: payload.content ?? {},
        lastUpdated: new Date()
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ message: 'Section updated successfully.', entry });
  } catch {
    res.status(500).json({ error: 'Failed to update section content' });
  }
}

export async function resetContent(req: Request, res: Response): Promise<void> {
  try {
    const section = req.params.section;
    await Content.findOneAndDelete({ sectionName: section });
    res.json({ message: 'Reset to defaults successfully.' });
  } catch {
    res.status(500).json({ error: 'Failed to reset section content' });
  }
}
