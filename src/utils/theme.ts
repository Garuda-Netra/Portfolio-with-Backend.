export function initTheme(): void {
  const saved = localStorage.getItem('portfolio-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  updateToggleIcon(saved);
}

export function toggleTheme(): string {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('portfolio-theme', next);
  updateToggleIcon(next);
  window.dispatchEvent(new CustomEvent('analytics:theme_switch', { detail: { theme: next } }));
  return next;
}

function updateToggleIcon(theme: string): void {
  const icon = document.getElementById('theme-toggle-icon');
  if (icon) {
    icon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
}

export function getCurrentTheme(): string {
  return document.documentElement.getAttribute('data-theme') || 'dark';
}