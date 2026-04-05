const ORIGINAL_TITLE = 'Prince Kumar | Cybersecurity Professional & Digital Forensics Enthusiast';
const AWAY_TITLE = 'Come back! | Prince Kumar';

const KONAMI = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a',
];

function typeText(node: HTMLElement, value: string, speed: number): Promise<void> {
  return new Promise((resolve) => {
    let index = 0;
    node.textContent = '';

    const tick = (): void => {
      node.textContent = `${node.textContent ?? ''}${value[index] ?? ''}`;
      index += 1;
      if (index >= value.length) {
        resolve();
        return;
      }
      window.setTimeout(tick, speed);
    };

    tick();
  });
}

export function initLoadingScreen(): void {
  const loader = document.getElementById('site-loader');
  const title = document.getElementById('site-loader-title');
  const subtitle = document.getElementById('site-loader-subtitle');
  const tagline = document.getElementById('site-loader-tagline');
  const bar = document.getElementById('site-loader-bar');
  const percent = document.getElementById('site-loader-percent');

  if (!loader || !title || !subtitle || !bar || !percent) {
    return;
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const start = performance.now();
  let complete = false;
  const progressDuration = reducedMotion ? 500 : 4000;

  const animateProgress = (): void => {
    const elapsed = performance.now() - start;
    const progress = Math.min(1, elapsed / progressDuration);
    bar.style.transform = `scaleX(${progress})`;
    percent.textContent = `${Math.floor(progress * 100)}%`;

    if (progress < 1) {
      requestAnimationFrame(animateProgress);
      return;
    }

    complete = true;
  };

  requestAnimationFrame(animateProgress);

  const loaded = new Promise<void>((resolve) => {
    if (document.readyState === 'complete') {
      resolve();
      return;
    }

    window.addEventListener('load', () => resolve(), { once: true });
  });

  (async () => {
    if (reducedMotion) {
      title.textContent = 'Prince Kumar';
      subtitle.textContent = 'Securing the digital frontier.';
      if (tagline) tagline.textContent = 'Turning vulnerabilities into strength.';
    } else {
      await typeText(title, 'Prince Kumar', 120);
      await typeText(subtitle, 'Securing the digital frontier.', 80);
      if (tagline) {
        await new Promise<void>((resolve) => window.setTimeout(resolve, 300));
        await typeText(tagline, 'Turning vulnerabilities into strength.', 60);
      }
    }

    await loaded;

    const fallbackStart = performance.now();
    while (!complete) {
      if (performance.now() - fallbackStart > 5000) {
        break;
      }
      await new Promise<void>((resolve) => window.setTimeout(resolve, 20));
    }

    if (reducedMotion) {
      loader.classList.add('site-loader-done-simple');
    } else {
      loader.classList.add('site-loader-done');
    }

    document.body.classList.add('hero-enter');

    window.setTimeout(() => {
      loader.remove();
    }, reducedMotion ? 250 : 900);
  })();
}

export function initScrollProgressAndDots(): void {
  const progress = document.getElementById('scroll-progress');
  const dots = document.querySelectorAll<HTMLButtonElement>('.section-dot');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const navbar = document.getElementById('navbar');

  const sections = Array.from(dots)
    .map((dot) => {
      const target = dot.dataset.target;
      if (!target) {
        return null;
      }

      const section = document.querySelector<HTMLElement>(target);
      if (!section) {
        return null;
      }

      return { dot, section };
    })
    .filter((item): item is { dot: HTMLButtonElement; section: HTMLElement } => item !== null);

  if (!sections.length) {
    return;
  }

  const getScrollOffset = (): number => {
    const navHeight = navbar?.getBoundingClientRect().height ?? 0;
    return Math.max(0, Math.round(navHeight + 8));
  };

  let activeIndex = -1;
  const setActiveDot = (index: number): void => {
    if (index === activeIndex || index < 0 || index >= sections.length) {
      return;
    }

    activeIndex = index;
    sections.forEach((item, itemIndex) => {
      item.dot.classList.toggle('active', itemIndex === index);
    });
    document.body.style.setProperty('--section-shift', String(index));
  };

  const resolveActiveIndexFromScroll = (): number => {
    const anchor = window.scrollY + getScrollOffset() + (window.innerHeight * 0.35);
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    sections.forEach((item, index) => {
      const top = item.section.offsetTop;
      const bottom = top + item.section.offsetHeight;
      let distance = 0;

      if (anchor < top) {
        distance = top - anchor;
      } else if (anchor > bottom) {
        distance = anchor - bottom;
      }

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  };

  const onScroll = (): void => {
    if (!progress) {
      setActiveDot(resolveActiveIndexFromScroll());
      return;
    }

    const scrollTop = window.scrollY;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    progress.style.transform = `scaleX(${scrollTop / max})`;
    setActiveDot(resolveActiveIndexFromScroll());
  };

  let ticking = false;
  const scheduleScrollUpdate = (): void => {
    if (ticking) {
      return;
    }

    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      onScroll();
    });
  };

  window.addEventListener('scroll', scheduleScrollUpdate, { passive: true });
  window.addEventListener('resize', scheduleScrollUpdate, { passive: true });
  onScroll();

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const targetSelector = dot.dataset.target;
      if (!targetSelector) {
        return;
      }

      const section = document.querySelector<HTMLElement>(targetSelector);
      if (!section) {
        return;
      }

      const top = Math.max(0, section.offsetTop - getScrollOffset());
      window.scrollTo({ top, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  });
}

function runKonamiOverlay(): void {
  const overlay = document.getElementById('konami-overlay');
  const canvas = document.getElementById('konami-canvas') as HTMLCanvasElement | null;
  if (!overlay || !canvas) {
    return;
  }

  overlay.classList.add('show');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    window.setTimeout(() => overlay.classList.remove('show'), 3000);
    return;
  }

  const chars = '01#$%*+-/ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const fontSize = 14;

  const resize = (): { cols: number; drops: number[] } => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const cols = Math.max(12, Math.floor(canvas.width / fontSize));
    const drops = Array.from({ length: cols }, () => Math.floor(Math.random() * -120));
    return { cols, drops };
  };

  let { cols, drops } = resize();
  const start = performance.now();

  const frame = (): void => {
    const elapsed = performance.now() - start;
    if (elapsed > 3000) {
      overlay.classList.remove('show');
      return;
    }

    ctx.fillStyle = 'rgba(5, 10, 20, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ff9c';
    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < cols; i += 1) {
      const text = chars[Math.floor(Math.random() * chars.length)] ?? '0';
      const x = i * fontSize;
      const y = drops[i] * fontSize;
      ctx.fillText(text, x, y);

      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i] += 1;
    }

    requestAnimationFrame(frame);
  };

  window.addEventListener('resize', () => {
    ({ cols, drops } = resize());
  }, { once: true });

  requestAnimationFrame(frame);
}

export function initKonamiCode(): void {
  let index = 0;

  document.addEventListener('keydown', (event) => {
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    const expected = KONAMI[index];

    if (key === expected) {
      index += 1;
      if (index === KONAMI.length) {
        runKonamiOverlay();
        index = 0;
      }
      return;
    }

    index = key === KONAMI[0] ? 1 : 0;
  });
}

export function initTitleOnTabBlur(): void {
  document.title = ORIGINAL_TITLE;
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      document.title = AWAY_TITLE;
      return;
    }

    document.title = ORIGINAL_TITLE;
  });
}

export function initConsoleSignature(): void {
  console.log('%cHey, fellow developer! [wave]', 'color:#00E5FF;font-size:18px;font-weight:700;');
  console.log('%cYou found the console - curious minds are welcome here.', 'color:#A855F7;font-size:13px;');
  console.log('%cPortfolio built by Prince Kumar | Cybersecurity Professional', 'color:#00E5FF;font-size:12px;');
  console.log('%cContact: princekumaarr2005@gmail.com', 'color:#A855F7;font-size:12px;');
}
