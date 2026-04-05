import SectionContainer from '../components/SectionContainer';

export default function Internship(): string {
  const content = `
    <div class="exp-section-wrap section-divider-top">
      <div class="text-center mb-16 reveal" data-reveal="fade-up">
        <h2 class="section-title" style="color: var(--text-primary);" data-split="chars">Internship & Experience</h2>
        <p class="section-subtitle">Hands-on security growth through research, tools, and real-world simulation.</p>
      </div>

      <div class="exp-timeline" data-parallax="0.08">
        <article class="exp-item exp-left reveal" data-reveal="fade-right" data-delay="0">
          <span class="exp-node" aria-hidden="true"></span>
          <div class="glass-card exp-card" data-magnetic>
            <p class="exp-meta">Ongoing • Self-Directed & Platform-Based</p>
            <h3 class="exp-title">Cybersecurity Research & Practice</h3>
            <p class="exp-description">Conducting independent security research, vulnerability hunting, and penetration testing practice. Actively solving challenges on TryHackMe, Hack The Box, and PortSwigger to build real-world offensive and defensive skills. Focusing on web application security, network penetration testing, and digital forensics investigation.</p>
            <div class="exp-tags">
              <span class="exp-tag">Penetration Testing</span>
              <span class="exp-tag">Bug Hunting</span>
              <span class="exp-tag">CTF</span>
              <span class="exp-tag">Research</span>
            </div>
          </div>
        </article>

        <article class="exp-item exp-right reveal" data-reveal="fade-left" data-delay="120">
          <span class="exp-node" aria-hidden="true"></span>
          <div class="glass-card exp-card" data-magnetic>
            <p class="exp-meta">Ongoing • Independent Projects</p>
            <h3 class="exp-title">Red Team & Blue Team Development</h3>
            <p class="exp-description">Developing professional-grade security tools including penetration testing frameworks and social engineering simulation platforms. Building defensive security solutions and forensic investigation tools. Practicing both offensive attack simulation and defensive threat hunting methodologies.</p>
            <div class="exp-tags">
              <span class="exp-tag">Red Team</span>
              <span class="exp-tag">Blue Team</span>
              <span class="exp-tag">Tool Development</span>
              <span class="exp-tag">Forensics</span>
            </div>
          </div>
        </article>

        <article class="exp-item exp-left reveal" data-reveal="fade-right" data-delay="220">
          <span class="exp-node" aria-hidden="true"></span>
          <div class="glass-card exp-card" data-magnetic>
            <p class="exp-meta">Ongoing • Self-Directed Learning</p>
            <h3 class="exp-title">Digital Forensics Learning & Investigation</h3>
            <p class="exp-description">Deep diving into digital forensics methodologies including memory forensics, network forensics, timeline analysis, hash verification, and steganography detection. Building educational platforms to make forensic investigation accessible and interactive for learners.</p>
            <div class="exp-tags">
              <span class="exp-tag">Digital Forensics</span>
              <span class="exp-tag">Investigation</span>
              <span class="exp-tag">Memory Analysis</span>
              <span class="exp-tag">Network Forensics</span>
            </div>
          </div>
        </article>

        <article class="exp-item exp-right reveal" data-reveal="fade-left" data-delay="280">
          <span class="exp-node" aria-hidden="true"></span>
          <div class="glass-card exp-card exp-placeholder" data-magnetic>
            <h3 class="exp-title">More experiences coming soon</h3>
            <p class="exp-description">Open to internship opportunities in cybersecurity and digital forensics.</p>
          </div>
        </article>
      </div>
    </div>
  `;

  return SectionContainer('internship', content);
}
