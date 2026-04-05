export function initScrollAnimations(): void {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) {
    document.querySelectorAll('.animate-on-scroll, .reveal').forEach((el) => {
      el.classList.add('animate-in', 'in-view');
    });
    return;
  }

  const revealTargets = document.querySelectorAll<HTMLElement>('.animate-on-scroll, .reveal');
  revealTargets.forEach((el) => {
    if (el.classList.contains('reveal')) {
      el.classList.add('reveal-init');
    }
  });

  // Group staggering: set incremental delay from parent attribute.
  document.querySelectorAll<HTMLElement>('[data-stagger-group]').forEach((group) => {
    const step = Number(group.dataset.staggerStep ?? '70');
    const children = group.querySelectorAll<HTMLElement>(':scope > [data-stagger-item]');
    children.forEach((child, index) => {
      if (!child.dataset.delay) {
        child.dataset.delay = String(index * step);
      }
      if (!child.classList.contains('reveal')) {
        child.classList.add('reveal', 'reveal-init');
      }
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;
          const customDelay = Number(target.dataset.delay ?? '0');

          if (customDelay > 0) {
            window.setTimeout(() => {
              target.classList.add('animate-in', 'in-view');
            }, customDelay);
          } else {
            target.classList.add('animate-in', 'in-view');
          }
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px 0px 0px',
    }
  );

  document.querySelectorAll('.animate-on-scroll, .reveal').forEach((el) => {
    observer.observe(el);
  });
}

export function initNavScrollSpy(): void {
  const navLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('.nav-link[href^="#"]'));
  const mobileNavLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('.mobile-nav-link[href^="#"]'));
  const linkTargets = navLinks
    .map((link) => (link.getAttribute('href') ?? '').replace('#', '').trim())
    .filter(Boolean);
  const uniqueTargets = Array.from(new Set(linkTargets));
  // Exclude sections that should not be highlighted/underlined
  // Add 'beyond-security' and 'training-learning' if those are the actual IDs for those sections
  const excludedSections = ['achievements', 'training', 'activities', 'beyond-security', 'training-learning'];
  const sections = uniqueTargets
    .filter((id) => !excludedSections.includes(id))
    .map((id) => document.getElementById(id))
    .filter((section): section is HTMLElement => Boolean(section));

  if (sections.length === 0) return;

  const seenSections = new Set<string>();

  const setActiveById = (id: string): void => {
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
    });
    mobileNavLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
    });
  };

  const updateActiveOnScroll = (): void => {
    const navbar = document.getElementById('navbar');
    const navbarHeight = navbar?.offsetHeight ?? 70;
    const currentY = window.scrollY + navbarHeight + 24;

    let activeId = sections[0].id;
    for (const section of sections) {
      if (section.offsetTop <= currentY) {
        activeId = section.id;
      }
    }

    setActiveById(activeId);
  };

  let ticking = false;
  const onScroll = (): void => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      updateActiveOnScroll();
      ticking = false;
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  updateActiveOnScroll();

  [...navLinks, ...mobileNavLinks].forEach((link) => {
    link.addEventListener('click', () => {
      const id = (link.getAttribute('href') ?? '').replace('#', '').trim();
      if (!id) return;
      setActiveById(id);
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          if (id && !seenSections.has(id)) {
            seenSections.add(id);
            window.dispatchEvent(new CustomEvent('analytics:section_view', { detail: { section: id } }));
          }
        }
      });
    },
    { threshold: 0.3, rootMargin: '-80px 0px -50% 0px' }
  );

  sections.forEach((section) => observer.observe(section));
}