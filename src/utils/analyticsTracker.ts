import { API_BASE_URL } from '../config/api';

type AnalyticsPayload = {
  eventType: string;
  eventData: Record<string, unknown>;
  sessionId: string;
  device: string;
  browser: string;
};

const SESSION_ID = sessionStorage.getItem('sessionId') || generateId();
sessionStorage.setItem('sessionId', SESSION_ID);

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function getDevice(): string {
  return window.innerWidth < 768 ? 'mobile' : 'desktop';
}

function getBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari')) return 'Safari';
  return 'Other';
}

const eventQueue: AnalyticsPayload[] = [];
let flushTimer: ReturnType<typeof setTimeout> | undefined;

export function trackEvent(eventType: string, eventData: Record<string, unknown> = {}): void {
  eventQueue.push({
    eventType,
    eventData,
    sessionId: SESSION_ID,
    device: getDevice(),
    browser: getBrowser()
  });

  if (flushTimer) {
    clearTimeout(flushTimer);
  }
  flushTimer = setTimeout(() => {
    void flushEvents();
  }, 5000);
}

async function flushEvents(): Promise<void> {
  if (eventQueue.length === 0) return;
  const events = [...eventQueue];
  eventQueue.length = 0;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    await fetch(`${API_BASE_URL}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
  } catch {
    // Silent fail to avoid affecting portfolio UX.
  }
}

function detectButtonName(target: Element | null): string | null {
  if (!target) return null;
  const buttonLike = target.closest<HTMLElement>('button, a, [role="button"]');
  if (!buttonLike) return null;

  const explicit = buttonLike.dataset.analyticsButton;
  if (explicit) return explicit;

  const id = buttonLike.id?.trim();
  if (id) return id;

  const text = buttonLike.textContent?.trim().replace(/\s+/g, ' ');
  if (!text) return null;
  return text.slice(0, 64);
}

export function initAnalyticsTracker(): void {
  trackEvent('page_view', {});

  document.addEventListener('click', (event) => {
    const name = detectButtonName(event.target as Element | null);
    if (!name) return;
    trackEvent('button_click', { button: name });
  }, { passive: true });

  window.addEventListener('analytics:section_view', (event) => {
    const detail = (event as CustomEvent<{ section?: string }>).detail;
    if (detail?.section) trackEvent('section_view', { section: detail.section });
  });

  window.addEventListener('analytics:terminal_command', (event) => {
    const detail = (event as CustomEvent<{ command?: string }>).detail;
    if (detail?.command) trackEvent('terminal_command', { command: detail.command });
  });

  window.addEventListener('analytics:theme_switch', (event) => {
    const detail = (event as CustomEvent<{ theme?: string }>).detail;
    if (detail?.theme) trackEvent('theme_switch', { theme: detail.theme });
  });

  window.addEventListener('analytics:ctf_flag', (event) => {
    const detail = (event as CustomEvent<{ level?: number }>).detail;
    if (typeof detail?.level === 'number') trackEvent('ctf_flag', { level: detail.level });
  });

  window.addEventListener('resume:downloaded', () => {
    trackEvent('resume_download', {});
  });

  window.addEventListener('analytics:scanner_open', () => {
    trackEvent('scanner_open', {});
  });

  window.addEventListener('beforeunload', () => {
    void flushEvents();
  });
}
