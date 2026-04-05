import SectionContainer from '../components/SectionContainer';

export default function Achievements(): string {
  const achievements = [
    {
      icon: '&#127942;',
      title: 'CTF Challenge Solver',
      description: 'Successfully solved 50+ Capture The Flag challenges across multiple platforms including TryHackMe, Hack The Box, and PortSwigger, covering web exploitation, cryptography, forensics, and reverse engineering.',
      highlight: '50+ Challenges',
    },
    {
      icon: '&#128736;',
      title: 'Security Tool Developer',
      description: 'Developed NetraX 2.0, a professional-grade penetration testing and social engineering simulation tool used for authorized security testing and awareness training.',
      highlight: 'NetraX 2.0',
    },
    {
      icon: '&#127891;',
      title: 'Forensics Platform Creator',
      description: 'Built Anveshana Vidya, an interactive digital forensics learning platform featuring AI-powered assistance, 200+ forensic commands, and comprehensive investigation training modules.',
      highlight: 'Anveshana Vidya',
    },
    {
      icon: '&#128737;',
      title: 'Multi-Domain Security Expertise',
      description: 'Developed proficiency across both offensive and defensive security domains, mastering tools like Burp Suite, Metasploit, Wireshark, Autopsy, and more while practicing on industry-standard platforms.',
      highlight: 'Red & Blue Team',
    },
    {
      icon: '&#128187;',
      title: 'Multi-OS Proficiency',
      description: 'Gained hands-on experience working across six different operating systems including macOS, Windows, Arch Linux, Ubuntu, Parrot OS, and Garuda Linux, understanding each from a security perspective.',
      highlight: '6 Operating Systems',
    },
  ];

  const cards = achievements.map((item, index) => `
    <article class="glass-card achievement-card reveal" data-reveal="scale-up" data-delay="${index * 90}" data-tilt>
      <div class="achievement-top-accent"></div>
      <div class="achievement-icon" aria-hidden="true">${item.icon}</div>
      <h3>${item.title}</h3>
      <p>${item.description}</p>
      <span class="achievement-highlight">${item.highlight}</span>
    </article>
  `).join('');

  const content = `
    <div class="achievements-wrap section-divider-top">
      <div class="text-center mb-16 reveal" data-reveal="fade-up">
        <h2 class="section-title" style="color: var(--text-primary);" data-split="chars">Achievements</h2>
        <p class="section-subtitle">Milestones and recognitions along my cybersecurity journey.</p>
      </div>
      <div class="achievement-grid">
        ${cards}
      </div>
    </div>
  `;

  return SectionContainer('achievements', content);
}
