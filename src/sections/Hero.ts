import GlowButton from '../components/GlowButton';

export default function Hero(): string {
  return `
    <section id="hero" class="relative min-h-screen flex items-center justify-center overflow-hidden" style="background: var(--bg-primary); padding-top: 4rem;">
      <div class="hero-spotlight" aria-hidden="true"></div>
      <div class="hero-mesh" aria-hidden="true"></div>
      <div class="hero-diagonal-glow" aria-hidden="true"></div>

      <!-- Animated Grid Background -->
      <div class="hero-grid"></div>

      <!-- Floating Orbs -->
      <div class="hero-orb hero-orb-1"></div>
      <div class="hero-orb hero-orb-2"></div>
      <div class="hero-orb hero-orb-3"></div>
      <div class="hero-shard hero-shard-a" data-parallax="0.05" aria-hidden="true"></div>
      <div class="hero-shard hero-shard-b" data-parallax="0.08" aria-hidden="true"></div>

      <!-- Desktop Social Rail -->
      <div id="hero-social-desktop" class="hero-social-rail hidden lg:flex" aria-label="Social links">
        <a href="https://github.com/Garuda-Netra" target="_blank" rel="noreferrer" aria-label="GitHub profile" class="hero-social-link">
          <svg viewBox="0 0 24 24" aria-hidden="true" class="w-4 h-4"><path fill="currentColor" d="M12 2C6.48 2 2 6.58 2 12.22c0 4.52 2.87 8.35 6.84 9.7c.5.1.68-.22.68-.5v-1.74c-2.78.62-3.37-1.22-3.37-1.22c-.45-1.19-1.11-1.5-1.11-1.5c-.9-.63.07-.62.07-.62c1 .07 1.52 1.04 1.52 1.04c.88 1.56 2.31 1.11 2.87.84c.09-.66.34-1.11.62-1.36c-2.22-.26-4.56-1.15-4.56-5.12c0-1.13.39-2.06 1.03-2.79c-.1-.26-.45-1.31.1-2.72c0 0 .84-.28 2.75 1.06A9.22 9.22 0 0 1 12 6.93c.82 0 1.66.11 2.44.34c1.9-1.34 2.74-1.06 2.74-1.06c.56 1.41.21 2.46.1 2.72c.64.73 1.03 1.66 1.03 2.79c0 3.98-2.34 4.86-4.57 5.11c.36.32.67.95.67 1.92v2.85c0 .27.18.6.69.5A10.23 10.23 0 0 0 22 12.22C22 6.58 17.52 2 12 2Z"/></svg>
        </a>
        <a href="https://www.linkedin.com/in/prince-kumar8/" target="_blank" rel="noreferrer" aria-label="LinkedIn profile" class="hero-social-link">
          <svg viewBox="0 0 24 24" aria-hidden="true" class="w-4 h-4"><path fill="currentColor" d="M6.94 8.5a1.91 1.91 0 1 0 0-3.82a1.91 1.91 0 0 0 0 3.82M5.3 9.98h3.28v9.84H5.3zm5.35 0h3.14v1.34h.05c.44-.82 1.52-1.68 3.13-1.68c3.35 0 3.97 2.26 3.97 5.18v5h-3.28v-4.44c0-1.06-.02-2.43-1.44-2.43c-1.45 0-1.67 1.16-1.67 2.35v4.52h-3.28z"/></svg>
        </a>
        <a href="mailto:princekumaarr2005@gmail.com" aria-label="Email address" class="hero-social-link">
          <svg viewBox="0 0 24 24" aria-hidden="true" class="w-4 h-4"><path fill="currentColor" d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1m0 2v.51l9 5.4l9-5.4V7l-9 5.4z"/></svg>
        </a>
      </div>

      <!-- Main Content -->
      <div class="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-20 hero-main-grid items-center gap-10 lg:gap-14">

        <!-- Profile Image -->
        <div class="animate-on-scroll mb-8 lg:mb-0 hero-profile-wrap order-1 lg:order-2">
          <div class="hero-profile-shell" role="img" aria-label="Portrait of Prince Kumar">
            <div class="hero-profile-inner">
              <img
                id="hero-profile-image"
                src=""
                alt="Prince Kumar profile photo"
                class="hero-profile-photo"
                loading="eager"
                decoding="async"
                style="display:none;"
                onerror="this.style.display='none'; if (this.nextElementSibling) { this.nextElementSibling.style.display='flex'; }"
              />
              <div class="hero-profile-fallback" style="display:flex;">
                <svg viewBox="0 0 200 200" class="hero-profile-icon" aria-hidden="true">
                  <path fill="currentColor" d="M100 18l58 22v43c0 44-28 82-58 99c-30-17-58-55-58-99V40z" opacity="0.35" />
                  <circle cx="100" cy="83" r="24" fill="currentColor" opacity="0.7" />
                  <path fill="currentColor" d="M62 152c8-19 23-30 38-30s30 11 38 30" opacity="0.7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Name & Title -->
        <div class="order-2 lg:order-1 text-center lg:text-left">
          <div class="animate-on-scroll stagger-1">
            <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 hero-name-gradient">
              <span id="hero-name-text" class="hero-name-shine">Prince Kumar</span>
            </h1>
          </div>

          <div class="animate-on-scroll stagger-2">
            <p class="text-lg sm:text-xl md:text-2xl mb-4 font-medium hero-typed-line" style="color: var(--text-secondary);">
              <span id="hero-typed-text" aria-live="polite"></span>
              <span class="hero-typed-caret" aria-hidden="true">|</span>
            </p>
          </div>

          <div class="animate-on-scroll stagger-3">
            <p id="hero-tagline-text" class="text-base md:text-lg max-w-2xl lg:max-w-3xl mx-auto lg:mx-0 mb-10 hero-tagline" style="color: var(--text-muted);">
              Exploring the intersection of offense and defense in cybersecurity. Building tools, breaking systems, and investigating the digital world.
            </p>
          </div>

          <!-- CTA Buttons -->
          <div class="animate-on-scroll stagger-4 hero-cta-grid">
            ${GlowButton('View Projects', '#projects', true).replace('class="glow-button', 'class="glow-button hero-cta-btn').replace('<a ', '<a data-magnetic ')}
            ${GlowButton('Open Terminal', '#', false).replace('href="#"', 'href="#" id="open-terminal-btn" data-magnetic').replace('class="glow-button', 'class="glow-button hero-cta-btn')}
            ${GlowButton('🛡 Scan Portfolio', '#', false).replace('href="#"', 'href="#" id="scan-portfolio-btn" data-magnetic').replace('class="glow-button', 'class="glow-button hero-cta-btn')}
            <a
              href="#"
              id="download-resume-btn"
              class="glow-button glow-button-secondary hero-cta-btn hero-resume-btn"
              data-resume-download
              data-resume-source="hero"
              data-resume-idle="Download Resume"
              data-magnetic
              download="Raj_CV.pdf"
              aria-label="Download resume PDF"
            >
              <span class="resume-btn-content">
                <span class="resume-download-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 3V14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                    <path d="M8 10L12 14L16 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M4 16H20V20H4V16Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
                  </svg>
                </span>
                <span data-resume-label>Download Resume</span>
                <span class="resume-inline-loader" aria-hidden="true"></span>
              </span>
            </a>
          </div>

          <!-- Mobile Social Links -->
          <div id="hero-social-mobile" class="hero-social-mobile lg:hidden mt-8 animate-on-scroll stagger-5" aria-label="Social links">
            <a href="https://github.com/Garuda-Netra" target="_blank" rel="noreferrer" aria-label="GitHub profile" class="hero-social-link">GitHub</a>
            <a href="https://www.linkedin.com/in/prince-kumar8/" target="_blank" rel="noreferrer" aria-label="LinkedIn profile" class="hero-social-link">LinkedIn</a>
            <a href="mailto:princekumaarr2005@gmail.com" aria-label="Email address" class="hero-social-link">Email</a>
          </div>

          <!-- Scroll Indicator -->
          <div class="animate-on-scroll stagger-5 mt-14 md:mt-16 lg:mt-20">
            <a href="#about" class="inline-flex flex-col items-center lg:items-start gap-2 transition-opacity hover:opacity-75" style="color: var(--text-muted);">
              <span class="text-sm font-mono tracking-wide">Scroll Down</span>
              <div class="hero-scroll-mouse">
                <div class="hero-scroll-dot"></div>
              </div>
            </a>
          </div>
        </div>
      </div>

      <!-- Existing Visual Depth -->
      <div class="absolute inset-x-0 bottom-0 h-28 pointer-events-none" style="background: linear-gradient(to top, rgba(var(--accent-cyan-rgb), 0.05), transparent);"></div>
    </section>
  `;
}
