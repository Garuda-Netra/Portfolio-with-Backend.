/* ────────────────────────────────────────────────────────────────
   SITE DATA CONFIGURATION
   Replace placeholder content with your own information
────────────────────────────────────────────────────────────────── */

export interface NavLink {
  label: string;
  href: string;
}

export interface SkillCategory {
  category: string;
  items: string[];
}

export interface Project {
  title: string;
  description: string;
  tags: string[];
  link?: string;
  github?: string;
}

export interface Experience {
  title: string;
  company: string;
  period: string;
  description: string;
  achievements?: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
 badge?: string;
}

export interface Achievement {
  title: string;
  description: string;
  date: string;
}

export interface Activity {
  title: string;
  role: string;
  period: string;
  description: string;
}

export interface Education {
  degree: string;
  institution: string;
  period: string;
  description?: string;
}

export interface Contact {
  email: string;
  github: string;
  linkedin: string;
}

export interface SiteData {
  name: string;
  title: string;
  tagline: string;
  profileImage: string;
  navLinks: NavLink[];
  navLinksMobile: NavLink[];
  about: {
    intro: string;
    details: string;
  };
  skills: SkillCategory[];
  internships: Experience[];
  projects: Project[];
  training: Experience[];
  certifications: Certification[];
  achievements: Achievement[];
  activities: Activity[];
  education: Education[];
  contact: Contact;
}

export const siteData: SiteData = {
  // Personal Info
  name: 'Your Name',
  title: 'Cybersecurity Enthusiast | Digital Forensics Learner',
  tagline: 'Exploring the digital frontier, one vulnerability at a time.',
  profileImage: '',

  // Navigation
  navLinks: [
    { label: 'Home', href: '#hero' },
    { label: 'About', href: '#about' },
    { label: 'Skills', href: '#skills' },
    { label: 'Projects', href: '#projects' },
    { label: 'Certifications', href: '#certifications' },
    { label: 'Education', href: '#education' },
    { label: 'Contact', href: '#contact' },
  ],

  navLinksMobile: [
    { label: 'Home', href: '#hero' },
    { label: 'About', href: '#about' },
    { label: 'Skills', href: '#skills' },
    { label: 'Internship', href: '#internship' },
    { label: 'Projects', href: '#projects' },
    { label: 'Training', href: '#training' },
    { label: 'Certifications', href: '#certifications' },
    { label: 'Achievements', href: '#achievements' },
    { label: 'Activities', href: '#activities' },
    { label: 'Education', href: '#education' },
    { label: 'Contact', href: '#contact' },
  ],

  // About Section
  about: {
    intro: 'Passionate about cybersecurity, threat intelligence, and digital forensics. Dedicated to protecting the digital world through continuous learning and hands-on practice.',
    details: 'With a strong foundation in security principles and forensic methodologies, I enjoy solving complex security challenges, analyzing digital artifacts, and staying ahead of emerging threats in the ever-evolving cyber landscape.',
  },

  // Skills Section
  skills: [
    {
      category: 'Security',
      items: ['Penetration Testing', 'Vulnerability Assessment', 'Incident Response', 'Threat Analysis', 'SIEM', 'SOC Operations'],
    },
    {
      category: 'Forensics',
      items: ['Disk Analysis', 'Memory Forensics', 'Network Forensics', 'Malware Analysis', 'Evidence Collection', 'Chain of Custody'],
    },
    {
      category: 'Tools',
      items: ['Wireshark', 'Nmap', 'Burp Suite', 'Metasploit', 'Autopsy', 'Volatility', 'FTK', 'Splunk'],
    },
    {
      category: 'Programming',
      items: ['Python', 'Bash', 'JavaScript', 'PowerShell', 'SQL'],
    },
    {
      category: 'Platforms',
      items: ['Kali Linux', 'Windows Server', 'SIFT Workstation', 'REMnux', 'AWS', 'Azure'],
    },
    {
      category: 'Frameworks',
      items: ['NIST CSF', 'MITRE ATT&CK', 'ISO 27001', 'OWASP Top 10'],
    },
  ],

  // Internships
  internships: [
    {
      title: 'Security Analyst Intern',
      company: 'Company Name',
      period: 'Month Year - Month Year',
      description: 'Assisted in security monitoring, threat detection, and incident response activities.',
      achievements: [
        'Monitored security logs and identified potential threats',
        'Assisted in vulnerability assessments and penetration tests',
        'Documented security incidents and remediation steps',
      ],
    },
  ],

  // Projects
  projects: [
    {
      title: 'Network Intrusion Detection System',
      description: 'Developed a custom IDS using Python and Scapy to detect anomalous network traffic patterns.',
      tags: ['Python', 'Scapy', 'Network Security', 'Machine Learning'],
      github: '#',
    },
    {
      title: 'Digital Forensics Toolkit',
      description: 'Created a suite of tools for automating common forensic analysis tasks including file carving and metadata extraction.',
      tags: ['Python', 'Forensics', 'Automation', 'CLI'],
      github: '#',
    },
    {
      title: 'Vulnerability Scanner',
      description: 'Built a web application vulnerability scanner that identifies common security flaws based on OWASP Top 10.',
      tags: ['Python', 'Web Security', 'OWASP', 'Scanning'],
      github: '#',
    },
  ],

  // Training
  training: [
    {
      title: 'Advanced Penetration Testing Workshop',
      company: 'Organization Name',
      period: 'Month Year',
      description: 'Intensive hands-on training covering advanced exploitation techniques, privilege escalation, and post-exploitation.',
    },
    {
      title: 'Digital Forensics Fundamentals',
      company: 'Training Provider',
      period: 'Month Year',
      description: 'Comprehensive training on disk forensics, memory analysis, and evidence handling procedures.',
    },
  ],

  // Certifications
  certifications: [
    {
      name: 'Certified Ethical Hacker (CEH)',
      issuer: 'EC-Council',
      date: 'Month Year',
    },
    {
      name: 'CompTIA Security+',
      issuer: 'CompTIA',
      date: 'Month Year',
    },
    {
      name: 'Certified Digital Forensics Examiner',
      issuer: 'Certification Body',
      date: 'Month Year',
    },
  ],

  // Achievements
  achievements: [
    {
      title: 'CTF Competition Winner',
      description: 'Ranked 1st place in Regional Capture The Flag cybersecurity competition.',
      date: 'Month Year',
    },
    {
      title: 'Security Research Publication',
      description: 'Published research paper on emerging threats in cloud security.',
      date: 'Month Year',
    },
    {
      title: 'Bug Bounty Recognition',
      description: 'Discovered and reported critical vulnerabilities, earning recognition from top tech companies.',
      date: 'Month Year',
    },
  ],

  // Extra/Co-curricular Activities
  activities: [
    {
      title: 'Cybersecurity Club',
      role: 'President',
      period: 'Year - Present',
      description: 'Lead weekly workshops on security topics, organize CTF events, and mentor new members.',
    },
    {
      title: 'Open Source Contributor',
      role: 'Contributor',
      period: 'Year - Present',
      description: 'Actively contribute to security-focused open source projects and tools.',
    },
  ],

  // Education
  education: [
    {
      degree: 'Bachelor of Science in Computer Science',
      institution: 'Lovely Professional University',
      period: 'Year - Year',
      description: 'Specialization in Cybersecurity and Digital Forensics',
    },
  ],

  // Contact
  contact: {
    email: 'princekumaarr2005@gmail.com',
    github: 'https://github.com/Garuda-Netra',
    linkedin: 'https://www.linkedin.com/in/prince-kumar8/',
  },
};

// Terminal Commands
export const terminalCommands: Record<string, { description: string }> = {
  help: { description: 'Show available commands' },
  about: { description: 'Learn about me' },
  skills: { description: 'View technical skills' },
  projects: { description: 'Browse my projects' },
  contact: { description: 'Get contact information' },
  theme: { description: 'Toggle dark/light theme' },
  clear: { description: 'Clear the terminal' },
  whoami: { description: 'Who are you?' },
  admin: { description: 'Open admin panel access page' },
  sudo: { description: 'Try your luck 😉' },
  exit: { description: 'Close the terminal' },
};
