const SCRAMBLE_POOL = '01アイウエオカキクケコ#$%&@!*^~<>/\\|{}[]ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGIT_POOL = '0123456789';

function randomFromPool(pool: string): string {
  return pool[Math.floor(Math.random() * pool.length)] ?? pool[0] ?? '';
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function scrambleText(
  node: HTMLElement,
  finalText: string,
  options?: { pool?: string; minResolve?: number; maxResolve?: number; tickMs?: number }
): Promise<void> {
  const pool = options?.pool ?? SCRAMBLE_POOL;
  const minResolve = options?.minResolve ?? 200;
  const maxResolve = options?.maxResolve ?? 600;
  const tickMs = options?.tickMs ?? 30;

  const chars = Array.from(finalText);
  const start = performance.now();
  const resolveAt = chars.map(() => minResolve + Math.random() * (maxResolve - minResolve));

  return new Promise((resolve) => {
    const timer = window.setInterval(() => {
      const elapsed = performance.now() - start;

      const built = chars.map((char, index) => {
        if (elapsed >= resolveAt[index]) {
          return char;
        }

        if (char.trim().length === 0) {
          return char;
        }

        return randomFromPool(pool);
      });

      node.textContent = built.join('');

      const complete = built.every((char, index) => char === chars[index]);
      if (complete) {
        window.clearInterval(timer);
        node.textContent = finalText;
        resolve();
      }
    }, tickMs);
  });
}

function initHeadingScramble(): void {
  const headings = document.querySelectorAll<HTMLElement>('.section-title');
  if (headings.length === 0) {
    return;
  }

  const seen = new WeakSet<HTMLElement>();
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      const heading = entry.target as HTMLElement;
      if (seen.has(heading)) {
        return;
      }

      seen.add(heading);
      const original = heading.dataset.originalText ?? heading.textContent ?? '';
      heading.dataset.originalText = original;
      void scrambleText(heading, original);
      observer.unobserve(heading);
    });
  }, { threshold: 0.35 });

  headings.forEach((heading) => observer.observe(heading));
}

function initHeroNameScramble(): void {
  const nameNode = document.querySelector<HTMLElement>('.hero-name-shine');
  if (!nameNode) {
    return;
  }

  const text = (nameNode.textContent ?? '').trim();
  if (!text) {
    return;
  }

  const run = (): void => {
    if (nameNode.dataset.scrambleDone === 'true') {
      return;
    }
    nameNode.dataset.scrambleDone = 'true';
    void scrambleText(nameNode, text);
  };

  if (document.body.classList.contains('hero-enter')) {
    run();
    return;
  }

  const observer = new MutationObserver(() => {
    if (document.body.classList.contains('hero-enter')) {
      run();
      observer.disconnect();
    }
  });

  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
}

function initBlurToSharpReveal(): void {
  const targets = document.querySelectorAll<HTMLElement>([
    '.hero-tagline',
    '.about-paragraph',
    '.project-description',
    '.contact-message',
    '.achievement-card p',
  ].join(','));

  if (targets.length === 0) {
    return;
  }

  targets.forEach((node) => node.classList.add('blur-sharp-target'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const node = entry.target as HTMLElement;
      const ratio = Math.max(0, Math.min(1, entry.intersectionRatio));
      const blur = (1 - ratio) * 15;
      const opacity = 0.7 + ratio * 0.3;
      const scale = 1.04 - ratio * 0.04;
      node.style.filter = `blur(${blur.toFixed(2)}px)`;
      node.style.opacity = opacity.toFixed(3);
      node.style.transform = `scale(${scale.toFixed(4)})`;
    });
  }, {
    threshold: [0, 0.25, 0.5, 0.75, 1],
    rootMargin: '0px 0px -8% 0px',
  });

  targets.forEach((node) => observer.observe(node));
}

function wrapRedactedPhrases(): void {
  const aboutParagraphs = document.querySelectorAll<HTMLElement>('#about .about-paragraph');
  const phrases = [
    'Red Teamer',
    'Blue Teamer',
    'penetration testing',
    'social engineering',
    'forensic investigation',
  ];

  aboutParagraphs.forEach((paragraph) => {
    if (paragraph.dataset.redactedReady === 'true') {
      return;
    }

    let html = paragraph.innerHTML;
    phrases.forEach((phrase) => {
      const regex = new RegExp(`(${escapeRegExp(phrase)})`, 'gi');
      html = html.replace(regex, '<span class="redacted-wrap"><span class="redacted-word">$1</span><span class="redacted-bar" data-redacted-bar title="CLASSIFIED"></span></span>');
    });

    paragraph.innerHTML = html;
    paragraph.dataset.redactedReady = 'true';
  });
}

function initRedactedReveal(): void {
  wrapRedactedPhrases();

  const bars = Array.from(document.querySelectorAll<HTMLElement>('[data-redacted-bar]'));
  if (bars.length === 0) {
    return;
  }

  bars.forEach((bar) => {
    bar.addEventListener('mouseenter', () => {
      window.dispatchEvent(new CustomEvent('redacted:hover'));
    });
  });

  const about = document.getElementById('about');
  if (!about) {
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      bars.forEach((bar, index) => {
        window.setTimeout(() => {
          bar.classList.add('revealing');
          const text = bar.previousElementSibling as HTMLElement | null;
          if (text) {
            text.classList.add('redacted-word-revealed');
            window.setTimeout(() => text.classList.remove('redacted-word-revealed'), 900);
          }
        }, 500 + index * 300);
      });

      observer.disconnect();
    });
  }, { threshold: 0.38 });

  observer.observe(about);
}

function initAboutNumberScramble(): void {
  const values = document.querySelectorAll<HTMLElement>('[data-about-stat] .about-stat-value[data-target]');
  if (values.length === 0) {
    return;
  }

  const aboutStats = document.querySelector('.about-stats-grid');
  if (!aboutStats) {
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      values.forEach((value, index) => {
        const target = value.dataset.target ?? '0';
        window.setTimeout(() => {
          void scrambleText(value, `${target}+`, {
            pool: DIGIT_POOL,
            minResolve: 180,
            maxResolve: 500,
            tickMs: 28,
          });
        }, index * 120);
      });

      observer.disconnect();
    });
  }, { threshold: 0.3 });

  observer.observe(aboutStats);
}

export function initTextEffects(): void {
  initHeroNameScramble();
  initHeadingScramble();
  initBlurToSharpReveal();
  initRedactedReveal();
  initAboutNumberScramble();
}
