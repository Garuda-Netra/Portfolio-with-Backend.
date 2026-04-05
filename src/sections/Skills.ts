import SectionContainer from '../components/SectionContainer';

export default function Skills(): string {
  const categories = [
    {
      id: 'operating-systems',
      title: 'Operating Systems',
      accent: 'cyan',
      tags: 'all tools',
      icon: '&#128421;',
      items: [ 'Kali Linux', 'Arch Linux', 'Ubuntu', 'Parrot OS', 'Garuda Linux','macOS', 'Windows'],
    },
    {
      id: 'offensive-security',
      title: 'Offensive Security Tools',
      accent: 'offensive',
      tags: 'all offensive tools',
      icon: '&#9876;',
      items: ['Burp Suite', 'Metasploit Framework', 'Nmap', 'Feroxbuster', 'Aircrack-ng', 'Ettercap', 'Bettercap', 'Hydra', 'John the Ripper', 'Hashcat'],
    },
    {
      id: 'defensive-security',
      title: 'Defensive Security & Forensics Tools',
      accent: 'defensive',
      tags: 'all defensive tools',
      icon: '&#128737;',
      items: ['Wireshark', 'Nessus', 'Autopsy', 'FTK Imager', 'Ghidra'],
    },
    {
      id: 'platforms-labs',
      title: 'Platforms & Labs',
      accent: 'platforms',
      tags: 'all platforms',
      icon: '&#127942;',
      items: ['TryHackMe', 'Hack The Box', 'PortSwigger', 'VulnHub', 'OverTheWire', 'PentesterLab'],
    },
    {
      id: 'other-skills',
      title: 'Other Skills',
      accent: 'other',
      tags: 'all tools',
      icon: '&#129504;',
      items: ['Termux Toolkit', 'Prompt Engineering', 'Digital Forensics Investigation', 'Social Engineering Awareness'],
    },
  ];

  const skillCategories = categories.map((category, index) => `
    <article
      class="glass-card skills-card animate-on-scroll"
      data-skill-card
      data-filter-tags="${category.tags}"
      style="transition-delay: ${index * 0.09}s;"
      id="${category.id}"
    >
      <header class="skills-card-header">
        <span class="skills-card-icon skills-accent-${category.accent}" aria-hidden="true">${category.icon}</span>
        <h3 class="skills-card-title skills-accent-${category.accent}">${category.title}</h3>
      </header>
      <div class="skills-badges">
        ${category.items.map((skill, badgeIndex) => `
          <span class="skills-badge skills-accent-${category.accent}" style="animation-delay: ${(badgeIndex * 0.06).toFixed(2)}s;">
            ${skill}
          </span>
        `).join('')}
      </div>
    </article>
  `).join('');

  const content = `
    <div class="skills-premium-wrap">
      <div class="animate-on-scroll text-center mb-16">
        <h2 class="section-title" style="color: var(--text-primary);">Skills & Arsenal</h2>
        <p class="section-subtitle">Tools and technologies I use to attack, defend, and investigate.</p>
      </div>

      <div class="skills-filters animate-on-scroll stagger-1" role="tablist" aria-label="Filter skills">
        <button class="skills-filter-btn active" type="button" data-skill-filter="all">All</button>
        <button class="skills-filter-btn" type="button" data-skill-filter="offensive">Offensive</button>
        <button class="skills-filter-btn" type="button" data-skill-filter="defensive">Defensive</button>
        <button class="skills-filter-btn" type="button" data-skill-filter="tools">Tools</button>
        <button class="skills-filter-btn" type="button" data-skill-filter="platforms">Platforms</button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        ${skillCategories}
      </div>
    </div>
  `;

  return SectionContainer('skills', content);
}
