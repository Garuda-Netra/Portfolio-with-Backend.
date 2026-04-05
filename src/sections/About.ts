import SectionContainer from '../components/SectionContainer';

export default function About(): string {
  const content = `
    <div class="about-premium-wrap">
      <div class="animate-on-scroll text-center mb-16">
        <h2 class="section-title" style="color: var(--text-primary);">About Me</h2>
        <div class="about-accent-row" aria-hidden="true">
          <span class="about-accent-dot"></span>
          <span class="about-accent-line"></span>
          <span class="about-accent-dot"></span>
        </div>
      </div>

      <div class="about-grid">
        <div class="animate-on-scroll stagger-1 about-left-column">
          <div class="about-mini-terminal" aria-label="Decorative terminal snippet">
            <div class="about-mini-header">
              <span class="about-mini-dot"></span>
              <span class="about-mini-dot"></span>
              <span class="about-mini-dot"></span>
            </div>
            <pre class="about-mini-content">$ cat about_prince.txt
[Loading profile...]
Name: Prince Kumar
Role: Cybersecurity Professional
Mode: Red Team + Blue Team
Status: Always Learning</pre>
          </div>
        </div>

        <div class="animate-on-scroll stagger-2 about-right-column">
          <p id="about-bio-text" class="about-paragraph">
            I am Prince Kumar, a B.Tech student with a burning passion for <span class="about-highlight">cybersecurity</span> and <span class="about-highlight">digital forensics</span>. My journey into the world of security began with curiosity about how systems work and how they can be broken and defended. Today I operate confidently on both sides of the security spectrum.
          </p>
          <p id="about-paragraph-2" class="about-paragraph">
            As a <span class="about-highlight">Red Teamer</span>, I simulate real-world attacks, conduct <span class="about-highlight">penetration testing</span>, and develop social engineering tools to expose vulnerabilities before malicious actors can exploit them. As a <span class="about-highlight">Blue Teamer</span>, I focus on threat hunting, incident response, and forensic investigation to protect and analyze digital environments.
          </p>
          <p id="about-paragraph-3" class="about-paragraph">
            I actively participate in <span class="about-highlight">CTF competitions</span> on platforms like TryHackMe, Hack The Box, and PortSwigger, constantly sharpening my skills against real-world challenges. I also engage in bug hunting, searching for vulnerabilities in live applications to contribute to a safer internet.
          </p>
          <p id="about-paragraph-4" class="about-paragraph">
            Beyond technical skills, I have experience in <span class="about-highlight">prompt engineering</span>, which enables me to effectively leverage AI-driven tools and systems. I believe in continuous learning and my portfolio reflects a commitment to mastering both the art of attack and the science of defense.
          </p>
        </div>
      </div>

      <div id="about-stats-grid" class="about-stats-grid mt-12">
        <article class="glass-card about-stat-card animate-on-scroll" data-about-stat>
          <div class="about-stat-icon" aria-hidden="true">&#9873;</div>
          <div class="about-stat-value" data-target="50">0</div>
          <p class="about-stat-label">CTF Challenges Solved</p>
        </article>

        <article class="glass-card about-stat-card animate-on-scroll stagger-1" data-about-stat>
          <div class="about-stat-icon" aria-hidden="true">&#9881;</div>
          <div class="about-stat-value" data-target="10">0</div>
          <p class="about-stat-label">Security Tools Mastered</p>
        </article>

        <article class="glass-card about-stat-card animate-on-scroll stagger-2" data-about-stat>
          <div class="about-stat-icon" aria-hidden="true">&#128187;</div>
          <div class="about-stat-value" data-target="6">0</div>
          <p class="about-stat-label">Major Projects Built</p>
        </article>

        <article class="glass-card about-stat-card animate-on-scroll stagger-3" data-about-stat>
          <div class="about-stat-icon" aria-hidden="true">&#128421;</div>
          <div class="about-stat-value" data-target="6">0</div>
          <p class="about-stat-label">Operating Systems Used</p>
        </article>
      </div>
    </div>
  `;

  return SectionContainer('about', content);
}
