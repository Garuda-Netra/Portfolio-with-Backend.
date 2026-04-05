import { Request, Response } from 'express';
import PortfolioSettings from '../models/PortfolioSettings';
import { logAction } from '../utils/logger';

const DEFAULT_SETTINGS = [
  {
    settingKey: 'marqueeStrips',
    settingValue: true,
    label: 'Marquee Strips',
    description: 'Enable scrolling text strips between sections'
  },
  {
    settingKey: 'terminalFeature',
    settingValue: true,
    label: 'Terminal Modal',
    description: 'Enable the interactive terminal'
  },
  {
    settingKey: 'scannerFeature',
    settingValue: true,
    label: 'Vulnerability Scanner',
    description: 'Enable the portfolio scanner feature'
  },
  {
    settingKey: 'loadingScreen',
    settingValue: true,
    label: 'Loading Screen',
    description: 'Enable intro loading animation'
  },
  {
    settingKey: 'smoothScroll',
    settingValue: true,
    label: 'Smooth Scroll',
    description: 'Enable lerp smooth scrolling'
  }
];

const SUPPORTED_SETTING_KEYS = new Set(DEFAULT_SETTINGS.map((setting) => setting.settingKey));

async function ensureDefaultSettings(): Promise<void> {
  for (const setting of DEFAULT_SETTINGS) {
    try {
      await PortfolioSettings.updateOne(
        { settingKey: setting.settingKey },
        {
          $setOnInsert: {
            settingKey: setting.settingKey,
            settingValue: setting.settingValue
          },
          $set: {
            label: setting.label,
            description: setting.description
          }
        },
        { upsert: true }
      );
    } catch (error) {
      console.error('ensureDefaultSettings upsert failed:', setting.settingKey, error);
    }
  }
}

export async function getAllSettings(_req: Request, res: Response): Promise<void> {
  try {
    await ensureDefaultSettings();
    let settings = (await PortfolioSettings.find({}).sort({ settingKey: 1 })).filter((setting) =>
      SUPPORTED_SETTING_KEYS.has(setting.settingKey)
    );

    if (settings.length === 0) {
      try {
        await PortfolioSettings.insertMany(DEFAULT_SETTINGS, { ordered: false });
        settings = (await PortfolioSettings.find({}).sort({ settingKey: 1 })).filter((setting) =>
          SUPPORTED_SETTING_KEYS.has(setting.settingKey)
        );
      } catch (seedError) {
        console.error('settings seed fallback failed:', seedError);
      }
    }

    if (settings.length === 0) {
      res.json({ settings: DEFAULT_SETTINGS });
      return;
    }

    res.json({ settings });
  } catch (error) {
    console.error('getAllSettings failed:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
}

export async function updateSetting(req: Request, res: Response): Promise<void> {
  try {
    const rawKey = req.params.key;
    const key = Array.isArray(rawKey) ? rawKey[0] : rawKey;
    const value = Boolean((req.body as { settingValue?: boolean }).settingValue);

    if (!key || !SUPPORTED_SETTING_KEYS.has(key)) {
      res.status(404).json({ error: 'Setting not found' });
      return;
    }

    const updated = await PortfolioSettings.findOneAndUpdate(
      { settingKey: key },
      { settingValue: value },
      { new: true }
    );

    if (!updated) {
      res.status(404).json({ error: 'Setting not found' });
      return;
    }

    await logAction('Portfolio settings updated', 'success', req, { key, value });

    res.json({ message: 'Setting updated', setting: updated });
  } catch {
    res.status(500).json({ error: 'Failed to update setting' });
  }
}

export async function resetAllSettings(_req: Request, res: Response): Promise<void> {
  try {
    await ensureDefaultSettings();
    for (const setting of DEFAULT_SETTINGS) {
      await PortfolioSettings.updateOne(
        { settingKey: setting.settingKey },
        { settingValue: setting.settingValue }
      );
    }
    const settings = (await PortfolioSettings.find({}).sort({ settingKey: 1 })).filter((setting) =>
      SUPPORTED_SETTING_KEYS.has(setting.settingKey)
    );
    res.json({ message: 'Settings reset successfully', settings });
  } catch {
    res.status(500).json({ error: 'Failed to reset settings' });
  }
}
