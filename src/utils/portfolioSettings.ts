import { API_BASE_URL } from '../config/api';

export type PortfolioSettingsMap = Record<string, boolean>;

const DEFAULT_SETTINGS: PortfolioSettingsMap = {
  marqueeStrips: true,
  terminalFeature: true,
  scannerFeature: true,
  loadingScreen: true,
  smoothScroll: true
};

export async function loadPortfolioSettings(): Promise<PortfolioSettingsMap> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(`${API_BASE_URL}/api/settings`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) return { ...DEFAULT_SETTINGS };

    const payload = (await response.json()) as {
      settings?: Array<{ settingKey?: string; settingValue?: boolean }>;
    };

    const map: PortfolioSettingsMap = { ...DEFAULT_SETTINGS };
    (payload.settings ?? []).forEach((item) => {
      if (!item.settingKey) return;
      if (typeof item.settingValue === 'boolean') {
        map[item.settingKey] = item.settingValue;
      }
    });

    return map;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function hideFeatureButtons(settings: PortfolioSettingsMap): void {
  if (!settings.terminalFeature) {
    document.querySelectorAll<HTMLElement>('#open-terminal-btn').forEach((node) => {
      node.style.display = 'none';
    });
  }

  if (settings.scannerFeature === false) {
    document.querySelectorAll<HTMLElement>('#scan-portfolio-btn').forEach((node) => {
      node.style.display = 'none';
    });
  }

  if (!settings.marqueeStrips) {
    document.querySelectorAll<HTMLElement>('.marquee-strip').forEach((node) => {
      node.remove();
    });
  }
}

export function getDefaultPortfolioSettings(): PortfolioSettingsMap {
  return { ...DEFAULT_SETTINGS };
}
