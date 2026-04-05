import SectionContainer from '../components/SectionContainer';

export default function Projects(): string {
  const content = `
    <div class="projects-section-wrap section-divider-top">
      <div class="text-center mb-16 reveal" data-reveal="fade-up">
        <h2 class="section-title" style="color: var(--text-primary);" data-split="chars">Projects</h2>
        <p class="section-subtitle">Real-world tools built for offense, defense, and investigation.</p>
      </div>

      <div id="projects-stack" class="projects-stack">
        <article class="glass-card project-feature-card reveal" data-reveal="clip-reveal" data-tilt>
          <div class="project-feature-grid">
            <div class="project-visual-terminal" data-parallax="0.06" aria-hidden="true">
              <div class="project-terminal-head">netrax@lab:~$</div>
              <pre class="project-terminal-content">$ netrax --mode phishing --template corporate
[+] Initializing decoy server...
[+] Generating phishing page... done
[+] Starting Ngrok tunnel...
[+] Tunnel active: https://xxxxx.ngrok.io
[*] Waiting for target interaction...
[+] Camera access granted - Image captured
[+] GPS coordinates received: 28.xxxx, 77.xxxx
[+] Credentials captured successfully</pre>
            </div>

            <div class="project-content">
              <p class="project-category-badge">Red Team | Offensive Security</p>
              <h3 class="project-title-gradient">NetraX 2.0</h3>
              <p class="project-subtitle">Advanced Penetration Testing & Social Engineering Simulation Tool</p>
              <p class="project-description">A professional-grade security testing tool designed for authorized penetration testing and social engineering awareness training. NetraX simulates real-world phishing attacks using carefully crafted decoy pages, demonstrating how attackers manipulate victims in actual scenarios.</p>
              <ul class="project-feature-list">
                <li>Real-world phishing simulation with professional decoy pages</li>
                <li>Front-camera capture and GPS tracking via permission-based interaction</li>
                <li>PHP backend with Ngrok and Cloudflare tunnel integration</li>
                <li>Multiple decoy templates for diverse attack scenarios</li>
                <li>CSRF protection and structured credential storage</li>
                <li>Full cross-platform compatibility</li>
              </ul>
              <div class="project-tags">
                <span>PHP</span><span>JavaScript</span><span>HTML</span><span>CSS</span><span>Ngrok</span><span>Cloudflare</span><span>Social Engineering</span>
              </div>
              <a href="https://github.com/Garuda-Netra/NetraX-2.0" target="_blank" rel="noopener noreferrer" class="project-view-btn" data-magnetic>
                View Project <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
        </article>

        <article class="glass-card project-feature-card reveal" data-reveal="clip-reveal" data-delay="120" data-tilt>
          <div class="project-feature-grid project-feature-grid-mirror">
            <div class="project-content">
              <p class="project-category-badge">Blue Team | Digital Forensics | Education</p>
              <h3 class="project-title-gradient">Anveshana Vidya</h3>
              <p class="project-sanskrit">The Science of Investigation</p>
              <p class="project-subtitle">Interactive Digital Forensics Learning Platform</p>
              <p class="project-description">An immersive educational platform designed to transform digital forensics learning from theoretical study into hands-on investigation experience. Anveshana Vidya combines AI-powered assistance with interactive modules to create a comprehensive forensic training environment.</p>
              <ul class="project-feature-list">
                <li>Domain-restricted AI assistant with Q&A, teaching, and guided investigation modes</li>
                <li>Five interactive theory modules: Network Forensics, Timeline Analysis, Hash Verification, Memory Forensics, Steganography Detection</li>
                <li>Advanced terminal system with 200+ forensic commands</li>
                <li>Quiz system with adaptive difficulty levels</li>
                <li>Mission-based challenges simulating real investigations</li>
                <li>Real-world case studies for practical learning</li>
                <li>Comprehensive glossary of forensic terminology</li>
              </ul>
              <div class="project-tags">
                <span>TypeScript</span><span>JavaScript</span><span>HTML</span><span>Tailwind CSS</span><span>AI Integration</span>
              </div>
              <a href="https://anveshana-vidya.vercel.app/" target="_blank" rel="noopener noreferrer" class="project-view-btn" data-magnetic>
                View Project <span aria-hidden="true">&rarr;</span>
              </a>
            </div>

            <div class="project-visual-dashboard" data-parallax="0.08" aria-hidden="true">
              <div class="project-dash-card dash-terminal">
                <p class="dash-label">forensics-terminal</p>
                <p class="dash-text">> strings evidence.img | grep token</p>
              </div>
              <div class="project-dash-card dash-modules">
                <p class="dash-label">Modules</p>
                <p class="dash-text">Network | Timeline | Hash | Memory | Steganography</p>
              </div>
              <div class="project-dash-card dash-chat">
                <p class="dash-label">AI Assist</p>
                <p class="dash-text">"How do I validate chain of custody from logs?"</p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  `;

  return SectionContainer('projects', content);
}
