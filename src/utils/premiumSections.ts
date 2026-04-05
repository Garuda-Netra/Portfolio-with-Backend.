let heroTitles = [
  'Cybersecurity Enthusiast',
  'Digital Forensics Learner',
  'Red Teamer & Blue Teamer',
  'CTF Player & Bug Hunter',
  'Prompt Engineer',
];

export function setHeroTypingTitles(titles: string[]): void {
  const cleaned = titles.map((item) => item.trim()).filter((item) => item.length > 0);
  if (cleaned.length > 0) {
    heroTitles = cleaned;
  }
}

let rafParallax = 0;
let parallaxTicking = false;
let lastScrollY = 0;

function initHeroTyping(): void {
  const typedText = document.getElementById('hero-typed-text');
  if (!typedText) {
    return;
  }

  let titleIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const tick = (): void => {
    const current = heroTitles[titleIndex] ?? '';

    if (deleting) {
      charIndex = Math.max(0, charIndex - 1);
      typedText.textContent = current.slice(0, charIndex);

      if (charIndex === 0) {
        deleting = false;
        titleIndex = (titleIndex + 1) % heroTitles.length;
        window.setTimeout(tick, 300);
        return;
      }

      window.setTimeout(tick, 36);
      return;
    }

    charIndex = Math.min(current.length, charIndex + 1);
    typedText.textContent = current.slice(0, charIndex);

    if (charIndex === current.length) {
      deleting = true;
      window.setTimeout(tick, 2000);
      return;
    }

    window.setTimeout(tick, 70);
  };

  tick();
}

function initTextSplitAnimation(): void {
  const splitTargets = document.querySelectorAll<HTMLElement>('[data-split]');
  if (splitTargets.length === 0) {
    return;
  }

  splitTargets.forEach((node) => {
    if (node.dataset.splitReady === 'true') {
      return;
    }

    const mode = node.dataset.split === 'words' ? 'words' : 'chars';
    const source = (node.textContent ?? '').trim();
    if (!source) {
      return;
    }

    const units = mode === 'words' ? source.split(' ') : Array.from(source);
    node.textContent = '';

    units.forEach((unit, index) => {
      const span = document.createElement('span');
      span.className = 'split-unit';
      span.style.animationDelay = `${index * 36}ms`;
      span.textContent = unit;
      node.appendChild(span);

      if (mode === 'words' && index < units.length - 1) {
        node.appendChild(document.createTextNode(' '));
      }
    });

    node.classList.add('split-ready');
    node.dataset.splitReady = 'true';
  });
}

function initHeroButtonRipple(): void {
  document.querySelectorAll<HTMLAnchorElement>('.hero-cta-btn').forEach((button) => {
    button.addEventListener('click', (event) => {
      const rect = button.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'hero-btn-ripple';

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const size = Math.max(rect.width, rect.height) * 1.3;

      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${x - size / 2}px`;
      ripple.style.top = `${y - size / 2}px`;

      button.appendChild(ripple);

      window.setTimeout(() => {
        ripple.remove();
      }, 550);
    });
  });
}

function updateParallax(nodes: NodeListOf<HTMLElement>): void {
  nodes.forEach((node) => {
    const speed = Number(node.dataset.parallax ?? '0.06');
    const rect = node.getBoundingClientRect();
    const viewportCenter = window.innerHeight / 2;
    const elementCenter = rect.top + rect.height / 2;
    const distance = elementCenter - viewportCenter;
    const translateY = distance * speed * -0.16;
    node.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0)`;
  });
}

function initParallaxMicroEffect(): void {
  const nodes = document.querySelectorAll<HTMLElement>('[data-parallax]');
  if (nodes.length === 0) {
    return;
  }

  const onScroll = (): void => {
    lastScrollY = window.scrollY;
    if (parallaxTicking) {
      return;
    }

    parallaxTicking = true;
    rafParallax = requestAnimationFrame(() => {
      void lastScrollY;
      updateParallax(nodes);
      parallaxTicking = false;
    });
  };

  updateParallax(nodes);
  window.addEventListener('scroll', onScroll, { passive: true });
}

function initAboutCounters(): void {
  const statCards = document.querySelectorAll<HTMLElement>('[data-about-stat]');
  if (statCards.length === 0) {
    return;
  }

  const seen = new WeakSet<HTMLElement>();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      const card = entry.target as HTMLElement;
      if (seen.has(card)) {
        return;
      }
      seen.add(card);

      const valueNode = card.querySelector<HTMLElement>('.about-stat-value[data-target]');
      if (!valueNode) {
        return;
      }

      const target = Number(valueNode.dataset.target ?? '0');
      let start: number | null = null;
      const duration = 1200;

      const animate = (timestamp: number): void => {
        if (start === null) {
          start = timestamp;
        }

        const progress = Math.min(1, (timestamp - start) / duration);
        const current = Math.floor(target * progress);
        valueNode.textContent = `${current}+`;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          valueNode.textContent = `${target}+`;
        }
      };

      requestAnimationFrame(animate);
      observer.unobserve(card);
    });
  }, { threshold: 0.35 });

  statCards.forEach((card) => observer.observe(card));
}

function initSkillsFilters(): void {
  const filterButtons = document.querySelectorAll<HTMLButtonElement>('[data-skill-filter]');
  const cards = document.querySelectorAll<HTMLElement>('[data-skill-card]');

  if (filterButtons.length === 0 || cards.length === 0) {
    return;
  }

  const applyFilter = (filter: string): void => {
    filterButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.skillFilter === filter);
      btn.setAttribute('aria-selected', btn.dataset.skillFilter === filter ? 'true' : 'false');
    });

    cards.forEach((card) => {
      const tags = card.dataset.filterTags ?? '';
      const visible = filter === 'all' || tags.includes(filter);
      card.classList.toggle('skills-card-hidden', !visible);
    });
  };

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.skillFilter ?? 'all';
      applyFilter(filter);
    });
  });

  applyFilter('all');
}

function initSkillsMeters(): void {
  const map = document.getElementById('skills-map');
  if (!map) {
    return;
  }

  const fills = map.querySelectorAll<HTMLElement>('.skills-meter-fill[data-fill]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      fills.forEach((fill, index) => {
        const target = Number(fill.dataset.fill ?? '0');
        window.setTimeout(() => {
          fill.style.width = `${target}%`;
        }, index * 90);
      });

      observer.disconnect();
    });
  }, { threshold: 0.35 });

  observer.observe(map);
}

function initEducationProgress(): void {
  const fill = document.querySelector<HTMLElement>('.edu-progress-fill[data-fill]');
  if (!fill) {
    return;
  }

  const target = Number(fill.dataset.fill ?? '0');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      fill.style.width = `${target}%`;
      observer.disconnect();
    });
  }, { threshold: 0.25 });

  observer.observe(fill);
}

function initContactForm(): void {
  const form = document.getElementById('contact-form') as HTMLFormElement | null;
  if (!form) {
    return;
  }

  const nameInput = document.getElementById('contact-name') as HTMLInputElement | null;
  const emailInput = document.getElementById('contact-email') as HTMLInputElement | null;
  const messageInput = document.getElementById('contact-message') as HTMLTextAreaElement | null;
  const submitButton = document.getElementById('contact-submit') as HTMLButtonElement | null;
  const successNode = document.getElementById('contact-success');

  const errorFor = (field: string): HTMLElement | null =>
    form.querySelector<HTMLElement>(`[data-error-for="${field}"]`);

  const setError = (field: string, message: string): void => {
    const node = errorFor(field);
    if (!node) {
      return;
    }
    node.textContent = message;
    node.classList.add('show');
  };

  const clearError = (field: string): void => {
    const node = errorFor(field);
    if (!node) {
      return;
    }
    node.textContent = '';
    node.classList.remove('show');
  };

  const validate = (): boolean => {
    let ok = true;
    const name = nameInput?.value.trim() ?? '';
    const email = emailInput?.value.trim() ?? '';
    const message = messageInput?.value.trim() ?? '';

    clearError('name');
    clearError('email');
    clearError('message');

    if (!name) {
      setError('name', 'Name is required.');
      ok = false;
    }

    if (!email) {
      setError('email', 'Email is required.');
      ok = false;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('email', 'Please enter a valid email address.');
      ok = false;
    }

    if (!message) {
      setError('message', 'Message is required.');
      ok = false;
    } else if (message.length < 10) {
      setError('message', 'Message must be at least 10 characters.');
      ok = false;
    }

    return ok;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (successNode) {
      successNode.classList.remove('show');
      successNode.textContent = '';
    }

    if (!validate()) {
      return;
    }

    submitButton?.classList.add('is-loading');

    try {
      const response = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameInput?.value.trim() ?? '',
          email: emailInput?.value.trim() ?? '',
          subject: (document.getElementById('contact-subject') as HTMLInputElement | null)?.value.trim() || 'Portfolio Inquiry',
          message: messageInput?.value.trim() ?? ''
        })
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      submitButton?.classList.remove('is-loading');
      form.reset();
      if (successNode) {
        successNode.textContent = 'Message sent successfully! I will get back to you soon.';
        successNode.classList.add('show');
      }
    } catch {
      submitButton?.classList.remove('is-loading');
      if (successNode) {
        successNode.textContent = 'Failed to send message. Please try again.';
        successNode.classList.add('show');
      }
    }
  });
}

function initBackToTop(): void {
  const button = document.getElementById('back-to-top');
  if (!button) {
    return;
  }

  const onScroll = (): void => {
    button.classList.toggle('show', window.scrollY > window.innerHeight);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function initSkillsCardStagger(): void {
  const cards = document.querySelectorAll<HTMLElement>('[data-skill-card]');
  if (cards.length === 0) {
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      const card = entry.target as HTMLElement;
      card.classList.add('skills-card-visible');
      observer.unobserve(card);
    });
  }, { threshold: 0.2 });

  cards.forEach((card) => observer.observe(card));
}

export function initPremiumSections(): void {
  initHeroTyping();
  initHeroButtonRipple();
  initTextSplitAnimation();
  initAboutCounters();
  initSkillsFilters();
  initSkillsMeters();
  initSkillsCardStagger();

  initEducationProgress();
  initContactForm();
  initBackToTop();
}
