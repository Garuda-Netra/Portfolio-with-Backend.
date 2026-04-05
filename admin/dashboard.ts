import { API_BASE_URL } from './config';
import { setupResumeManager } from './resumeManager';
import { setupBlogManager } from './blogManager';
import { initCursorTrail } from '../src/utils/cursorTrail';

const SECURITY_QUOTES = [
  'Security is not a product, it is a process.',
  'The quieter you become, the more you can hear.',
  'Hack the planet - ethically.',
  'Knowledge is the best exploit.',
  'In security, paranoia is a feature not a bug.'
];

type ToastType = 'success' | 'error' | 'warning';
type MessageFilter = 'all' | 'unread' | 'starred';

export {};

type SectionKey =
  | 'dashboard'
  | 'messages'
  | 'content'
  | 'certifications'
  | 'profile'
  | 'social'
  | 'blog'
  | 'toggles'
  | 'resume';

type AdminMessage = {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
};

type AdminProfile = {
  _id?: string;
  name: string;
  title: string;
  tagline: string;
  email: string;
  bio: string;
  profileImageUrl: string;
  githubUrl: string;
  linkedinUrl: string;
  typingTitles: string[];
  lastUpdated?: string;
};

type SocialLink = {
  _id: string;
  platform: string;
  url: string;
  displayText?: string;
  icon?: string;
  isVisible: boolean;
  order: number;
};

type CertificationItem = {
  _id: string;
  name: string;
  organization: string;
  category: string;
  dateEarned?: string;
  credentialLink?: string;
  imageUrl?: string;
  accentColor: string;
  order: number;
  isVisible: boolean;
};

type ContentEntry = {
  _id: string;
  sectionName: string;
  content: Record<string, unknown>;
  lastUpdated: string;
};

type PortfolioSetting = {
  _id?: string;
  settingKey: string;
  settingValue: boolean;
  label: string;
  description: string;
};

const sectionIcons: Record<SectionKey, string> = {
  dashboard: '🏠',
  messages: '📥',
  content: '📄',
  certifications: '📋',
  profile: '👤',
  social: '🔗',
  blog: '📝',
  toggles: '⚙️',
  resume: '📄'
};

const sectionNames: Record<SectionKey, string> = {
  dashboard: 'Dashboard',
  messages: 'Messages',
  content: 'Content',
  certifications: 'Certs',
  profile: 'Profile',
  social: 'Social Links',
  blog: 'Blog',
  toggles: 'Toggles',
  resume: 'Resume'
};

const PROFILE_IMAGE_VERSION_KEY = 'portfolioProfileImageVersion';

const navItems = Array.from(document.querySelectorAll<HTMLButtonElement>('.nav-item'));
const sectionPanels = Array.from(document.querySelectorAll<HTMLElement>('.admin-section'));
const toastRoot = document.querySelector<HTMLElement>('#toast-root');
const sidebar = document.querySelector<HTMLElement>('#sidebar');
const sidebarToggle = document.querySelector<HTMLButtonElement>('#sidebar-toggle');
const mobileMenuToggle = document.querySelector<HTMLButtonElement>('#mobile-menu-toggle');
const sidebarOverlay = document.querySelector<HTMLElement>('#sidebar-overlay');
const logoutButton = document.querySelector<HTMLButtonElement>('#logout-button');
const liveClock = document.querySelector<HTMLElement>('#live-clock');
const todayDate = document.querySelector<HTMLElement>('#today-date');
const securityQuote = document.querySelector<HTMLElement>('#security-quote');
const unreadBadge = document.querySelector<HTMLElement>('#unread-badge');
const recentMessagesRoot = document.querySelector<HTMLElement>('#recent-messages');
const serverStatus = document.querySelector<HTMLElement>('#server-status');
const quickPublishedPosts = document.querySelector<HTMLElement>('#quick-published-posts');
const quickSocialLinks = document.querySelector<HTMLElement>('#quick-social-links');
const quickLastLogin = document.querySelector<HTMLElement>('#quick-last-login');
const quickServerUptime = document.querySelector<HTMLElement>('#quick-server-uptime');
const notificationBell = document.querySelector<HTMLButtonElement>('#notification-bell');
const notificationBadge = document.querySelector<HTMLElement>('#notification-badge');
const notificationDropdown = document.querySelector<HTMLElement>('#notification-dropdown');
const notificationList = document.querySelector<HTMLElement>('#notification-list');
const notificationMarkRead = document.querySelector<HTMLButtonElement>('#notifications-mark-read');
const messageListRoot = document.querySelector<HTMLElement>('#message-list');
const messageDetailRoot = document.querySelector<HTMLElement>('#message-detail');
const messageFilterButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('.message-filter'));
const messageUnreadBadge = document.querySelector<HTMLElement>('#messages-unread-badge');
const profileForm = document.querySelector<HTMLFormElement>('#profile-form');
const usernameForm = document.querySelector<HTMLFormElement>('#username-form');
const newUsernameInput = document.querySelector<HTMLInputElement>('#new-username');
const usernamePasswordInput = document.querySelector<HTMLInputElement>('#username-password');
const profileLoading = document.querySelector<HTMLElement>('#profile-loading');
const profileError = document.querySelector<HTMLElement>('#profile-error');
const retryProfileButton = document.querySelector<HTMLButtonElement>('#retry-profile');
const profileImagePreview = document.querySelector<HTMLElement>('#profile-image-preview');
const profileImageInput = document.querySelector<HTMLInputElement>('#profile-image-input');
const uploadPhotoButton = document.querySelector<HTMLButtonElement>('#upload-photo-btn');
const changePhotoButton = document.querySelector<HTMLButtonElement>('#change-photo-btn');
const selectedImageName = document.querySelector<HTMLElement>('#selected-image-name');
const uploadProgressWrap = document.querySelector<HTMLElement>('#upload-progress-wrap');
const uploadProgressBar = document.querySelector<HTMLElement>('#upload-progress-bar');
const typingTitlesList = document.querySelector<HTMLElement>('#typing-titles-list');
const addTypingTitleButton = document.querySelector<HTMLButtonElement>('#add-typing-title');
const typingTitleInput = document.querySelector<HTMLInputElement>('#typing-title-input');
const taglineCount = document.querySelector<HTMLElement>('#tagline-count');
const bioCount = document.querySelector<HTMLElement>('#bio-count');
const passwordForm = document.querySelector<HTMLFormElement>('#password-form');
const newPasswordInput = document.querySelector<HTMLInputElement>('#new-password');
const passwordStrengthBar = document.querySelector<HTMLElement>('#password-strength-bar');
const dashboardProfileAvatar = document.querySelector<HTMLElement>('#dashboard-profile-avatar');
const dashboardProfileName = document.querySelector<HTMLElement>('#dashboard-profile-name');
const dashboardProfileTitle = document.querySelector<HTMLElement>('#dashboard-profile-title');
const socialLoading = document.querySelector<HTMLElement>('#social-loading');
const socialError = document.querySelector<HTMLElement>('#social-error');
const retrySocialButton = document.querySelector<HTMLButtonElement>('#retry-social');
const socialLinksList = document.querySelector<HTMLElement>('#social-links-list');
const addSocialLinkButton = document.querySelector<HTMLButtonElement>('#add-social-link');
const socialModal = document.querySelector<HTMLElement>('#social-modal');
const socialModalTitle = document.querySelector<HTMLElement>('#social-modal-title');
const socialForm = document.querySelector<HTMLFormElement>('#social-form');
const socialUrl = document.querySelector<HTMLInputElement>('#social-url');
const socialDisplay = document.querySelector<HTMLInputElement>('#social-display');
const socialVisible = document.querySelector<HTMLInputElement>('#social-visible');
const socialCancelButton = document.querySelector<HTMLButtonElement>('#social-cancel');
const deleteModal = document.querySelector<HTMLElement>('#delete-modal');
const deleteCancelButton = document.querySelector<HTMLButtonElement>('#delete-cancel');
const deleteConfirmButton = document.querySelector<HTMLButtonElement>('#delete-confirm');
const certLoading = document.querySelector<HTMLElement>('#cert-loading');
const certError = document.querySelector<HTMLElement>('#cert-error');
const certEmpty = document.querySelector<HTMLElement>('#cert-empty');
const certList = document.querySelector<HTMLElement>('#cert-list');
const retryCertificationsButton = document.querySelector<HTMLButtonElement>('#retry-certifications');
const addCertificationButton = document.querySelector<HTMLButtonElement>('#add-certification');
const deleteAllCertificationsButton = document.querySelector<HTMLButtonElement>('#delete-all-certifications');
const toggleCertOrderingButton = document.querySelector<HTMLButtonElement>('#toggle-cert-ordering');
const certOrderingHint = document.querySelector<HTMLElement>('#cert-ordering-hint');
const certModal = document.querySelector<HTMLElement>('#cert-modal');
const certModalTitle = document.querySelector<HTMLElement>('#cert-modal-title');
const certForm = document.querySelector<HTMLFormElement>('#cert-form');
const certNameInput = document.querySelector<HTMLInputElement>('#cert-name');
const certOrganizationInput = document.querySelector<HTMLInputElement>('#cert-organization');
const certCategoryInput = document.querySelector<HTMLSelectElement>('#cert-category');
const certDateInput = document.querySelector<HTMLInputElement>('#cert-date');
const certLinkInput = document.querySelector<HTMLInputElement>('#cert-link');
const certThumbnailInput = document.querySelector<HTMLInputElement>('#cert-thumbnail-input');
const certPickThumbnailButton = document.querySelector<HTMLButtonElement>('#cert-pick-thumbnail');
const certSelectedThumbnail = document.querySelector<HTMLElement>('#cert-selected-thumbnail');
const certThumbnailPreview = document.querySelector<HTMLElement>('#cert-thumbnail-preview');
const certCancelButton = document.querySelector<HTMLButtonElement>('#cert-cancel');
const certSaveButton = document.querySelector<HTMLButtonElement>('#cert-save');
const certDeleteModal = document.querySelector<HTMLElement>('#cert-delete-modal');
const certDeleteText = document.querySelector<HTMLElement>('#cert-delete-text');
const certDeleteCancel = document.querySelector<HTMLButtonElement>('#cert-delete-cancel');
const certDeleteConfirm = document.querySelector<HTMLButtonElement>('#cert-delete-confirm');
const certImageInput = document.createElement('input');
const contentLoading = document.querySelector<HTMLElement>('#content-loading');
const contentError = document.querySelector<HTMLElement>('#content-error');
const contentAccordion = document.querySelector<HTMLElement>('#content-accordion');
const retryContentButton = document.querySelector<HTMLButtonElement>('#retry-content');
const heroTypingList = document.querySelector<HTMLElement>('#content-hero-typing-list');
const heroTypingInput = document.querySelector<HTMLInputElement>('#content-hero-typing-input');
const heroTypingAdd = document.querySelector<HTMLButtonElement>('#content-hero-typing-add');
const aboutStatsList = document.querySelector<HTMLElement>('#content-about-stats-list');
const aboutAddStatButton = document.querySelector<HTMLButtonElement>('#content-about-add-stat');
const projectsEditorList = document.querySelector<HTMLElement>('#content-projects-list');
const addProjectEditorButton = document.querySelector<HTMLButtonElement>('#content-projects-add');
const togglesLoading = document.querySelector<HTMLElement>('#toggles-loading');
const togglesError = document.querySelector<HTMLElement>('#toggles-error');
const toggleGrid = document.querySelector<HTMLElement>('#toggle-grid');
const resetSettingsButton = document.querySelector<HTMLButtonElement>('#reset-settings');
const retryTogglesButton = document.querySelector<HTMLButtonElement>('#retry-toggles');
const settingsWarningBanner = document.querySelector<HTMLElement>('#settings-warning');

let allMessages: AdminMessage[] = [];
let currentFilter: MessageFilter = 'all';
let selectedMessageId: string | null = null;
let profileState: AdminProfile | null = null;
let pendingProfileImageFile: File | null = null;
let pendingProfileImageObjectUrl: string | null = null;
let profileImageVersion: string | null = localStorage.getItem(PROFILE_IMAGE_VERSION_KEY);
let typingTitlesState: string[] = [];
let socialLinksState: SocialLink[] = [];
let draggingSocialId: string | null = null;
let editingSocialId: string | null = null;
let pendingDeleteSocialId: string | null = null;
let certificationsState: CertificationItem[] = [];
let draggingCertificationId: string | null = null;
let isCertificationOrderingMode = false;
let editingCertificationId: string | null = null;
let pendingCertificationImageId: string | null = null;
let pendingDeleteCertificationId: string | null = null;
let pendingCertThumbnailFile: File | null = null;
let certThumbnailPreviewObjectUrl: string | null = null;
let isSavingCertification = false;
let contentEntriesState: Record<string, ContentEntry> = {};
let heroTypingTitlesState: string[] = [];
let aboutStatsState: Array<{ label: string; value: string }> = [];
let projectsEditorState: Array<{
  name: string;
  subtitle: string;
  description: string;
  features: string[];
  techStack: string[];
}> = [];
let settingsState: PortfolioSetting[] = [];
const SUPPORTED_TOGGLE_KEYS = new Set([
  'marqueeStrips',
  'terminalFeature',
  'scannerFeature',
  'loadingScreen',
  'smoothScroll'
]);
let quoteRotationTimer: number | undefined;
let quoteIndex = 0;
let previousUnreadSnapshot = 0;
let notificationItems: Array<{ id: string; message: string; type: ToastType; timestamp: string; read: boolean }> = [];
let notificationAutoClearTimer: number | undefined;

let unreadPollTimer: number | undefined;
let warningTimer: number | undefined;
let logoutTimer: number | undefined;
let settingsLoaded = false;

async function verifyAccessOrRedirect(): Promise<boolean> {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    window.location.replace('/admin/index.html');
    return false;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      localStorage.removeItem('adminToken');
      window.location.replace('/admin/index.html');
      return false;
    }

    return true;
  } catch {
    localStorage.removeItem('adminToken');
    window.location.replace('/admin/index.html');
    return false;
  }
}

async function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    throw new Error('No admin token found - please login again');
  }

  const method = (options.method ?? 'GET').toUpperCase();
  const headers = new Headers(options.headers ?? {});
  const shouldAttachJsonContentType =
    method !== 'GET' &&
    method !== 'HEAD' &&
    !(options.body instanceof FormData) &&
    !headers.has('Content-Type');

  if (shouldAttachJsonContentType) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('Authorization', `Bearer ${token}`);

  const maxAttempts = method === 'GET' ? 3 : 1;
  let response: Response | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      console.log(`Fetching: ${API_BASE_URL}${url} (attempt ${attempt}/${maxAttempts})`);
      response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      if (attempt < maxAttempts) {
        await new Promise<void>((resolve) => {
          window.setTimeout(resolve, attempt * 300);
        });
        continue;
      }
      console.error(`API fetch failed: ${API_BASE_URL}${url}`, errorMsg);
      throw new Error(`Server unreachable (${API_BASE_URL}${url}): ${errorMsg}`);
    }

    if ((response.status >= 500 || response.status === 429) && attempt < maxAttempts) {
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, attempt * 300);
      });
      continue;
    }

    break;
  }

  if (!response) {
    throw new Error(`No response received (${API_BASE_URL}${url})`);
  }

  if (response.status === 401 || response.status === 403) {
    console.warn('Unauthorized - clearing token and redirecting to login');
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/index.html';
    throw new Error('Unauthorized access - redirecting to login');
  }
  return response;
}

function showToast(message: string, type: ToastType): void {
  if (!toastRoot) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastRoot.appendChild(toast);
  const lower = message.toLowerCase();
  if (
    lower.includes('login') ||
    lower.includes('resume uploaded') ||
    lower.includes('published') ||
    lower.includes('setting updated') ||
    lower.includes('certification saved') ||
    lower.includes('certification added')
  ) {
    pushNotification(message, type);
  }
  window.setTimeout(() => {
    toast.classList.add('hide');
    window.setTimeout(() => toast.remove(), 320);
  }, 4000);
}

function setButtonBusy(button: HTMLButtonElement | null | undefined, busyText = 'Working...'): () => void {
  if (!button) return () => undefined;
  const original = button.textContent ?? '';
  button.disabled = true;
  button.classList.add('is-busy');
  button.textContent = busyText;

  return () => {
    button.disabled = false;
    button.classList.remove('is-busy', 'is-success', 'is-failed');
    button.textContent = original;
  };
}

function markButtonResult(button: HTMLButtonElement | null | undefined, status: 'success' | 'failed', text: string): void {
  if (!button) return;
  button.classList.remove('is-busy');
  button.classList.toggle('is-success', status === 'success');
  button.classList.toggle('is-failed', status === 'failed');
  button.textContent = text;
}

function loadNotificationsFromSession(): void {
  try {
    const raw = sessionStorage.getItem('adminNotifications');
    notificationItems = raw ? (JSON.parse(raw) as typeof notificationItems) : [];
  } catch {
    notificationItems = [];
  }
}

function persistNotifications(): void {
  sessionStorage.setItem('adminNotifications', JSON.stringify(notificationItems.slice(0, 30)));
}

function timeAgoShort(iso: string): string {
  const delta = Date.now() - new Date(iso).getTime();
  const mins = Math.max(1, Math.floor(delta / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function renderNotifications(): void {
  if (!notificationList || !notificationBadge) return;
  const unread = notificationItems.filter((item) => !item.read).length;
  notificationBadge.textContent = unread > 0 ? String(unread) : '';
  notificationBadge.classList.toggle('hidden', unread <= 0);

  if (notificationItems.length === 0) {
    notificationList.innerHTML = '<p class="muted">No notifications yet.</p>';
    return;
  }

  notificationList.innerHTML = notificationItems.slice(0, 10).map((item) => `
    <div class="notification-item ${item.read ? '' : 'unread'}" data-id="${item.id}">
      <span>${item.type === 'error' ? '⚠️' : item.type === 'warning' ? '🟡' : '✅'}</span>
      <div>
        <p>${escapeHtml(item.message)}</p>
        <small>${timeAgoShort(item.timestamp)}</small>
      </div>
    </div>
  `).join('');
}

function pushNotification(message: string, type: ToastType): void {
  notificationItems.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    message,
    type,
    timestamp: new Date().toISOString(),
    read: false
  });
  persistNotifications();
  renderNotifications();
}

function markAllNotificationsRead(): void {
  notificationItems = notificationItems.map((item) => ({ ...item, read: true }));
  persistNotifications();
  renderNotifications();
}

function removeReadNotifications(): void {
  const before = notificationItems.length;
  notificationItems = notificationItems.filter((item) => !item.read);
  if (notificationItems.length === before) {
    return;
  }
  persistNotifications();
  renderNotifications();
}

function markNotificationsSeen(): void {
  const hadUnread = notificationItems.some((item) => !item.read);
  if (!hadUnread) {
    return;
  }
  markAllNotificationsRead();
}

function scheduleAutoClearSeenNotifications(delayMs = 1200): void {
  if (notificationAutoClearTimer) {
    window.clearTimeout(notificationAutoClearTimer);
  }
  notificationAutoClearTimer = window.setTimeout(() => {
    removeReadNotifications();
    notificationAutoClearTimer = undefined;
  }, delayMs);
}

function updateTrend(key: string, value: number): void {
  const el = document.querySelector<HTMLElement>(`.stat-trend[data-trend="${key}"]`);
  if (!el) return;
  const todayKey = new Date().toISOString().slice(0, 10);
  const storageKey = `dashboardTrend:${key}`;

  try {
    const raw = localStorage.getItem(storageKey);
    const parsed = raw ? (JSON.parse(raw) as { day: string; value: number }) : null;
    if (!parsed || parsed.day !== todayKey) {
      localStorage.setItem(storageKey, JSON.stringify({ day: todayKey, value }));
      el.textContent = '↔ baseline';
      return;
    }

    if (value > parsed.value) el.textContent = `↗ +${value - parsed.value} vs yesterday`;
    else if (value < parsed.value) el.textContent = `↘ ${value - parsed.value} vs yesterday`;
    else el.textContent = '↔ no change';
  } catch {
    el.textContent = '↔ stable';
  }
}

function rotateSecurityQuote(): void {
  if (!securityQuote) return;
  securityQuote.textContent = SECURITY_QUOTES[quoteIndex % SECURITY_QUOTES.length];
  quoteIndex += 1;
}

function startQuoteRotation(): void {
  rotateSecurityQuote();
  if (quoteRotationTimer) window.clearInterval(quoteRotationTimer);
  quoteRotationTimer = window.setInterval(rotateSecurityQuote, 10_000);
}

async function loadQuickStats(): Promise<void> {
  try {
    const [blogRes, socialRes, healthRes] = await Promise.all([
      adminFetch('/api/blog/admin'),
      adminFetch('/api/social-links'),
      adminFetch('/api/health')
    ]);

    if (blogRes.ok) {
      const payload = (await blogRes.json()) as { posts?: Array<{ isPublished: boolean }> };
      const count = (payload.posts ?? []).filter((post) => post.isPublished).length;
      if (quickPublishedPosts) quickPublishedPosts.textContent = String(count);
    }

    if (socialRes.ok) {
      const payload = (await socialRes.json()) as { links?: Array<{ isVisible: boolean }> };
      const count = (payload.links ?? []).filter((link) => link.isVisible !== false).length;
      if (quickSocialLinks) quickSocialLinks.textContent = String(count);
    }

    if (healthRes.ok) {
      const payload = (await healthRes.json()) as { uptime?: string };
      if (quickServerUptime) quickServerUptime.textContent = payload.uptime ?? '--';
    }

    if (quickLastLogin) quickLastLogin.textContent = 'Unknown';
  } catch {
    if (quickPublishedPosts) quickPublishedPosts.textContent = '--';
    if (quickSocialLinks) quickSocialLinks.textContent = '--';
    if (quickServerUptime) quickServerUptime.textContent = '--';
  }
}

function updateClock(): void {
  if (!liveClock || !todayDate) return;
  const now = new Date();
  liveClock.textContent = now.toLocaleString(undefined, {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  todayDate.textContent = now.toLocaleDateString(undefined, {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

function setSidebarCollapsed(collapsed: boolean): void {
  document.body.classList.toggle('sidebar-collapsed', collapsed);
}

function setSidebarOpen(open: boolean): void {
  document.body.classList.toggle('sidebar-open', open);
}

function isMobileViewport(): boolean {
  return window.innerWidth < 1024;
}

function syncResponsiveSidebar(): void {
  if (isMobileViewport()) {
    setSidebarCollapsed(false);
    setSidebarOpen(false);
  } else {
    setSidebarOpen(false);
    setSidebarCollapsed(false);
  }
}

function activateSection(section: SectionKey): void {
  navItems.forEach((item) => {
    item.classList.toggle('active', item.dataset.section === section);
  });
  sectionPanels.forEach((panel) => {
    panel.classList.toggle('hidden', panel.dataset.panel !== section);
  });

  if (section === 'toggles' && !settingsLoaded) {
    settingsLoaded = true;
    void loadSettingsControls();
  }
}

function createPlaceholder(section: SectionKey): string {
  return `
    <article class="placeholder-card">
      <p class="placeholder-icon">${sectionIcons[section]}</p>
      <h2>${sectionNames[section]}</h2>
      <p>Coming soon - will be built in next steps.</p>
    </article>
  `;
}

function setupSectionPlaceholders(): void {
  sectionPanels.forEach((panel) => {
    const key = panel.dataset.panel as SectionKey;
    if (key !== 'dashboard' && key !== 'messages' && key !== 'profile' && key !== 'social' && key !== 'content' && key !== 'certifications' && key !== 'toggles' && key !== 'blog' && key !== 'resume') {
      panel.innerHTML = createPlaceholder(key);
    }
  });
}

function animateValue(element: HTMLElement | null, target: number): void {
  if (!element) return;
  const duration = 700;
  const start = Number(element.dataset.current ?? '0');
  const startedAt = performance.now();
  const tick = (timestamp: number): void => {
    const progress = Math.min((timestamp - startedAt) / duration, 1);
    const value = Math.round(start + (target - start) * progress);
    element.textContent = value.toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
    else element.dataset.current = String(target);
  };
  requestAnimationFrame(tick);
}

function timeAgo(isoDate?: string): string {
  if (!isoDate) return 'just now';
  const deltaMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.max(1, Math.floor(deltaMs / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function trimSubject(text: string, maxLength = 42): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function resolveMediaUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE_URL}${url}`;
}

function withCacheVersion(url: string, version?: string | null): string {
  if (!version) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${encodeURIComponent(version)}`;
}

function filteredMessages(): AdminMessage[] {
  if (currentFilter === 'unread') return allMessages.filter((item) => !item.isRead);
  if (currentFilter === 'starred') return allMessages.filter((item) => item.isStarred);
  return allMessages;
}

function renderMessageDetail(message: AdminMessage | null): void {
  if (!messageDetailRoot) return;

  if (!message) {
    messageDetailRoot.innerHTML = `
      <div class="message-detail-empty">
        <p class="empty-icon">📭</p>
        <p>Select a message to read.</p>
      </div>
    `;
    return;
  }

  messageDetailRoot.innerHTML = `
    <div class="message-detail-card">
      <div class="detail-actions">
        <button id="detail-star" class="detail-btn" type="button">${message.isStarred ? '★ Starred' : '☆ Star'}</button>
        <button id="detail-delete" class="detail-btn danger" type="button">Delete</button>
      </div>
      <h3>${escapeHtml(message.subject)}</h3>
      <p><strong>Name:</strong> ${escapeHtml(message.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(message.email)}</p>
      <p><strong>Received:</strong> ${new Date(message.timestamp).toLocaleString()}</p>
      <div class="detail-body">${escapeHtml(message.message).replace(/\n/g, '<br/>')}</div>
    </div>
  `;

  const detailStar = document.querySelector<HTMLButtonElement>('#detail-star');
  const detailDelete = document.querySelector<HTMLButtonElement>('#detail-delete');

  detailStar?.addEventListener('click', () => {
    void handleToggleStar(message._id);
  });

  detailDelete?.addEventListener('click', () => {
    void handleDeleteMessage(message._id);
  });
}

function renderMessageList(): void {
  if (!messageListRoot) return;

  const rows = filteredMessages();
  if (rows.length === 0) {
    messageListRoot.innerHTML = '<p class="messages-empty">No messages yet. Share your portfolio to receive messages.</p>';
    renderMessageDetail(null);
    return;
  }

  messageListRoot.innerHTML = rows
    .map((message) => `
      <button class="inbox-row ${message._id === selectedMessageId ? 'active' : ''}" data-id="${message._id}" type="button">
        <span class="unread-dot ${message.isRead ? 'hidden' : ''}"></span>
        <span class="star-toggle" data-star-id="${message._id}">${message.isStarred ? '★' : '☆'}</span>
        <span class="sender">${escapeHtml(message.name)}</span>
        <span class="subject">${escapeHtml(trimSubject(message.subject))}</span>
        <span class="time">${timeAgo(message.timestamp)}</span>
      </button>
    `)
    .join('');

  messageListRoot.querySelectorAll<HTMLButtonElement>('.inbox-row').forEach((row) => {
    row.addEventListener('click', () => {
      const id = row.dataset.id;
      if (!id) return;
      void openMessage(id);
    });
  });

  messageListRoot.querySelectorAll<HTMLElement>('.star-toggle').forEach((star) => {
    star.addEventListener('click', (event) => {
      event.stopPropagation();
      const id = star.dataset.starId;
      if (!id) return;
      void handleToggleStar(id);
    });
  });

  const selected = allMessages.find((item) => item._id === selectedMessageId) ?? null;
  renderMessageDetail(selected);
}

function updateUnreadBadges(count: number): void {
  if (unreadBadge) {
    unreadBadge.textContent = String(count);
    unreadBadge.classList.toggle('hidden', count <= 0);
  }

  if (messageUnreadBadge) {
    if (count <= 0) {
      messageUnreadBadge.textContent = 'No new';
      messageUnreadBadge.classList.add('zero-state');
      messageUnreadBadge.classList.remove('hidden');
      return;
    }
    messageUnreadBadge.textContent = String(count);
    messageUnreadBadge.classList.remove('hidden', 'zero-state');
  }
}

async function fetchUnreadCount(): Promise<number> {
  try {
    const response = await adminFetch('/api/messages/unread-count');
    if (!response.ok) return 0;
    const data = (await response.json()) as { count?: number };
    const count = Number(data.count ?? 0);
    updateUnreadBadges(count);
    return count;
  } catch {
    return 0;
  }
}

async function fetchMessages(): Promise<void> {
  try {
    const response = await adminFetch('/api/messages');
    if (!response.ok) {
      allMessages = [];
      renderMessageList();
      return;
    }

    const data = (await response.json()) as { messages?: AdminMessage[] };
    allMessages = data.messages ?? [];

    if (selectedMessageId && !allMessages.some((item) => item._id === selectedMessageId)) {
      selectedMessageId = null;
    }

    renderMessageList();
  } catch {
    allMessages = [];
    renderMessageList();
  }
}

async function openMessage(id: string): Promise<void> {
  try {
    const response = await adminFetch(`/api/messages/${id}`);
    if (!response.ok) return;

    const payload = (await response.json()) as { message?: AdminMessage };
    if (!payload.message) return;

    const index = allMessages.findIndex((item) => item._id === id);
    if (index >= 0) {
      allMessages[index] = payload.message;
    }
    selectedMessageId = id;
    renderMessageList();
    await fetchUnreadCount();
  } catch {
    showToast('Failed to open message.', 'error');
  }
}

async function handleToggleStar(id: string): Promise<void> {
  try {
    const response = await adminFetch(`/api/messages/${id}/star`, {
      method: 'PATCH'
    });
    if (!response.ok) {
      showToast('Failed to update star.', 'error');
      return;
    }
    const data = (await response.json()) as { isStarred?: boolean };
    const index = allMessages.findIndex((item) => item._id === id);
    if (index >= 0) {
      allMessages[index].isStarred = Boolean(data.isStarred);
      if (selectedMessageId === id) {
        renderMessageDetail(allMessages[index]);
      }
    }
    renderMessageList();
    showToast('Message star updated.', 'success');
  } catch {
    showToast('Failed to update star.', 'error');
  }
}

async function handleDeleteMessage(id: string): Promise<void> {
  if (!window.confirm('Delete this message?')) return;

  try {
    const response = await adminFetch(`/api/messages/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      showToast('Failed to delete message.', 'error');
      return;
    }
    allMessages = allMessages.filter((item) => item._id !== id);
    if (selectedMessageId === id) {
      selectedMessageId = null;
    }
    renderMessageList();
    await fetchUnreadCount();
    showToast('Message deleted.', 'success');
  } catch {
    showToast('Failed to delete message.', 'error');
  }
}

function setupMessageFilters(): void {
  messageFilterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      currentFilter = (button.dataset.filter as MessageFilter) ?? 'all';
      messageFilterButtons.forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      renderMessageList();
    });
  });
}

function renderProfileImage(url?: string, version?: string | null): void {
  if (!profileImagePreview) return;
  const initials = (profileState?.name ?? 'Prince Kumar')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'PK';

  const initialsNode = document.createElement('span');
  initialsNode.className = 'profile-initials';
  initialsNode.textContent = initials;

  const remoteUrl = (url ?? '').trim();
  if (remoteUrl && /^https?:\/\//i.test(remoteUrl)) {
    const source = withCacheVersion(remoteUrl, version);
    const previewImage = document.createElement('img');
    previewImage.src = source;
    previewImage.alt = 'Profile image';
    previewImage.addEventListener('error', () => {
      profileImagePreview.replaceChildren(initialsNode.cloneNode(true));
    });
    profileImagePreview.replaceChildren(previewImage);

    if (dashboardProfileAvatar) {
      const dashboardImage = document.createElement('img');
      dashboardImage.src = source;
      dashboardImage.alt = 'Profile image';
      dashboardImage.addEventListener('error', () => {
        dashboardProfileAvatar.textContent = initials;
      });
      dashboardProfileAvatar.replaceChildren(dashboardImage);
    }
    return;
  }
  profileImagePreview.replaceChildren(initialsNode);
  if (dashboardProfileAvatar) dashboardProfileAvatar.textContent = initials;
}

function resetPendingProfileImageSelection(): void {
  if (pendingProfileImageObjectUrl) {
    URL.revokeObjectURL(pendingProfileImageObjectUrl);
    pendingProfileImageObjectUrl = null;
  }
  pendingProfileImageFile = null;
  if (selectedImageName) selectedImageName.textContent = 'No file selected.';
  if (profileImageInput) profileImageInput.value = '';
  if (changePhotoButton) {
    changePhotoButton.disabled = true;
    changePhotoButton.textContent = 'Change';
  }
}

function previewPendingProfileImage(file: File): void {
  if (pendingProfileImageObjectUrl) {
    URL.revokeObjectURL(pendingProfileImageObjectUrl);
  }

  pendingProfileImageFile = file;
  pendingProfileImageObjectUrl = URL.createObjectURL(file);
  if (selectedImageName) selectedImageName.textContent = file.name;
  if (changePhotoButton) changePhotoButton.disabled = false;

  const previewImage = document.createElement('img');
  previewImage.src = pendingProfileImageObjectUrl;
  previewImage.alt = 'Selected profile image preview';
  previewImage.addEventListener('error', () => {
    renderProfileImage(profileState?.profileImageUrl, profileImageVersion);
  });
  profileImagePreview?.replaceChildren(previewImage);

  if (changePhotoButton) {
    changePhotoButton.textContent = 'Change';
  }
}

function updateDashboardProfilePreview(profile: AdminProfile | null): void {
  if (!profile) return;
  if (dashboardProfileName) {
    dashboardProfileName.textContent = profile.name?.trim() || 'Prince Kumar';
  }
  if (dashboardProfileTitle) {
    dashboardProfileTitle.textContent = profile.title?.trim() || 'Cybersecurity Enthusiast';
  }
}

function updateCharCount(): void {
  const taglineValue = (document.querySelector<HTMLInputElement | HTMLTextAreaElement>('#profile-tagline')?.value ?? '').trim();
  const bioValue = (document.querySelector<HTMLInputElement | HTMLTextAreaElement>('#profile-bio')?.value ?? '').trim();
  if (taglineCount) taglineCount.textContent = `${taglineValue.length} / 180`;
  if (bioCount) bioCount.textContent = `${bioValue.length} / 800`;
}

function renderTypingTitles(): void {
  if (!typingTitlesList) return;

  typingTitlesList.innerHTML = typingTitlesState
    .map((title, index) => `
      <span class="typing-tag">
        ${escapeHtml(title)}
        <button class="typing-tag-remove" type="button" data-index="${index}" aria-label="Remove title">✕</button>
      </span>
    `)
    .join('');

  typingTitlesList.querySelectorAll<HTMLButtonElement>('.typing-tag-remove').forEach((button) => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.index ?? '-1');
      if (Number.isNaN(index) || index < 0) return;
      if (typingTitlesState.length <= 1) {
        showToast('At least one typing title is required.', 'error');
        return;
      }
      typingTitlesState = typingTitlesState.filter((_item, idx) => idx !== index);
      renderTypingTitles();
    });
  });
}

function fillProfileForm(profile: AdminProfile): void {
  const setValue = (selector: string, value: string): void => {
    const element = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector);
    if (element) element.value = value;
  };

  setValue('#profile-name', profile.name ?? '');
  setValue('#profile-title', profile.title ?? '');
  setValue('#profile-email', profile.email ?? '');
  setValue('#profile-github', profile.githubUrl ?? '');
  setValue('#profile-linkedin', profile.linkedinUrl ?? '');
  setValue('#profile-tagline', profile.tagline ?? '');
  setValue('#profile-bio', profile.bio ?? '');

  typingTitlesState = Array.isArray(profile.typingTitles) && profile.typingTitles.length > 0
    ? [...profile.typingTitles]
    : ['Cybersecurity Enthusiast'];

  renderTypingTitles();
  updateCharCount();
  updateDashboardProfilePreview(profile);
  renderProfileImage(profile.profileImageUrl, profileImageVersion ?? profile.lastUpdated ?? null);
}

async function loadProfileManager(): Promise<void> {
  profileLoading?.classList.remove('hidden');
  profileError?.classList.add('hidden');
  profileForm?.classList.add('hidden');

  try {
    const response = await adminFetch('/api/profile');
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch profile`);
    }
    const data = (await response.json()) as { profile?: AdminProfile };
    if (!data.profile) throw new Error('No profile data in response');

    profileState = data.profile;
    fillProfileForm(data.profile);

    profileLoading?.classList.add('hidden');
    profileError?.classList.add('hidden');
    profileForm?.classList.remove('hidden');
  } catch (error) {
    console.error('Profile load error:', error);
    profileLoading?.classList.add('hidden');
    profileError?.classList.remove('hidden');
  }
}

async function saveProfile(): Promise<void> {
  if (!profileForm) return;

  const payload: AdminProfile = {
    name: (document.querySelector<HTMLInputElement>('#profile-name')?.value ?? '').trim(),
    title: (document.querySelector<HTMLInputElement>('#profile-title')?.value ?? '').trim(),
    email: (document.querySelector<HTMLInputElement>('#profile-email')?.value ?? '').trim(),
    githubUrl: (document.querySelector<HTMLInputElement>('#profile-github')?.value ?? '').trim(),
    linkedinUrl: (document.querySelector<HTMLInputElement>('#profile-linkedin')?.value ?? '').trim(),
    tagline: (document.querySelector<HTMLTextAreaElement>('#profile-tagline')?.value ?? '').trim(),
    bio: (document.querySelector<HTMLTextAreaElement>('#profile-bio')?.value ?? '').trim(),
    typingTitles: typingTitlesState,
    profileImageUrl: profileState?.profileImageUrl ?? ''
  };

  const button = document.querySelector<HTMLButtonElement>('#save-profile-btn');
  const restoreButton = setButtonBusy(button, 'Saving...');

  try {
    const response = await adminFetch('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      showToast('Failed to save profile.', 'error');
      return;
    }
    const data = (await response.json()) as { profile?: AdminProfile };
    if (data.profile) profileState = data.profile;
    profileImageVersion = profileState?.lastUpdated ?? profileImageVersion;
    updateDashboardProfilePreview(profileState);
    renderProfileImage(profileState?.profileImageUrl, profileImageVersion);
    markButtonResult(button, 'success', 'Saved ✓');
    showToast('Profile saved successfully.', 'success');
  } catch {
    markButtonResult(button, 'failed', 'Failed ✗');
    showToast('Failed to save profile.', 'error');
  } finally {
    window.setTimeout(() => {
      restoreButton();
    }, 900);
  }
}

function uploadProfileImage(file: File): void {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    showToast('Please log in again.', 'error');
    return;
  }

  const formData = new FormData();
  formData.append('image', file);

  uploadProgressWrap?.classList.remove('hidden');
  if (uploadProgressBar) uploadProgressBar.style.width = '0%';
  if (changePhotoButton) {
    changePhotoButton.disabled = true;
    changePhotoButton.textContent = 'Uploading...';
  }

  const xhr = new XMLHttpRequest();
  xhr.open('POST', `${API_BASE_URL}/api/profile/upload-image`, true);
  xhr.setRequestHeader('Authorization', `Bearer ${token}`);
  xhr.timeout = 25_000;

  xhr.upload.onprogress = (event: ProgressEvent<EventTarget>) => {
    if (!event.lengthComputable || !uploadProgressBar) return;
    const progress = Math.round((event.loaded / event.total) * 100);
    uploadProgressBar.style.width = `${progress}%`;
  };

  xhr.onload = () => {
    uploadProgressWrap?.classList.add('hidden');
    if (changePhotoButton) changePhotoButton.textContent = 'Change';
    if (xhr.status < 200 || xhr.status >= 300) {
      if (changePhotoButton) changePhotoButton.disabled = false;
      showToast('Image upload failed.', 'error');
      return;
    }
    try {
      const payload = JSON.parse(xhr.responseText) as { profileImageUrl?: string; imageUrl?: string; profile?: AdminProfile };
      const nextUrl = payload.profileImageUrl ?? payload.imageUrl;
      if (nextUrl) {
        if (!profileState) {
          profileState = {
            name: '',
            title: '',
            tagline: '',
            email: '',
            bio: '',
            profileImageUrl: nextUrl,
            githubUrl: '',
            linkedinUrl: '',
            typingTitles: ['Cybersecurity Enthusiast']
          };
        } else {
          profileState.profileImageUrl = nextUrl;
        }
        if (payload.profile) {
          profileState = payload.profile;
        }
        profileImageVersion = String(Date.now());
        localStorage.setItem(PROFILE_IMAGE_VERSION_KEY, profileImageVersion);
        renderProfileImage(nextUrl, profileImageVersion);
        updateDashboardProfilePreview(profileState);
      }
      resetPendingProfileImageSelection();
      showToast('Profile image updated.', 'success');
    } catch {
      if (changePhotoButton) changePhotoButton.disabled = false;
      showToast('Image upload failed.', 'error');
    }
  };

  xhr.onerror = () => {
    uploadProgressWrap?.classList.add('hidden');
    if (changePhotoButton) {
      changePhotoButton.disabled = false;
      changePhotoButton.textContent = 'Change';
    }
    showToast('Image upload failed.', 'error');
  };

  xhr.ontimeout = () => {
    uploadProgressWrap?.classList.add('hidden');
    if (changePhotoButton) {
      changePhotoButton.disabled = false;
      changePhotoButton.textContent = 'Change';
    }
    showToast('Image upload timed out. Please try again.', 'error');
  };

  xhr.send(formData);
}

function evaluatePasswordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  return score;
}

function renderPasswordStrength(password: string): void {
  if (!passwordStrengthBar) return;
  const score = evaluatePasswordStrength(password);
  const width = (score / 4) * 100;
  passwordStrengthBar.style.width = `${width}%`;
  passwordStrengthBar.className = 'password-strength-bar';
  if (score <= 1) passwordStrengthBar.classList.add('weak');
  else if (score <= 3) passwordStrengthBar.classList.add('medium');
  else passwordStrengthBar.classList.add('strong');
}

function socialIcon(platform: string): string {
  const normalized = platform.toLowerCase();
  if (normalized === 'github') return '🐙';
  if (normalized === 'linkedin') return 'in';
  if (normalized === 'email') return '✉';
  return '🔗';
}

function renderSocialLinksList(): void {
  if (!socialLinksList) return;

  if (socialLinksState.length === 0) {
    socialLinksList.innerHTML = '<p class="muted">No social links available. Add your first one.</p>';
    return;
  }

  socialLinksList.innerHTML = socialLinksState
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((link) => `
      <article class="social-link-card ${draggingSocialId === link._id ? 'dragging' : ''}" draggable="true" data-id="${link._id}">
        <span class="drag-handle" aria-hidden="true">⋮⋮</span>
        <span class="social-icon">${escapeHtml(socialIcon(link.platform))}</span>
        <div class="social-info">
          <p class="social-platform">${escapeHtml(link.platform)}</p>
          <p class="social-url">${escapeHtml(link.displayText || link.url)}</p>
        </div>
        <label class="switch">
          <input class="social-visible-toggle" type="checkbox" data-id="${link._id}" ${link.isVisible ? 'checked' : ''} />
          <span class="slider"></span>
        </label>
        <button class="social-action" data-action="edit" data-id="${link._id}" type="button">✎</button>
        <button class="social-action danger" data-action="delete" data-id="${link._id}" type="button">🗑</button>
      </article>
    `)
    .join('');

  socialLinksList.querySelectorAll<HTMLElement>('.social-link-card').forEach((card) => {
    card.addEventListener('dragstart', () => {
      draggingSocialId = card.dataset.id ?? null;
      card.classList.add('dragging');
    });

    card.addEventListener('dragend', () => {
      draggingSocialId = null;
      card.classList.remove('dragging');
    });

    card.addEventListener('dragover', (event) => {
      event.preventDefault();
      card.classList.add('drag-over');
    });

    card.addEventListener('dragleave', () => {
      card.classList.remove('drag-over');
    });

    card.addEventListener('drop', (event) => {
      event.preventDefault();
      card.classList.remove('drag-over');
      const targetId = card.dataset.id;
      if (!draggingSocialId || !targetId || draggingSocialId === targetId) return;
      void reorderSocialLinks(draggingSocialId, targetId);
    });
  });

  socialLinksList.querySelectorAll<HTMLInputElement>('.social-visible-toggle').forEach((toggle) => {
    toggle.addEventListener('change', () => {
      const id = toggle.dataset.id;
      if (!id) return;
      void toggleSocialVisibility(id, toggle);
    });
  });

  socialLinksList.querySelectorAll<HTMLButtonElement>('.social-action').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.id;
      const action = button.dataset.action;
      if (!id) return;
      if (action === 'edit') {
        openSocialModal(id);
        return;
      }
      pendingDeleteSocialId = id;
      deleteModal?.classList.remove('hidden');
    });
  });
}

async function loadSocialLinks(): Promise<void> {
  socialLoading?.classList.remove('hidden');
  socialError?.classList.add('hidden');
  socialLinksList?.classList.add('hidden');

  try {
    const response = await adminFetch('/api/social-links');
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch social links`);
    }
    const data = (await response.json()) as { links?: SocialLink[] };
    if (!Array.isArray(data.links)) {
      console.warn('Social links not an array, using empty array');
    }
    socialLinksState = data.links ?? [];
    renderSocialLinksList();
    socialLoading?.classList.add('hidden');
    socialError?.classList.add('hidden');
    socialLinksList?.classList.remove('hidden');
  } catch (error) {
    console.error('Social links load error:', error);
    socialLoading?.classList.add('hidden');
    socialError?.classList.remove('hidden');
  }
}

async function toggleSocialVisibility(id: string, toggleControl?: HTMLInputElement): Promise<void> {
  if (toggleControl) {
    toggleControl.disabled = true;
  }

  try {
    const response = await adminFetch(`/api/social-links/${id}/visibility`, {
      method: 'PATCH'
    });
    if (!response.ok) {
      showToast('Failed to update visibility.', 'error');
      return;
    }
    await loadSocialLinks();
    showToast('Visibility updated.', 'success');
  } catch {
    showToast('Failed to update visibility.', 'error');
  } finally {
    if (toggleControl) {
      toggleControl.disabled = false;
    }
  }
}

async function reorderSocialLinks(sourceId: string, targetId: string): Promise<void> {
  const ordered = socialLinksState.slice().sort((a, b) => a.order - b.order);
  const sourceIndex = ordered.findIndex((item) => item._id === sourceId);
  const targetIndex = ordered.findIndex((item) => item._id === targetId);
  if (sourceIndex < 0 || targetIndex < 0) return;

  const [moved] = ordered.splice(sourceIndex, 1);
  ordered.splice(targetIndex, 0, moved);
  const ids = ordered.map((item) => item._id);

  try {
    const response = await adminFetch('/api/social-links/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ ids })
    });
    if (!response.ok) {
      showToast('Failed to reorder links.', 'error');
      return;
    }
    socialLinksState = ordered.map((item, index) => ({ ...item, order: index }));
    renderSocialLinksList();
  } catch {
    showToast('Failed to reorder links.', 'error');
  }
}

function openSocialModal(id?: string): void {
  editingSocialId = id ?? null;
  const editing = socialLinksState.find((item) => item._id === id);

  if (socialModalTitle) {
    socialModalTitle.textContent = editing ? 'Edit Social Link' : 'Add Social Link';
  }

  if (socialUrl) socialUrl.value = editing?.url ?? '';
  if (socialDisplay) socialDisplay.value = editing?.displayText ?? '';
  if (socialVisible) socialVisible.checked = editing?.isVisible ?? true;

  socialModal?.classList.remove('hidden');
}

function closeSocialModal(): void {
  socialModal?.classList.add('hidden');
  editingSocialId = null;
}

function detectPlatformFromUrl(rawUrl: string): 'GitHub' | 'LinkedIn' | 'Email' | 'Other' {
  const url = rawUrl.trim().toLowerCase();
  if (!url) return 'Other';
  if (url.startsWith('mailto:') || /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/.test(url)) return 'Email';
  if (url.includes('github.com')) return 'GitHub';
  if (url.includes('linkedin.com')) return 'LinkedIn';
  return 'Other';
}

function normalizeSocialUrl(rawUrl: string): string | null {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

  if (/^mailto:/i.test(trimmed)) {
    const email = trimmed.replace(/^mailto:/i, '').trim();
    return emailPattern.test(email) ? `mailto:${email}` : null;
  }

  if (emailPattern.test(trimmed)) {
    return `mailto:${trimmed}`;
  }

  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return candidate;
  } catch {
    return null;
  }
}

async function saveSocialLink(): Promise<void> {
  if (!socialUrl || !socialDisplay || !socialVisible) return;

  const normalizedUrl = normalizeSocialUrl(socialUrl.value);
  if (!normalizedUrl) {
    showToast('Enter a valid URL or email address.', 'error');
    return;
  }

  const platform = detectPlatformFromUrl(normalizedUrl);

  const payload = {
    platform,
    url: normalizedUrl,
    displayText: socialDisplay.value.trim(),
    isVisible: socialVisible.checked,
    icon: platform.toLowerCase()
  };

  const method = editingSocialId ? 'PUT' : 'POST';
  const endpoint = editingSocialId ? `/api/social-links/${editingSocialId}` : '/api/social-links';
  const submitButton = socialForm?.querySelector<HTMLButtonElement>('button[type="submit"]');
  const restoreButton = setButtonBusy(submitButton, editingSocialId ? 'Updating...' : 'Saving...');

  try {
    const response = await adminFetch(endpoint, {
      method,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      markButtonResult(submitButton, 'failed', 'Failed ✗');
      showToast('Failed to save social link.', 'error');
      return;
    }

    closeSocialModal();
    await loadSocialLinks();
    markButtonResult(submitButton, 'success', 'Saved ✓');
    showToast('Social link saved.', 'success');
  } catch {
    markButtonResult(submitButton, 'failed', 'Failed ✗');
    showToast('Failed to save social link.', 'error');
  } finally {
    window.setTimeout(() => {
      restoreButton();
    }, 900);
  }
}

async function confirmDeleteSocialLink(): Promise<void> {
  if (!pendingDeleteSocialId) return;
  const restoreButton = setButtonBusy(deleteConfirmButton, 'Deleting...');
  try {
    const response = await adminFetch(`/api/social-links/${pendingDeleteSocialId}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      markButtonResult(deleteConfirmButton, 'failed', 'Failed ✗');
      showToast('Failed to delete link.', 'error');
      return;
    }
    deleteModal?.classList.add('hidden');
    pendingDeleteSocialId = null;
    await loadSocialLinks();
    markButtonResult(deleteConfirmButton, 'success', 'Deleted ✓');
    showToast('Social link deleted.', 'success');
  } catch {
    markButtonResult(deleteConfirmButton, 'failed', 'Failed ✗');
    showToast('Failed to delete link.', 'error');
  } finally {
    window.setTimeout(() => {
      restoreButton();
    }, 900);
  }
}

function setupProfileAndSocialHandlers(): void {
  retryProfileButton?.addEventListener('click', () => {
    void loadProfileManager();
  });

  retrySocialButton?.addEventListener('click', () => {
    void loadSocialLinks();
  });

  addTypingTitleButton?.addEventListener('click', () => {
    const value = typingTitleInput?.value.trim() ?? '';
    if (!value) return;
    typingTitlesState.push(value);
    if (typingTitleInput) typingTitleInput.value = '';
    renderTypingTitles();
  });

  typingTitleInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addTypingTitleButton?.click();
    }
  });

  document.querySelector<HTMLInputElement>('#profile-tagline')?.addEventListener('input', updateCharCount);
  document.querySelector<HTMLInputElement>('#profile-bio')?.addEventListener('input', updateCharCount);

  profileForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    void saveProfile();
  });

  usernameForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const nextUsername = (newUsernameInput?.value ?? '').trim();
    const currentPassword = (usernamePasswordInput?.value ?? '').trim();

    if (!nextUsername || !currentPassword) {
      showToast('Username and current password are required.', 'error');
      return;
    }

    try {
      const response = await adminFetch('/api/auth/change-username', {
        method: 'PUT',
        body: JSON.stringify({ newUsername: nextUsername, currentPassword })
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string; token?: string }
        | null;

      if (!response.ok) {
        showToast(payload?.error ?? 'Failed to change username.', 'error');
        return;
      }

      if (payload?.token) {
        localStorage.setItem('adminToken', payload.token);
      }

      usernameForm.reset();
      showToast('Username changed successfully.', 'success');
    } catch {
      showToast('Failed to change username.', 'error');
    }
  });

  uploadPhotoButton?.addEventListener('click', () => {
    if (profileImageInput) profileImageInput.value = '';
    profileImageInput?.click();
  });

  profileImageInput?.addEventListener('change', () => {
    const file = profileImageInput.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please choose a valid image file.', 'error');
      profileImageInput.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be 5MB or smaller.', 'error');
      profileImageInput.value = '';
      return;
    }
    previewPendingProfileImage(file);
  });

  changePhotoButton?.addEventListener('click', () => {
    if (!pendingProfileImageFile) {
      showToast('Select an image with Upload before applying Change.', 'warning');
      return;
    }
    uploadProfileImage(pendingProfileImageFile);
  });

  newPasswordInput?.addEventListener('input', () => {
    renderPasswordStrength(newPasswordInput.value);
  });

  passwordForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const currentPassword = (document.querySelector<HTMLInputElement>('#current-password')?.value ?? '').trim();
    const newPassword = (document.querySelector<HTMLInputElement>('#new-password')?.value ?? '').trim();
    const confirmPassword = (document.querySelector<HTMLInputElement>('#confirm-password')?.value ?? '').trim();

    if (newPassword !== confirmPassword) {
      showToast('New password and confirm password do not match.', 'error');
      return;
    }

    try {
      const response = await adminFetch('/api/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string; token?: string }
        | null;

      if (!response.ok) {
        showToast(payload?.error ?? 'Failed to change password.', 'error');
        return;
      }

      if (payload?.token) {
        localStorage.setItem('adminToken', payload.token);
      }

      passwordForm.reset();
      renderPasswordStrength('');
      showToast('Password changed successfully.', 'success');
    } catch {
      showToast('Failed to change password.', 'error');
    }
  });

  addSocialLinkButton?.addEventListener('click', () => {
    openSocialModal();
  });

  socialCancelButton?.addEventListener('click', () => {
    closeSocialModal();
  });

  socialForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    void saveSocialLink();
  });

  deleteCancelButton?.addEventListener('click', () => {
    deleteModal?.classList.add('hidden');
    pendingDeleteSocialId = null;
  });

  deleteConfirmButton?.addEventListener('click', () => {
    void confirmDeleteSocialLink();
  });
}

function certificationIconLink(url?: string): string {
  if (!url) return '';
  return `<a class="cert-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" aria-label="Credential Link">↗</a>`;
}

function uploadCertificationImage(id: string, file: File): void {
  const token = localStorage.getItem('adminToken');
  if (!token) return;

  const formData = new FormData();
  formData.append('image', file);

  const xhr = new XMLHttpRequest();
  xhr.open('POST', `${API_BASE_URL}/api/certifications/${id}/upload-image`, true);
  xhr.setRequestHeader('Authorization', `Bearer ${token}`);

  xhr.onload = async () => {
    if (xhr.status < 200 || xhr.status >= 300) {
      showToast('Certification image upload failed.', 'error');
      return;
    }
    showToast('Certification image updated.', 'success');
    await loadCertificationsAdmin();
  };

  xhr.onerror = () => {
    showToast('Certification image upload failed.', 'error');
  };

  xhr.send(formData);
}

function renderCertificationList(): void {
  if (!certList || !certEmpty) return;

  const ordered = certificationsState.slice().sort((a, b) => a.order - b.order);
  certEmpty.classList.toggle('hidden', ordered.length > 0);

  if (ordered.length === 0) {
    certList.innerHTML = '';
    return;
  }

  certList.classList.toggle('ordering-mode', isCertificationOrderingMode);

  certList.innerHTML = ordered.map((cert) => `
    <article class="cert-manager-card ${draggingCertificationId === cert._id ? 'dragging' : ''}" draggable="${isCertificationOrderingMode}" data-id="${cert._id}">
      <span class="drag-handle" aria-hidden="true">⋮⋮</span>
      ${cert.imageUrl ? `<img class="cert-thumb" src="${escapeHtml(cert.imageUrl)}" alt="${escapeHtml(cert.name)}" />` : '<div class="cert-thumb cert-thumb-placeholder" aria-hidden="true">IMG</div>'}
      <div class="cert-main">
        <p class="cert-name">${escapeHtml(cert.name)}</p>
        <p class="cert-org">${escapeHtml(cert.organization)}</p>
        <div class="cert-meta-row">
          <span class="cert-category-chip" style="background:${escapeHtml(cert.accentColor)}22;color:${escapeHtml(cert.accentColor)}">${escapeHtml(cert.category)}</span>
          ${cert.dateEarned ? `<span class="cert-date">${escapeHtml(cert.dateEarned)}</span>` : ''}
          ${certificationIconLink(cert.credentialLink)}
        </div>
      </div>
      <div class="cert-actions">
        <button class="cert-action" data-action="upload-image" data-id="${cert._id}" type="button" title="Upload image">🖼</button>
        <button class="cert-action" data-action="visibility" data-id="${cert._id}" type="button">${cert.isVisible ? '👁' : '🙈'}</button>
        <button class="cert-action" data-action="edit" data-id="${cert._id}" type="button">✎</button>
        <button class="cert-action danger" data-action="delete" data-id="${cert._id}" type="button">🗑</button>
      </div>
    </article>
  `).join('');

  certList.querySelectorAll<HTMLElement>('.cert-manager-card').forEach((card) => {
    card.addEventListener('dragstart', () => {
      if (!isCertificationOrderingMode) return;
      draggingCertificationId = card.dataset.id ?? null;
      card.classList.add('dragging');
    });
    card.addEventListener('dragend', () => {
      if (!isCertificationOrderingMode) return;
      draggingCertificationId = null;
      card.classList.remove('dragging');
    });
    card.addEventListener('dragover', (event) => {
      if (!isCertificationOrderingMode) return;
      event.preventDefault();
      card.classList.add('drag-over');
    });
    card.addEventListener('dragleave', () => {
      if (!isCertificationOrderingMode) return;
      card.classList.remove('drag-over');
    });
    card.addEventListener('drop', (event) => {
      if (!isCertificationOrderingMode) return;
      event.preventDefault();
      card.classList.remove('drag-over');
      const targetId = card.dataset.id;
      if (!draggingCertificationId || !targetId || draggingCertificationId === targetId) return;
      void reorderCertifications(draggingCertificationId, targetId);
    });
  });

  certList.querySelectorAll<HTMLButtonElement>('.cert-action').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.id;
      const action = button.dataset.action;
      if (!id || !action) return;

      if (action === 'visibility') {
        void toggleCertificationVisibility(id, button);
        return;
      }
      if (action === 'upload-image') {
        pendingCertificationImageId = id;
        certImageInput.click();
        return;
      }
      if (action === 'edit') {
        openCertificationModal(id);
        return;
      }
      const cert = certificationsState.find((item) => item._id === id);
      pendingDeleteCertificationId = id;
      if (certDeleteText) {
        certDeleteText.textContent = `Delete ${cert?.name ?? 'this certification'}? This cannot be undone.`;
      }
      certDeleteModal?.classList.remove('hidden');
    });
  });
}

async function loadCertificationsAdmin(): Promise<void> {
  certLoading?.classList.remove('hidden');
  certError?.classList.add('hidden');
  certList?.classList.add('hidden');
  certEmpty?.classList.add('hidden');

  try {
    const response = await adminFetch('/api/certifications/admin');
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch certifications`);
    }
    const payload = (await response.json()) as { certifications?: CertificationItem[] };
    if (!Array.isArray(payload.certifications)) {
      console.warn('Certifications not an array, using empty array');
    }
    certificationsState = payload.certifications ?? [];
    renderCertificationList();
    certLoading?.classList.add('hidden');
    certError?.classList.add('hidden');
    certList?.classList.remove('hidden');
  } catch (error) {
    console.error('Certifications load error:', error);
    certLoading?.classList.add('hidden');
    certError?.classList.remove('hidden');
  }
}

function openCertificationModal(id?: string): void {
  editingCertificationId = id ?? null;
  const editing = certificationsState.find((item) => item._id === id);

  if (certModalTitle) {
    certModalTitle.textContent = editing ? 'Edit Certification' : 'Add Certification';
  }
  if (certNameInput) certNameInput.value = editing?.name ?? '';
  if (certOrganizationInput) certOrganizationInput.value = editing?.organization ?? '';
  if (certCategoryInput) certCategoryInput.value = editing?.category ?? 'Cybersecurity';
  if (certDateInput) certDateInput.value = editing?.dateEarned ?? '';
  if (certLinkInput) certLinkInput.value = editing?.credentialLink ?? '';

  // Reset thumbnail inputs
  pendingCertThumbnailFile = null;
  if (certThumbnailInput) certThumbnailInput.value = '';
  if (certSelectedThumbnail) {
    certSelectedThumbnail.textContent = editing?.imageUrl ? 'Current image selected (pick new to replace)' : 'No image selected';
  }
  if (certThumbnailPreviewObjectUrl) {
    URL.revokeObjectURL(certThumbnailPreviewObjectUrl);
    certThumbnailPreviewObjectUrl = null;
  }
  if (certThumbnailPreview) {
    if (editing?.imageUrl) {
      certThumbnailPreview.innerHTML = `<img src="${editing.imageUrl}" alt="Current thumbnail" />`;
    } else {
      certThumbnailPreview.textContent = 'No image selected';
    }
  }



  certModal?.classList.remove('hidden');
}

function closeCertificationModal(): void {
  certModal?.classList.add('hidden');
  editingCertificationId = null;
  pendingCertThumbnailFile = null;
  if (certThumbnailInput) certThumbnailInput.value = '';
  if (certThumbnailPreviewObjectUrl) {
    URL.revokeObjectURL(certThumbnailPreviewObjectUrl);
    certThumbnailPreviewObjectUrl = null;
  }
  if (certSelectedThumbnail) {
    certSelectedThumbnail.textContent = 'No image selected';
  }
  if (certThumbnailPreview) {
    certThumbnailPreview.textContent = 'No image selected';
  }
}

async function saveCertification(): Promise<void> {
  console.log('🟢 saveCertification called');
  
  // Prevent concurrent submissions
  if (isSavingCertification) {
    console.warn('⚠️ Certification save already in progress, returning early');
    return;
  }
  
  console.log('🟢 isSavingCertification flag check passed');
  console.log('🟢 certNameInput:', certNameInput, certNameInput?.value);
  console.log('🟢 certOrganizationInput:', certOrganizationInput, certOrganizationInput?.value);
  console.log('🟢 certCategoryInput:', certCategoryInput, certCategoryInput?.value);
  console.log('🟢 certDateInput:', certDateInput, certDateInput?.value);
  console.log('🟢 certLinkInput:', certLinkInput, certLinkInput?.value);
  
  if (!certNameInput || !certOrganizationInput || !certCategoryInput || !certDateInput || !certLinkInput) {
    console.error('🔴 Form elements not found');
    showToast('Form elements not found. Please refresh the page.', 'error');
    return;
  }

  const name = certNameInput.value.trim();
  const organization = certOrganizationInput.value.trim();
  const category = certCategoryInput.value.trim();
  const dateEarned = certDateInput.value.trim();
  const credentialLink = certLinkInput.value.trim();

  console.log('🟢 Form values:', { name, organization, category, dateEarned, credentialLink });

  if (!name || !organization || !category) {
    console.warn('⚠️ Required fields missing');
    showToast('Name, organization and category are required.', 'error');
    return;
  }

  isSavingCertification = true;
  console.log('🟢 isSavingCertification set to true');

  // Update save button appearance
  const originalButtonText = certSaveButton?.textContent ?? 'Save';
  if (certSaveButton) {
    certSaveButton.disabled = true;
    certSaveButton.textContent = '⏳ Saving...';
  }

  const method = editingCertificationId ? 'PUT' : 'POST';
  const endpoint = editingCertificationId ? `/api/certifications/${editingCertificationId}` : '/api/certifications';

  // Use FormData to support file upload alongside text fields
  const formData = new FormData();
  formData.append('name', name);
  formData.append('organization', organization);
  formData.append('category', category);
  formData.append('dateEarned', dateEarned);
  formData.append('credentialLink', credentialLink);
  
  if (pendingCertThumbnailFile) {
    console.log('🟢 File to upload:', pendingCertThumbnailFile.name, 'Size:', pendingCertThumbnailFile.size);
    formData.append('image', pendingCertThumbnailFile);
  } else {
    console.log('ℹ️ No file selected for upload');
  }

  console.log('🟢 FormData constructed, about to send to', endpoint);

  try {
    // Create fetch with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('⏱️ Request timeout - aborting');
      controller.abort();
    }, 60000); // 60 second timeout

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    console.log('🟢 Response received with status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('🔴 Save certification failed:', response.status, errorData);
      showToast(errorData.error || 'Failed to save certification.', 'error');
      
      // Show error state on button
      if (certSaveButton) {
        certSaveButton.textContent = '✗ Failed';
        setTimeout(() => {
          certSaveButton.textContent = originalButtonText;
          certSaveButton.disabled = false;
        }, 2000);
      }
      isSavingCertification = false;
      return;
    }
    console.log('🟢 Response OK, closing modal and reloading');
    
    // Show success state on button
    if (certSaveButton) {
      certSaveButton.textContent = '✓ Saved';
      setTimeout(() => {
        certSaveButton.textContent = originalButtonText;
        certSaveButton.disabled = false;
      }, 2000);
    }
    
    closeCertificationModal();
    await loadCertificationsAdmin();
    showToast('Certification saved successfully.', 'success');
    isSavingCertification = false;
  } catch (error) {
    console.error('🔴 Certification save error:', error);
    
    // Show error state on button
    if (certSaveButton) {
      certSaveButton.textContent = '✗ Failed';
      setTimeout(() => {
        certSaveButton.textContent = originalButtonText;
        certSaveButton.disabled = false;
      }, 2000);
    }
    
    if (error instanceof Error && error.name === 'AbortError') {
      showToast('Upload timed out. File too large or connection slow.', 'error');
    } else {
      showToast('Failed to save certification. Check console for details.', 'error');
    }
    isSavingCertification = false;
  }
}

async function toggleCertificationVisibility(id: string, triggerButton?: HTMLButtonElement): Promise<void> {
  const restoreButton = setButtonBusy(triggerButton, '...');
  try {
    const response = await adminFetch(`/api/certifications/${id}/visibility`, {
      method: 'PATCH'
    });
    if (!response.ok) {
      markButtonResult(triggerButton, 'failed', '✗');
      showToast('Failed to toggle visibility.', 'error');
      return;
    }
    await loadCertificationsAdmin();
    markButtonResult(triggerButton, 'success', '✓');
    showToast('Visibility updated.', 'success');
  } catch {
    markButtonResult(triggerButton, 'failed', '✗');
    showToast('Failed to toggle visibility.', 'error');
  } finally {
    window.setTimeout(() => {
      restoreButton();
    }, 700);
  }
}

async function deleteAllCertifications(): Promise<void> {
  const restoreButton = setButtonBusy(deleteAllCertificationsButton, 'Clearing...');
  try {
    console.log('🟡 Deleting all certifications...');
    const response = await adminFetch('/api/certifications/clear-all', {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('🔴 Delete all certifications failed:', response.status, errorData);
      const backendMessage = typeof errorData.error === 'string' ? errorData.error : 'Failed to delete certifications.';
      markButtonResult(deleteAllCertificationsButton, 'failed', 'Failed ✗');
      showToast(`Delete all failed (${response.status}): ${backendMessage}`, 'error');
      return;
    }
    
    const result = await response.json().catch(() => ({}));
    console.log('🟢 Delete all API result:', result);
    console.log('🟢 All certifications deleted successfully');
    await loadCertificationsAdmin();
    markButtonResult(deleteAllCertificationsButton, 'success', 'Cleared ✓');
    const deletedCount = typeof result.deletedCount === 'number' ? result.deletedCount : null;
    showToast(
      deletedCount !== null
        ? `All certifications deleted successfully (${deletedCount} removed).`
        : 'All certifications deleted successfully.',
      'success'
    );
  } catch (error) {
    console.error('🔴 Delete all certifications error:', error);
    markButtonResult(deleteAllCertificationsButton, 'failed', 'Failed ✗');
    showToast('Failed to delete certifications. Check console for details.', 'error');
  } finally {
    window.setTimeout(() => {
      restoreButton();
    }, 900);
  }
}

async function reorderCertifications(sourceId: string, targetId: string): Promise<void> {
  const ordered = certificationsState.slice().sort((a, b) => a.order - b.order);
  const from = ordered.findIndex((item) => item._id === sourceId);
  const to = ordered.findIndex((item) => item._id === targetId);
  if (from < 0 || to < 0) return;

  const [moved] = ordered.splice(from, 1);
  ordered.splice(to, 0, moved);

  try {
    const response = await adminFetch('/api/certifications/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ ids: ordered.map((item) => item._id) })
    });
    if (!response.ok) {
      showToast('Failed to reorder certifications.', 'error');
      return;
    }
    certificationsState = ordered.map((item, index) => ({ ...item, order: index }));
    renderCertificationList();
    showToast('Certification order saved.', 'success');
  } catch {
    showToast('Failed to reorder certifications.', 'error');
  }
}

function setCertificationOrderingMode(enabled: boolean): void {
  isCertificationOrderingMode = enabled;
  toggleCertOrderingButton?.setAttribute('aria-pressed', enabled ? 'true' : 'false');
  if (toggleCertOrderingButton) {
    toggleCertOrderingButton.textContent = enabled ? 'Ordering: On' : 'Ordering: Off';
    toggleCertOrderingButton.classList.toggle('is-success', enabled);
  }
  certOrderingHint?.classList.toggle('hidden', !enabled);
  renderCertificationList();
}

async function confirmDeleteCertification(): Promise<void> {
  if (!pendingDeleteCertificationId) return;
  const restoreButton = setButtonBusy(certDeleteConfirm, 'Deleting...');
  try {
    const response = await adminFetch(`/api/certifications/${pendingDeleteCertificationId}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      markButtonResult(certDeleteConfirm, 'failed', 'Failed ✗');
      showToast('Failed to delete certification.', 'error');
      return;
    }
    pendingDeleteCertificationId = null;
    certDeleteModal?.classList.add('hidden');
    await loadCertificationsAdmin();
    markButtonResult(certDeleteConfirm, 'success', 'Deleted ✓');
    showToast('Certification deleted.', 'success');
  } catch {
    markButtonResult(certDeleteConfirm, 'failed', 'Failed ✗');
    showToast('Failed to delete certification.', 'error');
  } finally {
    window.setTimeout(() => {
      restoreButton();
    }, 900);
  }
}

function getInputValue(id: string): string {
  return (document.querySelector<HTMLInputElement | HTMLTextAreaElement>(id)?.value ?? '').trim();
}

function setInputValue(id: string, value: string): void {
  const node = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(id);
  if (node) node.value = value;
}

function updateSectionDot(section: string): void {
  const dot = document.querySelector<HTMLElement>(`.section-dot[data-dot="${section}"]`);
  const hasCustom = Boolean(contentEntriesState[section]);
  dot?.classList.toggle('custom', hasCustom);
}

function renderHeroTypingEditor(): void {
  if (!heroTypingList) return;
  heroTypingList.innerHTML = heroTypingTitlesState.map((title, index) => `
    <span class="typing-tag">
      ${escapeHtml(title)}
      <button type="button" class="typing-tag-remove" data-hero-typing-index="${index}">✕</button>
    </span>
  `).join('');

  heroTypingList.querySelectorAll<HTMLButtonElement>('[data-hero-typing-index]').forEach((button) => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.heroTypingIndex ?? '-1');
      if (index < 0) return;
      if (heroTypingTitlesState.length <= 1) {
        showToast('At least one title is required.', 'error');
        return;
      }
      heroTypingTitlesState = heroTypingTitlesState.filter((_item, idx) => idx !== index);
      renderHeroTypingEditor();
    });
  });
}

function renderAboutStatsEditor(): void {
  if (!aboutStatsList) return;
  aboutStatsList.innerHTML = aboutStatsState.map((row, index) => `
    <div class="stat-edit-row">
      <input data-stat-label="${index}" type="text" placeholder="Label" value="${escapeHtml(row.label)}" />
      <input data-stat-value="${index}" type="text" placeholder="Value" value="${escapeHtml(row.value)}" />
      <button type="button" class="admin-btn danger" data-stat-remove="${index}">Remove</button>
    </div>
  `).join('');

  aboutStatsList.querySelectorAll<HTMLInputElement>('input[data-stat-label]').forEach((input) => {
    input.addEventListener('input', () => {
      const index = Number(input.dataset.statLabel ?? '-1');
      if (index >= 0) aboutStatsState[index].label = input.value;
    });
  });

  aboutStatsList.querySelectorAll<HTMLInputElement>('input[data-stat-value]').forEach((input) => {
    input.addEventListener('input', () => {
      const index = Number(input.dataset.statValue ?? '-1');
      if (index >= 0) aboutStatsState[index].value = input.value;
    });
  });

  aboutStatsList.querySelectorAll<HTMLButtonElement>('[data-stat-remove]').forEach((button) => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.statRemove ?? '-1');
      if (index < 0) return;
      aboutStatsState = aboutStatsState.filter((_row, idx) => idx !== index);
      renderAboutStatsEditor();
    });
  });
}

function renderProjectsEditor(): void {
  if (!projectsEditorList) return;
  projectsEditorList.innerHTML = projectsEditorState.map((project, index) => `
    <article class="project-editor-card">
      <div class="admin-field"><input data-project-name="${index}" type="text" placeholder=" " value="${escapeHtml(project.name)}" /><label>Project Name</label></div>
      <div class="admin-field"><input data-project-subtitle="${index}" type="text" placeholder=" " value="${escapeHtml(project.subtitle)}" /><label>Subtitle</label></div>
      <div class="admin-field"><textarea data-project-description="${index}" rows="3" placeholder=" ">${escapeHtml(project.description)}</textarea><label>Description</label></div>
      <div class="list-chip-editor" data-feature-wrap="${index}">
        <p>Features</p>
        <div class="typing-tags">${project.features.map((feature, fIndex) => `<span class="typing-tag">${escapeHtml(feature)} <button type="button" class="typing-tag-remove" data-feature-remove="${index}:${fIndex}">✕</button></span>`).join('')}</div>
        <div class="typing-input-row"><input data-feature-input="${index}" type="text" placeholder="Add feature" /><button type="button" class="admin-btn" data-feature-add="${index}">Add</button></div>
      </div>
      <div class="list-chip-editor" data-tech-wrap="${index}">
        <p>Tech Stack</p>
        <div class="typing-tags">${project.techStack.map((item, tIndex) => `<span class="typing-tag">${escapeHtml(item)} <button type="button" class="typing-tag-remove" data-tech-remove="${index}:${tIndex}">✕</button></span>`).join('')}</div>
        <div class="typing-input-row"><input data-tech-input="${index}" type="text" placeholder="Add tech" /><button type="button" class="admin-btn" data-tech-add="${index}">Add</button></div>
      </div>
      <button type="button" class="admin-btn danger" data-project-remove="${index}">Remove Project</button>
    </article>
  `).join('');

  projectsEditorList.querySelectorAll<HTMLInputElement>('input[data-project-name]').forEach((input) => {
    input.addEventListener('input', () => {
      const index = Number(input.dataset.projectName ?? '-1');
      if (index >= 0) projectsEditorState[index].name = input.value;
    });
  });
  projectsEditorList.querySelectorAll<HTMLInputElement>('input[data-project-subtitle]').forEach((input) => {
    input.addEventListener('input', () => {
      const index = Number(input.dataset.projectSubtitle ?? '-1');
      if (index >= 0) projectsEditorState[index].subtitle = input.value;
    });
  });
  projectsEditorList.querySelectorAll<HTMLTextAreaElement>('textarea[data-project-description]').forEach((input) => {
    input.addEventListener('input', () => {
      const index = Number(input.dataset.projectDescription ?? '-1');
      if (index >= 0) projectsEditorState[index].description = input.value;
    });
  });

  projectsEditorList.querySelectorAll<HTMLButtonElement>('[data-feature-add]').forEach((button) => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.featureAdd ?? '-1');
      const input = projectsEditorList.querySelector<HTMLInputElement>(`input[data-feature-input="${index}"]`);
      const value = input?.value.trim() ?? '';
      if (!value || index < 0) return;
      projectsEditorState[index].features.push(value);
      renderProjectsEditor();
    });
  });

  projectsEditorList.querySelectorAll<HTMLButtonElement>('[data-tech-add]').forEach((button) => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.techAdd ?? '-1');
      const input = projectsEditorList.querySelector<HTMLInputElement>(`input[data-tech-input="${index}"]`);
      const value = input?.value.trim() ?? '';
      if (!value || index < 0) return;
      projectsEditorState[index].techStack.push(value);
      renderProjectsEditor();
    });
  });

  projectsEditorList.querySelectorAll<HTMLButtonElement>('[data-feature-remove]').forEach((button) => {
    button.addEventListener('click', () => {
      const [pIndexRaw, fIndexRaw] = (button.dataset.featureRemove ?? ':').split(':');
      const pIndex = Number(pIndexRaw);
      const fIndex = Number(fIndexRaw);
      if (pIndex < 0 || fIndex < 0) return;
      projectsEditorState[pIndex].features = projectsEditorState[pIndex].features.filter((_item, idx) => idx !== fIndex);
      renderProjectsEditor();
    });
  });

  projectsEditorList.querySelectorAll<HTMLButtonElement>('[data-tech-remove]').forEach((button) => {
    button.addEventListener('click', () => {
      const [pIndexRaw, tIndexRaw] = (button.dataset.techRemove ?? ':').split(':');
      const pIndex = Number(pIndexRaw);
      const tIndex = Number(tIndexRaw);
      if (pIndex < 0 || tIndex < 0) return;
      projectsEditorState[pIndex].techStack = projectsEditorState[pIndex].techStack.filter((_item, idx) => idx !== tIndex);
      renderProjectsEditor();
    });
  });

  projectsEditorList.querySelectorAll<HTMLButtonElement>('[data-project-remove]').forEach((button) => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.projectRemove ?? '-1');
      if (index < 0) return;
      projectsEditorState = projectsEditorState.filter((_item, idx) => idx !== index);
      renderProjectsEditor();
    });
  });
}

function hydrateContentForms(entries: ContentEntry[]): void {
  contentEntriesState = {};
  entries.forEach((entry) => {
    contentEntriesState[entry.sectionName] = entry;
  });

  const hero = (contentEntriesState.hero?.content ?? {}) as {
    name?: string;
    title?: string;
    tagline?: string;
    typingTitles?: string[];
  };
  setInputValue('#content-hero-name', hero.name ?? 'Prince Kumar');
  setInputValue('#content-hero-title', hero.title ?? 'Cybersecurity Enthusiast | Digital Forensics Learner');
  setInputValue('#content-hero-tagline', hero.tagline ?? 'Exploring the intersection of offense and defense in cybersecurity. Building tools, breaking systems, and investigating the digital world.');
  heroTypingTitlesState = Array.isArray(hero.typingTitles) && hero.typingTitles.length > 0
    ? [...hero.typingTitles]
    : ['Cybersecurity Enthusiast', 'Digital Forensics Learner'];
  renderHeroTypingEditor();

  const about = (contentEntriesState.about?.content ?? {}) as {
    paragraphs?: string[];
    stats?: Array<{ label: string; value: string }>;
  };
  const paragraphs = about.paragraphs ?? [];
  setInputValue('#content-about-paragraph1', paragraphs[0] ?? '');
  setInputValue('#content-about-paragraph2', paragraphs[1] ?? '');
  setInputValue('#content-about-paragraph3', paragraphs[2] ?? '');
  setInputValue('#content-about-paragraph4', paragraphs[3] ?? '');
  aboutStatsState = Array.isArray(about.stats) && about.stats.length > 0 ? about.stats.map((item) => ({ label: item.label, value: item.value })) : [
    { label: 'CTF Challenges Solved', value: '50+' },
    { label: 'Security Tools Mastered', value: '10+' }
  ];
  renderAboutStatsEditor();

  const projects = (contentEntriesState.projects?.content ?? {}) as {
    projects?: Array<{ name: string; subtitle: string; description: string; features: string[]; techStack: string[] }>;
  };
  projectsEditorState = Array.isArray(projects.projects) && projects.projects.length > 0
    ? projects.projects.map((item) => ({
      name: item.name ?? '',
      subtitle: item.subtitle ?? '',
      description: item.description ?? '',
      features: Array.isArray(item.features) ? [...item.features] : [],
      techStack: Array.isArray(item.techStack) ? [...item.techStack] : []
    }))
    : [];
  renderProjectsEditor();

  const education = (contentEntriesState.education?.content ?? {}) as {
    degree?: string;
    status?: string;
    institution?: string;
    focusAreas?: string;
  };
  setInputValue('#content-education-degree', education.degree ?? 'Bachelor of Technology (B.Tech)');
  setInputValue('#content-education-status', education.status ?? 'Currently Pursuing');
  setInputValue('#content-education-institution', education.institution ?? 'Placeholder University Name (to be updated)');
  setInputValue('#content-education-focus', education.focusAreas ?? 'Cybersecurity, Digital Forensics, Network Security, Information Security');

  ['hero', 'about', 'projects', 'education'].forEach((section) => updateSectionDot(section));
}

async function loadContentManager(): Promise<void> {
  contentLoading?.classList.remove('hidden');
  contentError?.classList.add('hidden');
  contentAccordion?.classList.add('hidden');

  try {
    const response = await adminFetch('/api/content');
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch content`);
    }
    const payload = (await response.json()) as { entries?: ContentEntry[] };
    if (!Array.isArray(payload.entries)) {
      console.warn('Content entries not an array, using empty array');
    }
    hydrateContentForms(payload.entries ?? []);
    contentLoading?.classList.add('hidden');
    contentError?.classList.add('hidden');
    contentAccordion?.classList.remove('hidden');
  } catch (error) {
    console.error('Content load error:', error);
    contentLoading?.classList.add('hidden');
    contentError?.classList.remove('hidden');
  }
}

async function saveContentSection(section: string, submitButton?: HTMLButtonElement | null): Promise<void> {
  let content: Record<string, unknown> = {};

  if (section === 'hero') {
    content = {
      name: getInputValue('#content-hero-name'),
      title: getInputValue('#content-hero-title'),
      tagline: getInputValue('#content-hero-tagline'),
      typingTitles: heroTypingTitlesState
    };
  }

  if (section === 'about') {
    content = {
      paragraphs: [
        getInputValue('#content-about-paragraph1'),
        getInputValue('#content-about-paragraph2'),
        getInputValue('#content-about-paragraph3'),
        getInputValue('#content-about-paragraph4')
      ].filter((item) => item.length > 0),
      stats: aboutStatsState
    };
  }

  if (section === 'projects') {
    content = {
      projects: projectsEditorState
    };
  }

  if (section === 'education') {
    content = {
      degree: getInputValue('#content-education-degree'),
      status: getInputValue('#content-education-status'),
      institution: getInputValue('#content-education-institution'),
      focusAreas: getInputValue('#content-education-focus')
    };
  }

  const restoreButton = setButtonBusy(submitButton, 'Saving...');

  try {
    const response = await adminFetch(`/api/content/${section}`, {
      method: 'PUT',
      body: JSON.stringify({ content })
    });
    if (!response.ok) {
      markButtonResult(submitButton, 'failed', 'Failed ✗');
      showToast('Failed to save section content.', 'error');
      return;
    }
    await loadContentManager();
    markButtonResult(submitButton, 'success', 'Saved ✓');
    showToast('Section updated successfully.', 'success');
  } catch {
    markButtonResult(submitButton, 'failed', 'Failed ✗');
    showToast('Failed to save section content.', 'error');
  } finally {
    window.setTimeout(() => {
      restoreButton();
    }, 900);
  }
}

async function resetContentSection(section: string, triggerButton?: HTMLButtonElement): Promise<void> {
  if (!window.confirm('Reset this section to default content?')) return;
  const restoreButton = setButtonBusy(triggerButton, 'Resetting...');

  try {
    const response = await adminFetch(`/api/content/${section}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      markButtonResult(triggerButton, 'failed', 'Failed ✗');
      showToast('Failed to reset section.', 'error');
      return;
    }
    await loadContentManager();
    markButtonResult(triggerButton, 'success', 'Reset ✓');
    showToast('Reset to defaults successfully.', 'success');
  } catch {
    markButtonResult(triggerButton, 'failed', 'Failed ✗');
    showToast('Failed to reset section.', 'error');
  } finally {
    window.setTimeout(() => {
      restoreButton();
    }, 900);
  }
}

function setupCertificationAndContentHandlers(): void {
  retryCertificationsButton?.addEventListener('click', () => {
    void loadCertificationsAdmin();
  });
  addCertificationButton?.addEventListener('click', () => {
    openCertificationModal();
  });
  toggleCertOrderingButton?.addEventListener('click', () => {
    const nextMode = !isCertificationOrderingMode;
    setCertificationOrderingMode(nextMode);
    showToast(nextMode ? 'Ordering mode enabled. Drag cards to reorder.' : 'Ordering mode disabled.', 'success');
  });
  deleteAllCertificationsButton?.addEventListener('click', () => {
    const confirmed = confirm('⚠️ Delete all certifications permanently? This cannot be undone.');
    if (confirmed) {
      void deleteAllCertifications();
    }
  });
  certCancelButton?.addEventListener('click', closeCertificationModal);
  certForm?.addEventListener('submit', (event) => {
    console.log('🔵 Form submit event triggered');
    event.preventDefault();
    console.log('🔵 Default prevented, calling saveCertification()');
    void saveCertification();
  });
  certPickThumbnailButton?.addEventListener('click', () => {
    certThumbnailInput?.click();
  });
  certThumbnailInput?.addEventListener('change', () => {
    const file = certThumbnailInput.files?.[0] ?? null;
    pendingCertThumbnailFile = file;
    if (certSelectedThumbnail) {
      certSelectedThumbnail.textContent = file ? file.name : 'No image selected';
    }
    if (certThumbnailPreviewObjectUrl) {
      URL.revokeObjectURL(certThumbnailPreviewObjectUrl);
    }
    if (!file) {
      certThumbnailPreviewObjectUrl = null;
      if (certThumbnailPreview) {
        const editing = certificationsState.find((item) => item._id === editingCertificationId);
        certThumbnailPreview.textContent = editing?.imageUrl ? 'Current thumbnail' : 'No image selected';
        if (editing?.imageUrl) {
          certThumbnailPreview.innerHTML = `<img src="${editing.imageUrl}" alt="Current thumbnail" />`;
        }
      }
      return;
    }
    certThumbnailPreviewObjectUrl = URL.createObjectURL(file);
    if (certThumbnailPreview) {
      certThumbnailPreview.innerHTML = `<img src="${certThumbnailPreviewObjectUrl}" alt="Preview" />`;
    }
  });

  certDeleteCancel?.addEventListener('click', () => {
    certDeleteModal?.classList.add('hidden');
    pendingDeleteCertificationId = null;
  });
  certDeleteConfirm?.addEventListener('click', () => {
    void confirmDeleteCertification();
  });

  certImageInput.addEventListener('change', () => {
    const file = certImageInput.files?.[0];
    const id = pendingCertificationImageId;
    pendingCertificationImageId = null;
    certImageInput.value = '';
    if (!file || !id) return;
    uploadCertificationImage(id, file);
  });

  retryContentButton?.addEventListener('click', () => {
    void loadContentManager();
  });

  document.querySelectorAll<HTMLButtonElement>('.accordion-header').forEach((button) => {
    button.addEventListener('click', () => {
      const item = button.closest<HTMLElement>('.accordion-item');
      item?.classList.toggle('open');
    });
  });

  heroTypingAdd?.addEventListener('click', () => {
    const value = heroTypingInput?.value.trim() ?? '';
    if (!value) return;
    heroTypingTitlesState.push(value);
    if (heroTypingInput) heroTypingInput.value = '';
    renderHeroTypingEditor();
  });

  aboutAddStatButton?.addEventListener('click', () => {
    aboutStatsState.push({ label: '', value: '' });
    renderAboutStatsEditor();
  });

  addProjectEditorButton?.addEventListener('click', () => {
    projectsEditorState.push({ name: '', subtitle: '', description: '', features: [], techStack: [] });
    renderProjectsEditor();
  });

  document.querySelectorAll<HTMLFormElement>('form[data-content-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const section = form.dataset.contentForm;
      if (!section) return;
      const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
      void saveContentSection(section, submitButton);
    });
  });

  document.querySelectorAll<HTMLButtonElement>('button[data-reset]').forEach((button) => {
    button.addEventListener('click', () => {
      const section = button.dataset.reset;
      if (!section) return;
      void resetContentSection(section, button);
    });
  });

  document.querySelectorAll<HTMLButtonElement>('button[data-preview]').forEach((button) => {
    button.addEventListener('click', () => {
      window.open('/index.html', '_blank', 'noopener');
    });
  });
}

function renderSettingsGrid(): void {
  if (!toggleGrid || !settingsWarningBanner) return;
  const anyDisabled = settingsState.some((item) => !item.settingValue);
  settingsWarningBanner.classList.toggle('hidden', !anyDisabled);

  toggleGrid.innerHTML = settingsState.map((setting) => `
    <article class="toggle-card" data-key="${setting.settingKey}">
      <div class="toggle-copy">
        <p class="toggle-label">${escapeHtml(setting.label || setting.settingKey)}</p>
        <p class="toggle-description">${escapeHtml(setting.description || '')}</p>
      </div>
      <button class="toggle-switch ${setting.settingValue ? 'active' : ''}" data-toggle-key="${setting.settingKey}" type="button" aria-label="Toggle ${escapeHtml(setting.label || setting.settingKey)}">
        <span class="toggle-thumb"></span>
      </button>
    </article>
  `).join('');

  toggleGrid.querySelectorAll<HTMLButtonElement>('.toggle-switch').forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.toggleKey;
      if (!key) return;
      const setting = settingsState.find((item) => item.settingKey === key);
      if (!setting) return;
      void updateSettingValue(key, !setting.settingValue);
    });
  });
}

async function loadSettingsControls(): Promise<void> {
  togglesLoading?.classList.remove('hidden');
  togglesError?.classList.add('hidden');
  toggleGrid?.classList.add('hidden');

  try {
    const response = await adminFetch('/api/settings');
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch settings`);
    }
    const payload = (await response.json()) as { settings?: PortfolioSetting[] };
    if (!Array.isArray(payload.settings)) {
      console.warn('Settings not an array, using empty array');
    }
    settingsState = (payload.settings ?? []).filter((item) => SUPPORTED_TOGGLE_KEYS.has(item.settingKey));
    renderSettingsGrid();
    togglesLoading?.classList.add('hidden');
    togglesError?.classList.add('hidden');
    toggleGrid?.classList.remove('hidden');
  } catch (error) {
    console.error('Settings load error:', error);
    togglesLoading?.classList.add('hidden');
    togglesError?.classList.remove('hidden');
  }
}

async function updateSettingValue(key: string, value: boolean): Promise<void> {
  try {
    const response = await adminFetch(`/api/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ settingValue: value })
    });
    if (!response.ok) {
      showToast('Failed to update setting.', 'error');
      return;
    }
    const target = settingsState.find((item) => item.settingKey === key);
    if (target) target.settingValue = value;
    renderSettingsGrid();
    showToast('Setting updated.', 'success');
  } catch {
    showToast('Failed to update setting.', 'error');
  }
}

async function resetAllSettings(): Promise<void> {
  if (!window.confirm('Reset all settings to default values?')) return;
  try {
    const response = await adminFetch('/api/settings/reset', {
      method: 'POST'
    });
    if (!response.ok) {
      showToast('Failed to reset settings.', 'error');
      return;
    }
    await loadSettingsControls();
    showToast('Settings reset successfully.', 'success');
  } catch {
    showToast('Failed to reset settings.', 'error');
  }
}

function setupToggleHandlers(): void {
  retryTogglesButton?.addEventListener('click', () => {
    settingsLoaded = false;
    void loadSettingsControls();
  });

  resetSettingsButton?.addEventListener('click', () => {
    void resetAllSettings();
  });
}

async function fetchCertificationsCount(): Promise<number> {
  try {
    const response = await adminFetch('/api/certifications/admin');
    if (!response.ok) return 0;
    const data = (await response.json()) as unknown;
    if (Array.isArray(data)) return data.length;
    if (data && typeof data === 'object') {
      const typed = data as { certifications?: unknown[]; count?: number };
      if (Array.isArray(typed.certifications)) return typed.certifications.length;
      if (typeof typed.count === 'number') return typed.count;
    }
    return 0;
  } catch {
    return 0;
  }
}

async function fetchResumeDownloads(): Promise<number> {
  try {
    const response = await adminFetch('/api/resume');
    if (!response.ok) return 0;
    const data = (await response.json()) as { downloadCount?: number; downloads?: number };
    return Number(data.downloadCount ?? data.downloads ?? 0);
  } catch {
    return 0;
  }
}

async function fetchServerStatus(): Promise<void> {
  if (!serverStatus) return;
  try {
    const response = await adminFetch('/api/health');
    if (response.ok) {
      const payload = (await response.json()) as { uptime?: string };
      serverStatus.textContent = 'Online';
      serverStatus.classList.add('online');
      if (quickServerUptime && payload.uptime) quickServerUptime.textContent = payload.uptime;
      return;
    }
    serverStatus.textContent = 'Offline';
    serverStatus.classList.remove('online');
  } catch {
    serverStatus.textContent = 'Offline';
    serverStatus.classList.remove('online');
  }
}

async function fetchRecentMessages(): Promise<void> {
  if (!recentMessagesRoot) return;
  recentMessagesRoot.innerHTML = '<p class="muted">Loading recent messages...</p>';
  try {
    const response = await adminFetch('/api/messages?limit=5');
    if (!response.ok) {
      recentMessagesRoot.innerHTML = '<p class="muted">No recent messages available.</p>';
      return;
    }

    const payload = (await response.json()) as { messages?: AdminMessage[] };
    const messages = payload.messages ?? [];
    if (messages.length === 0) {
      recentMessagesRoot.innerHTML = '<p class="muted">No recent messages yet.</p>';
      return;
    }

    recentMessagesRoot.innerHTML = messages.slice(0, 5).map((message) => `
      <button class="message-row" data-open="${message._id}" type="button">
        <span class="name">${escapeHtml(message.name)}</span>
        <span class="subject">${escapeHtml(trimSubject(message.subject))}</span>
        <span class="time">${timeAgo(message.timestamp)}</span>
      </button>
    `).join('');

    recentMessagesRoot.querySelectorAll<HTMLButtonElement>('.message-row').forEach((row) => {
      row.addEventListener('click', () => {
        const id = row.dataset.open;
        if (!id) return;
        activateSection('messages');
        void openMessage(id);
      });
    });
  } catch {
    recentMessagesRoot.innerHTML = '<p class="muted">No recent messages available.</p>';
  }
}

async function loadDashboardStats(): Promise<void> {
  const unreadElement = document.querySelector<HTMLElement>('[data-stat="unread"]');
  const certElement = document.querySelector<HTMLElement>('[data-stat="certifications"]');
  const downloadsElement = document.querySelector<HTMLElement>('[data-stat="downloads"]');

  const [unreadCount, certCount, downloads] = await Promise.all([
    fetchUnreadCount(),
    fetchCertificationsCount(),
    fetchResumeDownloads(),
    fetchServerStatus(),
    fetchRecentMessages(),
    fetchMessages()
  ]);

  animateValue(unreadElement, unreadCount);
  animateValue(certElement, certCount);
  animateValue(downloadsElement, downloads);
  updateTrend('unread', unreadCount);
  updateTrend('certifications', certCount);
  updateTrend('downloads', downloads);
  updateTrend('server', 1);
  previousUnreadSnapshot = unreadCount;
  void loadQuickStats();
}

async function handleLogout(): Promise<void> {
  try {
    await adminFetch('/api/auth/logout', { method: 'POST' });
  } catch {
    // ignore and continue clearing local token
  } finally {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/index.html';
  }
}

function clearSessionTimers(): void {
  if (warningTimer) window.clearTimeout(warningTimer);
  if (logoutTimer) window.clearTimeout(logoutTimer);
}

function resetSessionTimer(): void {
  clearSessionTimers();
  warningTimer = window.setTimeout(() => {
    showToast('Session expiring in 5 minutes. Click anywhere to stay logged in.', 'warning');
  }, 25 * 60 * 1000);
  logoutTimer = window.setTimeout(() => {
    showToast('Session expired. Logging out.', 'error');
    void handleLogout();
  }, 30 * 60 * 1000);
}

function setupActivityWatchers(): void {
  ['click', 'keydown'].forEach((eventName) => {
    document.addEventListener(eventName, () => {
      resetSessionTimer();
    });
  });
}

function startUnreadPolling(): void {
  if (unreadPollTimer) window.clearInterval(unreadPollTimer);
  unreadPollTimer = window.setInterval(() => {
    void (async () => {
      const unread = await fetchUnreadCount();
      if (unread > previousUnreadSnapshot) {
        pushNotification('New message received', 'success');
      }
      previousUnreadSnapshot = unread;
    })();
    void fetchRecentMessages();
    void fetchMessages();
  }, 30_000);
}

function setupNavigation(): void {
  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      const section = item.dataset.section as SectionKey;
      activateSection(section);
      if (isMobileViewport()) {
        setSidebarOpen(false);
      }
    });
  });

  document.querySelectorAll<HTMLButtonElement>('button[data-jump]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.dataset.jump as SectionKey;
      if (!target || !(target in sectionNames)) return;
      activateSection(target);
      showToast(`Opening ${sectionNames[target]} section`, 'success');

      if (isMobileViewport()) {
        setSidebarOpen(false);
      }
    });
  });
}

function setupSidebarToggle(): void {
  sidebarToggle?.addEventListener('click', () => {
    if (isMobileViewport()) {
      setSidebarOpen(!document.body.classList.contains('sidebar-open'));
      return;
    }
    setSidebarCollapsed(!document.body.classList.contains('sidebar-collapsed'));
  });

  mobileMenuToggle?.addEventListener('click', () => {
    setSidebarOpen(!document.body.classList.contains('sidebar-open'));
  });

  sidebarOverlay?.addEventListener('click', () => {
    setSidebarOpen(false);
  });

  window.addEventListener('resize', () => syncResponsiveSidebar());
  if (isMobileViewport()) setSidebarOpen(false);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && document.body.classList.contains('sidebar-open')) {
      setSidebarOpen(false);
    }
  });
}

function setupGlobalButtonFeedback(): void {
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    const button = target?.closest('button');
    if (!button || button.disabled || button.classList.contains('is-busy')) return;

    button.classList.add('is-clicked');
    window.setTimeout(() => {
      button.classList.remove('is-clicked');
    }, 180);
  });
}

async function init(): Promise<void> {
  const hasAccess = await verifyAccessOrRedirect();
  if (!hasAccess) return;

  initCursorTrail({
    maxParticles: 130,
    spawnSpacing: 9,
    baseSpeed: 0.18,
    speedVariance: 0.45,
    baseLife: 1.2,
    lifeVariance: 0.5,
  });

  loadNotificationsFromSession();
  renderNotifications();

  setupSectionPlaceholders();
  setupNavigation();
  setupSidebarToggle();
  syncResponsiveSidebar();
  setupMessageFilters();
  setupProfileAndSocialHandlers();
  setupCertificationAndContentHandlers();
  setupToggleHandlers();
  setupGlobalButtonFeedback();
  setupResumeManager({
    adminFetch,
    showToast,
    onStatsChange: () => {
      void loadDashboardStats();
    }
  });
  setupBlogManager({
    adminFetch,
    showToast,
    escapeHtml
  });

  updateClock();
  window.setInterval(updateClock, 1000);
  startQuoteRotation();

  notificationBell?.addEventListener('click', (event) => {
    event.stopPropagation();
    if (!notificationDropdown) return;

    const opening = notificationDropdown.classList.contains('hidden');
    notificationDropdown.classList.toggle('hidden');

    if (opening) {
      markNotificationsSeen();
      scheduleAutoClearSeenNotifications();
    }
  });

  notificationMarkRead?.addEventListener('click', () => {
    markAllNotificationsRead();
    scheduleAutoClearSeenNotifications(200);
  });

  document.addEventListener('click', (event) => {
    const target = event.target as Node;
    if (!notificationDropdown || !notificationBell) return;
    if (!notificationDropdown.contains(target) && !notificationBell.contains(target)) {
      if (!notificationDropdown.classList.contains('hidden')) {
        markNotificationsSeen();
        scheduleAutoClearSeenNotifications();
      }
      notificationDropdown.classList.add('hidden');
    }
  });

  logoutButton?.addEventListener('click', () => void handleLogout());

  resetSessionTimer();
  setupActivityWatchers();
  startUnreadPolling();
  renderMessageDetail(null);
  void loadProfileManager();
  void loadSocialLinks();
  void loadCertificationsAdmin();
  void loadContentManager();
  void loadDashboardStats();

  sidebar?.classList.add('ready');
}

certImageInput.type = 'file';
certImageInput.accept = 'image/*';
certImageInput.classList.add('hidden');
document.body.appendChild(certImageInput);

void init();
