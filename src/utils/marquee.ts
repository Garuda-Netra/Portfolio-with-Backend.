interface MarqueeConfig {
  afterSectionId: string;
  text: string;
  speed: number;
  direction: 'ltr' | 'rtl';
  rotation: string;
  tone: 'cyan' | 'purple' | 'mixed';
}

const STRIPS: MarqueeConfig[] = [
  {
    afterSectionId: 'hero',
    text: 'CYBERSECURITY • DIGITAL FORENSICS • RED TEAM • BLUE TEAM • CTF PLAYER • BUG HUNTER • PENETRATION TESTING • INCIDENT RESPONSE •',
    speed: 35,
    direction: 'rtl',
    rotation: '-2deg',
    tone: 'cyan',
  },
  {
    afterSectionId: 'skills',
    text: 'BURP SUITE — METASPLOIT — WIRESHARK — NMAP — AUTOPSY — GHIDRA — AIRCRACK-NG — HYDRA — HASHCAT — FTK IMAGER —',
    speed: 40,
    direction: 'ltr',
    rotation: '2deg',
    tone: 'purple',
  },
  {
    afterSectionId: 'projects',
    text: 'NETRAX 2.0 ◆ ANVESHANA VIDYA ◆ SOCIAL ENGINEERING ◆ FORENSIC INVESTIGATION ◆ PHISHING SIMULATION ◆ MEMORY FORENSICS ◆ STEGANOGRAPHY ◆',
    speed: 30,
    direction: 'rtl',
    rotation: '0deg',
    tone: 'cyan',
  },
  {
    afterSectionId: 'certifications',
    text: 'CERTIFIED ★ VALIDATED ★ SKILLED ★ PROVEN ★ EXPERIENCED ★ RECOGNIZED ★ ACCOMPLISHED ★ DEDICATED ★',
    speed: 45,
    direction: 'ltr',
    rotation: '-1deg',
    tone: 'mixed',
  },
];

function createStrip(config: MarqueeConfig): HTMLElement {
  const strip = document.createElement('div');
  strip.className = `marquee-strip marquee-${config.tone}`;
  strip.style.setProperty('--marquee-duration', `${config.speed}s`);
  strip.style.setProperty('--marquee-rotation', config.rotation);
  strip.style.setProperty('--marquee-direction', config.direction === 'rtl' ? '-1' : '1');

  const track = document.createElement('div');
  track.className = 'marquee-track';

  for (let i = 0; i < 6; i += 1) {
    const item = document.createElement('span');
    item.className = 'marquee-item';
    item.textContent = config.text;
    track.appendChild(item);
  }

  strip.appendChild(track);
  return strip;
}

export function initMarqueeStrips(): void {
  STRIPS.forEach((config) => {
    const section = document.getElementById(config.afterSectionId);
    if (!section || section.dataset.marqueeMounted === 'true') {
      return;
    }

    const strip = createStrip(config);
    section.insertAdjacentElement('afterend', strip);
    section.dataset.marqueeMounted = 'true';
  });
}
