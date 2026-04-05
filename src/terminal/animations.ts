import type { TerminalLine, TerminalSegment } from './commands';

export interface TypingOptions {
  speed?: number;
  lineDelay?: number;
  onProgress?: () => void;
  shouldStop?: () => boolean;
}

function toneClass(segment: TerminalSegment): string {
  switch (segment.tone) {
    case 'ctfBorder':
      return 'term-tone-ctf-border';
    case 'ctfText':
      return 'term-tone-ctf-text';
    case 'ctfCommand':
      return 'term-tone-ctf-command';
    case 'ctfOk':
      return 'term-tone-ctf-ok';
    case 'ctfFail':
      return 'term-tone-ctf-fail';
    case 'accent':
      return 'term-tone-accent';
    case 'cyan':
      return 'term-tone-cyan';
    case 'purple':
      return 'term-tone-purple';
    case 'prompt':
      return 'term-tone-prompt';
    case 'error':
      return 'term-tone-error';
    case 'success':
      return 'term-tone-success';
    case 'warning':
      return 'term-tone-warning';
    case 'secondary':
      return 'term-tone-secondary';
    case 'muted':
      return 'term-tone-muted';
    case 'primary':
    default:
      return 'term-tone-primary';
  }
}

export async function delay(ms: number): Promise<void> {
  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export async function typeLine(
  outputRoot: HTMLElement,
  line: TerminalLine,
  options?: TypingOptions
): Promise<void> {
  if (options?.shouldStop?.()) {
    return;
  }

  const row = document.createElement('div');
  row.className = 'term-line term-fade-in';

  if (line.pre) {
    row.classList.add('term-pre');
  }

  outputRoot.appendChild(row);

  const effectiveSpeed = line.speed ?? options?.speed ?? 14;

  for (const segment of line.segments) {
    if (options?.shouldStop?.()) {
      return;
    }

    const span = document.createElement('span');
    span.className = toneClass(segment);
    row.appendChild(span);

    for (const char of segment.text) {
      if (options?.shouldStop?.()) {
        return;
      }

      span.textContent = `${span.textContent ?? ''}${char}`;
      options?.onProgress?.();
      await delay(effectiveSpeed);
    }
  }

  options?.onProgress?.();
}

export async function typeLines(
  outputRoot: HTMLElement,
  lines: TerminalLine[],
  options?: TypingOptions
): Promise<void> {
  for (const row of lines) {
    if (options?.shouldStop?.()) {
      return;
    }

    await typeLine(outputRoot, row, options);

    if (options?.shouldStop?.()) {
      return;
    }

    if (options?.lineDelay !== undefined) {
      await delay(options.lineDelay);
    }
  }
}

export function runFlicker(surface: HTMLElement, duration = 220): void {
  surface.classList.remove('term-screen-flicker');
  void surface.offsetHeight;
  surface.classList.add('term-screen-flicker');

  window.setTimeout(() => {
    surface.classList.remove('term-screen-flicker');
  }, duration);
}

export function createParticles(target: HTMLElement, count = 18): () => void {
  const particles: HTMLSpanElement[] = [];

  for (let i = 0; i < count; i += 1) {
    const particle = document.createElement('span');
    particle.className = 'term-particle';

    const size = (Math.random() * 2 + 1.2).toFixed(2);
    const startX = (Math.random() * 100).toFixed(2);
    const startY = (Math.random() * 100).toFixed(2);
    const driftX = (Math.random() * 40 - 20).toFixed(2);
    const driftY = (Math.random() * 40 - 20).toFixed(2);
    const duration = (Math.random() * 10 + 16).toFixed(2);
    const delayMs = (Math.random() * 5000).toFixed(0);

    particle.style.setProperty('--term-p-size', `${size}px`);
    particle.style.setProperty('--term-p-x', `${startX}%`);
    particle.style.setProperty('--term-p-y', `${startY}%`);
    particle.style.setProperty('--term-p-dx', `${driftX}px`);
    particle.style.setProperty('--term-p-dy', `${driftY}px`);
    particle.style.setProperty('--term-p-duration', `${duration}s`);
    particle.style.setProperty('--term-p-delay', `${delayMs}ms`);

    target.appendChild(particle);
    particles.push(particle);
  }

  return () => {
    particles.forEach((particle) => particle.remove());
  };
}
