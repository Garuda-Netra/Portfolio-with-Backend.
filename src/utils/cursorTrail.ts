/**
 * Cursor Trail Animation
 * Creates an elegant particle trail that follows cursor movement.
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  size: number;
  seed: number;
  energy: number;
  color?: Rgb;
}

type ParticleOverrides = Partial<Pick<Particle, 'vx' | 'vy' | 'life' | 'size' | 'energy' | 'color'>>;

type CursorTrailOptions = {
  maxParticles?: number;
  spawnSpacing?: number;
  minDistance?: number;
  baseSpeed?: number;
  speedVariance?: number;
  baseLife?: number;
  lifeVariance?: number;
  baseSize?: number;
  sizeVariance?: number;
  gravity?: number;
  drag?: number;
  zIndex?: number;
  headGlow?: boolean;
  blastOnClick?: boolean;
  blastCount?: number;
  blastSpeedMultiplier?: number;
  fastMoveBlastThreshold?: number;
  fastMoveBlastCooldownMs?: number;
};

type Rgb = [number, number, number];

type Palette = {
  core: Rgb;
  glow: Rgb;
  link: Rgb;
};

const DEFAULT_OPTIONS: Required<CursorTrailOptions> = {
  maxParticles: 170,
  spawnSpacing: 7,
  minDistance: 3,
  baseSpeed: 0.2,
  speedVariance: 0.55,
  baseLife: 1.2,
  lifeVariance: 0.65,
  baseSize: 2.2,
  sizeVariance: 3.1,
  gravity: 0.018,
  drag: 0.975,
  zIndex: 9999,
  headGlow: true,
  blastOnClick: true,
  blastCount: 24,
  blastSpeedMultiplier: 3.6,
  fastMoveBlastThreshold: 105,
  fastMoveBlastCooldownMs: 120,
};

const BLAST_COLORS: Rgb[] = [
  [255, 230, 70],
  [255, 78, 201],
  [86, 214, 255],
  [255, 64, 64],
  [64, 230, 120],
  [255, 164, 46],
];

const WHITE: Rgb = [255, 255, 255];
const BLACK: Rgb = [0, 0, 0];

function blendRgb(from: Rgb, to: Rgb, amount: number): Rgb {
  const t = Math.max(0, Math.min(1, amount));
  return [
    Math.round(from[0] + (to[0] - from[0]) * t),
    Math.round(from[1] + (to[1] - from[1]) * t),
    Math.round(from[2] + (to[2] - from[2]) * t),
  ];
}

function brightenRgb(color: Rgb, amount: number): Rgb {
  return blendRgb(color, WHITE, amount);
}

function deepenRgb(color: Rgb, amount: number): Rgb {
  return blendRgb(color, BLACK, amount);
}

function toRgba(color: Rgb, alpha: number): string {
  const [r, g, b] = color;
  const clamped = Math.max(0, Math.min(1, alpha));
  return `rgba(${r}, ${g}, ${b}, ${clamped})`;
}

export function initCursorTrail(options: CursorTrailOptions = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };

  const existing = document.getElementById('cursor-trail-canvas');
  if (existing) {
    existing.remove();
  }

  const canvas = document.createElement('canvas');
  canvas.id = 'cursor-trail-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = String(config.zIndex);
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }
  const context: CanvasRenderingContext2D = ctx;

  let particles: Particle[] = [];
  let mouseX = 0;
  let mouseY = 0;
  let lastX = 0;
  let lastY = 0;
  let pointerReady = false;
  let frameId = 0;
  let lastFrameTime = performance.now();
  let lastBurstTime = 0;

  // Keep the trail crisp on high DPI screens.
  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resizeCanvas();

  function isDarkMode(): boolean {
    return (
      document.documentElement.classList.contains('dark') ||
      document.body.classList.contains('dark') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  }

  function getPalette(darkMode: boolean): Palette {
    if (darkMode) {
      return {
        core: [120, 235, 255],
        glow: [0, 170, 255],
        link: [130, 235, 255],
      };
    }

    return {
      core: [0, 132, 255],
      glow: [0, 188, 255],
      link: [0, 126, 245],
    };
  }

  function createParticle(x: number, y: number, overrides: ParticleOverrides = {}) {
    const angle = Math.random() * Math.PI * 2;
    const speed = config.baseSpeed + Math.random() * config.speedVariance;
    const vx = overrides.vx ?? Math.cos(angle) * speed;
    const vy = overrides.vy ?? Math.sin(angle) * speed;

    particles.push({
      x,
      y,
      vx,
      vy,
      age: 0,
      life: overrides.life ?? config.baseLife + Math.random() * config.lifeVariance,
      size: overrides.size ?? config.baseSize + Math.random() * config.sizeVariance,
      seed: Math.random() * Math.PI * 2,
      energy: overrides.energy ?? 0.9 + Math.random() * 0.25,
      color: overrides.color,
    });

    if (particles.length > config.maxParticles) {
      particles.splice(0, particles.length - config.maxParticles);
    }
  }

  function spawnBurst(x: number, y: number, intensity = 1): void {
    const normalized = Math.max(0.45, Math.min(1.8, intensity));
    const count = Math.round(config.blastCount * normalized);
    const colorOffset = Math.floor(Math.random() * BLAST_COLORS.length);

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.45;
      const speedBoost =
        config.blastSpeedMultiplier * (0.65 + Math.random() * 0.7) * (0.85 + normalized * 0.4);
      const blastColor = BLAST_COLORS[(i + colorOffset) % BLAST_COLORS.length];

      createParticle(x, y, {
        vx: Math.cos(angle) * speedBoost,
        vy: Math.sin(angle) * speedBoost,
        life: config.baseLife * (0.55 + Math.random() * 0.55),
        size: config.baseSize * (1.1 + Math.random() * 1.35),
        energy: 1.25 + Math.random() * 0.75,
        color: blastColor,
      });
    }
  }

  function drawLinks(palette: Palette): void {
    const maxDistance = 56;
    const maxDistanceSq = maxDistance * maxDistance;

    context.lineWidth = 1.25;
    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      for (let j = i + 1; j < Math.min(i + 8, particles.length); j++) {
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distanceSq = dx * dx + dy * dy;

        if (distanceSq > maxDistanceSq) {
          continue;
        }

        const linkColor = blendRgb(a.color ?? palette.link, b.color ?? palette.link, 0.5);
        const opacityScale = a.color || b.color ? 0.3 : 0.22;
        const opacity = (1 - distanceSq / maxDistanceSq) * opacityScale;
        context.strokeStyle = toRgba(linkColor, opacity);
        context.beginPath();
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
        context.stroke();
      }
    }
  }

  function drawPointerGlow(palette: Palette): void {
    if (!config.headGlow || !pointerReady) {
      return;
    }

    const pulse = 0.55 + 0.45 * Math.sin(performance.now() * 0.01);
    const radius = 14 + pulse * 8;

    const innerGlow = context.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, radius);
    innerGlow.addColorStop(0, toRgba(palette.core, 0.42));
    innerGlow.addColorStop(0.45, toRgba(palette.glow, 0.26));
    innerGlow.addColorStop(1, toRgba(palette.glow, 0));

    const auraGlow = context.createRadialGradient(
      mouseX,
      mouseY,
      radius * 0.3,
      mouseX,
      mouseY,
      radius * 2.2
    );
    auraGlow.addColorStop(0, toRgba(palette.glow, 0.16));
    auraGlow.addColorStop(1, toRgba(palette.glow, 0));

    context.fillStyle = auraGlow;
    context.beginPath();
    context.arc(mouseX, mouseY, radius * 2.2, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = innerGlow;
    context.beginPath();
    context.arc(mouseX, mouseY, radius, 0, Math.PI * 2);
    context.fill();

    context.strokeStyle = toRgba(palette.core, 0.44);
    context.lineWidth = 1;
    context.beginPath();
    context.arc(mouseX, mouseY, radius * 0.42, 0, Math.PI * 2);
    context.stroke();

    context.fillStyle = toRgba(WHITE, 0.85);
    context.beginPath();
    context.arc(mouseX, mouseY, Math.max(1.2, radius * 0.12), 0, Math.PI * 2);
    context.fill();
  }

  function animate(now: number) {
    const deltaSeconds = Math.min(0.04, Math.max(0.008, (now - lastFrameTime) / 1000));
    const frameScale = deltaSeconds * 60;
    lastFrameTime = now;

    const darkMode = isDarkMode();
    const palette = getPalette(darkMode);

    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.globalCompositeOperation = 'lighter';

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      p.age += deltaSeconds;
      const progress = p.age / p.life;

      if (progress >= 1) {
        particles.splice(i, 1);
        continue;
      }

      const dragFactor = Math.pow(config.drag, frameScale);
      p.vx *= dragFactor;
      p.vy = p.vy * dragFactor + config.gravity * frameScale;
      p.x += p.vx * frameScale;
      p.y += p.vy * frameScale;

      const shimmer = 0.78 + 0.22 * Math.sin(p.seed + p.age * 8);
      const opacity = (1 - progress) * 0.86 * shimmer * p.energy;
      const radius = p.size * (1 - progress * 0.38) * (0.82 + p.energy * 0.2);

      const baseColor = p.color ?? palette.core;
      const coreColor = p.color
        ? darkMode
          ? brightenRgb(baseColor, 0.08)
          : deepenRgb(baseColor, 0.1)
        : baseColor;
      const glowColor = p.color
        ? darkMode
          ? brightenRgb(baseColor, 0.42)
          : brightenRgb(deepenRgb(baseColor, 0.06), 0.22)
        : palette.glow;
      const sparkColor = p.color
        ? darkMode
          ? brightenRgb(baseColor, 0.62)
          : brightenRgb(baseColor, 0.34)
        : WHITE;

      const gradient = context.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 2.9);
      gradient.addColorStop(0, toRgba(coreColor, opacity));
      gradient.addColorStop(0.38, toRgba(glowColor, opacity * 0.62));
      gradient.addColorStop(0.82, toRgba(glowColor, opacity * 0.18));
      gradient.addColorStop(1, toRgba(glowColor, 0));

      context.fillStyle = gradient;
      context.beginPath();
      context.arc(p.x, p.y, Math.max(0.1, radius), 0, Math.PI * 2);
      context.fill();

      context.fillStyle = toRgba(sparkColor, Math.min(0.95, opacity * (p.color ? 0.66 : 0.52)));
      context.beginPath();
      context.arc(p.x, p.y, Math.max(0.45, radius * (p.color ? 0.21 : 0.16)), 0, Math.PI * 2);
      context.fill();
    }

    drawLinks(palette);
    drawPointerGlow(palette);

    context.globalCompositeOperation = 'source-over';
    frameId = requestAnimationFrame(animate);
  }

  function spawnTrail(x: number, y: number): void {
    if (!pointerReady) {
      lastX = x;
      lastY = y;
      pointerReady = true;
    }

    mouseX = x;
    mouseY = y;

    const dx = mouseX - lastX;
    const dy = mouseY - lastY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const now = performance.now();

    if (
      distance > config.fastMoveBlastThreshold &&
      now - lastBurstTime >= config.fastMoveBlastCooldownMs
    ) {
      const intensity = Math.min(1.3, distance / config.fastMoveBlastThreshold);
      spawnBurst(mouseX, mouseY, intensity * 0.6);
      lastBurstTime = now;
    }

    if (distance < config.minDistance) {
      return;
    }

    const steps = Math.min(16, Math.ceil(distance / config.spawnSpacing));
    for (let i = 0; i < steps; i++) {
      const t = (i + 1) / steps;
      createParticle(lastX + dx * t, lastY + dy * t);
    }

    lastX = mouseX;
    lastY = mouseY;
  }

  function onMouseMove(e: MouseEvent) {
    spawnTrail(e.clientX, e.clientY);
  }

  function onTouchMove(e: TouchEvent) {
    const target = e.target as Element | null;
    if (target?.closest('input, textarea, select')) {
      return;
    }

    const touch = e.touches[0];
    if (!touch) {
      return;
    }

    spawnTrail(touch.clientX, touch.clientY);
  }

  function onPointerDown(e: PointerEvent): void {
    if (!config.blastOnClick) {
      return;
    }

    const target = e.target as Element | null;
    if (target?.closest('input, textarea, select')) {
      return;
    }

    spawnBurst(e.clientX, e.clientY, 1);
  }

  window.addEventListener('resize', resizeCanvas);
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('touchmove', onTouchMove, { passive: true });
  document.addEventListener('pointerdown', onPointerDown);

  frameId = requestAnimationFrame(animate);

  return () => {
    cancelAnimationFrame(frameId);
    window.removeEventListener('resize', resizeCanvas);
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('pointerdown', onPointerDown);
    canvas.remove();
  };
}
