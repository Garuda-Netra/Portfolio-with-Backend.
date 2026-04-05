import { API_BASE_URL } from '../config/api';

type ThemeResponse = {
  darkMode?: {
    primaryBg?: string;
    secondaryBg?: string;
    accentCyan?: string;
    accentPurple?: string;
    accentGreen?: string;
    primaryText?: string;
    secondaryText?: string;
    cardBg?: string;
    cardBorder?: string;
    glowIntensity?: number;
  };
  lightMode?: {
    primaryBg?: string;
    secondaryBg?: string;
    accentColor?: string;
    primaryText?: string;
    secondaryText?: string;
    cardBg?: string;
    cardBorder?: string;
  };
  animationSpeed?: 'slow' | 'normal' | 'fast';
  fontFamily?: 'jetbrains' | 'fira-code' | 'source-code-pro';
};

function withTimeout(url: string, timeoutMs = 5000): Promise<Response> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { signal: controller.signal }).finally(() => {
    window.clearTimeout(timer);
  });
}

function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) {
    return '0, 229, 255';
  }
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

export async function applyCustomTheme(): Promise<void> {
  try {
    const res = await withTimeout(`${API_BASE_URL}/api/theme`, 5000);
    if (!res.ok) return;

    const theme = (await res.json()) as ThemeResponse;
    const root = document.documentElement;
    const dark = theme.darkMode ?? {};
    const light = theme.lightMode ?? {};

    root.style.setProperty('--primary-bg', dark.primaryBg ?? '#020509');
    root.style.setProperty('--secondary-bg', dark.secondaryBg ?? '#050A12');
    root.style.setProperty('--accent-cyan', dark.accentCyan ?? '#00E5FF');
    root.style.setProperty('--accent-purple', dark.accentPurple ?? '#A855F7');
    root.style.setProperty('--accent-green', dark.accentGreen ?? '#00CC6A');
    root.style.setProperty('--primary-text', dark.primaryText ?? '#E8EDF4');
    root.style.setProperty('--secondary-text', dark.secondaryText ?? '#AAB4C2');
    root.style.setProperty('--card-bg', dark.cardBg ?? 'rgba(6, 12, 24, 0.65)');
    root.style.setProperty('--card-border', dark.cardBorder ?? 'rgba(0, 229, 255, 0.06)');

    root.style.setProperty('--light-primary-bg', light.primaryBg ?? '#F8FAFC');
    root.style.setProperty('--light-secondary-bg', light.secondaryBg ?? '#F1F5F9');
    root.style.setProperty('--light-accent', light.accentColor ?? '#0891B2');
    root.style.setProperty('--light-primary-text', light.primaryText ?? '#0F172A');
    root.style.setProperty('--light-secondary-text', light.secondaryText ?? '#475569');
    root.style.setProperty('--light-card-bg', light.cardBg ?? 'rgba(255,255,255,0.8)');
    root.style.setProperty('--light-card-border', light.cardBorder ?? 'rgba(0,0,0,0.08)');

    const speedMap: Record<string, string> = {
      slow: '1.5',
      normal: '1',
      fast: '0.7'
    };
    root.style.setProperty('--animation-speed', speedMap[theme.animationSpeed ?? 'normal'] || '1');

    const fontMap: Record<string, string> = {
      jetbrains: '"JetBrains Mono", monospace',
      'fira-code': '"Fira Code", monospace',
      'source-code-pro': '"Source Code Pro", monospace'
    };
    root.style.setProperty('--terminal-font', fontMap[theme.fontFamily ?? 'jetbrains'] || '"JetBrains Mono", monospace');

    root.style.setProperty('--accent-cyan-rgb', hexToRgb(dark.accentCyan ?? '#00E5FF'));
    root.style.setProperty('--accent-purple-rgb', hexToRgb(dark.accentPurple ?? '#A855F7'));
    root.style.setProperty('--accent-green-rgb', hexToRgb(dark.accentGreen ?? '#00CC6A'));
  } catch {
    // Silent fallback
  }
}
