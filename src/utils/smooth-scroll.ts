export interface SmoothScrollController {
  getTargetScroll: () => number;
  getVelocity: () => number;
  destroy: () => void;
}

const LERP = 0.085;
const MAX_SKEW = 2.5;

function getNoopController(): SmoothScrollController {
  return {
    getTargetScroll: () => window.scrollY,
    getVelocity: () => 0,
    destroy: () => undefined,
  };
}

export function initSmoothScroll(): SmoothScrollController {
  const root = document.getElementById('smooth-scroll-root');
  if (!root) {
    return getNoopController();
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const mobile = window.innerWidth < 768;

  if (reducedMotion || coarsePointer || mobile) {
    document.documentElement.style.setProperty('--scroll-velocity', '0');
    document.documentElement.style.setProperty('--velocity-card-scale', '0');
    return getNoopController();
  }

  let rafId = 0;
  let resizeId = 0;
  let current = window.scrollY;
  let target = window.scrollY;
  let previousTarget = target;
  let velocityNorm = 0;
  let skewCurrent = 0;
  let direction = 1;
  let previousDirection = 1;
  let lastDirectionChange = 0;

  root.classList.add('smooth-scroll-root');

  const setBodyHeight = (): void => {
    document.body.style.height = `${root.scrollHeight}px`;
  };

  const getPaused = (): boolean => {
    const terminalOpen = Boolean(document.querySelector('#term-overlay.term-open'));
    const mobileMenuOpen = Boolean(document.querySelector('#mobile-menu.active'));
    return terminalOpen || mobileMenuOpen;
  };

  const updateAnchorNavigation = (): void => {
    document.addEventListener('click', (event) => {
      const targetElement = event.target as HTMLElement | null;
      if (!targetElement) {
        return;
      }

      const anchor = targetElement.closest('a[href^="#"]') as HTMLAnchorElement | null;
      const dot = targetElement.closest('.section-dot') as HTMLButtonElement | null;
      let selector = '';

      if (anchor) {
        selector = anchor.getAttribute('href') ?? '';
      } else if (dot) {
        selector = dot.dataset.target ?? '';
      }

      if (!selector || selector === '#') {
        return;
      }

      const node = document.querySelector<HTMLElement>(selector);
      if (!node) {
        return;
      }

      event.preventDefault();
      const top = node.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top, behavior: 'auto' });
      target = top;
    }, { passive: false });
  };

  const loop = (): void => {
    target = window.scrollY;

    const paused = getPaused();
    const interpolation = paused ? 1 : LERP;
    current = current + (target - current) * interpolation;

    const rawVelocity = target - previousTarget;
    previousTarget = target;

    const normalized = Math.min(1, Math.abs(rawVelocity) / 90);
    velocityNorm = velocityNorm + (normalized - velocityNorm) * 0.22;

    if (Math.abs(rawVelocity) > 0.4) {
      direction = rawVelocity >= 0 ? 1 : -1;
    }

    const now = performance.now();
    if (direction !== previousDirection && now - lastDirectionChange > 500) {
      window.dispatchEvent(new CustomEvent('smooth:direction-change', { detail: { direction } }));
      previousDirection = direction;
      lastDirectionChange = now;
    }

    const skewTarget = paused ? 0 : direction * velocityNorm * MAX_SKEW;
    skewCurrent = skewCurrent + (skewTarget - skewCurrent) * 0.16;

    root.style.transform = `translate3d(0, ${-current.toFixed(3)}px, 0) skewY(${skewCurrent.toFixed(3)}deg)`;

    document.documentElement.style.setProperty('--scroll-velocity', velocityNorm.toFixed(4));
    document.documentElement.style.setProperty('--velocity-card-scale', (velocityNorm * 0.018).toFixed(4));
    document.documentElement.style.setProperty('--decorative-fade', (1 - velocityNorm * 0.5).toFixed(4));

    rafId = window.requestAnimationFrame(loop);
  };

  const onResize = (): void => {
    window.clearTimeout(resizeId);
    resizeId = window.setTimeout(() => {
      setBodyHeight();
      target = window.scrollY;
      current = target;
    }, 120);
  };

  setBodyHeight();
  updateAnchorNavigation();
  window.addEventListener('resize', onResize, { passive: true });
  rafId = window.requestAnimationFrame(loop);

  return {
    getTargetScroll: () => target,
    getVelocity: () => velocityNorm,
    destroy: () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      root.style.transform = '';
      document.body.style.height = '';
      document.documentElement.style.removeProperty('--scroll-velocity');
      document.documentElement.style.removeProperty('--velocity-card-scale');
      document.documentElement.style.removeProperty('--decorative-fade');
    },
  };
}
