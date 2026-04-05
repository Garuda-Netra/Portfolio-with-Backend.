import { API_BASE_URL } from '../config/api';

type PublicBlogPost = {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  readTime: number;
  createdDate: string;
  thumbnailUrl?: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function parseMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/\n/g, '<br>');
}

function withTimeout(url: string, timeoutMs = 5000): Promise<Response> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { signal: controller.signal }).finally(() => {
    window.clearTimeout(timer);
  });
}

export async function initBlogSection(): Promise<void> {
  const wrap = document.querySelector<HTMLElement>('#portfolio-blog-wrap');
  const grid = document.querySelector<HTMLElement>('#portfolio-blog-grid');
  const modal = document.querySelector<HTMLElement>('#portfolio-blog-modal');
  const modalContent = document.querySelector<HTMLElement>('#portfolio-blog-modal-content');
  const closeBtn = document.querySelector<HTMLButtonElement>('#portfolio-blog-close');

  if (!wrap || !grid || !modal || !modalContent) return;

  try {
    const response = await withTimeout(`${API_BASE_URL}/api/blog?featured=true`, 5000);
    if (!response.ok) return;

    const payload = (await response.json()) as { posts?: PublicBlogPost[] };
    const posts = payload.posts ?? [];

    if (posts.length === 0) {
      wrap.classList.add('hidden');
      return;
    }

    wrap.classList.remove('hidden');

    grid.innerHTML = posts.map((post) => {
      const excerpt = (post.excerpt || '').trim() || post.content.slice(0, 120);
      const trimmedExcerpt = excerpt.length > 120 ? `${excerpt.slice(0, 117)}...` : excerpt;
      return `
        <article class="glass-card portfolio-blog-card reveal" data-reveal="fade-up">
          ${post.thumbnailUrl ? `<img class="portfolio-blog-thumb" src="${escapeHtml(post.thumbnailUrl)}" alt="${escapeHtml(post.title)} thumbnail" loading="lazy" />` : ''}
          <h3 class="portfolio-blog-title">${escapeHtml(post.title)}</h3>
          <span class="portfolio-blog-category">${escapeHtml(post.category || 'Other')}</span>
          <p class="portfolio-blog-excerpt">${escapeHtml(trimmedExcerpt)}</p>
          <p class="portfolio-blog-meta">${post.readTime} min • ${new Date(post.createdDate).toLocaleDateString()}</p>
          <button class="portfolio-blog-readmore" data-blog-id="${post._id}" type="button">Read More</button>
        </article>
      `;
    }).join('');

    grid.querySelectorAll<HTMLButtonElement>('[data-blog-id]').forEach((button) => {
      button.addEventListener('click', () => {
        const id = button.dataset.blogId;
        const post = posts.find((item) => item._id === id);
        if (!post) return;

        modalContent.innerHTML = `
          <h2>${escapeHtml(post.title)}</h2>
          <p class="portfolio-blog-modal-meta">${escapeHtml(post.category || 'Other')} • ${new Date(post.createdDate).toLocaleDateString()} • ${post.readTime} min</p>
          ${post.thumbnailUrl ? `<img class="portfolio-blog-modal-thumb" src="${escapeHtml(post.thumbnailUrl)}" alt="${escapeHtml(post.title)} thumbnail" loading="lazy" />` : ''}
          <article class="portfolio-blog-modal-body">${parseMarkdown(escapeHtml(post.content || ''))}</article>
        `;

        modal.classList.remove('hidden');
      });
    });
  } catch {
    // Silent fallback: section remains hidden if API fails.
  }

  closeBtn?.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.classList.add('hidden');
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      modal.classList.add('hidden');
    }
  });
}
