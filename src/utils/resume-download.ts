import { API_BASE_URL } from '../config/api';

const RESUME_FILE_NAME = 'Raj_CV.pdf';
const RESUME_PUBLIC_PATH = '/public/Raj_CV.pdf';
const RESUME_COUNT_KEY = 'resume_download_count';

const DOWNLOADABLE_SELECTOR = [
  '#download-resume-btn',
  '#nav-resume-link',
  '#mobile-nav-resume-link',
  '#contact-resume-download',
  '#footer-resume-link',
  '[data-resume-download]',
].join(',');

interface ResumeTriggerOptions {
  source?: string;
  immediate?: boolean;
  withFeedback?: boolean;
}

function isTouchDevice(): boolean {
  return window.matchMedia('(pointer: coarse)').matches;
}

function incrementSessionDownloadCounter(): void {
  try {
    const value = Number(window.sessionStorage.getItem(RESUME_COUNT_KEY) ?? '0');
    window.sessionStorage.setItem(RESUME_COUNT_KEY, String(value + 1));
  } catch {
    // Ignore storage failures in private browsing or restricted contexts.
  }
}

function createDownloadAnchor(path: string, filename: string): HTMLAnchorElement {
  const anchor = document.createElement('a');
  anchor.href = path;
  anchor.download = filename;
  anchor.rel = 'noopener';
  anchor.style.display = 'none';
  return anchor;
}

function triggerDownload(path: string, fileName: string): void {
  const anchor = createDownloadAnchor(path, fileName);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function getLocalResumePath(): { path: string; filename: string } {
  return {
    path: `${API_BASE_URL}${RESUME_PUBLIC_PATH}`,
    filename: RESUME_FILE_NAME,
  };
}

function updateButtonStatus(target: HTMLElement, status: 'idle' | 'loading' | 'done' | 'failed'): void {
  const label = target.querySelector<HTMLElement>('[data-resume-label]');
  const idleText = target.dataset.resumeIdle ?? 'Download Resume';

  if (label) {
    if (status === 'loading') {
      label.textContent = 'Loading...';
    } else if (status === 'done') {
      label.textContent = 'Downloaded ✓';
    } else if (status === 'failed') {
      label.textContent = 'Unavailable';
    } else {
      label.textContent = idleText;
    }
  }

  target.classList.toggle('is-downloading', status === 'loading');
  target.classList.toggle('is-downloaded', status === 'done');
}

export async function triggerResumeDownload(options: ResumeTriggerOptions = {}): Promise<boolean> {
  const runtime = getLocalResumePath();

  triggerDownload(runtime.path, runtime.filename);
  incrementSessionDownloadCounter();

  window.dispatchEvent(new CustomEvent('resume:downloaded', {
    detail: {
      source: options.source ?? 'unknown',
      file: runtime.filename,
      path: runtime.path,
    },
  }));

  return true;
}

function attachDownloadBehavior(target: HTMLElement): void {
  if (target.dataset.resumeBound === 'true') {
    return;
  }

  target.dataset.resumeBound = 'true';

  target.addEventListener('click', (event) => {
    event.preventDefault();

    void (async () => {
      const immediate = isTouchDevice() || target.dataset.resumeInstant === 'true';
      updateButtonStatus(target, 'loading');

      const success = await triggerResumeDownload({
        source: target.dataset.resumeSource ?? 'ui',
        immediate,
        withFeedback: true,
      });

      updateButtonStatus(target, success ? 'done' : 'failed');

      window.setTimeout(() => {
        updateButtonStatus(target, 'idle');
      }, success ? 2000 : 3000);
    })();
  });
}

export function initResumeDownload(): void {
  document.querySelectorAll<HTMLElement>(DOWNLOADABLE_SELECTOR).forEach((target) => {
    attachDownloadBehavior(target);
  });

  window.addEventListener('resume:request-download', (event) => {
    const custom = event as CustomEvent<{ source?: string }>;
    void triggerResumeDownload({
      source: custom.detail?.source ?? 'terminal',
      immediate: true,
    });
  });
}
