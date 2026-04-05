import { handleCtfCommand } from '../utils/ctf-challenge';
import { getDecryptTerminalLines } from '../utils/encrypted-message';
import { triggerResumeDownload } from '../utils/resume-download';
import { getVulnerabilityScanTerminalLines } from '../utils/vulnerability-scanner';

export type TerminalTone =
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'accent'
  | 'cyan'
  | 'purple'
  | 'ctfBorder'
  | 'ctfText'
  | 'ctfCommand'
  | 'ctfOk'
  | 'ctfFail'
  | 'prompt'
  | 'error'
  | 'success'
  | 'warning';

export interface TerminalSegment {
  text: string;
  tone?: TerminalTone;
  effect?: 'scramble';
}

export interface TerminalLine {
  segments: TerminalSegment[];
  pre?: boolean;
  speed?: number;
}

export interface CommandExecutionResult {
  clear?: boolean;
  matrix?: boolean;
  ctfCelebration?: 'capture' | 'complete';
  lines?: TerminalLine[];
}

export interface CommandContext {
  viewportWidth: number;
  viewportHeight: number;
}

export interface CommandInput {
  raw: string;
  base: string;
  args: string[];
}

interface CommandDefinition {
  name: string;
  description: string;
  execute: (context: CommandContext, input: CommandInput) => CommandExecutionResult;
}

const dynamicContact = {
  email: 'princekumaarr2005@gmail.com',
  github: 'github.com/Garuda-Netra',
  linkedin: 'linkedin.com/in/prince-kumar8'
};

export function setTerminalDynamicContact(payload: {
  email?: string;
  github?: string;
  linkedin?: string;
}): void {
  if (payload.email && payload.email.trim()) dynamicContact.email = payload.email.trim();
  if (payload.github && payload.github.trim()) dynamicContact.github = payload.github.trim();
  if (payload.linkedin && payload.linkedin.trim()) dynamicContact.linkedin = payload.linkedin.trim();
}

const seg = (text: string, tone: TerminalTone = 'primary'): TerminalSegment => ({ text, tone });
const line = (
  text: string,
  tone: TerminalTone = 'primary',
  options?: { pre?: boolean; speed?: number }
): TerminalLine => ({
  segments: [seg(text, tone)],
  pre: options?.pre,
  speed: options?.speed,
});

function makeHelpLines(commands: CommandDefinition[]): TerminalLine[] {
  const extraAliases = [{ name: 'open resume', description: 'Download resume PDF' }];
  const allRows = [...commands.map((item) => ({ name: item.name, description: item.description })), ...extraAliases];
  const maxCommandLength = allRows.reduce((max, item) => Math.max(max, item.name.length), 0);

  const header: TerminalLine[] = [
    line('Available commands:', 'cyan'),
    line(''),
  ];

  const rows = allRows.map((item) => ({
    segments: [
      seg(item.name.padEnd(maxCommandLength + 4, ' '), 'cyan'),
      seg(item.description, 'purple'),
    ],
    pre: true,
  }));

  return [...header, ...rows];
}

function neofetchLines(context: CommandContext): TerminalLine[] {
  const left = [
    '      /\\\\      ',
    '     /  \\\\     ',
    '    / /\\ \\\\    ',
    '   / ____ \\\\   ',
    '  /_/    \\_\\  ',
    '     [##]      ',
    '      ||       ',
    '     /__\\      ',
  ];

  const rightLabels = [
    'prince@portfolio',
    'OS',
    'Host',
    'Kernel',
    'Shell',
    'Resolution',
    'Terminal',
    'CPU',
    'Memory',
    'Uptime',
  ];

  const rightValues = [
    '',
    'Kali Linux (just for fun aesthetic)',
    'Portfolio v2.0',
    'Security-First',
    'prince-terminal',
    `${context.viewportWidth}x${context.viewportHeight}`,
    'prince@terminal',
    'Curiosity-Driven',
    'Unlimited Learning',
    'Since Day 1',
  ];

  const rightRows: Array<TerminalLine | null> = [
    { segments: [seg(rightLabels[0], 'cyan')] },
  ];

  for (let i = 1; i < rightLabels.length; i += 1) {
    rightRows.push({
      segments: [
        seg(`${rightLabels[i]}: `, 'cyan'),
        seg(rightValues[i], 'primary'),
      ],
    });
  }

  const rows: TerminalLine[] = [];
  const totalRows = Math.max(left.length, rightRows.length);

  for (let i = 0; i < totalRows; i += 1) {
    const leftText = left[i] ?? ''.padEnd(left[0].length, ' ');
    const rightLine = rightRows[i];

    if (!rightLine) {
      rows.push({
        segments: [
          seg(leftText, 'purple'),
        ],
        pre: true,
      });
      continue;
    }

    const spacer = '   ';
    rows.push({
      segments: [
        seg(leftText, 'purple'),
        seg(spacer, 'primary'),
        ...rightLine.segments,
      ],
      pre: true,
    });
  }

  return rows;
}

function bannerCommandLines(): TerminalLine[] {
  return [
    line(' ____  ____  ___ _   _  ____ _____   _  ___   _ __  __    _    ____  ', 'cyan', { pre: true }),
    line('|  _ \\|  _ \\|_ _| \\ | |/ ___| ____| | |/ / | | |  \\/  |  / \\  |  _ \\ ', 'cyan', { pre: true }),
    line('| |_) | |_) || ||  \\| | |   |  _|   | \' /| | | | |\\/| | / _ \\ | |_) |', 'cyan', { pre: true }),
    line('|  __/|  _ < | || |\\  | |___| |___  | . \\| |_| | |  | |/ ___ \\|  _ < ', 'cyan', { pre: true }),
    line('|_|   |_| \\_\\___|_| \\_|\\____|_____| |_|\\_\\\\___/|_|  |_/_/   \\_\\_| \\_\\', 'cyan', { pre: true }),
    line(''),
    line("Welcome to Prince Kumar's Terminal Portfolio", 'primary'),
    line('Cybersecurity Professional | Red Teamer | Blue Teamer | Digital Forensics Enthusiast', 'secondary'),
    line("Type 'help' to see available commands.", 'purple'),
  ];
}

function dateCommandLines(): TerminalLine[] {
  const now = new Date();
  const dayName = now.toLocaleDateString(undefined, { weekday: 'long' });
  const dateLabel = now.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const timeLabel = now.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local Timezone';

  return [
    line(`Current Date: ${dayName}, ${dateLabel}`, 'primary'),
    line(`Current Time: ${timeLabel}`, 'primary'),
    line(`Timezone: ${timezone}`, 'secondary'),
  ];
}

const commands: CommandDefinition[] = [
  {
    name: 'help',
    description: 'Show all available commands',
    execute: () => ({ lines: makeHelpLines(commands) }),
  },
  {
    name: 'whoami',
    description: 'Display identity and role summary',
    execute: () => ({
      lines: [
        line('Prince Kumar', 'primary'),
        line('B.Tech Student | Aspiring Cybersecurity Professional', 'primary'),
        line('Red Teamer | Blue Teamer | Digital Forensics Enthusiast', 'primary'),
        line('CTF Player | Bug Hunter | Prompt Engineer', 'primary'),
      ],
    }),
  },
  {
    name: 'scan',
    description: 'Run a vulnerability scan on this portfolio',
    execute: () => ({
      lines: getVulnerabilityScanTerminalLines(),
    }),
  },
  {
    name: 'ctf',
    description: 'Multi-level CTF challenge system (4 flags hidden)',
    execute: (_context, input) => handleCtfCommand(input.args),
  },
  {
    name: 'decrypt',
    description: 'Decrypt an intercepted message',
    execute: () => ({
      lines: getDecryptTerminalLines(),
    }),
  },
  {
    name: 'about',
    description: 'Read a detailed personal overview',
    execute: () => ({
      lines: [
        line(
          "Hey there! I'm Prince Kumar, a B.Tech student deeply passionate about cybersecurity and digital forensics. I operate on both sides of the security spectrum - as a red teamer simulating real-world attacks and as a blue teamer defending against them. I actively compete in CTF challenges on platforms like TryHackMe, Hack The Box, and PortSwigger. I hunt bugs in real-world applications and have a deep fascination with investigation and forensic analysis. My journey is driven by curiosity and the desire to make the digital world more secure. I also have experience in prompt engineering which helps me leverage AI systems effectively.",
          'secondary'
        ),
      ],
    }),
  },
  {
    name: 'skills',
    description: 'Explore tools, platforms, and capabilities',
    execute: () => ({
      lines: [
        line('[*] Operating Systems', 'cyan'),
        line('Kali Linux, Arch Linux, Ubuntu, Parrot OS, Garuda Linux, macOS, Windows', 'primary'),
        line('----------------------------------------', 'muted', { pre: true }),
        line('[*] Security and Pentesting Tools', 'cyan'),
        line(
          'Burp Suite, Metasploit Framework, Nmap, Feroxbuster, Nessus, Aircrack-ng, Ettercap, Bettercap, Hydra, John the Ripper, Hashcat',
          'primary'
        ),
        line('----------------------------------------', 'muted', { pre: true }),
        line('[*] Digital Forensics Tools', 'cyan'),
        line('Autopsy, FTK Imager, Wireshark, Ghidra', 'primary'),
        line('----------------------------------------', 'muted', { pre: true }),
        line('[*] Platforms', 'cyan'),
        line('TryHackMe, Hack The Box, PortSwigger', 'primary'),
        line('----------------------------------------', 'muted', { pre: true }),
        line('[*] Other Skills', 'cyan'),
        line('Termux toolkit, Prompt Engineering', 'primary'),
      ],
    }),
  },
  {
    name: 'projects',
    description: 'Show featured security projects',
    execute: () => ({
      lines: [
        line('Project 1: NetraX 2.0', 'cyan'),
        line('Advanced Penetration Testing and Social Engineering Simulation Tool', 'purple'),
        line('- Simulates real-world phishing attacks using professional decoy pages', 'primary'),
        line('- Captures front-camera images and GPS coordinates via permission-based interaction', 'primary'),
        line('- Built on PHP server with Ngrok and Cloudflare tunnel support', 'primary'),
        line('- Features multiple decoy templates and CSRF protection', 'primary'),
        line('- Includes structured data storage and full cross-platform compatibility', 'primary'),
        line('- Designed for authorized security testing and awareness training', 'primary'),
        line(''),
        line('Project 2: Anveshana Vidya - The Science of Investigation', 'cyan'),
        line('Interactive Digital Forensics Learning Platform', 'purple'),
        line('- Domain-restricted AI assistant with Q&A, teaching, and guided investigation modes', 'primary'),
        line('- Five interactive theory modules: network forensics, timeline analysis, hash verification, memory forensics, steganography detection', 'primary'),
        line('- Advanced terminal system with over 200 forensic commands', 'primary'),
        line('- Quiz system, mission-based challenges, and real-world case studies', 'primary'),
        line('- Complete glossary of digital forensic concepts', 'primary'),
        line('- Demonstrates expertise in blue teaming and educational system design', 'primary'),
      ],
    }),
  },
  {
    name: 'contact',
    description: 'Display contact channels',
    execute: () => ({
      lines: [
        {
          segments: [seg('Email: ', 'cyan'), seg(dynamicContact.email, 'primary')],
        },
        {
          segments: [seg('LinkedIn: ', 'cyan'), seg(dynamicContact.linkedin, 'primary')],
        },
        {
          segments: [seg('GitHub: ', 'cyan'), seg(dynamicContact.github, 'primary')],
        },
        line('Feel free to reach out for collaboration, opportunities, or just to connect!', 'secondary'),
      ],
    }),
  },
  {
    name: 'resume',
    description: 'View resume highlights',
    execute: () => ({
      lines: [
        { segments: [seg('📄 Resume - Prince Kumar', 'success')] },
        line(''),
        line('To download my resume, use the download button in the', 'success'),
        line('navigation bar or hero section.', 'success'),
        line(''),
        { segments: [seg('Resume highlights:', 'cyan')] },
        line('→ B.Tech Student (Currently Pursuing)', 'success'),
        line('→ Cybersecurity Professional', 'success'),
        line('→ Red Team & Blue Team Experience', 'success'),
        line('→ Digital Forensics Enthusiast', 'success'),
        line('→ CTF Player & Bug Hunter', 'success'),
        line('→ Tool Developer (NetraX 2.0, Anveshana Vidya)', 'success'),
        line('→ Multi-OS Proficiency (6 Operating Systems)', 'success'),
        line('→ 10+ Security Tools Mastered', 'success'),
        line(''),
        {
          segments: [
            seg('File: ', 'cyan'),
            seg('Raj_CV.pdf', 'success'),
          ],
        },
        {
          segments: [
            seg('Status: ', 'cyan'),
            seg('Available for download', 'success'),
          ],
        },
        line(''),
        line("Pro tip: You can also type 'open resume' to trigger the download.", 'success'),
      ],
    }),
  },
  {
    name: 'experience',
    description: 'Show current practical experience',
    execute: () => ({
      lines: [
        line('Currently building hands-on expertise through:', 'primary'),
        line(''),
        line('- Active labs on TryHackMe, Hack The Box, and PortSwigger', 'primary'),
        line('- Independent security research and vulnerability hunting', 'primary'),
        line('- Real-world project development in pentesting and forensics', 'primary'),
        line('- CTF competitions and challenge solving', 'primary'),
        line('Formal internship details will be updated soon.', 'secondary'),
      ],
    }),
  },
  {
    name: 'certifications',
    description: 'List certification focus areas',
    execute: () => ({
      lines: [
        line('High-impact certifications in:', 'primary'),
        line(''),
        line('- Cybersecurity fundamentals and advanced techniques', 'primary'),
        line('- Digital forensics and incident response', 'primary'),
        line('- Network security and analysis', 'primary'),
        line('- Practical security tools and methodologies', 'primary'),
        line('Detailed certification showcase available in the Certifications section of the portfolio.', 'secondary'),
      ],
    }),
  },
  {
    name: 'education',
    description: 'Display education and learning path',
    execute: () => ({
      lines: [
        { segments: [seg('Degree: ', 'cyan'), seg('Bachelor of Technology (B.Tech)', 'primary')] },
        { segments: [seg('Status: ', 'cyan'), seg('Currently Pursuing', 'primary')] },
        { segments: [seg('Focus Areas: ', 'cyan'), seg('Cybersecurity, Digital Forensics, Network Security', 'primary')] },
        { segments: [seg('Learning Platforms: ', 'cyan'), seg('TryHackMe, Hack The Box, PortSwigger', 'primary')] },
        { segments: [seg('Philosophy: ', 'cyan'), seg('Continuous learning through hands-on practice and real-world application', 'primary')] },
      ],
    }),
  },
  {
    name: 'socials',
    description: 'Show social profiles in styled format',
    execute: () => ({
      lines: [
        { segments: [seg('GitHub: ', 'cyan'), seg(dynamicContact.github, 'primary')] },
        { segments: [seg('LinkedIn: ', 'cyan'), seg(dynamicContact.linkedin, 'primary')] },
        { segments: [seg('Email: ', 'cyan'), seg(dynamicContact.email, 'primary')] },
      ],
    }),
  },
  {
    name: 'neofetch',
    description: 'Display neofetch-style system summary',
    execute: (context) => ({ lines: neofetchLines(context) }),
  },
  {
    name: 'clear',
    description: 'Clear terminal output',
    execute: () => ({ clear: true }),
  },
  {
    name: 'banner',
    description: 'Re-display banner and welcome lines',
    execute: () => ({ lines: bannerCommandLines() }),
  },
  {
    name: 'date',
    description: 'Show current date, time, and timezone',
    execute: () => ({ lines: dateCommandLines() }),
  },
  {
    name: 'admin',
    description: 'Open admin panel login page',
    execute: () => {
      window.setTimeout(() => {
        window.location.href = '/admin/index.html';
      }, 2000);

      return {
        lines: [
          line('[*] Initializing admin access...', 'warning'),
          line('[*] Checking authorization...', 'warning'),
          line('[*] Redirecting to admin panel...', 'warning'),
          line('', 'secondary'),
          line('Admin Panel: http://localhost:5173/admin/index.html', 'cyan'),
          line('Username: prince', 'success'),
          line('Note: Credentials required for access.', 'error'),
        ],
      };
    },
  },
  {
    name: 'matrix',
    description: 'Run a short matrix rain effect',
    execute: () => ({
      matrix: true,
      lines: [line('Matrix stream initiated...', 'prompt')],
    }),
  },
  {
    name: 'secret',
    description: 'Hidden command for curious minds',
    execute: () => ({
      lines: [
        line('You found the secret command! \\uD83D\\uDD0D', 'cyan'),
        line('True investigators always dig deeper.', 'secondary'),
        line('Prince Kumar - Curious. Relentless. Security-Focused.', 'purple'),
      ],
    }),
  },
];

const commandMap = new Map(commands.map((item) => [item.name, item]));

export function getCommandNames(): string[] {
  return commands.map((item) => item.name);
}

export function getCommandMatches(input: string): string[] {
  const normalized = input.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  return getCommandNames().filter((name) => name.startsWith(normalized));
}

export function executeCommand(rawInput: string, context: CommandContext): CommandExecutionResult {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return { lines: [] };
  }

  const normalized = trimmed.toLowerCase();
  if (normalized === 'open resume') {
    triggerResumeDownload({ source: 'terminal', immediate: true });

    return {
      lines: [
        line('[*] Initiating resume download...', 'success', { speed: 10 }),
        line('[*] File: Raj_CV.pdf', 'success', { speed: 10 }),
        line('[+] Download started successfully.', 'success', { speed: 10 }),
      ],
    };
  }

  const parts = trimmed.split(/\s+/);
  const base = (parts[0] ?? '').toLowerCase();
  const args = parts.slice(1);

  const input: CommandInput = {
    raw: trimmed,
    base,
    args,
  };

  const command = commandMap.get(base);
  if (command) {
    window.dispatchEvent(new CustomEvent('analytics:terminal_command', { detail: { command: base } }));
    return command.execute(context, input);
  }

  return {
    lines: [
      {
        segments: [
          seg(`bash: ${base}: command not found`, 'error'),
        ],
      },
      {
        segments: [
          seg("Type 'help' to see available commands.", 'error'),
        ],
      },
    ],
  };
}
