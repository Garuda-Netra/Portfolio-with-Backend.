import { Request } from 'express';
import SecurityLog from '../models/SecurityLog';

export async function logAction(
  action: string,
  status: 'success' | 'failure',
  req: Request,
  details?: object
): Promise<void> {
  try {
    await SecurityLog.create({
      action,
      status,
      ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      details: details || {}
    });
  } catch {
    // Never let logging break the main request
  }
}
