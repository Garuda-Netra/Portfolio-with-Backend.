import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import Admin from '../models/Admin';
import { blacklistToken } from '../utils/tokenBlacklist';
import { AuthRequest } from '../middleware/authMiddleware';
import { logAction } from '../utils/logger';

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function issueAdminToken(adminId: string, username: string): string {
  const tokenId = uuidv4();
  return jwt.sign(
    { adminId, username, tokenId },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  );
}

async function findAuthenticatedAdmin(req: AuthRequest) {
  if (req.admin?.adminId) {
    const byId = await Admin.findById(req.admin.adminId);
    if (byId) {
      return byId;
    }
  }

  if (req.admin?.username) {
    return Admin.findOne({ username: req.admin.username });
  }

  return null;
}

// One-time admin account creation
export async function setup(req: Request, res: Response): Promise<void> {
  try {
    const existing = await Admin.findOne({});
    if (existing) {
      res.status(400).json({ error: 'Admin account already exists' });
      return;
    }
    const hashed = await bcrypt.hash('Admin@123', 12);
    await Admin.create({ username: 'prince', password: hashed });
    res.json({ message: 'Admin created. Username: prince | Password: Admin@123' });
  } catch {
    res.status(500).json({ error: 'Setup failed' });
  }
}

// Temporary bootstrap route for deployment setup. Disable with ADMIN_SETUP_DISABLED=true.
export async function resetAdmin(req: Request, res: Response): Promise<void> {
  try {
    if (process.env.ADMIN_SETUP_DISABLED === 'true') {
      res.status(403).json({ error: 'Admin setup is disabled' });
      return;
    }

    const defaultUsername = 'prince';
    const defaultPassword = 'Admin@123';
    const hashed = await bcrypt.hash(defaultPassword, 12);
    const usernamePattern = new RegExp(`^${escapeRegex(defaultUsername)}$`, 'i');
    const matchingAdmins = await Admin.find({ username: usernamePattern }).sort({ _id: 1 });

    if (matchingAdmins.length > 0) {
      const primary = matchingAdmins[0];
      primary.username = defaultUsername;
      primary.password = hashed;
      await primary.save();

      if (matchingAdmins.length > 1) {
        const duplicateIds = matchingAdmins.slice(1).map((adminDoc) => adminDoc._id);
        await Admin.deleteMany({ _id: { $in: duplicateIds } });
      }
    } else {
      const fallback = await Admin.findOne({}).sort({ _id: 1 });
      if (fallback) {
        fallback.username = defaultUsername;
        fallback.password = hashed;
        await fallback.save();
      } else {
        await Admin.create({ username: defaultUsername, password: hashed });
      }
    }

    res.json({ message: 'Admin reset. Username: prince | Password: Admin@123' });
  } catch {
    res.status(500).json({ error: 'Admin reset failed' });
  }
}

// Login
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required' });
      return;
    }

    const trimmedUsername = String(username).trim();
    const rawPassword = String(password);
    const usernamePattern = new RegExp(`^${escapeRegex(trimmedUsername)}$`, 'i');

    const candidateAdmins = await Admin.find({ username: usernamePattern }).sort({ _id: 1 });
    if (candidateAdmins.length === 0) {
      await logAction('Failed login attempt', 'failure', req, { username: trimmedUsername });
      res.status(401).json({ error: 'No account found with this username' });
      return;
    }

    let authenticatedAdmin: Awaited<ReturnType<typeof Admin.findOne>> = null;

    for (const candidate of candidateAdmins) {
      const storedPassword = String(candidate.password ?? '');
      if (!storedPassword) {
        continue;
      }

      let isMatch = false;
      if (storedPassword.startsWith('$2')) {
        isMatch = await bcrypt.compare(rawPassword, storedPassword);
      } else {
        isMatch = storedPassword === rawPassword;
        if (isMatch) {
          candidate.password = await bcrypt.hash(rawPassword, 12);
          await candidate.save();
        }
      }

      if (isMatch) {
        authenticatedAdmin = candidate;
        break;
      }
    }

    if (!authenticatedAdmin) {
      await logAction('Failed login attempt', 'failure', req, { username: trimmedUsername });
      res.status(401).json({ error: 'Incorrect password' });
      return;
    }

    const admin = authenticatedAdmin;

    const token = issueAdminToken(String(admin._id), admin.username);

    admin.lastLogin = new Date();
    await admin.save();
    await logAction('Admin logged in', 'success', req, { username: trimmedUsername });

    res.json({ token, username: admin.username });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
}

// Verify token
export async function verify(req: AuthRequest, res: Response): Promise<void> {
  res.json({ valid: true, username: req.admin?.username });
}

// Logout
export async function logout(req: AuthRequest, res: Response): Promise<void> {
  if (req.admin?.tokenId) {
    blacklistToken(req.admin.tokenId);
  }
  res.json({ message: 'Logged out successfully' });
}

// Change username
export async function changeUsername(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { newUsername, currentPassword } = req.body as {
      newUsername?: string;
      currentPassword?: string;
    };

    if (!newUsername || !currentPassword) {
      res.status(400).json({ error: 'New username and current password are required' });
      return;
    }

    const normalizedUsername = String(newUsername).trim();
    if (!/^[A-Za-z0-9._-]{3,32}$/.test(normalizedUsername)) {
      res.status(400).json({ error: 'Username must be 3-32 chars and can include letters, numbers, dot, underscore and hyphen' });
      return;
    }

    const admin = await findAuthenticatedAdmin(req);
    if (!admin) {
      res.status(404).json({ error: 'Admin not found' });
      return;
    }

    const isMatch = await bcrypt.compare(String(currentPassword), admin.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Current password is incorrect' });
      return;
    }

    const usernamePattern = new RegExp(`^${escapeRegex(normalizedUsername)}$`, 'i');
    const exists = await Admin.findOne({ username: usernamePattern });
    if (exists && String(exists._id) !== String(admin._id)) {
      res.status(409).json({ error: 'Username already in use' });
      return;
    }

    admin.username = normalizedUsername;
    await admin.save();
    await logAction('Username changed', 'success', req, { username: normalizedUsername });

    if (req.admin?.tokenId) {
      blacklistToken(req.admin.tokenId);
    }

    const token = issueAdminToken(String(admin._id), admin.username);

    res.json({ message: 'Username changed successfully', username: normalizedUsername, token });
  } catch {
    res.status(500).json({ error: 'Failed to change username' });
  }
}

// Change password
export async function changePassword(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Both current and new password required' });
      return;
    }

    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      res.status(400).json({
        error: 'Password must be at least 8 characters with one number and one special character'
      });
      return;
    }

    const admin = await findAuthenticatedAdmin(req);
    if (!admin) {
      res.status(404).json({ error: 'Admin not found' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Current password is incorrect' });
      return;
    }

    admin.password = await bcrypt.hash(newPassword, 12);
    await admin.save();
    await logAction('Password changed', 'success', req);

    if (req.admin?.tokenId) {
      blacklistToken(req.admin.tokenId);
    }

    const token = issueAdminToken(String(admin._id), admin.username);

    res.json({ message: 'Password changed successfully', token });
  } catch {
    res.status(500).json({ error: 'Failed to change password' });
  }
}
