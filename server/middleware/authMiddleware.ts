import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { isBlacklisted } from '../utils/tokenBlacklist';

export interface AuthRequest extends Request {
  admin?: { adminId?: string; username: string; tokenId: string };
}

export function protect(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      adminId?: unknown;
      username?: unknown;
      tokenId?: unknown;
    };

    if (typeof decoded.username !== 'string' || typeof decoded.tokenId !== 'string') {
      res.status(401).json({ error: 'Invalid token payload' });
      return;
    }

    if (isBlacklisted(decoded.tokenId)) {
      res.status(401).json({ error: 'Token has been invalidated' });
      return;
    }

    req.admin = {
      username: decoded.username,
      tokenId: decoded.tokenId,
      adminId: typeof decoded.adminId === 'string' ? decoded.adminId : undefined
    };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
