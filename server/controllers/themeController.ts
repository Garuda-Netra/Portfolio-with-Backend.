import { Request, Response } from 'express';
import ThemeSettings from '../models/ThemeSettings';

const DEFAULT_THEME = {
  darkMode: {
    primaryBg: '#020509',
    secondaryBg: '#050A12',
    accentCyan: '#00E5FF',
    accentPurple: '#A855F7',
    accentGreen: '#00CC6A',
    primaryText: '#E8EDF4',
    secondaryText: '#AAB4C2',
    cardBg: 'rgba(6,12,24,0.65)',
    cardBorder: 'rgba(0,229,255,0.06)',
    glowIntensity: 0.6
  },
  lightMode: {
    primaryBg: '#F8FAFC',
    secondaryBg: '#F1F5F9',
    accentColor: '#0891B2',
    primaryText: '#0F172A',
    secondaryText: '#475569',
    cardBg: 'rgba(255,255,255,0.8)',
    cardBorder: 'rgba(0,0,0,0.08)'
  },
  animationSpeed: 'normal',
  particleDensity: 'medium',
  fontFamily: 'jetbrains',
  isActive: true,
  lastUpdated: new Date()
};

export async function getActiveTheme(_req: Request, res: Response): Promise<void> {
  try {
    const theme = await ThemeSettings.findOne({ isActive: true }).sort({ lastUpdated: -1 });
    if (!theme) {
      res.json(DEFAULT_THEME);
      return;
    }

    res.json(theme);
  } catch {
    res.status(500).json({ error: 'Failed to fetch theme settings' });
  }
}

export async function updateTheme(req: Request, res: Response): Promise<void> {
  try {
    const { darkMode, lightMode, animationSpeed, particleDensity, fontFamily } = req.body as {
      darkMode?: Record<string, unknown>;
      lightMode?: Record<string, unknown>;
      animationSpeed?: string;
      particleDensity?: string;
      fontFamily?: string;
    };

    const payload: Record<string, unknown> = {
      isActive: true,
      lastUpdated: new Date()
    };

    if (darkMode && typeof darkMode === 'object') payload.darkMode = darkMode;
    if (lightMode && typeof lightMode === 'object') payload.lightMode = lightMode;
    if (typeof animationSpeed === 'string') payload.animationSpeed = animationSpeed;
    if (typeof particleDensity === 'string') payload.particleDensity = particleDensity;
    if (typeof fontFamily === 'string') payload.fontFamily = fontFamily;

    const theme = await ThemeSettings.findOneAndUpdate(
      { isActive: true },
      payload,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ message: 'Theme updated successfully', theme });
  } catch {
    res.status(500).json({ error: 'Failed to update theme settings' });
  }
}

export async function resetTheme(_req: Request, res: Response): Promise<void> {
  try {
    await ThemeSettings.deleteMany({});
    res.json({ message: 'Theme reset to defaults' });
  } catch {
    res.status(500).json({ error: 'Failed to reset theme settings' });
  }
}
