import SectionContainer from '../components/SectionContainer';

export default function Blog(): string {
  const content = `
    <div id="portfolio-blog-wrap" class="portfolio-blog-wrap section-divider-top hidden">
      <div class="text-center mb-16 reveal" data-reveal="fade-up">
        <h2 class="section-title" style="color: var(--text-primary);" data-split="chars">Security Writings</h2>
        <p class="section-subtitle">CTF writeups, research, and security insights.</p>
      </div>

      <div id="portfolio-blog-grid" class="portfolio-blog-grid"></div>
    </div>

    <div id="portfolio-blog-modal" class="portfolio-blog-modal hidden" role="dialog" aria-modal="true" aria-label="Blog post">
      <div class="portfolio-blog-modal-card glass-card">
        <button id="portfolio-blog-close" class="portfolio-blog-close" type="button" aria-label="Close">✕</button>
        <div id="portfolio-blog-modal-content"></div>
      </div>
    </div>
  `;

  return SectionContainer('blog', content);
}
