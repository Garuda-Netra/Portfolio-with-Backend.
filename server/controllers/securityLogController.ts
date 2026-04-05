import { Request, Response } from 'express';
import SecurityLog from '../models/SecurityLog';

export async function getLogs(req: Request, res: Response): Promise<void> {
  try {
    const pageRaw = Number(req.query.page ?? 1);
    const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;
    const limit = 50;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      SecurityLog.find({}).sort({ timestamp: -1 }).skip(skip).limit(limit),
      SecurityLog.countDocuments({})
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));
    res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasPrev: page > 1,
        hasNext: page < totalPages
      }
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch security logs' });
  }
}

export async function clearLogs(_req: Request, res: Response): Promise<void> {
  try {
    await SecurityLog.deleteMany({});
    res.json({ message: 'Security logs cleared' });
  } catch {
    res.status(500).json({ error: 'Failed to clear security logs' });
  }
}
