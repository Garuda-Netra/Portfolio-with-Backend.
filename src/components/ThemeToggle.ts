import { toggleTheme } from '../utils/theme';

export function initThemeToggle(): void {
  const toggleBtn = document.getElementById('theme-toggle');
  toggleBtn?.addEventListener('click', () => {
    toggleTheme();
  });
}