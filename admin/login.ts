import { API_BASE_URL } from './config';
import { initCursorTrail } from '../src/utils/cursorTrail';

const API_BASE = `${API_BASE_URL}/api/auth`;

export {};

const card = document.querySelector<HTMLElement>('.login-card');
const form = document.querySelector<HTMLFormElement>('#login-form');
const usernameInput = document.querySelector<HTMLInputElement>('#username');
const passwordInput = document.querySelector<HTMLInputElement>('#password');
const togglePasswordButton = document.querySelector<HTMLButtonElement>('#toggle-password');
const loginButton = document.querySelector<HTMLButtonElement>('#login-button');
const buttonText = document.querySelector<HTMLElement>('.button-text');
const errorMessage = document.querySelector<HTMLElement>('#error-message');
const statusDot = document.querySelector<HTMLElement>('#status-dot');
const statusText = document.querySelector<HTMLElement>('#status-text');
const lines = Array.from(document.querySelectorAll<HTMLElement>('.terminal-line'));

function showError(message: string): void {
  if (!errorMessage) {
    return;
  }

  errorMessage.textContent = message;
  errorMessage.classList.remove('show');
  // Force reflow to replay shake animation each time.
  void errorMessage.offsetWidth;
  errorMessage.classList.add('show');
}

function clearError(): void {
  if (!errorMessage) {
    return;
  }

  errorMessage.textContent = '';
  errorMessage.classList.remove('show');
}

function withCacheVersion(url: string, version?: string): string {
  if (!version) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${encodeURIComponent(version)}`;
}

function setAdminFavicon(url?: string, version?: string): void {
  const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!favicon) return;

  const remoteUrl = (url ?? '').trim();
  if (!remoteUrl || !/^https?:\/\//i.test(remoteUrl)) {
    favicon.href = '/favicon.svg';
    favicon.type = 'image/svg+xml';
    return;
  }

  favicon.href = withCacheVersion(remoteUrl, version);
  favicon.removeAttribute('type');
}

async function loadAdminFavicon(): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/profile`, {
      method: 'GET'
    });
    if (!response.ok) return;

    const data = (await response.json()) as {
      profile?: {
        profileImageUrl?: string;
        lastUpdated?: string;
      };
    };

    setAdminFavicon(data.profile?.profileImageUrl, data.profile?.lastUpdated);
  } catch {
    setAdminFavicon();
  }
}

function setLoading(isLoading: boolean): void {
  if (!loginButton || !buttonText || !usernameInput || !passwordInput) {
    return;
  }

  loginButton.disabled = isLoading;
  loginButton.classList.toggle('loading', isLoading);
  buttonText.textContent = isLoading ? 'Authenticating...' : 'Authenticate';
  usernameInput.disabled = isLoading;
  passwordInput.disabled = isLoading;
  if (togglePasswordButton) {
    togglePasswordButton.disabled = isLoading;
  }
}

function startTerminalTyping(): void {
  const lineDelay = 640;
  const characterDelay = 22;

  lines.forEach((line, lineIndex) => {
    const fullText = line.dataset.line ?? '';
    line.textContent = '';

    window.setTimeout(() => {
      let i = 0;
      const writer = window.setInterval(() => {
        line.textContent = fullText.slice(0, i + 1);
        i += 1;

        if (i >= fullText.length) {
          window.clearInterval(writer);
        }
      }, characterDelay);
    }, lineDelay * lineIndex + 260);
  });
}

async function verifyExistingToken(): Promise<void> {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    card?.classList.remove('precheck');
    return;
  }

  card?.classList.add('precheck');

  try {
    const response = await fetch(`${API_BASE}/verify`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.ok) {
      window.location.href = '/admin/dashboard.html';
      return;
    }

    localStorage.removeItem('adminToken');
  } catch {
    localStorage.removeItem('adminToken');
  } finally {
    card?.classList.remove('precheck');
  }
}

function attachPasswordToggle(): void {
  if (!togglePasswordButton || !passwordInput) {
    return;
  }

  togglePasswordButton.addEventListener('click', () => {
    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';
    togglePasswordButton.textContent = isHidden ? 'Hide' : 'Show';
    togglePasswordButton.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
  });
}

function getMessageForFailure(status: number, backendMessage?: string): string {
  if (status === 429) {
    return 'Too many attempts. Please wait 15 minutes.';
  }

  if (status === 500) {
    return 'Server error. Please try again.';
  }

  if (status === 401 && backendMessage) {
    return backendMessage;
  }

  if (backendMessage) {
    return backendMessage;
  }

  return 'Authentication failed.';
}

function isLikelyNetworkError(error: Error): boolean {
  const message = error.message.toLowerCase();
  return (
    message.includes('fetch') ||
    message.includes('network') ||
    message.includes('failed') ||
    message.includes('load') ||
    message.includes('cors')
  );
}

async function checkServerStatus(): Promise<void> {
  if (!statusDot || !statusText) {
    return;
  }

  try {
    const controller = new AbortController();
    window.setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${API_BASE_URL}/api/health`, {
      signal: controller.signal,
      mode: 'cors'
    });

    if (res.ok) {
      const data = (await res.json()) as { status?: string };
      statusDot.className = 'status-dot online';
      statusText.textContent = `Server online - ${data.status ?? 'OK'}`;
    } else {
      throw new Error('Bad response');
    }
  } catch (err: unknown) {
    statusDot.className = 'status-dot offline';
    if (err instanceof Error && err.name === 'AbortError') {
      statusText.textContent = 'Server timeout - check if server is running on port 5000';
    } else {
      statusText.textContent = 'Server offline - run: cd server && npx ts-node index.ts';
    }
  }
}

async function onSubmit(event: SubmitEvent): Promise<void> {
  event.preventDefault();

  if (!usernameInput || !passwordInput) {
    return;
  }

  clearError();
  setLoading(true);

  try {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password
      }),
      signal: controller.signal
    });

    window.clearTimeout(timeout);

    const data = (await response.json().catch(() => null)) as { token?: string; error?: string } | null;

    if (!response.ok) {
      const mappedMessage = getMessageForFailure(response.status, data?.error);
      showError(mappedMessage);
      return;
    }

    if (!data?.token) {
      showError('Authentication failed.');
      return;
    }

    localStorage.setItem('adminToken', data.token);
    window.location.href = '/admin/dashboard.html';
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        showError('Request timed out. Server is taking too long to respond.');
      } else if (isLikelyNetworkError(error)) {
        showError('CORS or network error. Check that ALLOWED_ORIGIN in server/.env matches your frontend port.');
      } else {
        showError(`Connection failed: ${error.message}`);
      }
      console.error('Login error details:', error);
    } else {
      showError('Unknown error occurred. Check browser console for details.');
    }
  } finally {
    setLoading(false);
  }
}

async function init(): Promise<void> {
  initCursorTrail({
    maxParticles: 120,
    spawnSpacing: 9,
    baseSpeed: 0.18,
    speedVariance: 0.45,
    baseLife: 1.2,
    lifeVariance: 0.45,
  });

  startTerminalTyping();
  attachPasswordToggle();
  void loadAdminFavicon();
  void checkServerStatus();
  window.setInterval(() => {
    void checkServerStatus();
  }, 10_000);
  await verifyExistingToken();

  form?.addEventListener('submit', (event) => {
    void onSubmit(event);
  });
}

void init();
