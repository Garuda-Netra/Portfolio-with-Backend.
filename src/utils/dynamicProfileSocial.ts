import { setHeroTypingTitles } from './premiumSections';
import { setTerminalDynamicContact } from '../terminal/commands';
import { API_BASE_URL } from '../config/api';

type ProfilePayload = {
  name?: string;
  title?: string;
  tagline?: string;
  email?: string;
  bio?: string;
  profileImageUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  typingTitles?: string[];
  lastUpdated?: string;
};

const PROFILE_IMAGE_VERSION_KEY = 'portfolioProfileImageVersion';

type SocialLink = {
  platform: string;
  url: string;
  displayText?: string;
  isVisible?: boolean;
  order?: number;
};

type HeroContentPayload = {
  name?: string;
  title?: string;
  tagline?: string;
  typingTitles?: string[];
};

type AboutContentPayload = {
  paragraphs?: string[];
  stats?: Array<{ label: string; value: string }>;
};

type ProjectContentPayload = {
  name: string;
  subtitle?: string;
  description?: string;
  features?: string[];
  techStack?: string[];
};

type EducationContentPayload = {
  degree?: string;
  status?: string;
  institution?: string;
  focusAreas?: string;
};

function withTimeout(url: string, timeoutMs = 5000): Promise<Response> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { signal: controller.signal }).finally(() => {
    window.clearTimeout(timer);
  });
}

function toHref(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '#';
  if (trimmed.startsWith('mailto:')) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.includes('@') && !trimmed.includes(' ')) return `mailto:${trimmed}`;
  return `https://${trimmed}`;
}

function toDisplay(url: string): string {
  return url
    .replace(/^mailto:/i, '')
    .replace(/^https?:\/\//i, '')
    .replace(/\/$/, '');
}

function iconFor(platform: string): string {
  const normalized = platform.toLowerCase();
  if (normalized.includes('github')) return '&lt;/&gt;';
  if (normalized.includes('linkedin')) return 'in';
  if (normalized.includes('email')) return '✉';
  return '🔗';
}

function updateHeroProfile(profile: ProfilePayload): void {
  const nameNode = document.querySelector<HTMLElement>('#hero-name-text');
  const taglineNode = document.querySelector<HTMLElement>('#hero-tagline-text');
  const imageNode = document.querySelector<HTMLImageElement>('#hero-profile-image');
  const aboutNode = document.querySelector<HTMLElement>('#about-bio-text');
  const fallbackNode = imageNode?.nextElementSibling as HTMLElement | null;

  if (nameNode && profile.name) nameNode.textContent = profile.name;
  if (taglineNode && profile.tagline) taglineNode.textContent = profile.tagline;
  if (aboutNode && profile.bio) aboutNode.textContent = profile.bio;
  const remoteImageUrl = (profile.profileImageUrl ?? '').trim();
  if (imageNode && /^https?:\/\//i.test(remoteImageUrl)) {
    const nextVersion = profile.lastUpdated ?? localStorage.getItem(PROFILE_IMAGE_VERSION_KEY);
    if (profile.lastUpdated) {
      localStorage.setItem(PROFILE_IMAGE_VERSION_KEY, profile.lastUpdated);
    }

    const base = remoteImageUrl;
    imageNode.style.display = 'block';
    if (fallbackNode) fallbackNode.style.display = 'none';
    imageNode.onerror = () => {
      imageNode.style.display = 'none';
      if (fallbackNode) fallbackNode.style.display = 'flex';
    };
    imageNode.src = nextVersion ? `${base}${base.includes('?') ? '&' : '?'}v=${encodeURIComponent(nextVersion)}` : base;
  } else if (imageNode) {
    imageNode.removeAttribute('src');
    imageNode.style.display = 'none';
    if (fallbackNode) fallbackNode.style.display = 'flex';
  }
  if (Array.isArray(profile.typingTitles) && profile.typingTitles.length > 0) {
    setHeroTypingTitles(profile.typingTitles);
  } else if (profile.title) {
    setHeroTypingTitles([profile.title]);
  }
}

function updateHeroContent(content: HeroContentPayload): void {
  const nameNode = document.querySelector<HTMLElement>('#hero-name-text');
  const taglineNode = document.querySelector<HTMLElement>('#hero-tagline-text');

  if (nameNode && content.name) nameNode.textContent = content.name;
  if (taglineNode && content.tagline) taglineNode.textContent = content.tagline;

  if (Array.isArray(content.typingTitles) && content.typingTitles.length > 0) {
    setHeroTypingTitles(content.typingTitles);
  } else if (content.title) {
    setHeroTypingTitles([content.title]);
  }
}

function updateAboutContent(content: AboutContentPayload): void {
  const paragraphs = Array.isArray(content.paragraphs) ? content.paragraphs : [];
  const ids = ['#about-bio-text', '#about-paragraph-2', '#about-paragraph-3', '#about-paragraph-4'];
  ids.forEach((selector, index) => {
    const node = document.querySelector<HTMLElement>(selector);
    const text = paragraphs[index];
    if (node && text) node.textContent = text;
  });

  if (!Array.isArray(content.stats) || content.stats.length === 0) return;
  const statsRoot = document.querySelector<HTMLElement>('#about-stats-grid');
  if (!statsRoot) return;

  statsRoot.innerHTML = content.stats.map((item, index) => `
    <article class="glass-card about-stat-card animate-on-scroll ${index > 0 ? `stagger-${index}` : ''}" data-about-stat>
      <div class="about-stat-icon" aria-hidden="true">&#9873;</div>
      <div class="about-stat-value">${item.value}</div>
      <p class="about-stat-label">${item.label}</p>
    </article>
  `).join('');
}

function updateProjectsContent(projects: ProjectContentPayload[]): void {
  const root = document.querySelector<HTMLElement>('#projects-stack');
  if (!root || projects.length === 0) return;

  root.innerHTML = projects.map((project, index) => `
    <article class="glass-card project-feature-card reveal" data-reveal="clip-reveal" data-delay="${index * 80}" data-tilt>
      <div class="project-feature-grid">
        <div class="project-content">
          <p class="project-category-badge">Custom Project</p>
          <h3 class="project-title-gradient">${project.name}</h3>
          ${project.subtitle ? `<p class="project-subtitle">${project.subtitle}</p>` : ''}
          ${project.description ? `<p class="project-description">${project.description}</p>` : ''}
          ${Array.isArray(project.features) && project.features.length > 0 ? `<ul class="project-feature-list">${project.features.map((feature) => `<li>${feature}</li>`).join('')}</ul>` : ''}
          ${Array.isArray(project.techStack) && project.techStack.length > 0 ? `<div class="project-tags">${project.techStack.map((tech) => `<span>${tech}</span>`).join('')}</div>` : ''}
        </div>
      </div>
    </article>
  `).join('');
}

function updateEducationContent(content: EducationContentPayload): void {
  const degree = document.querySelector<HTMLElement>('#education-degree');
  const status = document.querySelector<HTMLElement>('#education-status');
  const institution = document.querySelector<HTMLElement>('#education-institution');
  const focus = document.querySelector<HTMLElement>('#education-focus');

  const institutionValue = (content.institution ?? '').trim();
  const normalizedInstitution = institutionValue.toLowerCase();
  const resolvedInstitution = !institutionValue || normalizedInstitution.includes('placeholder') || normalizedInstitution.includes('university name')
    ? 'Lovely Professional University'
    : institutionValue;

  if (degree && content.degree) degree.textContent = content.degree;
  if (status && content.status) status.textContent = content.status;
  if (institution) institution.textContent = resolvedInstitution;
  if (focus && content.focusAreas) focus.innerHTML = `<strong>Focus Areas:</strong> ${content.focusAreas}`;
}

async function fetchSectionContent<T>(section: string): Promise<T | null> {
  try {
    const response = await withTimeout(`${API_BASE_URL}/api/content/${section}`, 5000);
    if (!response.ok) return null;
    const payload = (await response.json()) as { entry?: { content?: T } };
    return payload.entry?.content ?? null;
  } catch {
    return null;
  }
}

function renderHeroSocial(container: HTMLElement, links: SocialLink[], mobile = false): void {
  const mapped = links.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (mobile) {
    container.innerHTML = mapped
      .map((link) => {
        const label = link.platform || 'Link';
        return `<a href="${toHref(link.url)}" target="_blank" rel="noreferrer" class="hero-social-link">${label}</a>`;
      })
      .join('');
    return;
  }

  container.innerHTML = mapped
    .map((link) => `
      <a href="${toHref(link.url)}" target="_blank" rel="noreferrer" aria-label="${link.platform}" class="hero-social-link">
        <span aria-hidden="true">${iconFor(link.platform)}</span>
      </a>
    `)
    .join('');
}

function updateFooterSocial(links: SocialLink[]): void {
  const root = document.querySelector<HTMLElement>('#footer-socials-dynamic');
  if (!root) return;

  root.innerHTML = links
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((link) => `
      <a href="${toHref(link.url)}" target="_blank" rel="noopener noreferrer" aria-label="${link.platform}" data-magnetic>
        ${iconFor(link.platform)}
      </a>
    `)
    .join('');
}

function updateContactLinks(links: SocialLink[]): void {
  const root = document.querySelector<HTMLElement>('#contact-links-dynamic');
  if (!root) return;

  root.innerHTML = links
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((link) => {
      const href = toHref(link.url);
      const display = link.displayText?.trim() ? link.displayText.trim() : toDisplay(link.url);
      const isExternal = !href.startsWith('mailto:');
      return `
        <a href="${href}" ${isExternal ? 'target="_blank" rel="noopener noreferrer"' : ''} class="contact-link-item" data-magnetic aria-label="${link.platform}">
          <span class="contact-link-icon" aria-hidden="true">${iconFor(link.platform)}</span>
          <span class="contact-link-text">${display}</span>
          <span class="contact-link-arrow" aria-hidden="true">&rarr;</span>
        </a>
      `;
    })
    .join('');
}

function updateTerminalData(profile: ProfilePayload, links: SocialLink[]): void {
  const emailLink = links.find((item) => item.platform.toLowerCase().includes('email'));
  const githubLink = links.find((item) => item.platform.toLowerCase().includes('github'));
  const linkedinLink = links.find((item) => item.platform.toLowerCase().includes('linkedin'));

  setTerminalDynamicContact({
    email: (emailLink?.displayText || profile.email || '').replace(/^mailto:/i, ''),
    github: githubLink ? toDisplay(githubLink.url) : (profile.githubUrl ? toDisplay(profile.githubUrl) : undefined),
    linkedin: linkedinLink ? toDisplay(linkedinLink.url) : (profile.linkedinUrl ? toDisplay(profile.linkedinUrl) : undefined)
  });
}

export async function initDynamicProfileAndSocial(): Promise<void> {
  try {
    const [profileRes, socialRes, heroContent, aboutContent, projectsContent, educationContent] = await Promise.all([
      withTimeout(`${API_BASE_URL}/api/profile`, 5000),
      withTimeout(`${API_BASE_URL}/api/social-links`, 5000),
      fetchSectionContent<HeroContentPayload>('hero'),
      fetchSectionContent<AboutContentPayload>('about'),
      fetchSectionContent<{ projects?: ProjectContentPayload[] }>('projects'),
      fetchSectionContent<EducationContentPayload>('education')
    ]);

    const profileData = profileRes.ok ? ((await profileRes.json()) as { profile?: ProfilePayload }) : {};
    const socialData = socialRes.ok ? ((await socialRes.json()) as { links?: SocialLink[] }) : {};

    const profile = profileData.profile;
    const links = (socialData.links ?? []).filter((item) => item.isVisible !== false);

    if (profile) {
      updateHeroProfile(profile);
    }

    if (heroContent) {
      updateHeroContent(heroContent);
    }

    if (aboutContent) {
      updateAboutContent(aboutContent);
    }

    if (projectsContent?.projects && Array.isArray(projectsContent.projects)) {
      updateProjectsContent(projectsContent.projects);
    }

    if (educationContent) {
      updateEducationContent(educationContent);
    }

    if (links.length > 0) {
      const heroDesktop = document.querySelector<HTMLElement>('#hero-social-desktop');
      const heroMobile = document.querySelector<HTMLElement>('#hero-social-mobile');
      if (heroDesktop) renderHeroSocial(heroDesktop, links, false);
      if (heroMobile) renderHeroSocial(heroMobile, links, true);
      updateFooterSocial(links);
      updateContactLinks(links);
    }

    updateTerminalData(profile ?? {}, links);
  } catch {
    // Silent fallback to existing static defaults.
  }
}
